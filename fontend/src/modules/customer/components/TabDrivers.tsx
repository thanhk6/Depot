import React, { useState, useMemo } from 'react';
import {
  CustomerCompany,
  DriverRecord,
  CustomerUser,
  LicenseGrade,
  DriverStatus
} from '../types/customerTypes';
import {
  UserCheck,
  Search,
  Plus,
  Edit,
  Lock,
  Unlock,
  Eye,
  CreditCard,
  Phone,
  Truck,
  Calendar,
  AlertCircle,
  X,
  Link2,
  Unlink,
  CheckCircle2
} from 'lucide-react';

interface TabDriversProps {
  customer: CustomerCompany;
  drivers: DriverRecord[];
  users: CustomerUser[];
  onAddDriver: (newDriver: Omit<DriverRecord, 'id' | 'createdAt'>) => void;
  onUpdateDriver: (driverId: string, updatedData: Partial<DriverRecord>) => void;
  onToggleDriverStatus: (driverId: string) => void;
}

export const TabDrivers: React.FC<TabDriversProps> = ({
  customer,
  drivers,
  users,
  onAddDriver,
  onUpdateDriver,
  onToggleDriverStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverRecord | null>(null);
  const [viewingDriver, setViewingDriver] = useState<DriverRecord | null>(null);

  // Form states
  const [formDriverCode, setFormDriverCode] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCitizenId, setFormCitizenId] = useState('');
  const [formLicenseNumber, setFormLicenseNumber] = useState('');
  const [formLicenseGrade, setFormLicenseGrade] = useState<LicenseGrade>('FC');
  const [formLicenseExpiryDate, setFormLicenseExpiryDate] = useState('2029-12-31');
  const [formAddress, setFormAddress] = useState('');
  const [formLinkedUserId, setFormLinkedUserId] = useState<string>('');
  const [formAssignedVehiclePlate, setFormAssignedVehiclePlate] = useState('');
  const [formAssignedMoocPlate, setFormAssignedMoocPlate] = useState('');

  // Customer specific datasets
  const customerDrivers = useMemo(() => {
    return drivers.filter((d) => d.customerId === customer.id);
  }, [drivers, customer.id]);

  const customerUsers = useMemo(() => {
    return users.filter((u) => u.customerId === customer.id);
  }, [users, customer.id]);

  const filteredDrivers = useMemo(() => {
    return customerDrivers.filter((d) => {
      const matchSearch =
        d.driverCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.includes(searchTerm) ||
        d.licenseNumber.includes(searchTerm) ||
        (d.linkedUsername && d.linkedUsername.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchGrade = gradeFilter === 'ALL' || d.licenseGrade === gradeFilter;

      return matchSearch && matchGrade;
    });
  }, [customerDrivers, searchTerm, gradeFilter]);

  const handleOpenAdd = () => {
    const nextNum = customerDrivers.length + 1;
    setFormDriverCode(`DRV-${String(nextNum).padStart(3, '0')}`);
    setFormFullName('');
    setFormPhone('');
    setFormEmail('');
    setFormCitizenId('');
    setFormLicenseNumber('');
    setFormLicenseGrade('FC');
    setFormLicenseExpiryDate('2029-12-31');
    setFormAddress('');
    setFormLinkedUserId('');
    setFormAssignedVehiclePlate('');
    setFormAssignedMoocPlate('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (d: DriverRecord) => {
    setEditingDriver(d);
    setFormDriverCode(d.driverCode);
    setFormFullName(d.fullName);
    setFormPhone(d.phone);
    setFormEmail(d.email || '');
    setFormCitizenId(d.citizenId);
    setFormLicenseNumber(d.licenseNumber);
    setFormLicenseGrade(d.licenseGrade);
    setFormLicenseExpiryDate(d.licenseExpiryDate);
    setFormAddress(d.address || '');
    setFormLinkedUserId(d.linkedUserId || '');
    setFormAssignedVehiclePlate(d.assignedVehiclePlate || '');
    setFormAssignedMoocPlate(d.assignedMoocPlate || '');
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formLicenseNumber.trim()) return;

    const linkedUserObj = customerUsers.find((u) => u.id === formLinkedUserId);

    if (editingDriver) {
      onUpdateDriver(editingDriver.id, {
        driverCode: formDriverCode.trim(),
        fullName: formFullName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        citizenId: formCitizenId.trim(),
        licenseNumber: formLicenseNumber.trim(),
        licenseGrade: formLicenseGrade,
        licenseExpiryDate: formLicenseExpiryDate,
        address: formAddress.trim(),
        linkedUserId: formLinkedUserId || undefined,
        linkedUsername: linkedUserObj ? linkedUserObj.username : undefined,
        assignedVehiclePlate: formAssignedVehiclePlate.trim() || undefined,
        assignedMoocPlate: formAssignedMoocPlate.trim() || undefined
      });
      setEditingDriver(null);
    } else {
      onAddDriver({
        customerId: customer.id,
        customerCode: customer.code,
        customerName: customer.shortName,
        driverCode: formDriverCode.trim() || `DRV-${Date.now().toString().slice(-3)}`,
        fullName: formFullName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        citizenId: formCitizenId.trim(),
        licenseNumber: formLicenseNumber.trim(),
        licenseGrade: formLicenseGrade,
        licenseExpiryDate: formLicenseExpiryDate,
        address: formAddress.trim(),
        linkedUserId: formLinkedUserId || undefined,
        linkedUsername: linkedUserObj ? linkedUserObj.username : undefined,
        assignedVehiclePlate: formAssignedVehiclePlate.trim() || undefined,
        assignedMoocPlate: formAssignedMoocPlate.trim() || undefined,
        status: 'ACTIVE'
      });
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã TX, họ tên, GPLX, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Hạng GPLX:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Tất cả hạng GPLX</option>
              <option value="FC">Hạng FC (Xe đầu kéo cont)</option>
              <option value="C">Hạng C (Xe tải trên 3.5T)</option>
              <option value="E">Hạng E (Xe tải rơ-moóc)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/20 cursor-pointer self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Tài Xế</span>
        </button>
      </div>

      {/* DataGrid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Mã Tài Xế</th>
                <th className="py-3.5 px-4 min-w-[160px]">Họ và Tên</th>
                <th className="py-3.5 px-4">Số Điện Thoại</th>
                <th className="py-3.5 px-4">Số GPLX</th>
                <th className="py-3.5 px-4 text-center">Hạng GPLX</th>
                <th className="py-3.5 px-4">Ngày Hết Hạn GPLX</th>
                <th className="py-3.5 px-4">Tài Khoản Liên Kết</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition">
                    {/* Driver Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-400 whitespace-nowrap">
                      {d.driverCode}
                    </td>

                    {/* Họ tên */}
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      <div>{d.fullName}</div>
                      {d.assignedVehiclePlate && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Truck className="w-3 h-3 text-slate-500" />
                          <span>Gán xe: {d.assignedVehiclePlate}</span>
                        </div>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-mono text-slate-200 whitespace-nowrap">
                      {d.phone}
                    </td>

                    {/* Số GPLX */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {d.licenseNumber}
                    </td>

                    {/* Hạng GPLX */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {d.licenseGrade}
                      </span>
                    </td>

                    {/* Ngày hết hạn */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                      {d.licenseExpiryDate}
                    </td>

                    {/* Tài khoản liên kết */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {d.linkedUsername ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono">
                          <Link2 className="w-3 h-3" />
                          <span>{d.linkedUsername}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Chưa liên kết</span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {d.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Tạm khóa
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingDriver(d)}
                          className="p-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition border border-blue-500/20 cursor-pointer"
                          title="Xem chi tiết hồ sơ tài xế"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700 cursor-pointer"
                          title="Chỉnh sửa tài xế"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleDriverStatus(d.id)}
                          className={`p-1.5 rounded-lg transition border cursor-pointer ${
                            d.status === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/20'
                          }`}
                          title={d.status === 'ACTIVE' ? 'Khóa tài xế' : 'Mở khóa tài xế'}
                        >
                          {d.status === 'ACTIVE' ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Không có tài xế nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Tài Xế */}
      {(isAddModalOpen || editingDriver) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingDriver ? 'Cập Nhật Hồ Sơ Tài Xế' : 'Thêm Hồ Sơ Tài Xế Mới'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Khách hàng: {customer.shortName} ({customer.code})
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingDriver(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="p-6 space-y-4 text-xs overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Mã Tài Xế <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formDriverCode}
                    onChange={(e) => setFormDriverCode(e.target.value)}
                    placeholder="VD: DRV-001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Họ và Tên Tài Xế <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Hùng"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Số Điện Thoại <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="VD: 0912.345.678"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Số Căn Cước (CCCD)</label>
                  <input
                    type="text"
                    value={formCitizenId}
                    onChange={(e) => setFormCitizenId(e.target.value)}
                    placeholder="VD: 079088012345"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Số GPLX (Giấy phép lái xe) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formLicenseNumber}
                    onChange={(e) => setFormLicenseNumber(e.target.value)}
                    placeholder="VD: 790150998877"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Hạng Giấy Phép Lái Xe <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formLicenseGrade}
                    onChange={(e) => setFormLicenseGrade(e.target.value as LicenseGrade)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="FC">Hạng FC (Đầu kéo Container / Rơ-moóc)</option>
                    <option value="C">Hạng C (Xe tải từ 3.5 tấn trở lên)</option>
                    <option value="E">Hạng E (Xe tải kéo rơ-moóc lớn)</option>
                    <option value="D">Hạng D (Xe tải / chở người)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Ngày Hết Hạn GPLX</label>
                  <input
                    type="date"
                    value={formLicenseExpiryDate}
                    onChange={(e) => setFormLicenseExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Liên Kết Tài Khoản Portal (User Account)
                  </label>
                  <select
                    value={formLinkedUserId}
                    onChange={(e) => setFormLinkedUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Chưa liên kết tài khoản --</option>
                    {customerUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.fullName} - {u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Biển Số Xe Đầu Kéo Gán Sẵn</label>
                  <input
                    type="text"
                    value={formAssignedVehiclePlate}
                    onChange={(e) => setFormAssignedVehiclePlate(e.target.value)}
                    placeholder="VD: 51C-889.92"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Biển Số Rơ-Moóc Gán Sẵn</label>
                  <input
                    type="text"
                    value={formAssignedMoocPlate}
                    onChange={(e) => setFormAssignedMoocPlate(e.target.value)}
                    placeholder="VD: 51R-123.45"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingDriver(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition shadow-lg shadow-purple-600/20 cursor-pointer"
                >
                  {editingDriver ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm Tài Xế'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal / Drawer Chi Tiết Tài Xế */}
      {viewingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Hồ Sơ Chi Tiết Tài Xế</span>
              </h3>
              <button onClick={() => setViewingDriver(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Mã tài xế:</span>
                <span className="font-mono font-bold text-purple-400">{viewingDriver.driverCode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Họ và tên:</span>
                <span className="font-bold text-white">{viewingDriver.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Số điện thoại:</span>
                <span className="font-mono font-bold text-slate-200">{viewingDriver.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Số CCCD:</span>
                <span className="font-mono text-slate-200">{viewingDriver.citizenId || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Số GPLX:</span>
                <span className="font-mono font-bold text-slate-100">{viewingDriver.licenseNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Hạng GPLX:</span>
                <span className="font-mono font-bold text-amber-400">{viewingDriver.licenseGrade}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Hạn sử dụng GPLX:</span>
                <span className="font-mono text-slate-300">{viewingDriver.licenseExpiryDate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tài khoản User liên kết:</span>
                {viewingDriver.linkedUsername ? (
                  <span className="font-mono text-blue-400 font-bold">{viewingDriver.linkedUsername}</span>
                ) : (
                  <span className="text-slate-500 italic">Chưa liên kết</span>
                )}
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Xe gán mặc định:</span>
                <span className="font-mono text-slate-200">
                  {viewingDriver.assignedVehiclePlate || 'Chưa gán'}
                  {viewingDriver.assignedMoocPlate ? ` / Moóc: ${viewingDriver.assignedMoocPlate}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trạng thái:</span>
                <span className={viewingDriver.status === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {viewingDriver.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingDriver(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
