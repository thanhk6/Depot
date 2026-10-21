using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class CleaningTariffTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CleaningTariffs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    NameVi = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    NameEn = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Category = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    CedexCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    VatPercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ResponsiblePartyDefault = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    EstimatedDurationMin = table.Column<int>(type: "integer", nullable: false),
                    WaterUsageLiters = table.Column<int>(type: "integer", nullable: false),
                    ChemicalRequired = table.Column<string>(type: "text", nullable: true),
                    EquipmentUsed = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_CleaningTariffs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CleaningTariffPrices",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CleaningTariffId = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_CleaningTariffPrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CleaningTariffPrices_CleaningTariffs_CleaningTariffId",
                        column: x => x.CleaningTariffId,
                        principalTable: "CleaningTariffs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CleaningTariffPrices_CleaningTariffId_ContainerTypeCode",
                table: "CleaningTariffPrices",
                columns: new[] { "CleaningTariffId", "ContainerTypeCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CleaningTariffs_Code",
                table: "CleaningTariffs",
                column: "Code",
                unique: true);

            // Chuyển biểu phí vệ sinh từ catalog dùng chung CLEANING_TARIFF (MasterCatalogItems.JsonData) sang bảng riêng,
            // GIỮ NGUYÊN giá (depot-fullstack-cleaning-tariff-pricing). Giá theo từng loại CONTAINER_TYPE:
            // priceByContainerType[mã] nếu có; lạnh 20 → price20RF, lạnh 40/45 → price40HR; 40HC → price40HC; cỡ 45 → price45HC;
            // cỡ 40 → price40DC; còn lại (cỡ 20) → price20DC. Chỉ chép giá > 0 (0 = chưa có giá). Sau đó xoá mềm dòng catalog cũ.
            migrationBuilder.Sql(@"
INSERT INTO ""CleaningTariffs"" (""Code"", ""NameVi"", ""NameEn"", ""Category"", ""CedexCode"", ""Description"", ""VatPercent"", ""Currency"",
    ""ResponsiblePartyDefault"", ""EstimatedDurationMin"", ""WaterUsageLiters"", ""ChemicalRequired"", ""EquipmentUsed"", ""IsActive"", ""SortOrder"",
    ""CreatedAt"", ""CreatedBy"", ""IsDeleted"")
SELECT UPPER(TRIM(c.""Code"")), COALESCE(NULLIF(c.""NameVi"", ''), c.""Name""), c.""Name"",
       COALESCE(NULLIF(j->>'category', ''), 'GENERAL_SWEEP'), NULLIF(j->>'cedexCode', ''), NULLIF(c.""Description"", ''),
       CASE WHEN COALESCE(j->>'vatPercent', '') ~ '^[0-9]+(\.[0-9]+)?$' THEN LEAST((j->>'vatPercent')::numeric, 100) ELSE 8 END,
       'VND', LEFT(COALESCE(NULLIF(j->>'responsiblePartyDefault', ''), 'U'), 5),
       (CASE WHEN COALESCE(j->>'estimatedDurationMin', '') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (j->>'estimatedDurationMin')::numeric ELSE 0 END)::int, (CASE WHEN COALESCE(j->>'waterUsageLiters', '') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (j->>'waterUsageLiters')::numeric ELSE 0 END)::int,
       NULLIF(j->>'chemicalRequired', ''), NULLIF(j->>'equipmentUsed', ''), c.""IsActive"", c.""SortOrder"",
       now(), 'migration', false
FROM ""MasterCatalogItems"" c
CROSS JOIN LATERAL (SELECT CASE WHEN COALESCE(c.""JsonData"", '') ~ '^\s*\{' THEN c.""JsonData""::json ELSE '{}'::json END AS j) jj
WHERE c.""CatalogType"" = 'CLEANING_TARIFF' AND NOT c.""IsDeleted"" AND COALESCE(TRIM(c.""Code""), '') <> ''
ON CONFLICT (""Code"") DO NOTHING;

INSERT INTO ""CleaningTariffPrices"" (""CleaningTariffId"", ""ContainerTypeCode"", ""Price"", ""CreatedAt"", ""CreatedBy"", ""IsDeleted"")
SELECT t.""Id"", ct.code, p.price, now(), 'migration', false
FROM ""MasterCatalogItems"" c
CROSS JOIN LATERAL (SELECT CASE WHEN COALESCE(c.""JsonData"", '') ~ '^\s*\{' THEN c.""JsonData""::json ELSE '{}'::json END AS j) jj
JOIN ""CleaningTariffs"" t ON t.""Code"" = UPPER(TRIM(c.""Code""))
CROSS JOIN (
    SELECT DISTINCT ON (UPPER(TRIM(""Name""))) UPPER(TRIM(""Name"")) AS code,
           COALESCE(CASE WHEN COALESCE(""JsonData"", '') ~ '^\s*\{' THEN ""JsonData""::json->>'size' END, '') AS size,
           UPPER(COALESCE(CASE WHEN COALESCE(""JsonData"", '') ~ '^\s*\{' THEN ""JsonData""::json->>'category' END, '')) AS category
    FROM ""MasterCatalogItems""
    WHERE ""CatalogType"" = 'CONTAINER_TYPE' AND NOT ""IsDeleted""
      AND COALESCE(TRIM(""Name""), '') <> '' AND LENGTH(TRIM(""Name"")) <= 20
    ORDER BY UPPER(TRIM(""Name"")), ""IsActive"" DESC, ""Id""
) ct
CROSS JOIN LATERAL (SELECT CASE
    WHEN (CASE WHEN COALESCE(jj.j->'priceByContainerType'->>ct.code, '') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (jj.j->'priceByContainerType'->>ct.code)::numeric ELSE 0 END) > 0 THEN (CASE WHEN COALESCE(jj.j->'priceByContainerType'->>ct.code, '') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (jj.j->'priceByContainerType'->>ct.code)::numeric ELSE 0 END)
    WHEN ct.category = 'REEFER' AND ct.size = '20' THEN (CASE WHEN COALESCE(jj.j->>'price20RF', '') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (jj.j->>'price20RF')::numeric ELSE 0 END)
    WHEN ct.category = 'REEFER' THEN (CASE WHEN COALESCE(jj.j->>'price40HR', '') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (jj.j->>'price40HR')::numeric ELSE 0 END)
    WHEN ct.code = '40HC' THEN (CASE WHEN COALESCE(jj.j->>'price40HC', '') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (jj.j->>'price40HC')::numeric ELSE 0 END)
    WHEN ct.size = '45' THEN (CASE WHEN COALESCE(jj.j->>'price45HC', '') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (jj.j->>'price45HC')::numeric ELSE 0 END)
    WHEN ct.size = '40' THEN (CASE WHEN COALESCE(jj.j->>'price40DC', '') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (jj.j->>'price40DC')::numeric ELSE 0 END)
    ELSE (CASE WHEN COALESCE(jj.j->>'price20DC', '') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (jj.j->>'price20DC')::numeric ELSE 0 END) END AS price) p
WHERE c.""CatalogType"" = 'CLEANING_TARIFF' AND NOT c.""IsDeleted"" AND p.price > 0
ON CONFLICT (""CleaningTariffId"", ""ContainerTypeCode"") DO NOTHING;

UPDATE ""MasterCatalogItems"" SET ""IsDeleted"" = true, ""DeletedAt"" = now(), ""DeletedBy"" = 'migration'
WHERE ""CatalogType"" = 'CLEANING_TARIFF' AND NOT ""IsDeleted"";");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Bật lại các dòng catalog CLEANING_TARIFF mà migration này đã xoá mềm (giá cũ vẫn còn trong JsonData).
            migrationBuilder.Sql(@"UPDATE ""MasterCatalogItems"" SET ""IsDeleted"" = false, ""DeletedAt"" = NULL, ""DeletedBy"" = NULL
WHERE ""CatalogType"" = 'CLEANING_TARIFF' AND ""DeletedBy"" = 'migration';");

            migrationBuilder.DropTable(
                name: "CleaningTariffPrices");

            migrationBuilder.DropTable(
                name: "CleaningTariffs");
        }
    }
}
