
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrayerCare.Domain.Entities;

namespace PrayerCare.Infrastructure.Persistence.Configurations;

public class CommunityConfiguration
    : IEntityTypeConfiguration<Community>
{
    public void Configure(
        EntityTypeBuilder<Community> builder)
    {
        // Nombre de la tabla
        builder.ToTable("Communities");

        // Llave primaria
        builder.HasKey(c => c.Id);

        // Nombre de la comunidad
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(150);

        // Descripción
        builder.Property(c => c.Description)
            .HasMaxLength(1000);

        // Imagen o logo
        builder.Property(c => c.ImageUrl)
            .HasMaxLength(2048);

        // Usuario fundador
        builder.Property(c => c.CreatedByUserId)
            .IsRequired();

        // Estado de la comunidad
        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Índice para buscar comunidades
        // creadas por un usuario
        builder.HasIndex(c => c.CreatedByUserId);

        // Relación con los miembros
        builder.HasMany(c => c.Members)
            .WithOne(m => m.Community)
            .HasForeignKey(m => m.CommunityId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
