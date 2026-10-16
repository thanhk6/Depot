using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class RestrictFinancialAuditCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_depot_jobs_DepotJobId",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_depot_jobs_DepotJobId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceOrders_depot_jobs_DepotJobId",
                table: "ServiceOrders");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_depot_jobs_DepotJobId",
                table: "AuditLogs",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_depot_jobs_DepotJobId",
                table: "Payments",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceOrders_depot_jobs_DepotJobId",
                table: "ServiceOrders",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_depot_jobs_DepotJobId",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_depot_jobs_DepotJobId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceOrders_depot_jobs_DepotJobId",
                table: "ServiceOrders");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_depot_jobs_DepotJobId",
                table: "AuditLogs",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_depot_jobs_DepotJobId",
                table: "Payments",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceOrders_depot_jobs_DepotJobId",
                table: "ServiceOrders",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
