using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentAccountCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tài khoản nhận tiền chuyển khoản / VietQR của công ty (người dùng cung cấp 2026-10-04). Lưu ở danh mục
            // PAYMENT_ACCOUNT để đổi được trong DB mà không sửa code. Techcombank BIN NAPAS = 970407.
            migrationBuilder.Sql(@"
INSERT INTO ""MasterCatalogItems"" (""CatalogType"", ""Code"", ""Name"", ""NameVi"", ""Description"", ""JsonData"", ""IsActive"", ""SortOrder"", ""CreatedAt"", ""IsDeleted"")
SELECT 'PAYMENT_ACCOUNT', 'TCB-29356868', 'CONG TY CO PHAN MATRAN', 'Techcombank',
       'Tài khoản nhận thanh toán chuyển khoản / VietQR',
       '{""bankBin"":""970407"",""bankName"":""Techcombank"",""accountNo"":""29356868"",""accountName"":""CONG TY CO PHAN MATRAN""}',
       TRUE, 1, NOW(), FALSE
WHERE NOT EXISTS (SELECT 1 FROM ""MasterCatalogItems"" WHERE ""CatalogType"" = 'PAYMENT_ACCOUNT' AND ""Code"" = 'TCB-29356868');");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""MasterCatalogItems"" WHERE ""CatalogType"" = 'PAYMENT_ACCOUNT' AND ""Code"" = 'TCB-29356868';");
        }
    }
}
