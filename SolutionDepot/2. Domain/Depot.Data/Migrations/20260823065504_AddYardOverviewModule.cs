using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddYardOverviewModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Forklifts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CurrentLocation = table.Column<string>(type: "text", nullable: true),
                    PositionX = table.Column<int>(type: "integer", nullable: false),
                    PositionY = table.Column<int>(type: "integer", nullable: false),
                    TargetPositionX = table.Column<int>(type: "integer", nullable: true),
                    TargetPositionY = table.Column<int>(type: "integer", nullable: true),
                    DriverName = table.Column<string>(type: "text", nullable: true),
                    DriverPhone = table.Column<string>(type: "text", nullable: true),
                    BatteryPercent = table.Column<int>(type: "integer", nullable: false),
                    MaxCapacityTons = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrentTask = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_Forklifts", x => x.Id);
                    table.UniqueConstraint("AK_Forklifts_Code", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "YardBlockLayouts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ZoneCode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    BlockName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BayCount = table.Column<int>(type: "integer", nullable: false),
                    RowCount = table.Column<int>(type: "integer", nullable: false),
                    MaxTier = table.Column<int>(type: "integer", nullable: false),
                    PositionX = table.Column<int>(type: "integer", nullable: false),
                    PositionY = table.Column<int>(type: "integer", nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: false),
                    Height = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_YardBlockLayouts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "YardGateLanes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LaneNo = table.Column<int>(type: "integer", nullable: false),
                    GateType = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    LaneName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    HasOcr = table.Column<bool>(type: "boolean", nullable: false),
                    HasRfid = table.Column<bool>(type: "boolean", nullable: false),
                    HasWeighbridge = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CurrentTruckPlate = table.Column<string>(type: "text", nullable: true),
                    CurrentContainerNo = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_YardGateLanes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "YardMoveHistories",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ContainerNo = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    FromLocation = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ToLocation = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MoveDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ForkliftCode = table.Column<string>(type: "text", nullable: true),
                    PerformedBy = table.Column<string>(type: "text", nullable: true),
                    Reason = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_YardMoveHistories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "YardZones",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ZoneName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ZoneType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    PositionX = table.Column<int>(type: "integer", nullable: false),
                    PositionY = table.Column<int>(type: "integer", nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: false),
                    Height = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_YardZones", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ForkliftDispatches",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ForkliftCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ContainerNo = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    FromLocation = table.Column<string>(type: "text", nullable: true),
                    ToLocation = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DispatchedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DriverName = table.Column<string>(type: "text", nullable: true),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
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
                    table.PrimaryKey("PK_ForkliftDispatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ForkliftDispatches_Forklifts_ForkliftCode",
                        column: x => x.ForkliftCode,
                        principalTable: "Forklifts",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ForkliftDispatches_Code",
                table: "ForkliftDispatches",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ForkliftDispatches_ContainerNo",
                table: "ForkliftDispatches",
                column: "ContainerNo");

            migrationBuilder.CreateIndex(
                name: "IX_ForkliftDispatches_ForkliftCode",
                table: "ForkliftDispatches",
                column: "ForkliftCode");

            migrationBuilder.CreateIndex(
                name: "IX_Forklifts_Code",
                table: "Forklifts",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_YardBlockLayouts_Code",
                table: "YardBlockLayouts",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_YardBlockLayouts_ZoneCode",
                table: "YardBlockLayouts",
                column: "ZoneCode");

            migrationBuilder.CreateIndex(
                name: "IX_YardGateLanes_Code",
                table: "YardGateLanes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_YardMoveHistories_Code",
                table: "YardMoveHistories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_YardMoveHistories_ContainerNo",
                table: "YardMoveHistories",
                column: "ContainerNo");

            migrationBuilder.CreateIndex(
                name: "IX_YardMoveHistories_MoveDate",
                table: "YardMoveHistories",
                column: "MoveDate");

            migrationBuilder.CreateIndex(
                name: "IX_YardZones_Code",
                table: "YardZones",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ForkliftDispatches");

            migrationBuilder.DropTable(
                name: "YardBlockLayouts");

            migrationBuilder.DropTable(
                name: "YardGateLanes");

            migrationBuilder.DropTable(
                name: "YardMoveHistories");

            migrationBuilder.DropTable(
                name: "YardZones");

            migrationBuilder.DropTable(
                name: "Forklifts");
        }
    }
}
