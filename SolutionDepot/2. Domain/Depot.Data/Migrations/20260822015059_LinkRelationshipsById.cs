using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class LinkRelationshipsById : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_depot_jobs_JobNo",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_Containers_ShippingLines_ShippingLineCode",
                table: "Containers");

            migrationBuilder.DropForeignKey(
                name: "FK_depot_jobs_ShippingLines_ShippingLineCode",
                table: "depot_jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_Estimates_depot_jobs_JobNo",
                table: "Estimates");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_depot_jobs_JobNo",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_RepairOrders_depot_jobs_JobNo",
                table: "RepairOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_Surveys_depot_jobs_JobNo",
                table: "Surveys");

            migrationBuilder.DropForeignKey(
                name: "FK_SystemUser_Roles_RoleName",
                table: "SystemUser");

            migrationBuilder.DropIndex(
                name: "IX_SystemUser_RoleName",
                table: "SystemUser");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ShippingLines_Code",
                table: "ShippingLines");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Roles_RoleCode",
                table: "Roles");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_depot_jobs_JobNo",
                table: "depot_jobs");

            migrationBuilder.DropIndex(
                name: "IX_depot_jobs_ShippingLineCode",
                table: "depot_jobs");

            migrationBuilder.DropIndex(
                name: "IX_Containers_ShippingLineCode",
                table: "Containers");

            migrationBuilder.AddColumn<int>(
                name: "RoleId",
                table: "SystemUser",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ShippingLineId",
                table: "depot_jobs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ShippingLineId",
                table: "CustomerBookings",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ShippingLineId",
                table: "Containers",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql(@"
UPDATE ""SystemUser"" su
SET ""RoleId"" = r.""Id""
FROM ""Roles"" r
WHERE su.""RoleName"" = r.""RoleCode"";
");

            migrationBuilder.Sql(@"
UPDATE ""depot_jobs"" dj
SET ""ShippingLineId"" = sl.""Id""
FROM ""ShippingLines"" sl
WHERE dj.""ShippingLineCode"" = sl.""Code"";
");

            migrationBuilder.Sql(@"
UPDATE ""CustomerBookings"" cb
SET ""ShippingLineId"" = sl.""Id""
FROM ""ShippingLines"" sl
WHERE cb.""ShippingLineCode"" = sl.""Code"";
");

            migrationBuilder.Sql(@"
UPDATE ""Containers"" c
SET ""ShippingLineId"" = sl.""Id""
FROM ""ShippingLines"" sl
WHERE c.""ShippingLineCode"" = sl.""Code"";
");

            migrationBuilder.AlterColumn<int>(
                name: "RoleId",
                table: "SystemUser",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ShippingLineId",
                table: "depot_jobs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ShippingLineId",
                table: "CustomerBookings",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ShippingLineId",
                table: "Containers",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SystemUser_RoleId",
                table: "SystemUser",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Surveys_DepotJobId",
                table: "Surveys",
                column: "DepotJobId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RepairOrders_DepotJobId",
                table: "RepairOrders",
                column: "DepotJobId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_DepotJobId",
                table: "Payments",
                column: "DepotJobId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Estimates_DepotJobId",
                table: "Estimates",
                column: "DepotJobId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_depot_jobs_ShippingLineId",
                table: "depot_jobs",
                column: "ShippingLineId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerBookings_ShippingLineId",
                table: "CustomerBookings",
                column: "ShippingLineId");

            migrationBuilder.CreateIndex(
                name: "IX_Containers_ShippingLineId",
                table: "Containers",
                column: "ShippingLineId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_DepotJobId",
                table: "AuditLogs",
                column: "DepotJobId");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_depot_jobs_DepotJobId",
                table: "AuditLogs",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Containers_ShippingLines_ShippingLineId",
                table: "Containers",
                column: "ShippingLineId",
                principalTable: "ShippingLines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerBookings_ShippingLines_ShippingLineId",
                table: "CustomerBookings",
                column: "ShippingLineId",
                principalTable: "ShippingLines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_depot_jobs_ShippingLines_ShippingLineId",
                table: "depot_jobs",
                column: "ShippingLineId",
                principalTable: "ShippingLines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Estimates_depot_jobs_DepotJobId",
                table: "Estimates",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_depot_jobs_DepotJobId",
                table: "Payments",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RepairOrders_depot_jobs_DepotJobId",
                table: "RepairOrders",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Surveys_depot_jobs_DepotJobId",
                table: "Surveys",
                column: "DepotJobId",
                principalTable: "depot_jobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SystemUser_Roles_RoleId",
                table: "SystemUser",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_depot_jobs_DepotJobId",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_Containers_ShippingLines_ShippingLineId",
                table: "Containers");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerBookings_ShippingLines_ShippingLineId",
                table: "CustomerBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_depot_jobs_ShippingLines_ShippingLineId",
                table: "depot_jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_Estimates_depot_jobs_DepotJobId",
                table: "Estimates");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_depot_jobs_DepotJobId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_RepairOrders_depot_jobs_DepotJobId",
                table: "RepairOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_Surveys_depot_jobs_DepotJobId",
                table: "Surveys");

            migrationBuilder.DropForeignKey(
                name: "FK_SystemUser_Roles_RoleId",
                table: "SystemUser");

            migrationBuilder.DropIndex(
                name: "IX_SystemUser_RoleId",
                table: "SystemUser");

            migrationBuilder.DropIndex(
                name: "IX_Surveys_DepotJobId",
                table: "Surveys");

            migrationBuilder.DropIndex(
                name: "IX_RepairOrders_DepotJobId",
                table: "RepairOrders");

            migrationBuilder.DropIndex(
                name: "IX_Payments_DepotJobId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Estimates_DepotJobId",
                table: "Estimates");

            migrationBuilder.DropIndex(
                name: "IX_depot_jobs_ShippingLineId",
                table: "depot_jobs");

            migrationBuilder.DropIndex(
                name: "IX_CustomerBookings_ShippingLineId",
                table: "CustomerBookings");

            migrationBuilder.DropIndex(
                name: "IX_Containers_ShippingLineId",
                table: "Containers");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_DepotJobId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "RoleId",
                table: "SystemUser");

            migrationBuilder.DropColumn(
                name: "ShippingLineId",
                table: "depot_jobs");

            migrationBuilder.DropColumn(
                name: "ShippingLineId",
                table: "CustomerBookings");

            migrationBuilder.DropColumn(
                name: "ShippingLineId",
                table: "Containers");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ShippingLines_Code",
                table: "ShippingLines",
                column: "Code");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Roles_RoleCode",
                table: "Roles",
                column: "RoleCode");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_depot_jobs_JobNo",
                table: "depot_jobs",
                column: "JobNo");

            migrationBuilder.CreateIndex(
                name: "IX_SystemUser_RoleName",
                table: "SystemUser",
                column: "RoleName");

            migrationBuilder.CreateIndex(
                name: "IX_depot_jobs_ShippingLineCode",
                table: "depot_jobs",
                column: "ShippingLineCode");

            migrationBuilder.CreateIndex(
                name: "IX_Containers_ShippingLineCode",
                table: "Containers",
                column: "ShippingLineCode");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_depot_jobs_JobNo",
                table: "AuditLogs",
                column: "JobNo",
                principalTable: "depot_jobs",
                principalColumn: "JobNo",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Containers_ShippingLines_ShippingLineCode",
                table: "Containers",
                column: "ShippingLineCode",
                principalTable: "ShippingLines",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_depot_jobs_ShippingLines_ShippingLineCode",
                table: "depot_jobs",
                column: "ShippingLineCode",
                principalTable: "ShippingLines",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Estimates_depot_jobs_JobNo",
                table: "Estimates",
                column: "JobNo",
                principalTable: "depot_jobs",
                principalColumn: "JobNo",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_depot_jobs_JobNo",
                table: "Payments",
                column: "JobNo",
                principalTable: "depot_jobs",
                principalColumn: "JobNo",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RepairOrders_depot_jobs_JobNo",
                table: "RepairOrders",
                column: "JobNo",
                principalTable: "depot_jobs",
                principalColumn: "JobNo",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Surveys_depot_jobs_JobNo",
                table: "Surveys",
                column: "JobNo",
                principalTable: "depot_jobs",
                principalColumn: "JobNo",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SystemUser_Roles_RoleName",
                table: "SystemUser",
                column: "RoleName",
                principalTable: "Roles",
                principalColumn: "RoleCode",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
