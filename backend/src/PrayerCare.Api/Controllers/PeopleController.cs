using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrayerCare.Api.Models.People;
using PrayerCare.Domain.Entities;
using PrayerCare.Infrastructure.Persistence;

namespace PrayerCare.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/people")]
public class PeopleController : ControllerBase
{
    private readonly PrayerCareDbContext _dbContext;

    public PeopleController(PrayerCareDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonResponse>>> GetAll()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var people = await _dbContext.People
            .AsNoTracking()
            .Where(person => person.UserId == userId.Value)
            .OrderBy(person => person.FirstName)
            .ThenBy(person => person.LastName)
            .Select(person => ToResponse(person))
            .ToListAsync();

        return Ok(people);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PersonResponse>> GetById(Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var person = await _dbContext.People
            .AsNoTracking()
            .FirstOrDefaultAsync(person =>
                person.Id == id && // Para que ninguna otra persona pueda acceder a la información de otra persona, se filtra por el userId del usuario autenticado
                person.UserId == userId.Value);

        if (person is null)
            return NotFound();

        return Ok(ToResponse(person));
    }

    [HttpPost]
public async Task<ActionResult<PersonResponse>> Create(
    CreatePersonRequest request)
{
    var userId = GetCurrentUserId();

    if (userId is null)
        return Unauthorized();

    if (string.IsNullOrWhiteSpace(request.FirstName))
    {
        return BadRequest(new
        {
            message = "First name is required."
        });
    }

    if (!Enum.IsDefined(request.Relationship))
    {
        return BadRequest(new
        {
            message = "Invalid relationship type."
        });
    }

    var now = DateTime.UtcNow;

    var person = new Person
    {
        Id = Guid.NewGuid(),
        UserId = userId.Value,
        FirstName = request.FirstName.Trim(),
        LastName = CleanOptional(request.LastName),
        Relationship = request.Relationship,
        Phone = CleanOptional(request.Phone),
        Email = CleanOptional(request.Email),
        Notes = CleanOptional(request.Notes),
        ProfileImageUrl = CleanOptional(request.ProfileImageUrl),
        CreatedAt = now,
        UpdatedAt = now
    };

    _dbContext.People.Add(person);

    await _dbContext.SaveChangesAsync();

    return CreatedAtAction(
        nameof(GetById),
        new { id = person.Id },
        ToResponse(person));
}

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PersonResponse>> Update(
        Guid id,
        UpdatePersonRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.FirstName))
        {
            return BadRequest(new
            {
                message = "First name is required."
            });
        }

        var person = await _dbContext.People
            .FirstOrDefaultAsync(person =>
                person.Id == id &&
                person.UserId == userId.Value);

        if (person is null)
            return NotFound();

        person.FirstName = request.FirstName.Trim();
        if (!Enum.IsDefined(request.Relationship))
        {
            return BadRequest(new
            {
                message = "Invalid relationship type."
            });
        }
        person.LastName = CleanOptional(request.LastName);
        person.Relationship = request.Relationship;
        person.Phone = CleanOptional(request.Phone);
        person.Email = CleanOptional(request.Email);
        person.Notes = CleanOptional(request.Notes);
        person.ProfileImageUrl = CleanOptional(request.ProfileImageUrl);
        person.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Ok(ToResponse(person));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        var person = await _dbContext.People
            .FirstOrDefaultAsync(person =>
                person.Id == id &&
                person.UserId == userId.Value);

        if (person is null)
            return NotFound();

        _dbContext.People.Remove(person);

        await _dbContext.SaveChangesAsync();

        return NoContent();
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

    private static PersonResponse ToResponse(Person person)
    {
        return new PersonResponse
        {
            Id = person.Id,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Relationship = person.Relationship,
            Phone = person.Phone,
            Email = person.Email,
            Notes = person.Notes,
            ProfileImageUrl = person.ProfileImageUrl,
            LastPrayedAt = person.LastPrayedAt,
            CreatedAt = person.CreatedAt,
            UpdatedAt = person.UpdatedAt
        };
    }
}