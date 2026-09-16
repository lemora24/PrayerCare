using PrayerCare.Domain.Enums;

namespace PrayerCare.Api.Models.People;

public class PersonResponse
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public RelationshipType Relationship { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Notes { get; set; }

    public string? ProfileImageUrl { get; set; }

    public DateTime? LastPrayedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}