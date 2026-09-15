using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrayerCare.Domain.Entities;

namespace PrayerCare.Infrastructure.Persistence.Configurations;

public class PrayerRequestConfiguration
    : IEntityTypeConfiguration<PrayerRequest>
{
    public void Configure(EntityTypeBuilder<PrayerRequest> builder)
    {
        builder.ToTable("PrayerRequests");

        builder.HasKey(request => request.Id);

        builder.Property(request => request.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(request => request.Description)
            .HasMaxLength(4000);

        builder.HasIndex(request => request.UserId);

        builder.HasIndex(request => request.PersonId);

        builder.HasIndex(request => new
        {
            request.UserId,
            request.Status
        });

        builder.HasMany(request => request.PrayerLogs)
            .WithOne(log => log.PrayerRequest)
            .HasForeignKey(log => log.PrayerRequestId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}