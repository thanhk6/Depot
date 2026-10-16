using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class ClearUnplacedYardLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Gate-In trước đây gán sẵn BLOCK_A/1/1/1 cho mọi container dù còn ở khu giám định / vệ sinh.
            // Đưa về "chưa hạ bãi" những hồ sơ còn đúng giá trị gán sẵn đó và chưa từng được xe nâng hạ bãi
            // hay dời vị trí (không có FORKLIFT_MOVE_COMPLETED / YARD_MOVE / YARD_MOVED trong nhật ký).
            migrationBuilder.Sql(@"
UPDATE depot_jobs j
SET ""BlockCode"" = '', ""Bay"" = 0, ""Row"" = 0, ""Tier"" = 0
WHERE j.""BlockCode"" = 'BLOCK_A' AND j.""Bay"" = 1 AND j.""Row"" = 1 AND j.""Tier"" = 1
  AND NOT EXISTS (
    SELECT 1 FROM ""AuditLogs"" a
    WHERE a.""DepotJobId"" = j.""Id""
      AND a.""Action"" IN ('FORKLIFT_MOVE_COMPLETED', 'YARD_MOVE', 'YARD_MOVED'));");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Không khôi phục vị trí giả.
        }
    }
}
