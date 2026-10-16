using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEstimateAemsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Cause",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LaborRate",
                table: "Estimates",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "RepairMode",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalManHours",
                table: "Estimates",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ManHoursPerPiece",
                table: "EstimateItem",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Tpi",
                table: "EstimateItem",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cause",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "LaborRate",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "RepairMode",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "TotalManHours",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "ManHoursPerPiece",
                table: "EstimateItem");

            migrationBuilder.DropColumn(
                name: "Tpi",
                table: "EstimateItem");
        }
    }
}
