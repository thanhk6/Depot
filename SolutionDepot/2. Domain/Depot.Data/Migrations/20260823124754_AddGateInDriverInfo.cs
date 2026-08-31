using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGateInDriverInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GateInBookingNo",
                table: "depot_jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GateInDriverName",
                table: "depot_jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GateInDriverPhone",
                table: "depot_jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GateInRemarks",
                table: "depot_jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GateInSealNo",
                table: "depot_jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GateInTrailerPlate",
                table: "depot_jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GateInTruckPlate",
                table: "depot_jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GateInTruckingCompany",
                table: "depot_jobs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GateInBookingNo",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "GateInDriverName",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "GateInDriverPhone",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "GateInRemarks",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "GateInSealNo",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "GateInTrailerPlate",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "GateInTruckPlate",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "GateInTruckingCompany",
                table: "depot_jobs");
        }
    }
}
