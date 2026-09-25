using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrayerCare.Domain.Entities;

namespace PrayerCare.Infrastructure.Persistence.Configurations;

public class PrayerReminderConfiguration
    : IEntityTypeConfiguration<PrayerReminder>
{
    public void Configure(
        EntityTypeBuilder<PrayerReminder> builder)
    {
        builder.ToTable("PrayerReminders");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ReminderTime)
            .HasColumnType("time")
            .IsRequired();
        
        builder.Property(x => x.TimeZoneId)
            .HasMaxLength(100)
            .IsRequired()
            .HasDefaultValue("America/Costa_Rica");

        builder.Property(x => x.IsEnabled)
            .IsRequired();

        builder.HasIndex(x => x.UserId);

        builder.HasIndex(x => x.PersonId);

        builder.HasIndex(x => new
        {
            x.UserId,
            x.IsEnabled
        });

        builder.HasOne(x => x.Person)
            .WithMany(x => x.PrayerReminders)
            .HasForeignKey(x => x.PersonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}