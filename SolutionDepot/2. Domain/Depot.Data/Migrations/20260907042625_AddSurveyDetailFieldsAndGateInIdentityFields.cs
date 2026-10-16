using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSurveyDetailFieldsAndGateInIdentityFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActionRequired",
                table: "Surveys",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CargoStatus",
                table: "Surveys",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompressorHours",
                table: "Surveys",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContainerTypeName",
                table: "Surveys",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CscPlateNo",
                table: "Surveys",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FloorType",
                table: "Surveys",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HumidityPercent",
                table: "Surveys",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ManufactureMonthYear",
                table: "Surveys",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Material",
                table: "Surveys",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxGrossWeightKg",
                table: "Surveys",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Owner",
                table: "Surveys",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PtiStatus",
                table: "Surveys",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QualityGrade",
                table: "Surveys",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReeferBrand",
                table: "Surveys",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReeferModel",
                table: "Surveys",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReeferSetTemperatureC",
                table: "Surveys",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Shift",
                table: "Surveys",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Standard",
                table: "Surveys",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StandardNotes",
                table: "Surveys",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SurveyNo",
                table: "Surveys",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VentilationCmh",
                table: "Surveys",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YardLocationNote",
                table: "Surveys",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GateInCustomsSealNo",
                table: "depot_jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GateInDriverLicense",
                table: "depot_jobs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActionRequired",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "CargoStatus",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "CompressorHours",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "ContainerTypeName",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "CscPlateNo",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "FloorType",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "HumidityPercent",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "ManufactureMonthYear",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "Material",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "MaxGrossWeightKg",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "Owner",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "PtiStatus",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "QualityGrade",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "ReeferBrand",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "ReeferModel",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "ReeferSetTemperatureC",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "Shift",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "Standard",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "StandardNotes",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "SurveyNo",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "VentilationCmh",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "YardLocationNote",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "GateInCustomsSealNo",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "GateInDriverLicense",
                table: "depot_jobs");
        }
    }
}
