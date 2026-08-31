using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBillingModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ArPayments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ShippingLineCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ShippingLineName = table.Column<string>(type: "text", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentAmountVnd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PaymentMethod = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    BankName = table.Column<string>(type: "text", nullable: true),
                    ReferenceNo = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RecordedBy = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ReversedBy = table.Column<string>(type: "text", nullable: true),
                    ReversedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReversalReason = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_ArPayments", x => x.Id);
                    table.UniqueConstraint("AK_ArPayments_Code", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "DebtPeriods",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    ShippingLineCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ShippingLineName = table.Column<string>(type: "text", nullable: false),
                    PeriodCode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    FromDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ToDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OpeningBalanceVnd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PeriodDebitVnd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PeriodCreditVnd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ClosingBalanceVnd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedBy = table.Column<string>(type: "text", nullable: true),
                    ClosingNotes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_DebtPeriods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ShippingLineDebts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ShippingLineCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ShippingLineName = table.Column<string>(type: "text", nullable: false),
                    JobNo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ContainerNo = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    QuotationNo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    RepairNo = table.Column<string>(type: "text", nullable: false),
                    InvoiceNo = table.Column<string>(type: "text", nullable: true),
                    DebtPeriodCode = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    DebtDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ServiceType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    TotalAmountVnd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PaidAmountVnd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    RemainingAmountVnd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ApprovalRef = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_ShippingLineDebts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PaymentAllocations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ArPaymentCode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ShippingLineDebtCode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ContainerNo = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    QuotationNo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    AllocatedAmountVnd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_PaymentAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentAllocations_ArPayments_ArPaymentCode",
                        column: x => x.ArPaymentCode,
                        principalTable: "ArPayments",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ArPayments_Code",
                table: "ArPayments",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ArPayments_ShippingLineCode",
                table: "ArPayments",
                column: "ShippingLineCode");

            migrationBuilder.CreateIndex(
                name: "IX_DebtPeriods_Code",
                table: "DebtPeriods",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DebtPeriods_ShippingLineCode",
                table: "DebtPeriods",
                column: "ShippingLineCode");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_ArPaymentCode",
                table: "PaymentAllocations",
                column: "ArPaymentCode");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_Code",
                table: "PaymentAllocations",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_ShippingLineDebtCode",
                table: "PaymentAllocations",
                column: "ShippingLineDebtCode");

            migrationBuilder.CreateIndex(
                name: "IX_ShippingLineDebts_Code",
                table: "ShippingLineDebts",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShippingLineDebts_ContainerNo",
                table: "ShippingLineDebts",
                column: "ContainerNo");

            migrationBuilder.CreateIndex(
                name: "IX_ShippingLineDebts_DebtPeriodCode",
                table: "ShippingLineDebts",
                column: "DebtPeriodCode");

            migrationBuilder.CreateIndex(
                name: "IX_ShippingLineDebts_JobNo",
                table: "ShippingLineDebts",
                column: "JobNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShippingLineDebts_ShippingLineCode",
                table: "ShippingLineDebts",
                column: "ShippingLineCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DebtPeriods");

            migrationBuilder.DropTable(
                name: "PaymentAllocations");

            migrationBuilder.DropTable(
                name: "ShippingLineDebts");

            migrationBuilder.DropTable(
                name: "ArPayments");
        }
    }
}
