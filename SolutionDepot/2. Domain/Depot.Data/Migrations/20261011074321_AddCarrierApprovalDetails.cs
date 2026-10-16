using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCarrierApprovalDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApprovalChannel",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovalNotes",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ApprovedAmount",
                table: "Estimates",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarrierApproverName",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarrierAuthCode",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarrierWorkOrderNo",
                table: "Estimates",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalChannel",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "ApprovalNotes",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "ApprovedAmount",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "CarrierApproverName",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "CarrierAuthCode",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "CarrierWorkOrderNo",
                table: "Estimates");
        }
    }
}
