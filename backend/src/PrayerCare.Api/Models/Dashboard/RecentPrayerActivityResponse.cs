namespace PrayerCare.Api.Models.Dashboard;

public class RecentPrayerActivityResponse
{
    public Guid Id { get; set; }

    public Guid PrayerRequestId { get; set; }

    public Guid PersonId { get; set; }

    public string PersonName { get; set; } = string.Empty;

    public string PrayerRequestTitle { get; set; } = string.Empty;

    public DateTime PrayedAt { get; set; }

    public string? Note { get; set; }
}