using PrayerCare.Domain.Common;

namespace PrayerCare.Domain.Entities;

public class PrayerLog : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid PrayerRequestId { get; set; }

    public DateTime PrayedAt { get; set; } = DateTime.UtcNow;

    public string? Note { get; set; }

    public PrayerRequest PrayerRequest { get; set; } = null!;
}
