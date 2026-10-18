
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
[Route("api/communities")]
public class CommunitiesController : ControllerBase
{
    private readonly PrayerCareDbContext _dbContext;

    public CommunitiesController(
        PrayerCareDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // ==========================================
    // POST /api/communities
    // Crear una comunidad privada
    // ==========================================

    [HttpPost]
    public async Task<ActionResult<CommunityResponse>> Create(
        [FromBody] CreateCommunityRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "El nombre de la comunidad es obligatorio."
            });
        }

        var name = request.Name.Trim();
        var description = CleanOptional(request.Description);
        var imageUrl = CleanOptional(request.ImageUrl);

        if (name.Length > 150)
        {
            return BadRequest(new
            {
                message = "El nombre no puede superar 150 caracteres."
            });
        }

        if (description?.Length > 1000)
        {
            return BadRequest(new
            {
                message = "La descripción no puede superar 1000 caracteres."
            });
        }

        if (imageUrl?.Length > 2048)
        {
            return BadRequest(new
            {
                message = "La URL de la imagen es demasiado larga."
            });
        }

        var now = DateTime.UtcNow;

        var community = new Community
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            ImageUrl = imageUrl,
            CreatedByUserId = userId.Value,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        var founderMembership = new CommunityMember
        {
            Id = Guid.NewGuid(),
            CommunityId = community.Id,
            UserId = userId.Value,
            Role = CommunityRole.Admin,
            Status = CommunityMemberStatus.Active,
            JoinedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };

        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync();

        _dbContext.Communities.Add(community);
        _dbContext.CommunityMembers.Add(founderMembership);

        await _dbContext.SaveChangesAsync();
        await transaction.CommitAsync();

        var response = ToCommunityResponse(
            community,
            founderMembership.Role,
            1);

        return CreatedAtAction(
            nameof(GetById),
            new { id = community.Id },
            response);
    }

    // ==========================================
    // GET /api/communities
    // Listar comunidades del usuario
    // ==========================================

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommunityResponse>>>
        GetMyCommunities()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var communities = await _dbContext.CommunityMembers
            .AsNoTracking()
            .Where(member =>
                member.UserId == userId.Value &&
                member.Status == CommunityMemberStatus.Active &&
                member.Community.IsActive)
            .Select(member => new CommunityResponse
            {
                Id = member.Community.Id,
                Name = member.Community.Name,
                Description = member.Community.Description,
                ImageUrl = member.Community.ImageUrl,
                CreatedByUserId =
                    member.Community.CreatedByUserId,
                IsActive = member.Community.IsActive,
                MyRole = member.Role,
                MemberCount = member.Community.Members.Count(
                    other =>
                        other.Status ==
                        CommunityMemberStatus.Active),
                CreatedAt = member.Community.CreatedAt
            })
            .OrderBy(community => community.Name)
            .ToListAsync();

        return Ok(communities);
    }

    // ==========================================
    // GET /api/communities/{id}
    // Consultar una comunidad autorizada
    // ==========================================

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CommunityResponse>> GetById(
        Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var result = await _dbContext.CommunityMembers
            .AsNoTracking()
            .Where(member =>
                member.CommunityId == id &&
                member.UserId == userId.Value &&
                member.Status == CommunityMemberStatus.Active &&
                member.Community.IsActive)
            .Select(member => new CommunityResponse
            {
                Id = member.Community.Id,
                Name = member.Community.Name,
                Description = member.Community.Description,
                ImageUrl = member.Community.ImageUrl,
                CreatedByUserId =
                    member.Community.CreatedByUserId,
                IsActive = member.Community.IsActive,
                MyRole = member.Role,
                MemberCount = member.Community.Members.Count(
                    other =>
                        other.Status ==
                        CommunityMemberStatus.Active),
                CreatedAt = member.Community.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    // ==========================================
    // GET /api/communities/{id}/members
    // Listar miembros de una comunidad
    // ==========================================

    [HttpGet("{id:guid}/members")]
    public async Task<ActionResult<IEnumerable<CommunityMemberResponse>>>
        GetMembers(Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var hasAccess = await _dbContext.CommunityMembers
            .AsNoTracking()
            .AnyAsync(member =>
                member.CommunityId == id &&
                member.UserId == userId.Value &&
                member.Status == CommunityMemberStatus.Active &&
                member.Community.IsActive);

        if (!hasAccess)
            return NotFound();

        var members = await (
            from member in _dbContext.CommunityMembers.AsNoTracking()
            join user in _dbContext.Users.AsNoTracking()
                on member.UserId equals user.Id
            where member.CommunityId == id &&
                  member.Status == CommunityMemberStatus.Active
            orderby user.FirstName, user.LastName
            select new CommunityMemberResponse
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = member.Role,
                JoinedAt = member.JoinedAt
            }
        ).ToListAsync();

        return Ok(members);
    }

    // ==========================================
    // HELPERS
    // ==========================================

    private Guid? GetCurrentUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var userId)
            ? userId
            : null;
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static CommunityResponse ToCommunityResponse(
        Community community,
        CommunityRole myRole,
        int memberCount)
    {
        return new CommunityResponse
        {
            Id = community.Id,
            Name = community.Name,
            Description = community.Description,
            ImageUrl = community.ImageUrl,
            CreatedByUserId = community.CreatedByUserId,
            IsActive = community.IsActive,
            MyRole = myRole,
            MemberCount = memberCount,
            CreatedAt = community.CreatedAt
        };
    }
}

// ==========================================
// REQUEST / RESPONSE MODELS
// ==========================================

public class CreateCommunityRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }
}

public class CommunityResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public Guid CreatedByUserId { get; set; }

    public bool IsActive { get; set; }

    public CommunityRole MyRole { get; set; }

    public int MemberCount { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class CommunityMemberResponse
{
    public Guid UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public CommunityRole Role { get; set; }

    public DateTime JoinedAt { get; set; }
}
