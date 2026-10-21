using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class StorageTariffPricesPerContainerType : Migration
    {
        // Danh sách loại container của DM (mã, size, category, reefer) — dùng chung cho chép giá xuôi / ngược.
        private const string ContainerTypesSql = @"
    SELECT DISTINCT ON (UPPER(TRIM(""Name""))) UPPER(TRIM(""Name"")) AS code,
           COALESCE(CASE WHEN COALESCE(""JsonData"", '') ~ '^\s*\{' THEN ""JsonData""::json->>'size' END, '') AS size,
           UPPER(COALESCE(CASE WHEN COALESCE(""JsonData"", '') ~ '^\s*\{' THEN ""JsonData""::json->>'category' END, '')) AS category,
           LOWER(COALESCE(CASE WHEN COALESCE(""JsonData"", '') ~ '^\s*\{' THEN ""JsonData""::json->>'isReefer' END, 'false')) = 'true' AS reefer
    FROM ""MasterCatalogItems""
    WHERE ""CatalogType"" = 'CONTAINER_TYPE' AND NOT ""IsDeleted""
      AND COALESCE(TRIM(""Name""), '') <> '' AND LENGTH(TRIM(""Name"")) <= 20
    ORDER BY UPPER(TRIM(""Name"")), ""IsActive"" DESC, ""Id""";

        // Cột giá cũ ứng với 1 loại container (design.md mục 10).
        private const string LegacyColumnSql = @"CASE
        WHEN ct.reefer OR ct.category = 'REEFER' THEN CASE WHEN ct.size = '20' THEN 'Price20Reefer' ELSE 'Price40Reefer' END
        WHEN ct.category IN ('OPEN_TOP', 'FLAT_RACK', 'TANK', 'SPECIAL') THEN 'PriceSpecial'
        WHEN ct.size = '45' THEN 'Price45Dry'
        WHEN ct.size = '40' THEN 'Price40Dry'
        WHEN ct.size = '20' THEN 'Price20Dry'
        ELSE NULL END";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StorageTariffTierPrices",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StorageTariffTierId = table.Column<long>(type: "bigint", nullable: false),
                    ContainerTypeCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_StorageTariffTierPrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StorageTariffTierPrices_StorageTariffTier_StorageTariffTier~",
                        column: x => x.StorageTariffTierId,
                        principalTable: "StorageTariffTier",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StorageTariffTierPrices_StorageTariffTierId_ContainerTypeCo~",
                table: "StorageTariffTierPrices",
                columns: new[] { "StorageTariffTierId", "ContainerTypeCode" },
                unique: true);

            // depot-fullstack-storage-tariff-pricing:
            // 1) Ngày miễn phí chỉ khai ở DefaultFreeDays — bỏ bậc nằm trọn trong ngày miễn phí, bậc vắt qua bắt đầu từ ngày (miễn phí + 1).
            // 2) Chép giá 6 cột cũ sang từng loại container của DM (chỉ giá > 0).
            // 3) Xoá mềm dữ liệu test + catalog STORAGE_TARIFF cũ; tạm ngưng các quy tắc theo quyết định 20/10/2026
            //    (giữ STOR_DRY_STANDARD; STOR_MAERSK_SPECIAL gắn hãng MSK không có trong DM Hãng Tàu).
            migrationBuilder.Sql(@"
DELETE FROM ""StorageTariffTier"" t USING ""StorageTariffRules"" r
WHERE r.""Id"" = t.""StorageTariffRuleId"" AND t.""ToDay"" IS NOT NULL AND t.""ToDay"" <= r.""DefaultFreeDays"";

UPDATE ""StorageTariffTier"" t SET ""FromDay"" = r.""DefaultFreeDays"" + 1, ""LastModifiedAt"" = now(), ""LastModifiedBy"" = 'migration'
FROM ""StorageTariffRules"" r
WHERE r.""Id"" = t.""StorageTariffRuleId"" AND t.""FromDay"" <= r.""DefaultFreeDays"";

INSERT INTO ""StorageTariffTierPrices"" (""StorageTariffTierId"", ""ContainerTypeCode"", ""Price"", ""CreatedAt"", ""CreatedBy"", ""IsDeleted"")
SELECT t.""Id"", ct.code, p.price, now(), 'migration', false
FROM ""StorageTariffTier"" t
CROSS JOIN (" + ContainerTypesSql + @") ct
CROSS JOIN LATERAL (SELECT CASE " + LegacyColumnSql + @"
        WHEN 'Price20Reefer' THEN t.""Price20Reefer"" WHEN 'Price40Reefer' THEN t.""Price40Reefer""
        WHEN 'PriceSpecial' THEN t.""PriceSpecial"" WHEN 'Price45Dry' THEN t.""Price45Dry""
        WHEN 'Price40Dry' THEN t.""Price40Dry"" WHEN 'Price20Dry' THEN t.""Price20Dry"" ELSE 0 END AS price) p
WHERE p.price > 0
ON CONFLICT DO NOTHING;

UPDATE ""StorageTariffRules"" SET ""IsDeleted"" = true, ""IsActive"" = false, ""DeletedAt"" = now(), ""DeletedBy"" = 'migration'
WHERE NOT ""IsDeleted"" AND (""Code"" LIKE 'QA\_STO\_%' OR ""Code"" IN ('TEST_STORAGE_NEW', 'STOR_TEST_UI'));

UPDATE ""StorageTariffRules"" SET ""IsActive"" = false, ""LastModifiedAt"" = now(), ""LastModifiedBy"" = 'migration'
WHERE NOT ""IsDeleted"" AND ""IsActive""
  AND ""Code"" IN ('STOR_REEFER', 'STOR_45HC', 'STOR_OOG_DG', 'STOR_SPECIAL_EQUIP', 'STOR_MAERSK_SPECIAL');

UPDATE ""StorageTariffRules"" SET ""CalculationUnit"" = 'VND/Cont/Ngày';

UPDATE ""MasterCatalogItems"" SET ""IsDeleted"" = true, ""DeletedAt"" = now(), ""DeletedBy"" = 'migration'
WHERE ""CatalogType"" = 'STORAGE_TARIFF' AND NOT ""IsDeleted"";
");

            migrationBuilder.DropColumn(name: "Price20Dry", table: "StorageTariffTier");
            migrationBuilder.DropColumn(name: "Price20Reefer", table: "StorageTariffTier");
            migrationBuilder.DropColumn(name: "Price40Dry", table: "StorageTariffTier");
            migrationBuilder.DropColumn(name: "Price40Reefer", table: "StorageTariffTier");
            migrationBuilder.DropColumn(name: "Price45Dry", table: "StorageTariffTier");
            migrationBuilder.DropColumn(name: "PriceSpecial", table: "StorageTariffTier");
            migrationBuilder.DropColumn(name: "ContainerTypeCategory", table: "StorageTariffRules");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            foreach (var column in new[] { "Price20Dry", "Price20Reefer", "Price40Dry", "Price40Reefer", "Price45Dry", "PriceSpecial" })
                migrationBuilder.AddColumn<decimal>(name: column, table: "StorageTariffTier", type: "numeric(18,2)",
                    precision: 18, scale: 2, nullable: false, defaultValue: 0m);
            migrationBuilder.AddColumn<string>(name: "ContainerTypeCategory", table: "StorageTariffRules",
                type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "DRY_STANDARD");

            // Chép ngược giá theo loại về 6 cột (lấy giá cao nhất trong các loại cùng cột). Bậc đã sửa / xoá ở Up không khôi phục.
            migrationBuilder.Sql(@"
WITH m AS (
    SELECT p.""StorageTariffTierId"" AS tier_id, " + LegacyColumnSql + @" AS col, MAX(p.""Price"") AS price
    FROM ""StorageTariffTierPrices"" p
    JOIN (" + ContainerTypesSql + @") ct ON ct.code = p.""ContainerTypeCode""
    WHERE NOT p.""IsDeleted""
    GROUP BY 1, 2
)
UPDATE ""StorageTariffTier"" t SET
    ""Price20Dry"" = COALESCE((SELECT price FROM m WHERE m.tier_id = t.""Id"" AND m.col = 'Price20Dry'), 0),
    ""Price40Dry"" = COALESCE((SELECT price FROM m WHERE m.tier_id = t.""Id"" AND m.col = 'Price40Dry'), 0),
    ""Price45Dry"" = COALESCE((SELECT price FROM m WHERE m.tier_id = t.""Id"" AND m.col = 'Price45Dry'), 0),
    ""Price20Reefer"" = COALESCE((SELECT price FROM m WHERE m.tier_id = t.""Id"" AND m.col = 'Price20Reefer'), 0),
    ""Price40Reefer"" = COALESCE((SELECT price FROM m WHERE m.tier_id = t.""Id"" AND m.col = 'Price40Reefer'), 0),
    ""PriceSpecial"" = COALESCE((SELECT price FROM m WHERE m.tier_id = t.""Id"" AND m.col = 'PriceSpecial'), 0);

UPDATE ""StorageTariffRules"" SET ""IsDeleted"" = false, ""DeletedAt"" = NULL, ""DeletedBy"" = NULL WHERE ""DeletedBy"" = 'migration';
UPDATE ""StorageTariffRules"" SET ""IsActive"" = true WHERE ""LastModifiedBy"" = 'migration'
  AND ""Code"" IN ('STOR_REEFER', 'STOR_45HC', 'STOR_OOG_DG', 'STOR_SPECIAL_EQUIP', 'STOR_MAERSK_SPECIAL');
UPDATE ""MasterCatalogItems"" SET ""IsDeleted"" = false, ""DeletedAt"" = NULL, ""DeletedBy"" = NULL
WHERE ""CatalogType"" = 'STORAGE_TARIFF' AND ""DeletedBy"" = 'migration';
");

            migrationBuilder.DropTable(name: "StorageTariffTierPrices");
        }
    }
}
