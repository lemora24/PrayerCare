using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrayerCare.Domain.Entities;

namespace PrayerCare.Infrastructure.Persistence.Configurations;

public class PrayerLogConfiguration
    : IEntityTypeConfiguration<PrayerLog>
{
    public void Configure(EntityTypeBuilder<PrayerLog> builder)
    {
        builder.ToTable("PrayerLogs");

        builder.HasKey(log => log.Id);

        builder.Property(log => log.Note)
            .HasMaxLength(2000);

        builder.Property(log => log.PrayedAt)
            .IsRequired();

        builder.HasIndex(log => log.UserId);

        builder.HasIndex(log => log.PrayerRequestId);

        builder.HasIndex(log => new
        {
            log.UserId,
            log.PrayedAt
        });
    }
}