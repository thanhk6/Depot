using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class UniqueActiveContainerJob : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Dữ liệu trùng đã phát sinh do race condition Gate-In (BUG-004) sẽ chặn tạo unique index: với mỗi số
            // container còn > 1 hồ sơ đang hoạt động, giữ hồ sơ đi xa nhất (đã giám định, đã báo giá, rồi Id nhỏ
            // nhất) và xoá mềm các hồ sơ còn lại, kèm 1 dòng AuditLogs để tra lại.
            migrationBuilder.Sql(@"
WITH ranked AS (
    SELECT j.""Id"", j.""JobNo"",
           ROW_NUMBER() OVER (
               PARTITION BY j.""ContainerNo""
               ORDER BY (EXISTS (SELECT 1 FROM ""Surveys"" s WHERE s.""DepotJobId"" = j.""Id"")) DESC,
                        (EXISTS (SELECT 1 FROM ""Estimates"" e WHERE e.""DepotJobId"" = j.""Id"")) DESC,
                        j.""Id"") AS rn
    FROM depot_jobs j
    WHERE j.""Status"" <> 'GATE_OUT' AND j.""IsDeleted"" = false
), dup AS (
    UPDATE depot_jobs d
    SET ""IsDeleted"" = true, ""DeletedAt"" = now(), ""DeletedBy"" = 'migration:UniqueActiveContainerJob'
    FROM ranked r
    WHERE d.""Id"" = r.""Id"" AND r.rn > 1
    RETURNING d.""Id"", d.""JobNo"", d.""ContainerNo""
)
INSERT INTO ""AuditLogs"" (""JobNo"", ""DepotJobId"", ""Action"", ""User"", ""Details"", ""Timestamp"", ""CreatedAt"", ""IsDeleted"")
SELECT dup.""JobNo"", dup.""Id"", 'DUPLICATE_REMOVED', 'System',
       'Xoá mềm hồ sơ trùng: container ' || dup.""ContainerNo"" || ' đã có hồ sơ khác đang trong bãi.',
       now(), now(), false
FROM dup;");

            migrationBuilder.CreateIndex(
                name: "UX_depot_jobs_ContainerNo_Active",
                table: "depot_jobs",
                column: "ContainerNo",
                unique: true,
                filter: "\"Status\" <> 'GATE_OUT' AND \"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_depot_jobs_ContainerNo_Active",
                table: "depot_jobs");
        }
    }
}
