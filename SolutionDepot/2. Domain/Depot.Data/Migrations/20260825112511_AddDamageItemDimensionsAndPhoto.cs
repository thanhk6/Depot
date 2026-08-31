using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDamageItemDimensionsAndPhoto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "LengthMm",
                table: "DamageItem",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "DamageItem",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WidthMm",
                table: "DamageItem",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LengthMm",
                table: "DamageItem");

            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "DamageItem");

            migrationBuilder.DropColumn(
                name: "WidthMm",
                table: "DamageItem");
        }
    }
}
