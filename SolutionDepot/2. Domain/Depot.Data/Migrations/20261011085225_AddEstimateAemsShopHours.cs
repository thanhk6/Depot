using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEstimateAemsShopHours : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "OrdinaryHours",
                table: "Estimates",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Ot1Hours",
                table: "Estimates",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Ot2Hours",
                table: "Estimates",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Ot3Hours",
                table: "Estimates",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PreparationHours",
                table: "Estimates",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ShopCode",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VendorRefNo",
                table: "Estimates",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OrdinaryHours",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "Ot1Hours",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "Ot2Hours",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "Ot3Hours",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "PreparationHours",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "ShopCode",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "VendorRefNo",
                table: "Estimates");
        }
    }
}
