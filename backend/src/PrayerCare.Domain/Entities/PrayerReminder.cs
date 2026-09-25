using PrayerCare.Domain.Common;

namespace PrayerCare.Domain.Entities;

public class PrayerReminder : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid PersonId { get; set; }

    public TimeOnly ReminderTime { get; set; }

    public bool Sunday { get; set; }

    public bool Monday { get; set; }

    public bool Tuesday { get; set; }

    public bool Wednesday { get; set; }

    public bool Thursday { get; set; }

    public bool Friday { get; set; }

    public bool Saturday { get; set; }

    public bool IsEnabled { get; set; } = true;

    public Person Person { get; set; } = null!;
}