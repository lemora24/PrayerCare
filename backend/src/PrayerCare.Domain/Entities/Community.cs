
using PrayerCare.Domain.Common;

namespace PrayerCare.Domain.Entities;

public class Community : BaseEntity
{
    // Información principal
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Identificador del usuario que creó la comunidad
    public Guid CreatedByUserId { get; set; }

    // Personalización visual
    public string? ImageUrl { get; set; }

    // Control de estado
    public bool IsActive { get; set; } = true;

    // Relaciones
    public ICollection<CommunityMember> Members { get; set; }
        = new List<CommunityMember>();
}
