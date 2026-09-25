using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrayerCare.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPrayerReminderTimeZone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TimeZoneId",
                table: "PrayerReminders",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "America/Costa_Rica");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeZoneId",
                table: "PrayerReminders");
        }
    }
}
