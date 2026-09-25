using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrayerCare.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPrayerReminders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PrayerReminders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReminderTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    Sunday = table.Column<bool>(type: "bit", nullable: false),
                    Monday = table.Column<bool>(type: "bit", nullable: false),
                    Tuesday = table.Column<bool>(type: "bit", nullable: false),
                    Wednesday = table.Column<bool>(type: "bit", nullable: false),
                    Thursday = table.Column<bool>(type: "bit", nullable: false),
                    Friday = table.Column<bool>(type: "bit", nullable: false),
                    Saturday = table.Column<bool>(type: "bit", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrayerReminders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrayerReminders_People_PersonId",
                        column: x => x.PersonId,
                        principalTable: "People",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PrayerReminders_PersonId",
                table: "PrayerReminders",
                column: "PersonId");

            migrationBuilder.CreateIndex(
                name: "IX_PrayerReminders_UserId",
                table: "PrayerReminders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PrayerReminders_UserId_IsEnabled",
                table: "PrayerReminders",
                columns: new[] { "UserId", "IsEnabled" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrayerReminders");
        }
    }
}
