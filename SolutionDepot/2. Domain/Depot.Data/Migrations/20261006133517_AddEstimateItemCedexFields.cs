using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEstimateItemCedexFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DamageCode",
                table: "EstimateItem",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DamageName",
                table: "EstimateItem",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocationCode",
                table: "EstimateItem",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocationName",
                table: "EstimateItem",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RepairCode",
                table: "EstimateItem",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RepairMethod",
                table: "EstimateItem",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "EstimateItem",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "VatPercent",
                table: "EstimateItem",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DamageCode",
                table: "EstimateItem");

            migrationBuilder.DropColumn(
                name: "DamageName",
                table: "EstimateItem");

            migrationBuilder.DropColumn(
                name: "LocationCode",
                table: "EstimateItem");

            migrationBuilder.DropColumn(
                name: "LocationName",
                table: "EstimateItem");

            migrationBuilder.DropColumn(
                name: "RepairCode",
                table: "EstimateItem");

            migrationBuilder.DropColumn(
                name: "RepairMethod",
                table: "EstimateItem");

            migrationBuilder.DropColumn(
                name: "Unit",
                table: "EstimateItem");

            migrationBuilder.DropColumn(
                name: "VatPercent",
                table: "EstimateItem");
        }
    }
}
