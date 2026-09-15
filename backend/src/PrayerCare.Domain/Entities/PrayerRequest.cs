using PrayerCare.Domain.Common;
using PrayerCare.Domain.Enums;

namespace PrayerCare.Domain.Entities;

public class PrayerRequest : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid PersonId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public PrayerCategory Category { get; set; } = PrayerCategory.Other;

    public PrayerPriority Priority { get; set; } = PrayerPriority.Normal;

    public PrayerRequestStatus Status { get; set; } = PrayerRequestStatus.Active;

    public DateTime? LastPrayedAt { get; set; }

    public DateTime? AnsweredAt { get; set; }

    public Person Person { get; set; } = null!;

    public ICollection<PrayerLog> PrayerLogs { get; set; }
        = new List<PrayerLog>();
}