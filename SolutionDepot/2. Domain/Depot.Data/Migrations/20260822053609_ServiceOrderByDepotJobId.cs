using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class ServiceOrderByDepotJobId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DepotJobId",
                table: "ServiceOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(@"
UPDATE ""ServiceOrders"" so
SET ""DepotJobId"" = dj.""Id""
FROM ""depot_jobs"" dj
WHERE so.""JobNo"" = dj.""JobNo"";
");

            migrationBuilder.DropIndex(
                name: "IX_ServiceOrders_JobNo",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "JobNo",
                table: "ServiceOrders");

            migrationBuilder.AlterColumn<Guid>(
                name: "DepotJobId",
                table: "ServiceOrders",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_DepotJobId",
                table: "ServiceOrders",
                column: "DepotJobId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceOrders_depot_jobs_DepotJobId",
                table: "ServiceOrders",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceOrders_depot_jobs_DepotJobId",
                table: "ServiceOrders");

            migrationBuilder.DropIndex(
                name: "IX_ServiceOrders_DepotJobId",
                table: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "DepotJobId",
                table: "ServiceOrders");

            migrationBuilder.AddColumn<string>(
                name: "JobNo",
                table: "ServiceOrders",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_JobNo",
                table: "ServiceOrders",
                column: "JobNo");
        }
    }
}
