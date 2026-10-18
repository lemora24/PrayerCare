
using System.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrayerCare.Domain.Entities;
using PrayerCare.Domain.Enums;
using PrayerCare.Infrastructure.Persistence;

namespace PrayerCare.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/communities/{communityId:guid}/members")]
public class CommunityMembersController : ControllerBase
{
    private readonly PrayerCareDbContext _db;

    public CommunityMembersController(PrayerCareDbContext db)
    {
        _db = db;
    }

    // PUT /api/communities/{communityId}/members/{userId}/role

    [HttpPut("{userId:guid}/role")]
    public async Task<IActionResult> UpdateRole(
        Guid communityId,
        Guid userId,
        [FromBody] UpdateCommunityRoleRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
            return Unauthorized();

        if (!Enum.IsDefined(request.Role))
        {
            return BadRequest(new
            {
                message = "El rol indicado no es válido."
            });
        }

        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        if (!await IsActiveAdminAsync(
                communityId, currentUserId.Value))
        {
            return NotFound();
        }

        var member = await _db.CommunityMembers
            .FirstOrDefaultAsync(m =>
                m.CommunityId == communityId &&
                m.UserId == userId);

        if (member is null)
            return NotFound();

        if (member.Status != CommunityMemberStatus.Active)
        {
            return Conflict(new
            {
                message =
                    "Solo se puede cambiar el rol de un miembro activo."
            });
        }

        if (member.Role == request.Role)
        {
            return Ok(ToResponse(member));
        }

        if (member.Role == CommunityRole.Admin &&
            request.Role != CommunityRole.Admin)
        {
            var activeAdminCount = await _db.CommunityMembers
                .CountAsync(m =>
                    m.CommunityId == communityId &&
                    m.Role == CommunityRole.Admin &&
                    m.Status == CommunityMemberStatus.Active);

            if (activeAdminCount <= 1)
            {
                return Conflict(new
                {
                    message =
                        "No se puede cambiar el rol del último administrador activo."
                });
            }
        }

        member.Role = request.Role;
        member.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(ToResponse(member));
    }

    // PUT /api/communities/{communityId}/members/{userId}/status

    [HttpPut("{userId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid communityId,
        Guid userId,
        [FromBody] UpdateCommunityStatusRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
            return Unauthorized();

        if (!Enum.IsDefined(request.Status))
        {
            return BadRequest(new
            {
                message = "El estado indicado no es válido."
            });
        }

        // Pending se reserva para futuros flujos de aprobación.
        if (request.Status == CommunityMemberStatus.Pending)
        {
            return BadRequest(new
            {
                message =
                    "No se puede asignar el estado Pending manualmente."
            });
        }

        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        if (!await IsActiveAdminAsync(
                communityId, currentUserId.Value))
        {
            return NotFound();
        }

        var member = await _db.CommunityMembers
            .FirstOrDefaultAsync(m =>
                m.CommunityId == communityId &&
                m.UserId == userId);

        if (member is null)
            return NotFound();

        if (member.Status == request.Status)
        {
            return Ok(ToResponse(member));
        }

        // Removed es un estado final.
        // Reincorporar usuarios retirados requerirá
        // un flujo administrativo separado.
        if (member.Status == CommunityMemberStatus.Removed)
        {
            return Conflict(new
            {
                message =
                    "Una membresía retirada no puede reactivarse desde este endpoint."
            });
        }

        // No activar directamente solicitudes pendientes.
        if (member.Status == CommunityMemberStatus.Pending)
        {
            return Conflict(new
            {
                message =
                    "Las solicitudes pendientes requieren un flujo de aprobación."
            });
        }

        if (member.Role == CommunityRole.Admin &&
            request.Status != CommunityMemberStatus.Active &&
            member.Status == CommunityMemberStatus.Active)
        {
            var activeAdminCount = await _db.CommunityMembers
                .CountAsync(m =>
                    m.CommunityId == communityId &&
                    m.Role == CommunityRole.Admin &&
                    m.Status == CommunityMemberStatus.Active);

            if (activeAdminCount <= 1)
            {
                return Conflict(new
                {
                    message =
                        "No se puede suspender ni retirar al último administrador activo."
                });
            }
        }

        member.Status = request.Status;
        member.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(ToResponse(member));
    }

    private async Task<bool> IsActiveAdminAsync(
        Guid communityId,
        Guid userId)
    {
        return await _db.CommunityMembers
            .AsNoTracking()
            .AnyAsync(m =>
                m.CommunityId == communityId &&
                m.UserId == userId &&
                m.Role == CommunityRole.Admin &&
                m.Status == CommunityMemberStatus.Active &&
                m.Community.IsActive);
    }

    private Guid? GetCurrentUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var userId)
            ? userId
            : null;
    }

    private static CommunityMembershipResponse ToResponse(
        CommunityMember member)
    {
        return new CommunityMembershipResponse
        {
            CommunityId = member.CommunityId,
            UserId = member.UserId,
            Role = member.Role,
            Status = member.Status,
            JoinedAt = member.JoinedAt,
            UpdatedAt = member.UpdatedAt
        };
    }
}

public class UpdateCommunityRoleRequest
{
    public CommunityRole Role { get; set; }
}

public class UpdateCommunityStatusRequest
{
    public CommunityMemberStatus Status { get; set; }
}

public class CommunityMembershipResponse
{
    public Guid CommunityId { get; set; }

    public Guid UserId { get; set; }

    public CommunityRole Role { get; set; }

    public CommunityMemberStatus Status { get; set; }

    public DateTime JoinedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
