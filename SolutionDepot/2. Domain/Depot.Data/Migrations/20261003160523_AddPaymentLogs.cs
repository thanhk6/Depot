using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PaymentLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DepotJobId = table.Column<long>(type: "bigint", nullable: true),
                    JobNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ContainerNo = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    ServiceOrderNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    InvoiceNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Method = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    OrderTotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CashReceived = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ChangeAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    TransactionRef = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CashierName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LoggedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentLogs_ContainerNo",
                table: "PaymentLogs",
                column: "ContainerNo");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentLogs_LoggedAt",
                table: "PaymentLogs",
                column: "LoggedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentLogs_TransactionRef",
                table: "PaymentLogs",
                column: "TransactionRef");

            // Chép các khoản đã thu trước khi có nhật ký riêng (bảng Payments, Status = PAID) để nhật ký có lịch sử.
            migrationBuilder.Sql(@"
INSERT INTO ""PaymentLogs"" (""DepotJobId"", ""JobNo"", ""ContainerNo"", ""ServiceOrderNo"", ""InvoiceNo"", ""Method"", ""Status"",
    ""Amount"", ""OrderTotal"", ""TransactionRef"", ""CashierName"", ""Message"", ""LoggedAt"", ""CreatedAt"", ""IsDeleted"")
SELECT p.""DepotJobId"", j.""JobNo"", j.""ContainerNo"", so.""OrderNo"", p.""InvoiceNo"",
    LEFT(COALESCE(NULLIF(p.""PaymentMethod"", ''), 'UNKNOWN'), 30), 'SUCCESS',
    p.""TotalAmount"", so.""GrandTotal"", LEFT(COALESCE(p.""TransactionRef"", so.""TransactionId""), 100), LEFT(p.""CashierName"", 150),
    'Chép từ dữ liệu thanh toán trước khi có nhật ký riêng', COALESCE(p.""PaidAt"", p.""CreatedAt"", NOW()), NOW(), FALSE
FROM ""Payments"" p
LEFT JOIN depot_jobs j ON j.""Id"" = p.""DepotJobId""
LEFT JOIN LATERAL (
    SELECT s.""OrderNo"", s.""GrandTotal"", s.""TransactionId"" FROM ""ServiceOrders"" s
    WHERE s.""DepotJobId"" = p.""DepotJobId"" AND s.""Status"" <> 'CANCELLED' ORDER BY s.""Id"" DESC LIMIT 1
) so ON TRUE
WHERE p.""Status"" = 'PAID' AND p.""IsDeleted"" = FALSE;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentLogs");
        }
    }
}
