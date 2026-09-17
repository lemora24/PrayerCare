using PrayerCare.Domain.Enums;

namespace PrayerCare.Api.Models.Dashboard;

public class PrayerRequestAttentionResponse
{
    public Guid Id { get; set; }

    public Guid PersonId { get; set; }

    public string PersonName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public PrayerPriority Priority { get; set; }

    public PrayerRequestStatus Status { get; set; }

    public DateTime? LastPrayedAt { get; set; }

    public DateTime CreatedAt { get; set; }
}