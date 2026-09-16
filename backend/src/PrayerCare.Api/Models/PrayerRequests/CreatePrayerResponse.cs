using PrayerCare.Domain.Enums;

namespace PrayerCare.Api.Models.PrayerRequests;

public class PrayerRequestResponse
{
    public Guid Id { get; set; }
    public Guid PersonId { get; set; }

    public string PersonName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public PrayerCategory Category { get; set; }
    public PrayerPriority Priority { get; set; }
    public PrayerRequestStatus Status { get; set; }

    public DateTime? LastPrayedAt { get; set; }
    public DateTime? AnsweredAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}