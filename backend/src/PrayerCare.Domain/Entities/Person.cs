using PrayerCare.Domain.Common;
using PrayerCare.Domain.Enums;

namespace PrayerCare.Domain.Entities;

public class Person : BaseEntity
{
    public Guid UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string? ProfileImageUrl { get; set; }

    public RelationshipType Relationship { get; set; } = RelationshipType.Other;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Notes { get; set; }

    public DateTime? LastPrayedAt { get; set; }

    public ICollection<PrayerRequest> PrayerRequests { get; set; }
        = new List<PrayerRequest>();
}