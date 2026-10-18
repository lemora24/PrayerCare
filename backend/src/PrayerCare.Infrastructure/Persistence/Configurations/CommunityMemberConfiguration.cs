
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrayerCare.Domain.Entities;

namespace PrayerCare.Infrastructure.Persistence.Configurations;

public class CommunityMemberConfiguration
    : IEntityTypeConfiguration<CommunityMember>
{
    public void Configure(
        EntityTypeBuilder<CommunityMember> builder)
    {
        // Nombre de la tabla
        builder.ToTable("CommunityMembers");

        // Llave primaria
        builder.HasKey(m => m.Id);

        // Comunidad a la que pertenece
        builder.Property(m => m.CommunityId)
            .IsRequired();

        // Usuario de ASP.NET Core Identity
        builder.Property(m => m.UserId)
            .IsRequired();

        // Rol dentro de la comunidad
        builder.Property(m => m.Role)
            .HasConversion<int>()
            .IsRequired();

        // Estado de la membresía
        builder.Property(m => m.Status)
            .HasConversion<int>()
            .IsRequired();

        // Fecha de ingreso
        builder.Property(m => m.JoinedAt)
            .IsRequired();

        // Un usuario solamente puede tener
        // una membresía por comunidad
        builder.HasIndex(m => new
        {
            m.CommunityId,
            m.UserId
        })
        .IsUnique();

        // Consultar todas las comunidades
        // a las que pertenece un usuario
        builder.HasIndex(m => m.UserId);

        // Relación con Community
        builder.HasOne(m => m.Community)
            .WithMany(c => c.Members)
            .HasForeignKey(m => m.CommunityId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
