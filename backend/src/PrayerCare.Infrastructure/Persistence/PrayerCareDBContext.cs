
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PrayerCare.Domain.Entities;
using PrayerCare.Infrastructure.Identity;

namespace PrayerCare.Infrastructure.Persistence;

public class PrayerCareDbContext
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public PrayerCareDbContext(
        DbContextOptions<PrayerCareDbContext> options)
        : base(options)
    {
    }

    // ==========================================
    // MODULO PERSONAL
    // ==========================================

    public DbSet<Person> People => Set<Person>();

    public DbSet<PrayerRequest> PrayerRequests
        => Set<PrayerRequest>();

    public DbSet<PrayerLog> PrayerLogs
        => Set<PrayerLog>();

    public DbSet<PrayerReminder> PrayerReminders
        => Set<PrayerReminder>();

    // ==========================================
    // MODULO DE COMUNIDADES
    // ==========================================

    public DbSet<Community> Communities
        => Set<Community>();

    public DbSet<CommunityMember> CommunityMembers
        => Set<CommunityMember>();

    public DbSet<CommunityInvitation> CommunityInvitations
        => Set<CommunityInvitation>();

    // Peticiones publicadas dentro de comunidades.
    public DbSet<CommunityPrayerRequest> CommunityPrayerRequests
        => Set<CommunityPrayerRequest>();

    // Historial de oraciones realizadas por miembros.
    public DbSet<CommunityPrayer> CommunityPrayers
        => Set<CommunityPrayer>();

    // ==========================================
    // CONFIGURACION DEL MODELO
    // ==========================================

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Aplicar configuraciones de las entidades.
        builder.ApplyConfigurationsFromAssembly(
            typeof(PrayerCareDbContext).Assembly);

        // ==========================================
        // RELACIONES DE COMUNIDADES CON USUARIOS
        // ==========================================

        builder.Entity<CommunityMember>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(member => member.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Community>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(community => community.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CommunityInvitation>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(invitation => invitation.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
