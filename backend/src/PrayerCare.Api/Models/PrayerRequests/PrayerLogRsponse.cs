namespace PrayerCare.Api.Models.PrayerRequests;

public class PrayerLogResponse
{
    public Guid Id { get; set; }
    public Guid PrayerRequestId { get; set; }
    public DateTime PrayedAt { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}