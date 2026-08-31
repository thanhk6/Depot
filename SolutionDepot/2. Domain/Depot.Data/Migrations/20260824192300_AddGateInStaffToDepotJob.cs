using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGateInStaffToDepotJob : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "GateInStaffId",
                table: "depot_jobs",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GateInStaffName",
                table: "depot_jobs",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GateInStaffId",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "GateInStaffName",
                table: "depot_jobs");
        }
    }
}
