using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class ExtendServiceOrderFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CleaningNote",
                table: "ServiceOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Condition",
                table: "ServiceOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DriverPhone",
                table: "ServiceOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IsoCode",
                table: "ServiceOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "ServiceOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingLineCode",
                table: "ServiceOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "ServiceOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SurveyNote",
                table: "ServiceOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "ServiceOrders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CleaningNote",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "Condition",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "DriverPhone",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "IsoCode",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "ShippingLineCode",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "SurveyNote",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "ServiceOrders");
        }
    }
}
