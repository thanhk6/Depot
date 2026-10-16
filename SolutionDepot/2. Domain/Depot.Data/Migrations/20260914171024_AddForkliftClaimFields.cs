using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddForkliftClaimFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ForkliftAssignedVehicleCode",
                table: "depot_jobs",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ForkliftClaimedAt",
                table: "depot_jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ForkliftClaimedByOperatorId",
                table: "depot_jobs",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ForkliftClaimedByOperatorName",
                table: "depot_jobs",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ForkliftStartedAt",
                table: "depot_jobs",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ForkliftAssignedVehicleCode",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "ForkliftClaimedAt",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "ForkliftClaimedByOperatorId",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "ForkliftClaimedByOperatorName",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "ForkliftStartedAt",
                table: "depot_jobs");
        }
    }
}
