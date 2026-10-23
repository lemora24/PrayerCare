
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrayerCare.Domain.Entities;
using PrayerCare.Infrastructure.Identity;

namespace PrayerCare.Infrastructure.Persistence.Configurations;

public class CommunityPrayerConfiguration
    : IEntityTypeConfiguration<CommunityPrayer>
{
    public void Configure(
        EntityTypeBuilder<CommunityPrayer> builder)
    {
        // ==========================================
        // TABLA Y CLAVE PRIMARIA
        // ==========================================

        builder.ToTable("CommunityPrayers");

        builder.HasKey(prayer => prayer.Id);

        // ==========================================
        // PROPIEDADES OBLIGATORIAS
        // ==========================================

        builder.Property(prayer => prayer.CommunityPrayerRequestId)
            .IsRequired();

        builder.Property(prayer => prayer.UserId)
            .IsRequired();

        builder.Property(prayer => prayer.PrayedAt)
            .IsRequired();

        // ==========================================
        // RELACION CON PETICION COMUNITARIA
        // ==========================================

        builder.HasOne(prayer => prayer.CommunityPrayerRequest)
            .WithMany()
            .HasForeignKey(prayer => prayer.CommunityPrayerRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        // ==========================================
        // RELACION CON USUARIO
        // ==========================================

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(prayer => prayer.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // ==========================================
        // INDICES
        // ==========================================

        // Consultar oraciones de una peticion.
        builder.HasIndex(prayer => new
        {
            prayer.CommunityPrayerRequestId,
            prayer.PrayedAt
        });

        // Consultar historial de oraciones de un usuario.
        builder.HasIndex(prayer => new
        {
            prayer.UserId,
            prayer.PrayedAt
        });
    }
}
