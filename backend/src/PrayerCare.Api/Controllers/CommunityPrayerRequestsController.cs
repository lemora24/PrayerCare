
using System.ComponentModel.DataAnnotations;
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
[Route("api/communities/{communityId:guid}/prayer-requests")]
public class CommunityPrayerRequestsController : ControllerBase
{
    private readonly PrayerCareDbContext _db;

    public CommunityPrayerRequestsController(PrayerCareDbContext db)
    {
        _db = db;
    }

    // ==========================================
    // MODELOS DE ENTRADA
    // ==========================================

    public sealed class CreateCommunityPrayerRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 3)]
        public string Title { get; set; } = string.Empty;

        [StringLength(5000)]
        public string? Description { get; set; }

        public PrayerCategory Category { get; set; }
            = PrayerCategory.Other;
    }

    public sealed class UpdateCommunityPrayerRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 3)]
        public string Title { get; set; } = string.Empty;

        [StringLength(5000)]
        public string? Description { get; set; }

        public PrayerCategory Category { get; set; }
            = PrayerCategory.Other;
    }

    // ==========================================
    // AUTENTICACION Y AUTORIZACION
    // ==========================================

    private Guid? CurrentUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var userId)
            ? userId
            : null;
    }

    private Task<bool> HasActiveMembership(
        Guid communityId,
        Guid userId)
    {
        return _db.CommunityMembers
            .AsNoTracking()
            .AnyAsync(member =>
                member.CommunityId == communityId &&
                member.UserId == userId &&
                member.Status == CommunityMemberStatus.Active &&
                member.Community.IsActive);
    }

    private Task<bool> CanModerate(
        Guid communityId,
        Guid userId)
    {
        return _db.CommunityMembers
            .AsNoTracking()
            .AnyAsync(member =>
                member.CommunityId == communityId &&
                member.UserId == userId &&
                member.Status == CommunityMemberStatus.Active &&
                member.Community.IsActive &&
                (member.Role == CommunityRole.Admin ||
                 member.Role == CommunityRole.Moderator));
    }

    // ==========================================
    // PUBLICAR PETICION
    // POST /api/communities/{communityId}/prayer-requests
    // ==========================================

    [HttpPost]
    public async Task<IActionResult> Create(
        Guid communityId,
        [FromBody] CreateCommunityPrayerRequest input)
    {
        var userId = CurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (!await HasActiveMembership(
                communityId, userId.Value))
            return NotFound();

        var title = input.Title?.Trim();

        if (string.IsNullOrWhiteSpace(title) ||
            title.Length < 3)
        {
            return BadRequest(new
            {
                message = "El titulo debe tener al menos 3 caracteres."
            });
        }

        if (!Enum.IsDefined(input.Category))
        {
            return BadRequest(new
            {
                message = "La categoria no es valida."
            });
        }

        var now = DateTime.UtcNow;

        var request = new CommunityPrayerRequest
        {
            Id = Guid.NewGuid(),
            CommunityId = communityId,
            AuthorUserId = userId.Value,
            Title = title,
            Description = string.IsNullOrWhiteSpace(
                input.Description)
                ? null
                : input.Description.Trim(),
            Category = input.Category,
            Status = PrayerRequestStatus.Active,
            IsHidden = false,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.CommunityPrayerRequests.Add(request);

        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                communityId,
                requestId = request.Id
            },
            new
            {
                request.Id,
                request.CommunityId,
                request.AuthorUserId,
                request.Title,
                request.Description,
                request.Category,
                request.Status,
                request.IsHidden,
                request.CreatedAt
            });
    }

    // ==========================================
    // LISTAR PETICIONES VISIBLES
    // GET /api/communities/{communityId}/prayer-requests
    // ==========================================

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid communityId)
    {
        var userId = CurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (!await HasActiveMembership(
                communityId, userId.Value))
            return NotFound();

        var requests = await _db.CommunityPrayerRequests
            .AsNoTracking()
            .Where(request =>
                request.CommunityId == communityId &&
                !request.IsHidden)
            .OrderByDescending(request => request.CreatedAt)
            .Select(request => new
            {
                request.Id,
                request.CommunityId,
                request.AuthorUserId,
                request.Title,
                request.Description,
                request.Category,
                request.Status,
                request.AnsweredAt,
                request.CreatedAt,
                request.UpdatedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    // ==========================================
    // LISTAR PETICIONES OCULTAS
    // SOLO ADMIN Y MODERATOR
    //
    // GET /api/communities/{communityId}/prayer-requests/moderation/hidden
    // ==========================================

    [HttpGet("moderation/hidden")]
    public async Task<IActionResult> GetHidden(
        Guid communityId)
    {
        var userId = CurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (!await CanModerate(communityId, userId.Value))
            return NotFound();

        var requests = await _db.CommunityPrayerRequests
            .AsNoTracking()
            .Where(request =>
                request.CommunityId == communityId &&
                request.IsHidden)
            .OrderByDescending(request => request.UpdatedAt)
            .Select(request => new
            {
                request.Id,
                request.CommunityId,
                request.AuthorUserId,
                request.Title,
                request.Description,
                request.Category,
                request.Status,
                request.IsHidden,
                request.CreatedAt,
                request.UpdatedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    // ==========================================
    // VER DETALLE DE PETICION VISIBLE
    // GET /api/communities/{communityId}/prayer-requests/{requestId}
    // ==========================================

    [HttpGet("{requestId:guid}")]
    public async Task<IActionResult> GetById(
        Guid communityId,
        Guid requestId)
    {
        var userId = CurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (!await HasActiveMembership(
                communityId, userId.Value))
            return NotFound();

        var request = await _db.CommunityPrayerRequests
            .AsNoTracking()
            .Where(request =>
                request.Id == requestId &&
                request.CommunityId == communityId &&
                !request.IsHidden)
            .Select(request => new
            {
                request.Id,
                request.CommunityId,
                request.AuthorUserId,
                request.Title,
                request.Description,
                request.Category,
                request.Status,
                request.AnsweredAt,
                request.CreatedAt,
                request.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (request is null)
            return NotFound();

        return Ok(request);
    }

    // ==========================================
    // EDITAR PETICION - SOLO EL AUTOR
    // PUT /api/communities/{communityId}/prayer-requests/{requestId}
    // ==========================================

    [HttpPut("{requestId:guid}")]
    public async Task<IActionResult> Update(
        Guid communityId,
        Guid requestId,
        [FromBody] UpdateCommunityPrayerRequest input)
    {
        var userId = CurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (!await HasActiveMembership(
                communityId, userId.Value))
            return NotFound();

        var request = await _db.CommunityPrayerRequests
            .FirstOrDefaultAsync(item =>
                item.Id == requestId &&
                item.CommunityId == communityId);

        if (request is null)
            return NotFound();

        if (request.AuthorUserId != userId.Value)
            return NotFound();

        if (request.IsHidden)
        {
            return Conflict(new
            {
                message = "No puedes editar una peticion oculta."
            });
        }

        var title = input.Title?.Trim();

        if (string.IsNullOrWhiteSpace(title) ||
            title.Length < 3)
        {
            return BadRequest(new
            {
                message = "El titulo debe tener al menos 3 caracteres."
            });
        }

        if (!Enum.IsDefined(input.Category))
        {
            return BadRequest(new
            {
                message = "La categoria no es valida."
            });
        }

        var now = DateTime.UtcNow;

        request.Title = title;
        request.Description = string.IsNullOrWhiteSpace(
            input.Description)
            ? null
            : input.Description.Trim();

        request.Category = input.Category;
        request.LastEditedAt = now;
        request.UpdatedAt = now;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            request.Id,
            request.CommunityId,
            request.AuthorUserId,
            request.Title,
            request.Description,
            request.Category,
            request.Status,
            request.IsHidden,
            request.LastEditedAt,
            request.UpdatedAt
        });
    }

    // ==========================================
    // OCULTAR PETICION
    // SOLO ADMIN Y MODERATOR
    //
    // PUT /api/communities/{communityId}/prayer-requests/{requestId}/hide
    // ==========================================

    [HttpPut("{requestId:guid}/hide")]
    public async Task<IActionResult> Hide(
        Guid communityId,
        Guid requestId)
    {
        var userId = CurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (!await CanModerate(communityId, userId.Value))
            return NotFound();

        var request = await _db.CommunityPrayerRequests
            .FirstOrDefaultAsync(item =>
                item.Id == requestId &&
                item.CommunityId == communityId);

        if (request is null)
            return NotFound();

        if (request.IsHidden)
        {
            return Conflict(new
            {
                message = "La peticion ya esta oculta."
            });
        }

        request.IsHidden = true;
        request.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            request.Id,
            request.CommunityId,
            request.IsHidden,
            request.UpdatedAt,
            message = "Peticion ocultada correctamente."
        });
    }

    // ==========================================
    // RESTAURAR PETICION
    // SOLO ADMIN Y MODERATOR
    //
    // PUT /api/communities/{communityId}/prayer-requests/{requestId}/restore
    // ==========================================

    [HttpPut("{requestId:guid}/restore")]
    public async Task<IActionResult> Restore(
        Guid communityId,
        Guid requestId)
    {
        var userId = CurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (!await CanModerate(communityId, userId.Value))
            return NotFound();

        var request = await _db.CommunityPrayerRequests
            .FirstOrDefaultAsync(item =>
                item.Id == requestId &&
                item.CommunityId == communityId);

        if (request is null)
            return NotFound();

        if (!request.IsHidden)
        {
            return Conflict(new
            {
                message = "La peticion ya esta visible."
            });
        }

        request.IsHidden = false;
        request.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            request.Id,
            request.CommunityId,
            request.IsHidden,
            request.UpdatedAt,
            message = "Peticion restaurada correctamente."
        });
    }
}
