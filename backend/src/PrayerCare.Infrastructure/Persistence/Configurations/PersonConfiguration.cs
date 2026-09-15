using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrayerCare.Domain.Entities;

namespace PrayerCare.Infrastructure.Persistence.Configurations;

public class PersonConfiguration : IEntityTypeConfiguration<Person>
{
    public void Configure(EntityTypeBuilder<Person> builder)
    {
        builder.ToTable("People");

        builder.HasKey(person => person.Id);

        builder.Property(person => person.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(person => person.LastName)
            .HasMaxLength(100);

        builder.Property(person => person.ProfileImageUrl)
            .HasMaxLength(500);

        builder.Property(person => person.Phone)
            .HasMaxLength(50);

        builder.Property(person => person.Email)
            .HasMaxLength(254);

        builder.Property(person => person.Notes)
            .HasMaxLength(2000);

        builder.HasIndex(person => person.UserId);

        builder.HasIndex(person => new
        {
            person.UserId,
            person.FirstName
        });

        builder.HasMany(person => person.PrayerRequests)
            .WithOne(request => request.Person)
            .HasForeignKey(request => request.PersonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}