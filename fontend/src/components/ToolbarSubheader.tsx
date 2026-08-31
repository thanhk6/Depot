
import React from 'react';
import {
  PlusCircle,
  FileSpreadsheet,
  FileText,
  Printer,
  RotateCcw,
  Filter,
  Layers,
  ChevronRight,
  Download
} from 'lucide-react';

interface ToolbarSubheaderProps {
  activeTab: string;
  onRefresh?: () => void;
  onOpenGateIn?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

const TAB_TITLES: Record<string, { title: string; breadcrumb: string; desc: string }> = {
  dashboard: { title: 'Báo Cáo KPI Overall', breadcrumb: 'Dashboard / Overview', desc: 'Chỉ số sản lượng nâng hạ, doanh thu dịch vụ & sơ đồ bãi tổng quan' },
  jobs: { title: 'Danh Sách Hồ Sơ Container (DataGrid)', breadcrumb: 'Container / All Jobs', desc: 'Tra cứu, lọc nâng cao, quản lý trạng thái & lịch sử luồng Container' },
  operation: { title: 'Màn Hình Khai Thác Cổng (Gate In/Out)', breadcrumb: 'Operation / Gate', desc: 'Lập phiếu dịch vụ, tính tiền tự động, chọn xe đầu kéo & phát hành QR VietQR' },
  survey: { title: 'Màn Hình Giám Định Kỹ Thuật (IICL Survey)', breadcrumb: 'Survey / Inspection', desc: 'Lập biên bản hư hỏng 3 cột, upload ảnh Before/After, mã số IICL-5' },
  qc: { title: 'Màn Hình Nghiệm Thu Chất Lượng (QC)', breadcrumb: 'QC / Inspection', desc: 'Đối chiếu ảnh Before/After, kiểm tra checklist IICL-5 & phê duyệt/từ chối' },
  estimate: { title: 'Báo Giá Sửa Chữa (Estimate Approval)', breadcrumb: 'Estimate / Approval', desc: 'Áp đơn giá vật tư, nhân công thợ, tính tổng & gửi Hãng tàu phê duyệt' },
  repair: { title: 'Tiến Độ Sửa Chữa Thợ (Kanban Board)', breadcrumb: 'Repair / Work Order', desc: 'Theo dõi bảng Kanban 4 cột (Chờ - Đang làm - QC - Complete) & vật tư xuất kho' },
  yard: { title: 'Sơ Đồ Bãi Container 2D (Yard Management)', breadcrumb: 'Yard / Map 2D', desc: 'Sơ đồ bãi 2D Block-Bay-Row-Tier, màu sắc trạng thái, zoom, pan & đảo bãi' },
  forklift: { title: 'Điều Độ Lệnh Xe Nâng (Forklift Work Orders)', breadcrumb: 'Forklift / Move Order', desc: 'Phát lệnh gắp đảo bãi, chuyển vị trí sửa chữa, phân công tài xế & theo dõi' },
  payment: { title: 'Thanh Toán Dịch Vụ & QR VietQR', breadcrumb: 'Payment / VietQR', desc: 'Trạng thái thanh toán tự động, gạch nợ Webhook ngân hàng & in phiếu thu' },
  inventory: { title: 'Quản Lý Kho Vật Tư Sửa Chữa', breadcrumb: 'Inventory / Warehouse', desc: 'Tồn kho thép tấm, sơn lót, ván sàn, đệm cao su & cảnh báo hạn mức' },
  categories: { title: 'Quản Lý Phân Loại Container (ISO Standards)', breadcrumb: 'Master Data / Categories', desc: 'Danh mục chuẩn loại vỏ (20GP, 40HC, 40RH...), trọng tải Tare/Payload, CBM & ISO Codes' },
  ai: { title: 'Trợ Lý Trí Tuệ Nhân Tạo (Module 20: AI Enterprise)', breadcrumb: 'AI / Copilot System', desc: 'AI OCR Container/Seal, phân tích ảnh hư hỏng IICL, gợi ý báo giá & Chatbot tra cứu bãi' },
  masterdata: { title: 'Danh Mục Dữ Liệu Gốc (Master Data)', breadcrumb: 'System / Master Data', desc: 'Hãng tàu, Doanh nghiệp khách hàng, Đội xe vận tải & Danh sách tài xế' },
  report: { title: 'Trung Tâm Báo Cáo Doanh Thu (Analytics)', breadcrumb: 'Reports / BI Analytics', desc: 'Biểu đồ Recharts, Pivot table tổng hợp & xuất dữ liệu báo cáo' },
  permissions: { title: 'Cấu Hình Phân Quyền RBAC & User', breadcrumb: 'System / Permissions', desc: 'Ma trận phân quyền Menu Tab, policy vận hành & quản lý tài khoản nhân viên' },
  dotnet: { title: 'Cấu Trúc C# .NET Core 8.0 Architecture', breadcrumb: 'System / .NET 8 API', desc: 'Mã nguồn C# .NET 8 Enterprise, Entity Framework Core & JWT Authorization' }
};

export const ToolbarSubheader: React.FC<ToolbarSubheaderProps> = ({
  activeTab,
  onRefresh,
  onOpenGateIn,
  onExportExcel,
  onExportPdf
}) => {
  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: 'Hệ Thống Depot ERP',
    breadcrumb: 'System / Module',
    desc: 'Quản lý toàn bộ quy trình Container Depot'
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3.5 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Breadcrumb */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span>Metronic ERP</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-blue-600 font-mono">{currentTabInfo.breadcrumb}</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
            {currentTabInfo.title}
          </h2>
          <p className="text-xs text-slate-500">{currentTabInfo.desc}</p>
        </div>

        {/* Toolbar Action Buttons (Metronic v8 Style) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenGateIn}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Gate-In</span>
          </button>

          <button
            onClick={onExportExcel}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Xuất dữ liệu ra Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={onExportPdf}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Xuất file PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="In biểu mẫu"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-xl transition cursor-pointer shadow-sm"
            title="Làm mới dữ liệu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
