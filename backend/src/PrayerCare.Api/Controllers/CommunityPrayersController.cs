
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
[Route("api/communities/{communityId:guid}/prayer-requests/{requestId:guid}/prayers")]
public class CommunityPrayersController : ControllerBase
{
    private readonly PrayerCareDbContext _db;

    public CommunityPrayersController(PrayerCareDbContext db)
    {
        _db = db;
    }

    // ==========================================
    // USUARIO AUTENTICADO
    // ==========================================

    private Guid? CurrentUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var userId)
            ? userId
            : null;
    }

    // ==========================================
    // VERIFICAR MEMBRESIA ACTIVA
    // ==========================================

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

    // ==========================================
    // VERIFICAR PETICION VISIBLE
    // ==========================================

    private Task<bool> HasVisibleRequest(
        Guid communityId,
        Guid requestId)
    {
        return _db.CommunityPrayerRequests
            .AsNoTracking()
            .AnyAsync(request =>
                request.Id == requestId &&
                request.CommunityId == communityId &&
                !request.IsHidden);
    }

    // ==========================================
    // REGISTRAR "ORE POR TI"
    //
    // POST /api/communities/{communityId}/
    //      prayer-requests/{requestId}/prayers
    // ==========================================

    [HttpPost]
    public async Task<IActionResult> Pray(
        Guid communityId,
        Guid requestId)
    {
        var userId = CurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (!await HasActiveMembership(
                communityId, userId.Value))
            return NotFound();

        if (!await HasVisibleRequest(
                communityId, requestId))
            return NotFound();

        var now = DateTime.UtcNow;

        var prayer = new CommunityPrayer
        {
            Id = Guid.NewGuid(),
            CommunityPrayerRequestId = requestId,
            UserId = userId.Value,
            PrayedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.CommunityPrayers.Add(prayer);

        await _db.SaveChangesAsync();

        var totalPrayers = await _db.CommunityPrayers
            .CountAsync(item =>
                item.CommunityPrayerRequestId == requestId);

        var myPrayers = await _db.CommunityPrayers
            .CountAsync(item =>
                item.CommunityPrayerRequestId == requestId &&
                item.UserId == userId.Value);

        return Ok(new
        {
            message = "Tu oracion ha sido registrada.",
            prayerId = prayer.Id,
            prayedAt = prayer.PrayedAt,
            totalPrayers,
            myPrayers
        });
    }

    // ==========================================
    // ESTADISTICAS DE UNA PETICION
    //
    // GET /api/communities/{communityId}/
    //     prayer-requests/{requestId}/prayers/stats
    // ==========================================

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(
        Guid communityId,
        Guid requestId)
    {
        var userId = CurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (!await HasActiveMembership(
                communityId, userId.Value))
            return NotFound();

        if (!await HasVisibleRequest(
                communityId, requestId))
            return NotFound();

        var prayers = _db.CommunityPrayers
            .AsNoTracking()
            .Where(item =>
                item.CommunityPrayerRequestId == requestId);

        var totalPrayers = await prayers.CountAsync();

        var peopleWhoPrayed = await prayers
            .Select(item => item.UserId)
            .Distinct()
            .CountAsync();

        var myPrayers = await prayers
            .CountAsync(item =>
                item.UserId == userId.Value);

        var lastPrayedAt = await prayers
            .MaxAsync(item => (DateTime?)item.PrayedAt);

        return Ok(new
        {
            communityId,
            requestId,
            totalPrayers,
            peopleWhoPrayed,
            myPrayers,
            lastPrayedAt
        });
    }

    // ==========================================
    // MI HISTORIAL EN ESTA PETICION
    //
    // GET /api/communities/{communityId}/
    //     prayer-requests/{requestId}/prayers/mine
    // ==========================================

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(
        Guid communityId,
        Guid requestId)
    {
        var userId = CurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (!await HasActiveMembership(
                communityId, userId.Value))
            return NotFound();

        if (!await HasVisibleRequest(
                communityId, requestId))
            return NotFound();

        var prayers = await _db.CommunityPrayers
            .AsNoTracking()
            .Where(item =>
                item.CommunityPrayerRequestId == requestId &&
                item.UserId == userId.Value)
            .OrderByDescending(item => item.PrayedAt)
            .Select(item => new
            {
                item.Id,
                item.PrayedAt,
                item.CreatedAt
            })
            .ToListAsync();

        return Ok(prayers);
    }
}
