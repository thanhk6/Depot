import React, { useState } from 'react';
import { ShippingLineModule } from './ShippingLineModule';
import { ContainerCategoryModule } from './ContainerCategoryModule';
import { ContainerQualityGradeModule } from './ContainerQualityGradeModule';
import {
  Users,
  Building2,
  Truck,
  Ship,
  Phone,
  Mail,
  MapPin,
  Search,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  UserCheck,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  Boxes,
  Award
} from 'lucide-react';

export const MasterDataModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'quality_grades' | 'shipping' | 'customers' | 'transports' | 'drivers'>('quality_grades');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable lists for full CRUD
  const [customers, setCustomers] = useState([
    { taxCode: '0312345678', name: 'Công ty TNHH Logistics Toàn Cầu', phone: '0903123456', email: 'logistics@toancau.vn', address: 'Tòa nhà Pearl Plaza, Bình Thạnh, TP.HCM' },
    { taxCode: '0309876543', name: 'Tập đoàn Xuất Nhập Khẩu Thái Bình Dương', phone: '0918765432', email: 'contact@thaibinhduong.com', address: 'KCN Cát Lái, Thủ Đức, TP.HCM' },
    { taxCode: '0315556667', name: 'Công ty Cổ Phần Vận Tải Biển Tân Cảng', phone: '0988112233', email: 'tancang@shipping.vn', address: 'Tân Cảng Cát Lái, Quận 2, TP.HCM' }
  ]);

  const [transports, setTransports] = useState([
    { id: 'TRP-01', name: 'Công ty Vận Tải Container Đại Nam', phone: '0909112233', truckCount: 18, driversCount: 22 },
    { id: 'TRP-02', name: 'Đội Xe Đầu Kéo Trường Thành', phone: '0912334455', truckCount: 12, driversCount: 15 },
    { id: 'TRP-03', name: 'Công ty Cổ Phần Vận Tải Hoàng Long', phone: '0987665544', truckCount: 25, driversCount: 30 }
  ]);

  const [drivers, setDrivers] = useState([
    { id: 'DRV-01', name: 'Nguyễn Văn Minh', phone: '0903112233', license: 'Bằng FC - 79A12345', truckPlate: '51C-889.12', trailerPlate: '51R-099.45', transport: 'Công ty Vận Tải Container Đại Nam' },
    { id: 'DRV-02', name: 'Lê Hoàng Anh', phone: '0918223344', license: 'Bằng FC - 60B98765', truckPlate: '60C-771.89', trailerPlate: '60R-012.34', transport: 'Đội Xe Đầu Kéo Trường Thành' },
    { id: 'DRV-03', name: 'Phạm Quốc Tuấn', phone: '0988334455', license: 'Bằng FC - 51C55443', truckPlate: '51D-332.11', trailerPlate: '51R-881.90', transport: 'Công ty Cổ Phần Vận Tải Hoàng Long' }
  ]);

  // Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [editingCustomerTax, setEditingCustomerTax] = useState<string | null>(null);
  const [customerForm, setCustomerForm] = useState({ taxCode: '', name: '', phone: '', email: '', address: '' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.taxCode || !customerForm.name) {
      alert('Vui lòng nhập Mã số thuế và Tên doanh nghiệp!');
      return;
    }

    if (editingCustomerTax) {
      setCustomers((prev) =>
        prev.map((c) => (c.taxCode === editingCustomerTax ? customerForm : c))
      );
      showToast(`Đã cập nhật thông tin khách hàng ${customerForm.name}`);
    } else {
      setCustomers((prev) => [customerForm, ...prev]);
      showToast(`Đã thêm mới khách hàng ${customerForm.name}`);
    }
    setShowAddCustomerModal(false);
    setEditingCustomerTax(null);
  };

  const handleDeleteCustomer = (taxCode: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      setCustomers((prev) => prev.filter((c) => c.taxCode !== taxCode));
      showToast('Đã xóa dữ liệu khách hàng');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar for Master Data Sub-tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'quality_grades', label: 'Phân Loại Chất Lượng (Quality Grades)', icon: <Award className="w-4 h-4 text-indigo-400" /> },
            { id: 'categories', label: 'Phân Loại Container (ISO Types)', icon: <Boxes className="w-4 h-4" /> },
            { id: 'shipping', label: 'Quản Lý Hãng Tàu (Shipping Lines)', icon: <Ship className="w-4 h-4" /> },
            { id: 'customers', label: 'Khách Hàng (Customers)', icon: <Building2 className="w-4 h-4" /> },
            { id: 'transports', label: 'Công Ty Vận Tải (Transports)', icon: <Truck className="w-4 h-4" /> },
            { id: 'drivers', label: 'Tài Xế & Đầu Kéo (Drivers)', icon: <UserCheck className="w-4 h-4" /> }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'quality_grades' && <ContainerQualityGradeModule />}
      {activeTab === 'categories' && <ContainerCategoryModule />}
      {activeTab === 'shipping' && <ShippingLineModule />}

      {activeTab !== 'quality_grades' && activeTab !== 'categories' && activeTab !== 'shipping' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-3">
            <h3 className="font-bold text-white text-sm">
              {activeTab === 'customers' && 'Danh Sách Khách Hàng / Chủ Hàng'}
              {activeTab === 'transports' && 'Danh Sách Công Ty Vận Tải Container'}
              {activeTab === 'drivers' && 'Danh Sách Tài Xế & Phương Tiện Xe Đầu Kéo'}
            </h3>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đối tác..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {activeTab === 'customers' && (
                <button
                  onClick={() => {
                    setEditingCustomerTax(null);
                    setCustomerForm({ taxCode: '', name: '', phone: '', email: '', address: '' });
                    setShowAddCustomerModal(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Khách Hàng</span>
                </button>
              )}
            </div>
          </div>

          {activeTab === 'customers' && (
            <div className="overflow-x-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="py-3 px-4 font-bold">Mã Số Thuế</th>
                    <th className="py-3 px-4 font-bold">Tên Doanh Nghiệp Khách Hàng</th>
                    <th className="py-3 px-3 font-bold">Số Điện Thoại</th>
                    <th className="py-3 px-4 font-bold">Email</th>
                    <th className="py-3 px-4 font-bold">Địa Chỉ Đăng Ký Kinh Doanh</th>
                    <th className="py-3 px-4 font-bold text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {customers
                    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.taxCode.includes(searchQuery))
                    .map((c) => (
                      <tr key={c.taxCode} className="hover:bg-slate-800/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">{c.taxCode}</td>
                        <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                        <td className="py-3 px-3 text-slate-300">{c.phone}</td>
                        <td className="py-3 px-4 text-slate-300 font-mono">{c.email}</td>
                        <td className="py-3 px-4 text-slate-400">{c.address}</td>
                        <td className="py-3 px-4 text-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingCustomerTax(c.taxCode);
                              setCustomerForm(c);
                              setShowAddCustomerModal(true);
                            }}
                            className="p-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 rounded border border-amber-800 transition"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c.taxCode)}
                            className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded border border-rose-800 transition"
                            title="Xóa khách hàng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'transports' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {transports.map((t) => (
                <div key={t.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-amber-300 font-bold">{t.id}</span>
                    <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-800">
                      Đối tác vận tải
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{t.name}</h4>
                  <p className="text-xs text-slate-400">ĐT: {t.phone}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                    <span>Số xe đầu kéo: <strong className="text-white">{t.truckCount} xe</strong></span>
                    <span>Tài xế: <strong className="text-white">{t.driversCount} người</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="overflow-x-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="py-3 px-4 font-bold">Họ Và Tên Tài Xế</th>
                    <th className="py-3 px-3 font-bold">Số Điện Thoại</th>
                    <th className="py-3 px-4 font-bold">Hạng Bằng Lái</th>
                    <th className="py-3 px-3 font-bold">Biển Số Đầu Kéo</th>
                    <th className="py-3 px-3 font-bold">Biển Số Rơ Moóc</th>
                    <th className="py-3 px-4 font-bold">Đơn Vị Vận Tải</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {drivers.map((d) => (
                    <tr key={d.phone} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-bold text-white">{d.name}</td>
                      <td className="py-3 px-3 text-slate-300">{d.phone}</td>
                      <td className="py-3 px-4 text-purple-300 font-semibold">{d.license}</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-300">{d.truckPlate}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-300">{d.trailerPlate}</td>
                      <td className="py-3 px-4 text-slate-300">{d.transport}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>{editingCustomerTax ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng / Chủ Hàng Mới'}</span>
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Mã Số Thuế Doanh Nghiệp</label>
                <input
                  type="text"
                  required
                  disabled={!!editingCustomerTax}
                  placeholder="VD: 0312345678"
                  value={customerForm.taxCode}
                  onChange={(e) => setCustomerForm({ ...customerForm, taxCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Doanh Nghiệp Khách Hàng</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Công ty TNHH Logistics Vận Tải..."
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Số Điện Thoại Liên Hệ</label>
                  <input
                    type="text"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Nhận Hóa Đơn</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Địa Chỉ Đăng Ký Kinh Doanh</label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Lưu Dữ Liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
