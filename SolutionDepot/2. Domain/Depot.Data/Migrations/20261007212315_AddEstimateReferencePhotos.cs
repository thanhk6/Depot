using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEstimateReferencePhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InspectionPhotoUrlsJson",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SurveyReference",
                table: "Estimates",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InspectionPhotoUrlsJson",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "SurveyReference",
                table: "Estimates");
        }
    }
}
