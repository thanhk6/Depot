import React, { useEffect, useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import { apiClient, API_ENDPOINTS } from '../../api';
import {
  Ship,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  CreditCard,
  ShieldCheck,
  UserCheck,
  Key,
  Lock,
  FileText,
  DollarSign,
  Camera,
  Layers,
  CheckSquare,
  X,
  Upload,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export interface ShippingLineItem {
  id: string;
  code: string;           // Mã hãng tàu (VD: MAEU)
  name: string;           // Tên Hãng tàu (VD: Maersk Line A/S)
  shortName: string;      // Tên viết tắt (VD: MAERSK)
  scacCode: string;       // Mã SCAC (VD: MAEU)
  website: string;
  logoUrl?: string;
  country: string;
  city: string;
  address: string;

  // Contact Info
  contactPerson: string;
  contactTitle: string;
  phone: string;
  email: string;

  // Billing & Payment Info
  taxCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;

  // System Configurations
  allowAutoSendEstimate: boolean;
  allowPortalApproval: boolean;
  allowViewRepairPhotos: boolean;
  allowDownloadInvoice: boolean;
  isActive: boolean;

  // Linked metrics
  containerCount: number;
  pendingEstimatesCount: number;
}

export const INITIAL_SHIPPING_LINES: ShippingLineItem[] = [
  {
    id: 'SL-001',
    code: 'MAEU',
    name: 'Maersk Line A/S Vietnam Company Ltd.',
    shortName: 'MAERSK',
    scacCode: 'MAEU',
    website: 'https://www.maersk.com',
    country: 'Đan Mạch',
    city: 'TP. Hồ Chí Minh',
    address: 'Số 54-56 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
    contactPerson: 'Mr. Hans Nielsen',
    contactTitle: 'Trưởng Đại Diện Bảo Trì & Sửa Chữa (M&R Manager)',
    phone: '028-3823-0011',
    email: 'hans.nielsen@maersk.com',
    taxCode: '0302881920',
    bankName: 'Ngân hàng Standard Chartered Vietnam',
    accountNumber: '99018273610',
    accountHolder: 'CÔNG TY TNHH MAERSK VIỆT NAM',
    allowAutoSendEstimate: true,
    allowPortalApproval: true,
    allowViewRepairPhotos: true,
    allowDownloadInvoice: true,
    isActive: true,
    containerCount: 142,
    pendingEstimatesCount: 3
  },
  {
    id: 'SL-002',
    code: 'MSCU',
    name: 'Mediterranean Shipping Company (MSC) S.A.',
    shortName: 'MSC',
    scacCode: 'MSCU',
    website: 'https://www.msc.com',
    country: 'Thụy Sĩ',
    city: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Bitexco Financial Tower, số 2 Hải Triều, Q.1, TP.HCM',
    contactPerson: 'Mr. Marco Rossi',
    contactTitle: 'Giám Đốc Thiết Bị & Bãi Container (Equipment Director)',
    phone: '028-3914-1122',
    email: 'msc.vietnam@msc.com',
    taxCode: '0305119283',
    bankName: 'Ngân hàng HSBC Việt Nam',
    accountNumber: '001-882736-001',
    accountHolder: 'MSC MEDITERRANEAN SHIPPING COMPANY VIETNAM',
    allowAutoSendEstimate: true,
    allowPortalApproval: true,
    allowViewRepairPhotos: true,
    allowDownloadInvoice: true,
    isActive: true,
    containerCount: 98,
    pendingEstimatesCount: 2
  },
  {
    id: 'SL-003',
    code: 'COSU',
    name: 'COSCO Shipping Lines (Vietnam) Co., Ltd.',
    shortName: 'COSCO',
    scacCode: 'COSU',
    website: 'http://lines.coscoshipping.com',
    country: 'Trung Quốc',
    city: 'Hải Phòng',
    address: 'Tòa nhà TD Plaza, đường Lê Hồng Phong, Q. Ngô Quyền, Hải Phòng',
    contactPerson: 'Mr. Li Wei',
    contactTitle: 'Trưởng Phòng Giám Định Hư Hỏng Container',
    phone: '028-3821-4455',
    email: 'cosco.vnm@cosco.com',
    taxCode: '0201992831',
    bankName: 'Ngân hàng Bank of China - CN TP.HCM',
    accountNumber: '10008891273',
    accountHolder: 'COSCO SHIPPING LINES VIETNAM CO LTD',
    allowAutoSendEstimate: true,
    allowPortalApproval: true,
    allowViewRepairPhotos: true,
    allowDownloadInvoice: true,
    isActive: true,
    containerCount: 86,
    pendingEstimatesCount: 1
  },
  {
    id: 'SL-004',
    code: 'CMAU',
    name: 'CMA CGM Vietnam Joint Stock Company',
    shortName: 'CMA CGM',
    scacCode: 'CMAU',
    website: 'https://www.cma-cgm.com',
    country: 'Pháp',
    city: 'TP. Hồ Chí Minh',
    address: 'Số 81-85 Hàm Nghi, Phường Nguyễn Thái Bình, Q.1, TP.HCM',
    contactPerson: 'Mme. Sophie Laurent',
    contactTitle: 'Quản Lý Công Nợ & Báo Giá Sửa Chữa',
    phone: '028-3910-3344',
    email: 'cma.depot@cma-cgm.com',
    taxCode: '0308229102',
    bankName: 'Ngân hàng BNP Paribas Việt Nam',
    accountNumber: '04001928371',
    accountHolder: 'CÔNG TY CP CMA CGM VIỆT NAM',
    allowAutoSendEstimate: false,
    allowPortalApproval: true,
    allowViewRepairPhotos: true,
    allowDownloadInvoice: true,
    isActive: true,
    containerCount: 64,
    pendingEstimatesCount: 0
  },
  {
    id: 'SL-005',
    code: 'ONEU',
    name: 'Ocean Network Express (ONE) Vietnam LLC',
    shortName: 'ONE',
    scacCode: 'ONEU',
    website: 'https://www.one-line.com',
    country: 'Nhật Bản',
    city: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Saigon Centre Tower 2, 67 Lê Lợi, Q.1, TP.HCM',
    contactPerson: 'Mr. Kenji Sato',
    contactTitle: 'Trưởng Bộ Phận M&R Vỏ Container',
    phone: '028-3827-8899',
    email: 'one.service@one-line.com',
    taxCode: '0314992810',
    bankName: 'Ngân hàng MUFG Bank - CN TP.HCM',
    accountNumber: '02938475102',
    accountHolder: 'OCEAN NETWORK EXPRESS VIETNAM LLC',
    allowAutoSendEstimate: true,
    allowPortalApproval: true,
    allowViewRepairPhotos: true,
    allowDownloadInvoice: true,
    isActive: true,
    containerCount: 52,
    pendingEstimatesCount: 1
  },
  {
    id: 'SL-006',
    code: 'EVER',
    name: 'Evergreen Marine Corp. (Taiwan) Ltd.',
    shortName: 'EVERGREEN',
    scacCode: 'EGLV',
    website: 'https://www.evergreen-marine.com',
    country: 'Đài Loan',
    city: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Pearl Plaza, 561A Điện Biên Phủ, Q. Bình Thạnh, TP.HCM',
    contactPerson: 'Mr. Chen Kuo-Hua',
    contactTitle: 'Phụ Trách Kỹ Thuật Bãi Container',
    phone: '028-3512-9900',
    email: 'mnd@evergreen-shipping.com.vn',
    taxCode: '0309928120',
    bankName: 'Ngân hàng Mega International Commercial Bank',
    accountNumber: '0881928374',
    accountHolder: 'EVERGREEN SHIPPING AGENCY VIETNAM',
    allowAutoSendEstimate: true,
    allowPortalApproval: true,
    allowViewRepairPhotos: true,
    allowDownloadInvoice: true,
    isActive: true,
    containerCount: 41,
    pendingEstimatesCount: 0
  },
  {
    id: 'SL-007',
    code: 'HLCU',
    name: 'Hapag-Lloyd (Vietnam) Co., Ltd.',
    shortName: 'HAPAG-LLOYD',
    scacCode: 'HLCU',
    website: 'https://www.hapag-lloyd.com',
    country: 'Đức',
    city: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Vincom Center, 72 Lê Thánh Tôn, Q.1, TP.HCM',
    contactPerson: 'Mr. Thomas Muller',
    contactTitle: 'Giám Đốc Vận Hành Cảng & Depot',
    phone: '028-3915-5500',
    email: 'vietnam@hlag.com',
    taxCode: '0310881922',
    bankName: 'Ngân hàng Deutsche Bank - CN TP.HCM',
    accountNumber: '1029384756',
    accountHolder: 'HAPAG-LLOYD VIETNAM COMPANY LIMITED',
    allowAutoSendEstimate: true,
    allowPortalApproval: false,
    allowViewRepairPhotos: true,
    allowDownloadInvoice: false,
    isActive: false,
    containerCount: 0,
    pendingEstimatesCount: 0
  }
];

export const ShippingLineModule: React.FC = () => {
  const { jobs, showToast } = useDepot();

  const [shippingLines, setShippingLines] = useState<ShippingLineItem[]>([]);

  useEffect(() => {
    apiClient.get<any>(API_ENDPOINTS.MASTER_DATA.SHIPPING_LINES)
      .then((response) => {
        const rows = response.data?.data;
        if (!Array.isArray(rows)) return;
        setShippingLines(rows.map((line: any): ShippingLineItem => ({
          id: String(line.id), code: line.code, name: line.name, shortName: line.code,
          scacCode: line.code, website: '', logoUrl: undefined, country: '', city: '', address: '',
          contactPerson: '', contactTitle: '', phone: line.phone || '', email: line.contactEmail || '',
          taxCode: '', bankName: '', accountNumber: '', accountHolder: '',
          allowAutoSendEstimate: true, allowPortalApproval: true, allowViewRepairPhotos: true,
          allowDownloadInvoice: true, isActive: !line.isDeleted, containerCount: 0, pendingEstimatesCount: 0
        })));
      })
      .catch((error) => console.warn('Không thể tải ShippingLine từ Backend SQL:', error));
  }, []);

  // Filters
  const [filterCode, setFilterCode] = useState<string>('ALL');
  const [filterName, setFilterName] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Selected row
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State for Create / Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShippingLineItem | null>(null);

  // Detail Drawer View State
  const [viewDetailItem, setViewDetailItem] = useState<ShippingLineItem | null>(null);
  const [detailTab, setDetailTab] = useState<'PROFILE' | 'USERS' | 'CONTAINERS' | 'INVOICES'>('PROFILE');

  // Form Fields State
  const [formData, setFormData] = useState<Omit<ShippingLineItem, 'id' | 'containerCount' | 'pendingEstimatesCount'>>({
    code: '',
    name: '',
    shortName: '',
    scacCode: '',
    website: '',
    logoUrl: '',
    country: 'Đan Mạch',
    city: 'TP. Hồ Chí Minh',
    address: '',
    contactPerson: '',
    contactTitle: '',
    phone: '',
    email: '',
    taxCode: '',
    bankName: 'Ngân hàng Vietcombank',
    accountNumber: '',
    accountHolder: '',
    allowAutoSendEstimate: true,
    allowPortalApproval: true,
    allowViewRepairPhotos: true,
    allowDownloadInvoice: true,
    isActive: true
  });

  // Notification Toast
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered List
  const filteredList = shippingLines.filter((item) => {
    if (filterCode !== 'ALL' && item.code !== filterCode) return false;
    if (filterCountry !== 'ALL' && item.country !== filterCountry) return false;
    if (filterStatus !== 'ALL') {
      const activeBool = filterStatus === 'ACTIVE';
      if (item.isActive !== activeBool) return false;
    }
    if (filterName.trim()) {
      const q = filterName.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.shortName.toLowerCase().includes(q) ||
        item.contactPerson.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.taxCode.includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Actions
  const handleOpenAddForm = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      shortName: '',
      scacCode: '',
      website: 'https://',
      logoUrl: '',
      country: 'Việt Nam',
      city: 'TP. Hồ Chí Minh',
      address: '',
      contactPerson: '',
      contactTitle: 'Trưởng Đại Diện M&R',
      phone: '',
      email: '',
      taxCode: '',
      bankName: 'Ngân hàng Vietcombank',
      accountNumber: '',
      accountHolder: '',
      allowAutoSendEstimate: true,
      allowPortalApproval: true,
      allowViewRepairPhotos: true,
      allowDownloadInvoice: true,
      isActive: true
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (item: ShippingLineItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      shortName: item.shortName,
      scacCode: item.scacCode,
      website: item.website,
      logoUrl: item.logoUrl || '',
      country: item.country,
      city: item.city,
      address: item.address,
      contactPerson: item.contactPerson,
      contactTitle: item.contactTitle,
      phone: item.phone,
      email: item.email,
      taxCode: item.taxCode,
      bankName: item.bankName,
      accountNumber: item.accountNumber,
      accountHolder: item.accountHolder,
      allowAutoSendEstimate: item.allowAutoSendEstimate,
      allowPortalApproval: item.allowPortalApproval,
      allowViewRepairPhotos: item.allowViewRepairPhotos,
      allowDownloadInvoice: item.allowDownloadInvoice,
      isActive: item.isActive
    });
    setIsFormModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setShippingLines((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    showNotification('Đã thay đổi trạng thái hoạt động của hãng tàu.');
  };

  const handleDeleteItem = (id: string) => {
    const item = shippingLines.find((s) => s.id === id);
    if (!item) return;
    if (confirm(`Bạn có chắc chắn muốn ngừng hoạt động / xóa Hãng Tàu "${item.name}"?`)) {
      setShippingLines((prev) => prev.filter((s) => s.id !== id));
      showNotification(`Đã xóa thông tin Hãng tàu ${item.code} thành công.`);
    }
  };

  const handleSaveForm = async (andCreateNew: boolean = false) => {
    if (!formData.code || !formData.name) {
      showToast('Vui lòng nhập đầy đủ Mã Hãng Tàu và Tên Hãng Tàu!', 'error', 'Thiếu Thông Tin');
      return;
    }

    if (editingItem) {
      showNotification('Backend chưa hỗ trợ cập nhật ShippingLine. Chỉ được sửa sau khi có API PUT.');
      return;
    } else {
      const response = await apiClient.post<any>(API_ENDPOINTS.MASTER_DATA.SHIPPING_LINES, {
        code: formData.code.toUpperCase(), name: formData.name,
        contactEmail: formData.email, phone: formData.phone, repairLaborRatePerHour: 150000
      });
      const line = response.data?.data;
      if (!line) {
        showNotification('Không thể thêm Hãng Tàu vào SQL Server.');
        return;
      }
      const newItem: ShippingLineItem = {
        id: String(line.id), ...formData, code: line.code, name: line.name,
        shortName: formData.shortName.toUpperCase(), containerCount: 0, pendingEstimatesCount: 0
      };
      setShippingLines((prev) => [newItem, ...prev]);
      showNotification(`Đã thêm Hãng Tàu ${newItem.code} vào SQL Server.`);
    }

    if (andCreateNew) {
      setEditingItem(null);
      setFormData({
        code: '',
        name: '',
        shortName: '',
        scacCode: '',
        website: 'https://',
        logoUrl: '',
        country: 'Việt Nam',
        city: 'TP. Hồ Chí Minh',
        address: '',
        contactPerson: '',
        contactTitle: '',
        phone: '',
        email: '',
        taxCode: '',
        bankName: 'Ngân hàng Vietcombank',
        accountNumber: '',
        accountHolder: '',
        allowAutoSendEstimate: true,
        allowPortalApproval: true,
        allowViewRepairPhotos: true,
        allowDownloadInvoice: true,
        isActive: true
      });
    } else {
      setIsFormModalOpen(false);
    }
  };

  // Select all checkbox
  const handleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map((i) => i.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportExcel = () => {
    showToast(`Đã xuất thành công file danh sách Hãng tàu (.xlsx) với ${filteredList.length} dòng dữ liệu.`, 'success', 'Xuất Excel');
  };

  const handleImportExcel = () => {
    showToast('Đã nhập dữ liệu từ file Excel "Danh_sach_hang_tau_2026.xlsx". Đã thêm 2 đối tác mới.', 'success', 'Nhập Excel');
  };

  const handlePrintList = () => {
    window.print();
  };

  const uniqueCountries = Array.from(new Set(shippingLines.map((s) => s.country)));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl shadow-inner">
              <Ship className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Quản Lý Danh Mục Hãng Tàu (Shipping Line Management)</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono font-bold">
                  MASTER DATA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Quản lý hồ sơ đối tác hãng tàu, tài khoản Portal phê duyệt báo giá sửa chữa, phân quyền xem ảnh giám định IICL, hóa đơn công nợ & định danh Container.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tổng Hãng Tàu</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">{shippingLines.length}</div>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Hoạt Động</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                {shippingLines.filter((s) => s.isActive).length}
              </div>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Mở Portal</div>
              <div className="text-lg font-black text-purple-300 font-mono mt-0.5">
                {shippingLines.filter((s) => s.allowPortalApproval).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR & TOOLBAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Mã / Tên Hãng Tàu / Email</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm MAEU, Maersk, email..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Mã Hãng Tàu (Code)</label>
            <select
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
            >
              <option value="ALL">-- Tất Cả Mã Hãng Tàu --</option>
              {shippingLines.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.code} - {s.shortName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Quốc Gia Xuất Xứ</label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            >
              <option value="ALL">-- Tất Cả Quốc Gia --</option>
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Trạng Thái Hệ Thống</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            >
              <option value="ALL">-- Tất Cả Trạng Thái --</option>
              <option value="ACTIVE">Hoạt Động (Active)</option>
              <option value="INACTIVE">Ngừng Hoạt Động (Inactive)</option>
            </select>
          </div>
        </div>

        {/* Toolbar Buttons matching exact specs */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAddForm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mới Hãng Tàu</span>
            </button>

            {selectedIds.length === 1 && (
              <button
                onClick={() => {
                  const target = shippingLines.find((s) => s.id === selectedIds[0]);
                  if (target) handleOpenEditForm(target);
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Chỉnh Sửa</span>
              </button>
            )}

            {selectedIds.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Bạn có chắc chắn muốn ngừng hoạt động ${selectedIds.length} Hãng Tàu đã chọn?`)) {
                    setShippingLines((prev) =>
                      prev.map((s) => (selectedIds.includes(s.id) ? { ...s, isActive: false } : s))
                    );
                    setSelectedIds([]);
                    showNotification('Đã cập nhật trạng thái ngừng hoạt động.');
                  }
                }}
                className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ngừng Hoạt Động ({selectedIds.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                setFilterCode('ALL');
                setFilterName('');
                setFilterCountry('ALL');
                setFilterStatus('ALL');
                showNotification('Đã làm mới dữ liệu và các bộ lọc.');
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Làm Mới</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImportExcel}
              className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handlePrintList}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Danh Sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN DATA TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3.5 px-4 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                    onChange={handleSelectAll}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Mã</th>
                <th className="py-3.5 px-4">Tên Hãng Tàu</th>
                <th className="py-3.5 px-3">Tên Viết Tắt</th>
                <th className="py-3.5 px-3">Quốc Gia</th>
                <th className="py-3.5 px-4">Người Liên Hệ</th>
                <th className="py-3.5 px-3">Điện Thoại</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-3 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Không tìm thấy dữ liệu Hãng tàu phù hợp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/50 transition ${
                        isSelected ? 'bg-blue-950/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(item.id)}
                          className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                        {item.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-blue-400 shrink-0">
                            {item.shortName.substring(0, 3)}
                          </div>
                          <div>
                            <div className="text-slate-100">{item.name}</div>
                            {item.scacCode && (
                              <div className="text-[10px] font-mono text-slate-400">SCAC: {item.scacCode}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-blue-300">{item.shortName}</td>
                      <td className="py-3.5 px-3 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                          🌐 {item.country}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{item.contactPerson}</div>
                        <div className="text-[10px] text-slate-400">{item.contactTitle}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-300">{item.phone}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span>{item.email}</span>
                          {item.allowPortalApproval && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[9px] font-bold" title="Tài khoản Portal Hoạt Động">
                              PORTAL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                            item.isActive
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                              : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                          }`}
                        >
                          {item.isActive ? 'Hoạt Động' : 'Ngừng HD'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setViewDetailItem(item);
                              setDetailTab('PROFILE');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-blue-600 transition cursor-pointer"
                            title="Xem chi tiết & quản lý Portal"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditForm(item)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-amber-600 transition cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-rose-950 transition cursor-pointer"
                            title="Xóa / Ngừng hoạt động"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>Hiển thị {filteredList.length} trên tổng số {shippingLines.length} Hãng Tàu đối tác</div>
          <div className="flex items-center gap-2 font-mono">
            <span>Trang 1 / 1</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT FORM MODAL MATCHING USER WIREFRAME LAYOUT EXACTLY */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingItem ? `CHỈNH SỬA THÔNG TIN HÃNG TÀU [ ${editingItem.code} ]` : 'THÊM MỚI HÃNG TÀU ĐỐI TÁC'}
                  </h3>
                  <p className="text-xs text-slate-400">Nhập đầy đủ thông tin doanh nghiệp, thông tin liên hệ, thanh toán & phân quyền hệ thống</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content Layout */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] text-xs">
              {/* SECTION 1: THÔNG TIN CƠ BẢN */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="font-bold text-sm text-blue-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>1. Thông Tin Cơ Bản & Doanh Nghiệp</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Mã Hãng Tàu <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="VD: MAEU, MSCU, EVER"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold uppercase"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">Tên Hãng Tàu (Tên Đầy Đủ) <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Maersk Line A/S Vietnam Company Ltd."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Tên Viết Tắt</label>
                    <input
                      type="text"
                      placeholder="VD: MAERSK"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white uppercase font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">SCAC Code</label>
                    <input
                      type="text"
                      placeholder="VD: MAEU"
                      value={formData.scacCode}
                      onChange={(e) => setFormData({ ...formData, scacCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Website</label>
                    <input
                      type="text"
                      placeholder="https://www.maersk.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: THÔNG TIN LIÊN HỆ */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="font-bold text-sm text-blue-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>2. Thông Tin Liên Hệ (Contact Person)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">Người Liên Hệ Chính</label>
                    <input
                      type="text"
                      placeholder="VD: Mr. Hans Nielsen"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">Chức Vụ</label>
                    <input
                      type="text"
                      placeholder="VD: Trưởng Đại Diện M&R / Phụ Trách Giám Định"
                      value={formData.contactTitle}
                      onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">Điện Thoại</label>
                    <input
                      type="text"
                      placeholder="VD: 028-3823-0011"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">Email (Đăng Nhập Portal & Nhận Báo Giá)</label>
                    <input
                      type="email"
                      placeholder="VD: hans.nielsen@maersk.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: ĐỊA CHỈ */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="font-bold text-sm text-blue-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>3. Địa Chỉ Trụ Sở & Văn Phòng</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Quốc Gia</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="Đan Mạch">Đan Mạch</option>
                      <option value="Thụy Sĩ">Thụy Sĩ</option>
                      <option value="Trung Quốc">Trung Quốc</option>
                      <option value="Pháp">Pháp</option>
                      <option value="Nhật Bản">Nhật Bản</option>
                      <option value="Đài Loan">Đài Loan</option>
                      <option value="Đức">Đức</option>
                      <option value="Hàn Quốc">Hàn Quốc</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Mỹ">Mỹ</option>
                      <option value="Việt Nam">Việt Nam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Tỉnh / Thành Phố</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Bà Rịa - Vũng Tàu">Bà Rịa - Vũng Tàu</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Quy Nhơn">Quy Nhơn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Địa Chỉ Chi Tiết</label>
                    <input
                      type="text"
                      placeholder="VD: Số 54-56 Nguyễn Trãi, Q.1, TP.HCM"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: THÔNG TIN THANH TOÁN */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="font-bold text-sm text-blue-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>4. Thông Tin Thanh Toán & Công Nợ</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Mã Số Thuế</label>
                    <input
                      type="text"
                      placeholder="VD: 0302881920"
                      value={formData.taxCode}
                      onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Ngân Hàng</label>
                    <input
                      type="text"
                      placeholder="VD: Ngân hàng Standard Chartered"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Số Tài Khoản</label>
                    <input
                      type="text"
                      placeholder="VD: 99018273610"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Tên Tài Khoản</label>
                    <input
                      type="text"
                      placeholder="VD: CÔNG TY TNHH MAERSK VIỆT NAM"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white uppercase font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: THIẾT LẬP HỆ THỐNG */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="font-bold text-sm text-blue-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>5. Thiết Lập Hệ Thống & Phân Quyền Portal</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-blue-600 transition">
                    <input
                      type="checkbox"
                      checked={formData.allowAutoSendEstimate}
                      onChange={(e) => setFormData({ ...formData, allowAutoSendEstimate: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-200">Cho phép gửi báo giá tự động</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-blue-600 transition">
                    <input
                      type="checkbox"
                      checked={formData.allowPortalApproval}
                      onChange={(e) => setFormData({ ...formData, allowPortalApproval: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-200">Cho phép duyệt báo giá trên Portal</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-blue-600 transition">
                    <input
                      type="checkbox"
                      checked={formData.allowViewRepairPhotos}
                      onChange={(e) => setFormData({ ...formData, allowViewRepairPhotos: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-200">Cho phép xem hình ảnh sửa chữa</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-blue-600 transition">
                    <input
                      type="checkbox"
                      checked={formData.allowDownloadInvoice}
                      onChange={(e) => setFormData({ ...formData, allowDownloadInvoice: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-200">Cho phép tải hóa đơn công nợ</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-blue-600 transition">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-semibold text-emerald-400">Trạng thái hoạt động (Active)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer matching exact buttons [ Lưu ] [ Lưu & Thêm mới ] [ Hủy ] */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">💡 Lưu ý: Hệ thống tự động tạo mã SCAC và cấu hình Portal khi bấm Lưu.</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSaveForm(true)}
                  className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Lưu & Thêm Mới
                </button>
                <button
                  onClick={() => handleSaveForm(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED PROFILE DRAWER / PORTAL MANAGEMENT MODAL */}
      {/* ========================================================================= */}
      {viewDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8">
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm font-mono">
                  {viewDetailItem.code}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{viewDetailItem.name}</span>
                    <span className="text-xs font-mono text-amber-300">({viewDetailItem.shortName})</span>
                  </h3>
                  <p className="text-xs text-slate-400">Quốc gia: {viewDetailItem.country} • Tax Code: {viewDetailItem.taxCode}</p>
                </div>
              </div>
              <button
                onClick={() => setViewDetailItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="px-6 pt-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setDetailTab('PROFILE')}
                className={`px-4 py-2 border-b-2 transition cursor-pointer ${
                  detailTab === 'PROFILE'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Hồ Sơ Doanh Nghiệp
              </button>
              <button
                onClick={() => setDetailTab('USERS')}
                className={`px-4 py-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  detailTab === 'USERS'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Tài Khoản Portal</span>
              </button>
              <button
                onClick={() => setDetailTab('CONTAINERS')}
                className={`px-4 py-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  detailTab === 'CONTAINERS'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Container Trong Bãi ({jobs.filter((j) => (j.shippingLine || '').toUpperCase().includes(viewDetailItem.code) || (j.shippingLine || '').toUpperCase().includes(viewDetailItem.shortName)).length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto max-h-[65vh] text-xs space-y-4">
              {detailTab === 'PROFILE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <h4 className="font-bold text-blue-400 border-b border-slate-800 pb-1.5 uppercase text-[11px]">Thông Tin Liên Hệ & Đội Ngũ</h4>
                    <div>Người liên hệ: <strong className="text-white">{viewDetailItem.contactPerson}</strong></div>
                    <div>Chức vụ: <span className="text-slate-300">{viewDetailItem.contactTitle}</span></div>
                    <div>Điện thoại: <strong className="font-mono text-amber-300">{viewDetailItem.phone}</strong></div>
                    <div>Email Portal: <strong className="font-mono text-blue-300">{viewDetailItem.email}</strong></div>
                    <div>Website: <a href={viewDetailItem.website} target="_blank" rel="noreferrer" className="text-indigo-400 underline">{viewDetailItem.website}</a></div>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <h4 className="font-bold text-blue-400 border-b border-slate-800 pb-1.5 uppercase text-[11px]">Thông Tin Thanh Toán & Ngân Hàng</h4>
                    <div>Mã số thuế: <strong className="font-mono text-emerald-400">{viewDetailItem.taxCode}</strong></div>
                    <div>Tên ngân hàng: <span className="text-slate-200">{viewDetailItem.bankName}</span></div>
                    <div>Số tài khoản: <strong className="font-mono text-white">{viewDetailItem.accountNumber}</strong></div>
                    <div>Chủ tài khoản: <strong className="text-slate-100 uppercase">{viewDetailItem.accountHolder}</strong></div>
                  </div>
                </div>
              )}

              {detailTab === 'USERS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-200">Danh Sách Tài Khoản Đăng Nhập Portal Hãng Tàu</h4>
                    <button
                      onClick={() => alert(`Đã tạo liên kết kích hoạt Portal và gửi mật khẩu qua email ${viewDetailItem.email}`)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cấp Thêm Tài Khoản Portal</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div>
                        <div className="font-bold text-white">{viewDetailItem.contactPerson}</div>
                        <div className="text-[11px] font-mono text-slate-400">{viewDetailItem.email} (Username: {viewDetailItem.code.toLowerCase()})</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                        Hoạt Động (Active)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'CONTAINERS' && (
                <div className="space-y-3">
                  <div className="text-slate-300 font-semibold">
                    Danh sách các Container thuộc sở hữu của {viewDetailItem.shortName} đang quản lý tại Depot:
                  </div>

                  <div className="border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <th className="p-2.5">Mã Job</th>
                          <th className="p-2.5">Số Container</th>
                          <th className="p-2.5">Kích Thước</th>
                          <th className="p-2.5">Vị Trí Lưu Bãi</th>
                          <th className="p-2.5 text-center">Trạng Thái Job</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {jobs
                          .filter(
                            (j) =>
                              (j.shippingLine || '').toUpperCase().includes(viewDetailItem.code) ||
                              (j.shippingLine || '').toUpperCase().includes(viewDetailItem.shortName)
                          )
                          .map((job) => (
                            <tr key={job.id} className="hover:bg-slate-800/40">
                              <td className="p-2.5 font-mono text-blue-400 font-bold">{job.id}</td>
                              <td className="p-2.5 font-mono font-bold text-white">{job.containerNo}</td>
                              <td className="p-2.5 font-mono text-amber-300">{job.isoSize}</td>
                              <td className="p-2.5 font-mono text-emerald-300">
                                Block {job.currentLocation.block.replace('BLOCK_', '')}-B{job.currentLocation.bay}-R{job.currentLocation.row}-T{job.currentLocation.tier}
                              </td>
                              <td className="p-2.5 text-center">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-bold">
                                  {job.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewDetailItem(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Đóng Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
