using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveShippingSyncLogJobNo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShippingSyncLogs_JobNo_CarrierCode_EventType_SyncedAt",
                table: "ShippingSyncLogs");

            migrationBuilder.DropColumn(
                name: "JobNo",
                table: "ShippingSyncLogs");

            migrationBuilder.CreateIndex(
                name: "IX_ShippingSyncLogs_DepotJobId_CarrierCode_EventType_SyncedAt",
                table: "ShippingSyncLogs",
                columns: new[] { "DepotJobId", "CarrierCode", "EventType", "SyncedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShippingSyncLogs_DepotJobId_CarrierCode_EventType_SyncedAt",
                table: "ShippingSyncLogs");

            migrationBuilder.AddColumn<string>(
                name: "JobNo",
                table: "ShippingSyncLogs",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ShippingSyncLogs_JobNo_CarrierCode_EventType_SyncedAt",
                table: "ShippingSyncLogs",
                columns: new[] { "JobNo", "CarrierCode", "EventType", "SyncedAt" });
        }
    }
}
