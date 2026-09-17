using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrayerCare.Api.Models.PrayerRequests;
using PrayerCare.Domain.Entities;
using PrayerCare.Domain.Enums;
using PrayerCare.Infrastructure.Persistence;

namespace PrayerCare.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class PrayerRequestsController : ControllerBase
{
    private readonly PrayerCareDbContext _dbContext;

    public PrayerRequestsController(PrayerCareDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // GET: /api/prayer-requests
    [HttpGet("prayer-requests")]
    public async Task<ActionResult<IEnumerable<PrayerRequestResponse>>> GetAll()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var requests = await _dbContext.PrayerRequests
            .AsNoTracking()
            .Include(x => x.Person)
            .Where(x => x.UserId == userId.Value)
            .OrderByDescending(x => x.Priority)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(requests.Select(ToResponse));
    }

    // GET: /api/prayer-requests/{id}
    [HttpGet("prayer-requests/{id:guid}")]
    public async Task<ActionResult<PrayerRequestResponse>> GetById(Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var request = await _dbContext.PrayerRequests
            .AsNoTracking()
            .Include(x => x.Person)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == userId.Value);

        if (request is null)
            return NotFound();

        return Ok(ToResponse(request));
    }

    // GET: /api/people/{personId}/prayer-requests
    [HttpGet("people/{personId:guid}/prayer-requests")]
    public async Task<ActionResult<IEnumerable<PrayerRequestResponse>>> GetForPerson(
        Guid personId)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var personExists = await _dbContext.People
            .AnyAsync(x =>
                x.Id == personId &&
                x.UserId == userId.Value);

        if (!personExists)
            return NotFound();

        var requests = await _dbContext.PrayerRequests
            .AsNoTracking()
            .Include(x => x.Person)
            .Where(x =>
                x.PersonId == personId &&
                x.UserId == userId.Value)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(requests.Select(ToResponse));
    }

    // POST: /api/people/{personId}/prayer-requests
    [HttpPost("people/{personId:guid}/prayer-requests")]
    public async Task<ActionResult<PrayerRequestResponse>> Create(
        Guid personId,
        CreatePrayerRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Title is required."
            });
        }

        if (!Enum.IsDefined(request.Category))
        {
            return BadRequest(new
            {
                message = "Invalid prayer category."
            });
        }

        if (!Enum.IsDefined(request.Priority))
        {
            return BadRequest(new
            {
                message = "Invalid prayer priority."
            });
        }

        var person = await _dbContext.People
            .FirstOrDefaultAsync(x =>
                x.Id == personId &&
                x.UserId == userId.Value);

        if (person is null)
            return NotFound();

        var now = DateTime.UtcNow;

        var prayerRequest = new PrayerRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId.Value,
            PersonId = person.Id,
            Person = person,
            Title = request.Title.Trim(),
            Description = CleanOptional(request.Description),
            Category = request.Category,
            Priority = request.Priority,
            Status = PrayerRequestStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.PrayerRequests.Add(prayerRequest);

        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = prayerRequest.Id },
            ToResponse(prayerRequest));
    }

    // PUT: /api/prayer-requests/{id}
    [HttpPut("prayer-requests/{id:guid}")]
    public async Task<ActionResult<PrayerRequestResponse>> Update(
        Guid id,
        UpdatePrayerRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Title is required."
            });
        }

        if (!Enum.IsDefined(request.Category) ||
            !Enum.IsDefined(request.Priority) ||
            !Enum.IsDefined(request.Status))
        {
            return BadRequest(new
            {
                message = "One or more enum values are invalid."
            });
        }

        var prayerRequest = await _dbContext.PrayerRequests
            .Include(x => x.Person)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == userId.Value);

        if (prayerRequest is null)
            return NotFound();

        prayerRequest.Title = request.Title.Trim();
        prayerRequest.Description = CleanOptional(request.Description);
        prayerRequest.Category = request.Category;
        prayerRequest.Priority = request.Priority;
        prayerRequest.Status = request.Status;
        prayerRequest.UpdatedAt = DateTime.UtcNow;

        if (request.Status == PrayerRequestStatus.Answered &&
            prayerRequest.AnsweredAt is null)
        {
            prayerRequest.AnsweredAt = DateTime.UtcNow;
        }
        else if (request.Status != PrayerRequestStatus.Answered)
        {
            prayerRequest.AnsweredAt = null;
        }

        await _dbContext.SaveChangesAsync();

        return Ok(ToResponse(prayerRequest));
    }

    // POST: /api/prayer-requests/{id}/pray
    [HttpPost("prayer-requests/{id:guid}/pray")]
    public async Task<ActionResult<PrayerRequestResponse>> Pray(
        Guid id,
        PrayRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var prayerRequest = await _dbContext.PrayerRequests
            .Include(x => x.Person)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == userId.Value);

        if (prayerRequest is null)
            return NotFound();

        var now = DateTime.UtcNow;

        var log = new PrayerLog
        {
            Id = Guid.NewGuid(),
            UserId = userId.Value,
            PrayerRequestId = prayerRequest.Id,
            PrayerRequest = prayerRequest,
            PrayedAt = now,
            Note = CleanOptional(request.Note),
            CreatedAt = now,
            UpdatedAt = now
        };

        prayerRequest.LastPrayedAt = now;
        prayerRequest.Person.LastPrayedAt = now;
        prayerRequest.UpdatedAt = now;
        prayerRequest.Person.UpdatedAt = now;

        _dbContext.PrayerLogs.Add(log);

        await _dbContext.SaveChangesAsync();

        return Ok(ToResponse(prayerRequest));
    }

    // POST: /api/prayer-requests/{id}/answer
    [HttpPost("prayer-requests/{id:guid}/answer")]
    public async Task<ActionResult<PrayerRequestResponse>> MarkAnswered(Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var prayerRequest = await _dbContext.PrayerRequests
            .Include(x => x.Person)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == userId.Value);

        if (prayerRequest is null)
            return NotFound();

        var now = DateTime.UtcNow;

        prayerRequest.Status = PrayerRequestStatus.Answered;
        prayerRequest.AnsweredAt ??= now;
        prayerRequest.UpdatedAt = now;

        await _dbContext.SaveChangesAsync();

        return Ok(ToResponse(prayerRequest));
    }

    // DELETE: /api/prayer-requests/{id}
    [HttpDelete("prayer-requests/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var prayerRequest = await _dbContext.PrayerRequests
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == userId.Value);

        if (prayerRequest is null)
            return NotFound();

        _dbContext.PrayerRequests.Remove(prayerRequest);

        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

        // GET: /api/prayer-requests/{id}/logs
    [HttpGet("prayer-requests/{id:guid}/logs")]
    public async Task<ActionResult<IEnumerable<PrayerLogResponse>>> GetPrayerLogs(
        Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var prayerRequestExists = await _dbContext.PrayerRequests
            .AnyAsync(x =>
                x.Id == id &&
                x.UserId == userId.Value);

        if (!prayerRequestExists)
            return NotFound();

        var logs = await _dbContext.PrayerLogs
            .AsNoTracking()
            .Where(x =>
                x.PrayerRequestId == id &&
                x.UserId == userId.Value)
            .OrderByDescending(x => x.PrayedAt)
            .Select(x => new PrayerLogResponse
            {
                Id = x.Id,
                PrayerRequestId = x.PrayerRequestId,
                PrayedAt = x.PrayedAt,
                Note = x.Note,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();

        return Ok(logs);
    }

    private Guid? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

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

    private static PrayerRequestResponse ToResponse(
        PrayerRequest prayerRequest)
    {
        return new PrayerRequestResponse
        {
            Id = prayerRequest.Id,
            PersonId = prayerRequest.PersonId,
            PersonName = string.Join(
                " ",
                new[]
                {
                    prayerRequest.Person.FirstName,
                    prayerRequest.Person.LastName
                }
                .Where(x => !string.IsNullOrWhiteSpace(x))),
            Title = prayerRequest.Title,
            Description = prayerRequest.Description,
            Category = prayerRequest.Category,
            Priority = prayerRequest.Priority,
            Status = prayerRequest.Status,
            LastPrayedAt = prayerRequest.LastPrayedAt,
            AnsweredAt = prayerRequest.AnsweredAt,
            CreatedAt = prayerRequest.CreatedAt,
            UpdatedAt = prayerRequest.UpdatedAt
        };
    }
}