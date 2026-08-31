using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSurveyClaimLockToDepotJob : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "SurveyClaimedAt",
                table: "depot_jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SurveyClaimedByName",
                table: "depot_jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SurveyClaimedByStaffId",
                table: "depot_jobs",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SurveyClaimedAt",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "SurveyClaimedByName",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "SurveyClaimedByStaffId",
                table: "depot_jobs");
        }
    }
}
