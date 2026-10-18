
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using PrayerCare.Domain.Entities;
using PrayerCare.Domain.Enums;
using PrayerCare.Infrastructure.Persistence;

namespace PrayerCare.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/communities")]
public class CommunityInvitationsController : ControllerBase
{
    private readonly PrayerCareDbContext _db;

    public CommunityInvitationsController(PrayerCareDbContext db)
    {
        _db = db;
    }

    // POST /api/communities/{communityId}/invitations
    // Solo administradores pueden generar invitaciones.

    [HttpPost("{communityId:guid}/invitations")]
    public async Task<IActionResult> CreateInvitation(
        Guid communityId,
        [FromBody] CreateInvitationRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var isAdmin = await _db.CommunityMembers
            .AsNoTracking()
            .AnyAsync(m =>
                m.CommunityId == communityId &&
                m.UserId == userId.Value &&
                m.Role == CommunityRole.Admin &&
                m.Status == CommunityMemberStatus.Active &&
                m.Community.IsActive);

        if (!isAdmin) return NotFound();

        if (request.MaxUses < 1 || request.MaxUses > 100)
            return BadRequest(new
            {
                message = "MaxUses debe estar entre 1 y 100."
            });

        if (request.ExpiresInHours < 1 ||
            request.ExpiresInHours > 720)
            return BadRequest(new
            {
                message = "ExpiresInHours debe estar entre 1 y 720."
            });

        var now = DateTime.UtcNow;

        // 32 bytes criptográficamente aleatorios.
        var code = Convert.ToHexString(
            RandomNumberGenerator.GetBytes(32));

        var invitation = new CommunityInvitation
        {
            Id = Guid.NewGuid(),
            CommunityId = communityId,
            CreatedByUserId = userId.Value,
            CodeHash = HashCode(code),
            MaxUses = request.MaxUses,
            UseCount = 0,
            ExpiresAt = now.AddHours(request.ExpiresInHours),
            IsRevoked = false,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.CommunityInvitations.Add(invitation);
        await _db.SaveChangesAsync();

        // El código original se entrega una sola vez.
        return Ok(new
        {
            invitationId = invitation.Id,
            communityId,
            code,
            expiresAt = invitation.ExpiresAt,
            maxUses = invitation.MaxUses
        });
    }

    // POST /api/communities/join
    // Un usuario autenticado utiliza un código privado.

    [HttpPost("join")]
    public async Task<IActionResult> Join(
        [FromBody] JoinCommunityRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var code = request.Code?.Trim();

        if (string.IsNullOrWhiteSpace(code) ||
            code.Length != 64 ||
            !code.All(Uri.IsHexDigit))
        {
            return BadRequest(new
            {
                message = "Código de invitación inválido."
            });
        }

        var codeHash = HashCode(code.ToUpperInvariant());

        // Serializable evita que dos solicitudes consuman
        // simultáneamente el último uso disponible.
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        var invitation = await _db.CommunityInvitations
            .Include(i => i.Community)
            .FirstOrDefaultAsync(i => i.CodeHash == codeHash);

        var now = DateTime.UtcNow;

        if (invitation is null ||
            !invitation.Community.IsActive ||
            !invitation.IsAvailable(now))
        {
            return BadRequest(new
            {
                message = "La invitación no existe, expiró o ya no está disponible."
            });
        }

        var existingMember = await _db.CommunityMembers
            .FirstOrDefaultAsync(m =>
                m.CommunityId == invitation.CommunityId &&
                m.UserId == userId.Value);

        if (existingMember is not null)
        {
            // No permitir que una invitación reactive
            // membresías suspendidas o eliminadas.
            return Conflict(new
            {
                message = existingMember.Status ==
                          CommunityMemberStatus.Active
                    ? "Ya pertenecés a esta comunidad."
                    : "Tu membresía requiere revisión de un administrador."
            });
        }

        var member = new CommunityMember
        {
            Id = Guid.NewGuid(),
            CommunityId = invitation.CommunityId,
            UserId = userId.Value,
            Role = CommunityRole.Member,
            Status = CommunityMemberStatus.Active,
            JoinedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };

        invitation.UseCount++;
        invitation.UpdatedAt = now;

        _db.CommunityMembers.Add(member);

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(new
        {
            communityId = invitation.CommunityId,
            communityName = invitation.Community.Name,
            role = member.Role,
            status = member.Status,
            joinedAt = member.JoinedAt
        });
    }

    // GET /api/communities/{communityId}/invitations
    // Los administradores consultan invitaciones,
    // pero nunca recuperan códigos originales.

    [HttpGet("{communityId:guid}/invitations")]
    public async Task<IActionResult> GetInvitations(
        Guid communityId)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var isAdmin = await _db.CommunityMembers
            .AsNoTracking()
            .AnyAsync(m =>
                m.CommunityId == communityId &&
                m.UserId == userId.Value &&
                m.Role == CommunityRole.Admin &&
                m.Status == CommunityMemberStatus.Active &&
                m.Community.IsActive);

        if (!isAdmin) return NotFound();

        var invitations = await _db.CommunityInvitations
            .AsNoTracking()
            .Where(i => i.CommunityId == communityId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.Id,
                i.MaxUses,
                i.UseCount,
                i.ExpiresAt,
                i.IsRevoked,
                i.CreatedAt
            })
            .ToListAsync();

        return Ok(invitations);
    }

    // POST /api/communities/{communityId}/invitations/{id}/revoke

    [HttpPost(
        "{communityId:guid}/invitations/{invitationId:guid}/revoke")]
    public async Task<IActionResult> Revoke(
        Guid communityId,
        Guid invitationId)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var isAdmin = await _db.CommunityMembers
            .AsNoTracking()
            .AnyAsync(m =>
                m.CommunityId == communityId &&
                m.UserId == userId.Value &&
                m.Role == CommunityRole.Admin &&
                m.Status == CommunityMemberStatus.Active &&
                m.Community.IsActive);

        if (!isAdmin) return NotFound();

        var invitation = await _db.CommunityInvitations
            .FirstOrDefaultAsync(i =>
                i.Id == invitationId &&
                i.CommunityId == communityId);

        if (invitation is null) return NotFound();

        if (!invitation.IsRevoked)
        {
            var now = DateTime.UtcNow;
            invitation.IsRevoked = true;
            invitation.RevokedAt = now;
            invitation.UpdatedAt = now;

            await _db.SaveChangesAsync();
        }

        return NoContent();
    }

    private Guid? CurrentUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var id)
            ? id
            : null;
    }

    private static string HashCode(string code)
    {
        var bytes = SHA256.HashData(
            Encoding.UTF8.GetBytes(code));

        return Convert.ToHexString(bytes);
    }
}

public class CreateInvitationRequest
{
    public int MaxUses { get; set; } = 1;
    public int ExpiresInHours { get; set; } = 24;
}

public class JoinCommunityRequest
{
    public string Code { get; set; } = string.Empty;
}
