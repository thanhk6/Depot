using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class ServiceTariffPricesPerContainerType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ServiceTariffPrices",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ServiceTariffId = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_ServiceTariffPrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceTariffPrices_ServiceTariffs_ServiceTariffId",
                        column: x => x.ServiceTariffId,
                        principalTable: "ServiceTariffs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTariffPrices_ServiceTariffId_ContainerTypeCode",
                table: "ServiceTariffPrices",
                columns: new[] { "ServiceTariffId", "ContainerTypeCode" },
                unique: true);

            // Chuyển giá 6 nhóm cũ sang từng loại container của DM Loại Container (CONTAINER_TYPE.Name), theo đúng quy tắc
            // đang dùng để tính phiếu: khô 20/40/45 → Price20GP/40HC/45HC; lạnh 20 → Price20RF, lạnh 40/45 → Price40RH;
            // nhóm khác → PriceSpecial. Chỉ chép giá > 0 (0 = chưa có giá) — giá không đổi (depot-fullstack-lolo-tariff-pricing).
            migrationBuilder.Sql(@"
INSERT INTO ""ServiceTariffPrices"" (""ServiceTariffId"", ""ContainerTypeCode"", ""Price"", ""CreatedAt"", ""CreatedBy"", ""IsDeleted"")
SELECT t.""Id"", UPPER(TRIM(ct.""Name"")), p.price, now(), 'migration', false
FROM ""ServiceTariffs"" t
CROSS JOIN (
    SELECT DISTINCT ON (UPPER(TRIM(""Name""))) ""Name"",
           COALESCE(NULLIF(""JsonData"", '')::json->>'size', '') AS size,
           UPPER(COALESCE(NULLIF(""JsonData"", '')::json->>'category', '')) AS category
    FROM ""MasterCatalogItems""
    WHERE ""CatalogType"" = 'CONTAINER_TYPE' AND NOT ""IsDeleted""
      AND COALESCE(TRIM(""Name""), '') <> '' AND LENGTH(TRIM(""Name"")) <= 20
      AND (COALESCE(""JsonData"", '') = '' OR ""JsonData"" ~ '^\s*\{')
    ORDER BY UPPER(TRIM(""Name"")), ""IsActive"" DESC, ""Id""
) ct
CROSS JOIN LATERAL (SELECT CASE
    WHEN ct.category = 'DRY' AND ct.size = '20' THEN t.""Price20GP""
    WHEN ct.category = 'DRY' AND ct.size = '40' THEN t.""Price40HC""
    WHEN ct.category = 'DRY' AND ct.size = '45' THEN t.""Price45HC""
    WHEN ct.category = 'REEFER' AND ct.size = '20' THEN t.""Price20RF""
    WHEN ct.category = 'REEFER' THEN t.""Price40RH""
    ELSE t.""PriceSpecial"" END AS price) p
WHERE NOT t.""IsDeleted"" AND p.price > 0;");

            migrationBuilder.DropColumn(
                name: "Price20GP",
                table: "ServiceTariffs");

            migrationBuilder.DropColumn(
                name: "Price20RF",
                table: "ServiceTariffs");

            migrationBuilder.DropColumn(
                name: "Price40HC",
                table: "ServiceTariffs");

            migrationBuilder.DropColumn(
                name: "Price40RH",
                table: "ServiceTariffs");

            migrationBuilder.DropColumn(
                name: "Price45HC",
                table: "ServiceTariffs");

            migrationBuilder.DropColumn(
                name: "PriceSpecial",
                table: "ServiceTariffs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceTariffPrices");

            migrationBuilder.AddColumn<decimal>(
                name: "Price20GP",
                table: "ServiceTariffs",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Price20RF",
                table: "ServiceTariffs",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Price40HC",
                table: "ServiceTariffs",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Price40RH",
                table: "ServiceTariffs",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Price45HC",
                table: "ServiceTariffs",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PriceSpecial",
                table: "ServiceTariffs",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }
    }
}
