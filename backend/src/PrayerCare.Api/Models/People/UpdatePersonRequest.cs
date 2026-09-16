using PrayerCare.Domain.Enums;

namespace PrayerCare.Api.Models.People;

public class UpdatePersonRequest
{
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public RelationshipType Relationship { get; set; } = RelationshipType.Other;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Notes { get; set; }

    public string? ProfileImageUrl { get; set; }
}