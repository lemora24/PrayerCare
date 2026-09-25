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

    public DbSet<Person> People => Set<Person>();

    public DbSet<PrayerRequest> PrayerRequests => Set<PrayerRequest>();

    public DbSet<PrayerLog> PrayerLogs => Set<PrayerLog>();
    public DbSet<PrayerReminder> PrayerReminders => Set<PrayerReminder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(PrayerCareDbContext).Assembly);
    }
}