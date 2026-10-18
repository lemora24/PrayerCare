
using PrayerCare.Domain.Common;
using PrayerCare.Domain.Enums;

namespace PrayerCare.Domain.Entities;

public class CommunityMember : BaseEntity
{
    // Comunidad a la que pertenece
    public Guid CommunityId { get; set; }

    // Usuario registrado en ASP.NET Core Identity
    public Guid UserId { get; set; }

    // Rol dentro de esta comunidad
    public CommunityRole Role { get; set; }
        = CommunityRole.Member;

    // Estado de la membresía
    public CommunityMemberStatus Status { get; set; }
        = CommunityMemberStatus.Active;

    // Fecha en que el usuario se unió
    public DateTime JoinedAt { get; set; }
        = DateTime.UtcNow;

    // Relación con la comunidad
    public Community Community { get; set; } = null!;
}
