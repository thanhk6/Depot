using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCleaningModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CleaningRecords",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    JobNo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    ContainerNo = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    IsoCode = table.Column<string>(type: "text", nullable: true),
                    SizeType = table.Column<string>(type: "text", nullable: true),
                    TypeName = table.Column<string>(type: "text", nullable: true),
                    ShippingLine = table.Column<string>(type: "text", nullable: true),
                    EeirNo = table.Column<string>(type: "text", nullable: true),
                    CleaningBay = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CleaningStaff = table.Column<string>(type: "text", nullable: true),
                    WaterPressureBar = table.Column<int>(type: "integer", nullable: false),
                    ChemicalUsed = table.Column<string>(type: "text", nullable: true),
                    ChemicalVolumeLiters = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    TemperatureCelsius = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    TargetQualityGrade = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    BeforeCleaningPhotoUrl = table.Column<string>(type: "text", nullable: true),
                    BeforePhotoTimestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AfterCleaningPhotoUrl = table.Column<string>(type: "text", nullable: true),
                    AfterPhotoTimestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalCostVnd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CleaningNotes = table.Column<string>(type: "text", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HandoverToOperationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HandoverActor = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_CleaningRecords", x => x.Id);
                    table.UniqueConstraint("AK_CleaningRecords_Code", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "CleaningWorkItem",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CleaningRecordCode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    CleaningCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CleaningName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ChemicalRequired = table.Column<bool>(type: "boolean", nullable: false),
                    ChemicalName = table.Column<string>(type: "text", nullable: true),
                    EstimatedDurationMin = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ResponsibleParty = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedBy = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_CleaningWorkItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CleaningWorkItem_CleaningRecords_CleaningRecordCode",
                        column: x => x.CleaningRecordCode,
                        principalTable: "CleaningRecords",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CleaningRecords_Code",
                table: "CleaningRecords",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CleaningRecords_ContainerNo",
                table: "CleaningRecords",
                column: "ContainerNo");

            migrationBuilder.CreateIndex(
                name: "IX_CleaningRecords_JobNo",
                table: "CleaningRecords",
                column: "JobNo");

            migrationBuilder.CreateIndex(
                name: "IX_CleaningRecords_Status",
                table: "CleaningRecords",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CleaningWorkItem_CleaningRecordCode",
                table: "CleaningWorkItem",
                column: "CleaningRecordCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CleaningWorkItem");

            migrationBuilder.DropTable(
                name: "CleaningRecords");
        }
    }
}
