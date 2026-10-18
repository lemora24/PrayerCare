
using PrayerCare.Domain.Common;

namespace PrayerCare.Domain.Entities;

public class CommunityInvitation : BaseEntity
{
    // Comunidad a la que permite ingresar
    public Guid CommunityId { get; set; }

    // Usuario que creó la invitación
    public Guid CreatedByUserId { get; set; }

    // Código de invitación generado por el backend
    // Se almacena como hash, no en texto plano.
    public string CodeHash { get; set; } = string.Empty;

    // Cantidad máxima de veces que puede utilizarse
    public int MaxUses { get; set; } = 1;

    // Cantidad de usos registrados
    public int UseCount { get; set; } = 0;

    // Fecha de vencimiento
    public DateTime ExpiresAt { get; set; }

    // Permite revocar la invitación
    public bool IsRevoked { get; set; } = false;

    // Fecha de revocación
    public DateTime? RevokedAt { get; set; }

    // Relación con la comunidad
    public Community Community { get; set; } = null!;

    // Indica si la invitación puede seguir utilizándose
    public bool IsAvailable(DateTime utcNow)
    {
        return !IsRevoked
            && utcNow < ExpiresAt
            && UseCount < MaxUses;
    }
}
