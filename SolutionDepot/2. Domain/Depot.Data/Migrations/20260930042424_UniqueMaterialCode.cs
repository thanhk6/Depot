using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class UniqueMaterialCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Vật tư trùng mã đã phát sinh (BUG-007) chặn tạo unique index: đổi mã các dòng trùng thành <mã>-DUP<Id>
            // (giữ dòng Id nhỏ nhất) thay vì xoá, để không mất tồn kho — người quản lý kho gộp/sửa lại sau.
            // Index trên upper(Code) để 'ABC' và 'abc' cũng tính là trùng; EF không mô tả được index biểu thức
            // nên tạo bằng SQL, không có trong model snapshot.
            migrationBuilder.Sql(@"
UPDATE ""Materials"" m
SET ""Code"" = m.""Code"" || '-DUP' || m.""Id""
FROM (
    SELECT ""Id"", ROW_NUMBER() OVER (PARTITION BY upper(""Code"") ORDER BY ""Id"") AS rn
    FROM ""Materials"" WHERE ""IsDeleted"" = false
) d
WHERE m.""Id"" = d.""Id"" AND d.rn > 1;

CREATE UNIQUE INDEX ""UX_Materials_Code_Active"" ON ""Materials"" (upper(""Code"")) WHERE ""IsDeleted"" = false;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""UX_Materials_Code_Active"";");
        }
    }
}
