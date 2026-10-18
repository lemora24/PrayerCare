
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrayerCare.Domain.Entities;

namespace PrayerCare.Infrastructure.Persistence.Configurations;

public class CommunityInvitationConfiguration
    : IEntityTypeConfiguration<CommunityInvitation>
{
    public void Configure(
        EntityTypeBuilder<CommunityInvitation> builder)
    {
        // Nombre de la tabla
        builder.ToTable("CommunityInvitations");

        // Llave primaria
        builder.HasKey(i => i.Id);

        // Comunidad destinataria
        builder.Property(i => i.CommunityId)
            .IsRequired();

        // Usuario que creó la invitación
        builder.Property(i => i.CreatedByUserId)
            .IsRequired();

        // Hash del código de invitación
        builder.Property(i => i.CodeHash)
            .IsRequired()
            .HasMaxLength(64)
            .IsUnicode(false);

        // Cada código debe ser único
        builder.HasIndex(i => i.CodeHash)
            .IsUnique();

        // Límite de usos
        builder.Property(i => i.MaxUses)
            .IsRequired();

        // Usos realizados
        builder.Property(i => i.UseCount)
            .IsRequired()
            .HasDefaultValue(0);

        // Fecha de vencimiento en UTC
        builder.Property(i => i.ExpiresAt)
            .IsRequired();

        // Estado de revocación
        builder.Property(i => i.IsRevoked)
            .IsRequired()
            .HasDefaultValue(false);

        // Fecha opcional de revocación
        builder.Property(i => i.RevokedAt);

        // Consultar invitaciones de una comunidad
        builder.HasIndex(i => i.CommunityId);

        // Consultar invitaciones por vencimiento
        builder.HasIndex(i => i.ExpiresAt);

        // Relación con la comunidad
        builder.HasOne(i => i.Community)
            .WithMany()
            .HasForeignKey(i => i.CommunityId)
            .OnDelete(DeleteBehavior.Restrict);

        // Restricciones de integridad
        builder.ToTable(table =>
        {
            table.HasCheckConstraint(
                "CK_CommunityInvitations_MaxUses",
                "[MaxUses] > 0");

            table.HasCheckConstraint(
                "CK_CommunityInvitations_UseCount",
                "[UseCount] >= 0 AND [UseCount] <= [MaxUses]");
        });
    }
}
