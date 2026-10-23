using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrayerCare.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCommunityPrayers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CommunityPrayers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityPrayerRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PrayedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunityPrayers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommunityPrayers_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CommunityPrayers_CommunityPrayerRequests_CommunityPrayerRequestId",
                        column: x => x.CommunityPrayerRequestId,
                        principalTable: "CommunityPrayerRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPrayers_CommunityPrayerRequestId_PrayedAt",
                table: "CommunityPrayers",
                columns: new[] { "CommunityPrayerRequestId", "PrayedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPrayers_UserId_PrayedAt",
                table: "CommunityPrayers",
                columns: new[] { "UserId", "PrayedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CommunityPrayers");
        }
    }
}
