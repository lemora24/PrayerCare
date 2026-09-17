namespace PrayerCare.Api.Models.Dashboard;

public class DashboardResponse
{
    public int TotalPeople { get; set; }

    public int ActivePrayerRequests { get; set; }

    public int FollowingUpPrayerRequests { get; set; }

    public int AnsweredPrayerRequests { get; set; }

    public int TotalPrayerLogs { get; set; }

    public List<PrayerRequestAttentionResponse> NeedsAttention { get; set; }
        = new();
}