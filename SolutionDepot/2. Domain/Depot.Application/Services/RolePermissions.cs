using System;
using System.Collections.Generic;
using System.Linq;

namespace Depot.Application.Services
{
    /// <summary>
    /// Ma trận vai trò → nhóm chức năng: nguồn chân lý DUY NHẤT cho cả menu frontend (trả về qua
    /// <c>AllowedTabs</c> lúc đăng nhập) lẫn phân quyền API (<c>[RequirePermission]</c> ở BackendApi).
    /// Trước đây ma trận này chỉ dùng để dựng menu, còn API chỉ yêu cầu "đã đăng nhập" — mọi vai trò gọi thẳng
    /// được API công nợ/danh mục/kho (BUG-001 trong docs/qa/bug-report.md).
    /// Frontend quy đổi từng mục menu sang nhóm ở <c>fontend/src/constants/menuPermissions.ts</c> — thêm/đổi
    /// nhóm ở đây thì phải sửa cả file đó.
    /// </summary>
    public static class RolePermissions
    {
        public const string Dashboard = "dashboard";
        public const string Jobs = "jobs";
        public const string Operation = "operation";   // Gate-In, Gate-Out, phiếu dịch vụ khai thác
        public const string Payment = "payment";       // thu tiền phiếu dịch vụ tại cổng
        public const string Survey = "survey";
        public const string Cleaning = "cleaning";
        public const string Estimate = "estimate";     // lập + duyệt báo giá, truyền API hãng tàu
        public const string Repair = "repair";
        public const string Qc = "qc";
        public const string Yard = "yard";
        public const string Forklift = "forklift";
        public const string Billing = "billing";       // công nợ hãng tàu (AR)
        public const string Inventory = "inventory";   // kho vật tư
        public const string MasterData = "masterdata"; // danh mục, biểu cước, khách hàng, hãng tàu
        public const string Notifications = "notifications";
        public const string Report = "report";
        public const string Permissions = "permissions"; // quản trị người dùng/vai trò — chỉ ADMIN

        public static readonly IReadOnlyList<string> All = new[]
        {
            Dashboard, Jobs, Operation, Payment, Survey, Cleaning, Estimate, Repair, Qc, Yard, Forklift,
            Billing, Inventory, MasterData, Notifications, Report, Permissions
        };

        private static readonly Dictionary<string, string[]> ByRole = new(StringComparer.OrdinalIgnoreCase)
        {
            ["ADMIN"] = All.ToArray(),
            ["SURVEYOR"] = new[] { Jobs, Survey, Yard },
            ["GATE_OP"] = new[] { Jobs, Operation, Payment },
            ["CASHIER"] = new[] { Dashboard, Jobs, Payment, Billing, Inventory, MasterData, Report },
            ["ESTIMATOR"] = new[] { Jobs, Estimate, Survey },
            ["TECHNICIAN"] = new[] { Jobs, Repair, Yard },
            ["QC_ENG"] = new[] { Jobs, Qc, Repair, Survey },
            ["FORKLIFT"] = new[] { Jobs, Forklift, Yard },
            ["CARRIER"] = new[] { Jobs, Estimate },
            ["CLEANING"] = new[] { Jobs, Cleaning, Yard },
        };

        private static readonly string[] Fallback = { Jobs, Yard };

        public static IReadOnlyList<string> ForRole(string? roleCode) =>
            !string.IsNullOrWhiteSpace(roleCode) && ByRole.TryGetValue(roleCode.Trim(), out var perms) ? perms : Fallback;

        public static bool HasAny(string? roleCode, IEnumerable<string> required)
        {
            var granted = ForRole(roleCode);
            return required.Any(p => granted.Contains(p, StringComparer.OrdinalIgnoreCase));
        }
    }
}
