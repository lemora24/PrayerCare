using PrayerCare.Domain.Enums;

namespace PrayerCare.Api.Models.PrayerRequests;

public class CreatePrayerRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PrayerCategory Category { get; set; } = PrayerCategory.Other;
    public PrayerPriority Priority { get; set; } = PrayerPriority.Normal;
}