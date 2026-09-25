namespace PrayerCare.Api.Models.PrayerReminders;

public class PrayerAgendaItemResponse
{
    public Guid ReminderId { get; set; }

    public Guid PersonId { get; set; }

    public string PersonName { get; set; } = string.Empty;

    public TimeOnly ReminderTime { get; set; }

    public string TimeZoneId { get; set; } = string.Empty;
}