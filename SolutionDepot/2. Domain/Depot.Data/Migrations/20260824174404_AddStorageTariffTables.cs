using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStorageTariffTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StorageTariffRules",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ShippingLineCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ShippingLineName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ContainerTypeCategory = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    DefaultFreeDays = table.Column<int>(type: "integer", nullable: false),
                    CalculationUnit = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    VatPercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_StorageTariffRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StorageTariffTier",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StorageTariffRuleId = table.Column<long>(type: "bigint", nullable: false),
                    TierName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FromDay = table.Column<int>(type: "integer", nullable: false),
                    ToDay = table.Column<int>(type: "integer", nullable: true),
                    Price20Dry = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Price40Dry = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Price45Dry = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Price20Reefer = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Price40Reefer = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PriceSpecial = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_StorageTariffTier", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StorageTariffTier_StorageTariffRules_StorageTariffRuleId",
                        column: x => x.StorageTariffRuleId,
                        principalTable: "StorageTariffRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StorageTariffRules_Code",
                table: "StorageTariffRules",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StorageTariffRules_ShippingLineCode",
                table: "StorageTariffRules",
                column: "ShippingLineCode");

            migrationBuilder.CreateIndex(
                name: "IX_StorageTariffTier_StorageTariffRuleId",
                table: "StorageTariffTier",
                column: "StorageTariffRuleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StorageTariffTier");

            migrationBuilder.DropTable(
                name: "StorageTariffRules");
        }
    }
}
