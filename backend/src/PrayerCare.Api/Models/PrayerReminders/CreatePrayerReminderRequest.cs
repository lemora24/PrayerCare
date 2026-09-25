namespace PrayerCare.Api.Models.PrayerReminders;

public class CreatePrayerReminderRequest
{
    public TimeOnly ReminderTime { get; set; }
    public string TimeZoneId { get; set; } = "America/Costa_Rica"; // Default timezone for Costa Rica

    public bool Sunday { get; set; }

    public bool Monday { get; set; }

    public bool Tuesday { get; set; }

    public bool Wednesday { get; set; }

    public bool Thursday { get; set; }

    public bool Friday { get; set; }

    public bool Saturday { get; set; }

    public bool IsEnabled { get; set; } = true;
}