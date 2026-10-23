using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrayerCare.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCommunityPrayerRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CommunityPrayerRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: true),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AnsweredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    LastEditedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunityPrayerRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommunityPrayerRequests_AspNetUsers_AuthorUserId",
                        column: x => x.AuthorUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CommunityPrayerRequests_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPrayerRequests_AuthorUserId",
                table: "CommunityPrayerRequests",
                column: "AuthorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPrayerRequests_CommunityId_CreatedAt",
                table: "CommunityPrayerRequests",
                columns: new[] { "CommunityId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPrayerRequests_CommunityId_Status",
                table: "CommunityPrayerRequests",
                columns: new[] { "CommunityId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CommunityPrayerRequests");
        }
    }
}
