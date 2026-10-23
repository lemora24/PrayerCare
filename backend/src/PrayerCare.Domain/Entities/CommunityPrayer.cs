
using PrayerCare.Domain.Common;

namespace PrayerCare.Domain.Entities;

public class CommunityPrayer : BaseEntity
{
    // Peticion comunitaria por la que se oro.
    public Guid CommunityPrayerRequestId { get; set; }

    // Usuario que realizo la oracion.
    public Guid UserId { get; set; }

    // Momento en que el usuario registro la oracion.
    public DateTime PrayedAt { get; set; } = DateTime.UtcNow;

    // Navegacion hacia la peticion comunitaria.
    public CommunityPrayerRequest CommunityPrayerRequest { get; set; }
        = null!;
}
