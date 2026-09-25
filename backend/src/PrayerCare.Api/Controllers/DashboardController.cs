using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrayerCare.Api.Models.Dashboard;
using PrayerCare.Domain.Enums;
using PrayerCare.Infrastructure.Persistence;

namespace PrayerCare.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly PrayerCareDbContext _dbContext;

    public DashboardController(PrayerCareDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> Get() //User.ID es identificado por el token de autenticación, no es necesario pasarlo como parámetro
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var totalPeople = await _dbContext.People
            .AsNoTracking()
            .CountAsync(x => x.UserId == userId.Value);

        var activePrayerRequests = await _dbContext.PrayerRequests
            .AsNoTracking()
            .CountAsync(x =>
                x.UserId == userId.Value &&
                x.Status == PrayerRequestStatus.Active);
        
        var followingUpPrayerRequests = await _dbContext.PrayerRequests
        .AsNoTracking()
        .CountAsync(x =>
        x.UserId == userId.Value &&
        x.Status == PrayerRequestStatus.FollowingUp);

        var answeredPrayerRequests = await _dbContext.PrayerRequests
            .AsNoTracking()
            .CountAsync(x =>
                x.UserId == userId.Value && // 
                x.Status == PrayerRequestStatus.Answered);

        var totalPrayerLogs = await _dbContext.PrayerLogs
            .AsNoTracking()
            .CountAsync(x => x.UserId == userId.Value);
        var needsAttention = await _dbContext.PrayerRequests
        .AsNoTracking()
        .Include(x => x.Person)
        .Where(x =>
            x.UserId == userId.Value &&
            (x.Status == PrayerRequestStatus.Active ||
            x.Status == PrayerRequestStatus.FollowingUp))
        .OrderBy(x => x.LastPrayedAt.HasValue)
        .ThenBy(x => x.LastPrayedAt)
        .ThenByDescending(x => x.Priority)
        .ThenBy(x => x.CreatedAt)
        .Take(5)
        .ToListAsync();

    var attentionResponses = needsAttention
        .Select(x => new PrayerRequestAttentionResponse
        {
            Id = x.Id,
            PersonId = x.PersonId,
            PersonName = string.Join(
                " ",
                new[]
                {
                    x.Person.FirstName,
                    x.Person.LastName
                }.Where(name => !string.IsNullOrWhiteSpace(name))),
            Title = x.Title,
            Priority = x.Priority,
            Status = x.Status,
            LastPrayedAt = x.LastPrayedAt,
            CreatedAt = x.CreatedAt
        })
        .ToList();

        var recentPrayerLogs = await _dbContext.PrayerLogs
            .AsNoTracking()
            .Include(x => x.PrayerRequest)
                .ThenInclude(x => x.Person)
            .Where(x => x.UserId == userId.Value)
            .OrderByDescending(x => x.PrayedAt)
            .ThenByDescending(x => x.CreatedAt)
            .Take(5)
            .ToListAsync();

        var recentActivity = recentPrayerLogs
            .Select(x => new RecentPrayerActivityResponse
            {
                Id = x.Id,
                PrayerRequestId = x.PrayerRequestId,
                PersonId = x.PrayerRequest.PersonId,

                PersonName = string.Join(
                    " ",
                    new[]
                    {
                        x.PrayerRequest.Person.FirstName,
                        x.PrayerRequest.Person.LastName
                    }.Where(name => !string.IsNullOrWhiteSpace(name))),

                PrayerRequestTitle = x.PrayerRequest.Title,
                PrayedAt = x.PrayedAt,
                Note = x.Note
            })
            .ToList();

        var response = new DashboardResponse
        {
            TotalPeople = totalPeople,
            ActivePrayerRequests = activePrayerRequests,
            FollowingUpPrayerRequests = followingUpPrayerRequests,
            AnsweredPrayerRequests = answeredPrayerRequests,
            TotalPrayerLogs = totalPrayerLogs,
            NeedsAttention = attentionResponses,
            RecentActivity = recentActivity
        };

        return Ok(response);
    }

    private Guid? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var userId)
            ? userId
            : null;
    }
}