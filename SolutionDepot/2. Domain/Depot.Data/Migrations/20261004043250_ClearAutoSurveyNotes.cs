using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class ClearAutoSurveyNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Màn Giám định trước đây tự điền "Job <JobNo> từ Gate-In SQL Server" làm ghi chú khi phiếu chưa có ghi chú,
            // rồi lưu ngược vào DB như ghi chú thật của giám định viên. Xoá đúng mẫu câu tự sinh đó.
            migrationBuilder.Sql(@"UPDATE ""Surveys"" SET ""OverallNotes"" = NULL WHERE ""OverallNotes"" LIKE 'Job JOB-% từ Gate-In SQL Server';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Không khôi phục câu tự sinh.
        }
    }
}
