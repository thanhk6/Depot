using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class ShippingSyncLogRealGateway : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EndpointUrl",
                table: "ShippingSyncLogs",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HttpStatusCode",
                table: "ShippingSyncLogs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LatencyMs",
                table: "ShippingSyncLogs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestBody",
                table: "ShippingSyncLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponseBody",
                table: "ShippingSyncLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TriggeredBy",
                table: "ShippingSyncLogs",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            // Bản ghi cũ do adapter giả lập tự sinh ACK (không hề gọi tới hãng tàu) — đánh dấu SIMULATED để
            // không bị hiểu nhầm là đã gửi thành công.
            migrationBuilder.Sql(@"UPDATE ""ShippingSyncLogs"" SET ""Status"" = 'SIMULATED', ""ErrorMessage"" = COALESCE(""ErrorMessage"", 'ACK tự sinh bởi adapter giả lập cũ, chưa từng gửi tới hãng tàu.') WHERE ""Status"" = 'ACKNOWLEDGED';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndpointUrl",
                table: "ShippingSyncLogs");

            migrationBuilder.DropColumn(
                name: "HttpStatusCode",
                table: "ShippingSyncLogs");

            migrationBuilder.DropColumn(
                name: "LatencyMs",
                table: "ShippingSyncLogs");

            migrationBuilder.DropColumn(
                name: "RequestBody",
                table: "ShippingSyncLogs");

            migrationBuilder.DropColumn(
                name: "ResponseBody",
                table: "ShippingSyncLogs");

            migrationBuilder.DropColumn(
                name: "TriggeredBy",
                table: "ShippingSyncLogs");
        }
    }
}
