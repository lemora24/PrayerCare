
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrayerCare.Domain.Entities;

namespace PrayerCare.Infrastructure.Persistence.Configurations;

public class CommunityPrayerRequestConfiguration
    : IEntityTypeConfiguration<CommunityPrayerRequest>
{
    public void Configure(
        EntityTypeBuilder<CommunityPrayerRequest> builder)
    {
        builder.ToTable("CommunityPrayerRequests");

        // Identificador único.
        builder.HasKey(request => request.Id);

        // Comunidad a la que pertenece.
        builder.Property(request => request.CommunityId)
            .IsRequired();

        // Autor de la petición.
        builder.Property(request => request.AuthorUserId)
            .IsRequired();

        // Título obligatorio.
        builder.Property(request => request.Title)
            .IsRequired()
            .HasMaxLength(200);

        // Descripción opcional.
        builder.Property(request => request.Description)
            .HasMaxLength(5000);

        // Categoría y estado almacenados como enteros.
        builder.Property(request => request.Category)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(request => request.Status)
            .HasConversion<int>()
            .IsRequired();

        // Fecha de respuesta.
        builder.Property(request => request.AnsweredAt);

        // Moderación: ocultar sin eliminar.
        builder.Property(request => request.IsHidden)
            .IsRequired()
            .HasDefaultValue(false);

        // Última edición del contenido.
        builder.Property(request => request.LastEditedAt);

        // Relación con Communities.
        // Restrict evita eliminaciones en cascada.
        builder.HasOne(request => request.Community)
            .WithMany()
            .HasForeignKey(request => request.CommunityId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índices para consultar peticiones por comunidad.
        builder.HasIndex(request => new
        {
            request.CommunityId,
            request.CreatedAt
        });

        // Índice para consultar peticiones por autor.
        builder.HasIndex(request => request.AuthorUserId);

        // Índice para filtrar por comunidad y estado.
        builder.HasIndex(request => new
        {
            request.CommunityId,
            request.Status
        });

        // Relación con AspNetUsers.
        builder.HasOne<
                PrayerCare.Infrastructure.Identity.ApplicationUser>()
            .WithMany()
            .HasForeignKey(request => request.AuthorUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
