
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PrayerCare.Domain.Entities;
using PrayerCare.Infrastructure.Identity;

namespace PrayerCare.Infrastructure.Persistence;

public class PrayerCareDbContext
    : IdentityDbContext<
        ApplicationUser,
        IdentityRole<Guid>,
        Guid>
{
    public PrayerCareDbContext(
        DbContextOptions<PrayerCareDbContext> options)
        : base(options)
    {
    }

    // ==========================================
    // PERSONAS Y ORACIÓN PERSONAL
    // ==========================================

    public DbSet<Person> People => Set<Person>();

    public DbSet<PrayerRequest> PrayerRequests
        => Set<PrayerRequest>();

    public DbSet<PrayerLog> PrayerLogs
        => Set<PrayerLog>();

    public DbSet<PrayerReminder> PrayerReminders
        => Set<PrayerReminder>();

    // ==========================================
    // COMUNIDADES PRIVADAS
    // ==========================================

    public DbSet<Community> Communities
        => Set<Community>();

    public DbSet<CommunityMember> CommunityMembers
        => Set<CommunityMember>();

    public DbSet<CommunityInvitation> CommunityInvitations
        => Set<CommunityInvitation>();

    // ==========================================
    // CONFIGURACIÓN DE ENTITY FRAMEWORK CORE
    // ==========================================

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        // Configuración de ASP.NET Core Identity
        base.OnModelCreating(modelBuilder);

        // Cargar automáticamente las configuraciones
        // de las entidades desde Infrastructure
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(PrayerCareDbContext).Assembly);

        // ======================================
        // RELACIONES CON ASP.NET CORE IDENTITY
        // ======================================

        // Cada membresía pertenece a un usuario
        modelBuilder.Entity<CommunityMember>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cada comunidad tiene un usuario fundador
        modelBuilder.Entity<Community>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(c => c.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cada invitación tiene un usuario creador
        modelBuilder.Entity<CommunityInvitation>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(i => i.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
