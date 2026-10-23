
using PrayerCare.Domain.Common;
using PrayerCare.Domain.Enums;

namespace PrayerCare.Domain.Entities;

public class CommunityPrayerRequest : BaseEntity
{
    // Comunidad donde se publica la petición.
    public Guid CommunityId { get; set; }

    // Usuario que creó la petición.
    public Guid AuthorUserId { get; set; }

    // Contenido de la petición.
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Reutilizar las categorías existentes.
    public PrayerCategory Category { get; set; }
        = PrayerCategory.Other;

    // Estado de la petición.
    public PrayerRequestStatus Status { get; set; }
        = PrayerRequestStatus.Active;

    // Fecha en que el autor marcó la petición como respondida.
    public DateTime? AnsweredAt { get; set; }

    // Control de visibilidad dentro de la comunidad.
    public bool IsHidden { get; set; } = false;

    // Fecha de la última modificación de contenido.
    public DateTime? LastEditedAt { get; set; }

    // Relación con la comunidad.
    public Community Community { get; set; } = null!;
}
