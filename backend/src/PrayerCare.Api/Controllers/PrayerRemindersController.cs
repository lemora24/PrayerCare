using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrayerCare.Api.Models.PrayerReminders;
using PrayerCare.Domain.Entities;
using PrayerCare.Infrastructure.Persistence;

namespace PrayerCare.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/people/{personId:guid}/reminders")]
public class PrayerRemindersController : ControllerBase
{
    private readonly PrayerCareDbContext _context;

    public PrayerRemindersController(PrayerCareDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        Guid personId,
        [FromBody] CreatePrayerReminderRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var personExists = await _context.People.AnyAsync(
            person => person.Id == personId && person.UserId == userId);

        if (!personExists)
        {
            return NotFound("No se encontró la persona.");
        }

        if (!request.Sunday &&
            !request.Monday &&
            !request.Tuesday &&
            !request.Wednesday &&
            !request.Thursday &&
            !request.Friday &&
            !request.Saturday)
        {
            return BadRequest("Selecciona al menos un día para el recordatorio.");
        }

        var reminder = new PrayerReminder
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PersonId = personId,
            ReminderTime = request.ReminderTime,
            Sunday = request.Sunday,
            Monday = request.Monday,
            Tuesday = request.Tuesday,
            Wednesday = request.Wednesday,
            Thursday = request.Thursday,
            Friday = request.Friday,
            Saturday = request.Saturday,
            IsEnabled = request.IsEnabled,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.PrayerReminders.Add(reminder);
        await _context.SaveChangesAsync();

        return Created(
            $"/api/people/{personId}/reminders/{reminder.Id}",
            new
            {
                reminder.Id,
                reminder.PersonId,
                reminder.ReminderTime,
                reminder.Sunday,
                reminder.Monday,
                reminder.Tuesday,
                reminder.Wednesday,
                reminder.Thursday,
                reminder.Friday,
                reminder.Saturday,
                reminder.IsEnabled
            });
    }
    [HttpGet]
    public async Task<IActionResult> GetByPerson(Guid personId)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var personExists = await _context.People.AnyAsync(
            person => person.Id == personId && person.UserId == userId);

        if (!personExists)
        {
            return NotFound("No se encontró la persona.");
        }

        var reminders = await _context.PrayerReminders
            .AsNoTracking()
            .Where(reminder =>
                reminder.PersonId == personId &&
                reminder.UserId == userId)
            .OrderBy(reminder => reminder.ReminderTime)
            .Select(reminder => new
            {
                reminder.Id,
                reminder.PersonId,
                reminder.ReminderTime,
                reminder.Sunday,
                reminder.Monday,
                reminder.Tuesday,
                reminder.Wednesday,
                reminder.Thursday,
                reminder.Friday,
                reminder.Saturday,
                reminder.IsEnabled
            })
            .ToListAsync();

        return Ok(reminders);
    }
    [HttpPut("{reminderId:guid}")]
    public async Task<IActionResult> Update(
        Guid personId,
        Guid reminderId,
        [FromBody] UpdatePrayerReminderRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var reminder = await _context.PrayerReminders
            .FirstOrDefaultAsync(x =>
                x.Id == reminderId &&
                x.PersonId == personId &&
                x.UserId == userId);

        if (reminder is null)
        {
            return NotFound("No se encontró el recordatorio.");
        }

        if (!request.Sunday &&
            !request.Monday &&
            !request.Tuesday &&
            !request.Wednesday &&
            !request.Thursday &&
            !request.Friday &&
            !request.Saturday)
        {
            return BadRequest("Selecciona al menos un día para el recordatorio.");
        }

        reminder.ReminderTime = request.ReminderTime;
        reminder.Sunday = request.Sunday;
        reminder.Monday = request.Monday;
        reminder.Tuesday = request.Tuesday;
        reminder.Wednesday = request.Wednesday;
        reminder.Thursday = request.Thursday;
        reminder.Friday = request.Friday;
        reminder.Saturday = request.Saturday;
        reminder.IsEnabled = request.IsEnabled;
        reminder.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            reminder.Id,
            reminder.PersonId,
            reminder.ReminderTime,
            reminder.Sunday,
            reminder.Monday,
            reminder.Tuesday,
            reminder.Wednesday,
            reminder.Thursday,
            reminder.Friday,
            reminder.Saturday,
            reminder.IsEnabled
        });
    }
}