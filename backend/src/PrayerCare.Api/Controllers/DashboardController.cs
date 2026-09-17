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

        var response = new DashboardResponse
        {
            TotalPeople = totalPeople,
            ActivePrayerRequests = activePrayerRequests,
            FollowingUpPrayerRequests = followingUpPrayerRequests,
            AnsweredPrayerRequests = answeredPrayerRequests,
            TotalPrayerLogs = totalPrayerLogs
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