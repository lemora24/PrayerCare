using PrayerCare.Domain.Enums;

namespace PrayerCare.Api.Models.PrayerRequests;

public class UpdatePrayerRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PrayerCategory Category { get; set; }
    public PrayerPriority Priority { get; set; }
    public PrayerRequestStatus Status { get; set; }
}