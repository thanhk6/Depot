using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class CloseSpuriousCleaningRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Lỗi cũ: lập phiếu dịch vụ có dòng phí vệ sinh luôn tạo thêm 1 lệnh vệ sinh mới, kể cả khi container đã
            // vệ sinh xong & bàn giao → container quay lại hàng đợi Tổ Vệ Sinh. Đóng (xoá mềm) đúng các lệnh thừa đó:
            // chưa bàn giao, tạo trong vòng 10 giây sau phiếu dịch vụ của chính hồ sơ, và hồ sơ đã có lệnh khác bàn giao.
            const string spurious = @"
SELECT c.""Id"" AS cid, c.""Code"" AS code, j.""Id"" AS jid, j.""JobNo"" AS jobno, so.""OrderNo"" AS orderno
FROM ""CleaningRecords"" c
JOIN depot_jobs j ON j.""JobNo"" = c.""JobNo""
JOIN ""ServiceOrders"" so ON so.""DepotJobId"" = j.""Id""
WHERE c.""Status"" <> 'HANDOVER_TO_OPERATION' AND c.""IsDeleted"" = FALSE
  AND c.""CreatedAt"" BETWEEN so.""CreatedAt"" AND so.""CreatedAt"" + INTERVAL '10 seconds'
  AND EXISTS (SELECT 1 FROM ""CleaningRecords"" h
              WHERE h.""JobNo"" = c.""JobNo"" AND h.""Status"" = 'HANDOVER_TO_OPERATION'
                AND h.""CreatedAt"" < c.""CreatedAt"" AND h.""IsDeleted"" = FALSE)";

            migrationBuilder.Sql($@"
INSERT INTO ""AuditLogs"" (""DepotJobId"", ""JobNo"", ""Action"", ""User"", ""Timestamp"", ""Details"", ""CreatedAt"", ""IsDeleted"")
SELECT s.jid, s.jobno, 'CLEANING_CANCELLED', 'Hệ thống (dọn dữ liệu)', NOW(),
       'Đóng lệnh vệ sinh thừa ' || s.code || ' (tự sinh khi lập phiếu ' || s.orderno || ' dù container đã vệ sinh xong & bàn giao).',
       NOW(), FALSE
FROM ({spurious}) s;");

            migrationBuilder.Sql($@"
UPDATE ""CleaningRecords"" SET ""IsDeleted"" = TRUE, ""DeletedAt"" = NOW(), ""DeletedBy"" = 'migration:CloseSpuriousCleaningRecords'
WHERE ""Id"" IN (SELECT cid FROM ({spurious}) s);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"UPDATE ""CleaningRecords"" SET ""IsDeleted"" = FALSE, ""DeletedAt"" = NULL, ""DeletedBy"" = NULL WHERE ""DeletedBy"" = 'migration:CloseSpuriousCleaningRecords';");
        }
    }
}
