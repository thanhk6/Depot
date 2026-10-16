import React, { useState } from 'react';
import {
  Truck,
  Search,
  Plus,
  Edit2,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  QrCode,
  CheckCircle2,
  X,
  Phone,
  CreditCard,
  Calendar,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { DriverRecord, CustomerCompany, CustomerUser } from '../types/customerPortal';
import { generateTempPassword } from '../utils/tempPassword';

interface CustomerDriverManagementViewProps {
  currentCustomer: CustomerCompany;
  drivers: DriverRecord[];
  onAddDriver: (driver: DriverRecord, userAccount?: CustomerUser) => void;
  onUpdateDriver: (driver: DriverRecord) => void;
}

export const CustomerDriverManagementView: React.FC<CustomerDriverManagementViewProps> = ({
  currentCustomer,
  drivers,
  onAddDriver,
  onUpdateDriver
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedDriverForView, setSelectedDriverForView] = useState<DriverRecord | null>(null);

  // Form State for creating Driver
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [citizenId, setCitizenId] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [licenseGrade, setLicenseGrade] = useState<'FC' | 'C' | 'E'>('FC');
  const [licenseIssueDate, setLicenseIssueDate] = useState<string>('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [assignedVehiclePlate, setAssignedVehiclePlate] = useState<string>('');
  const [assignedMoocPlate, setAssignedMoocPlate] = useState<string>('');

  // Checkbox: Create User Account as well
  const [createAccount, setCreateAccount] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>(() => generateTempPassword());
  const [confirmPassword, setConfirmPassword] = useState<string>(password);

  const customerDrivers = drivers.filter((d) => d.customerId === currentCustomer.id);

  const filteredDrivers = customerDrivers.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.driverCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      d.licenseNumber.includes(searchTerm) ||
      (d.username && d.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateDriver = () => {
    if (!fullName || !phone || !licenseNumber) {
      alert('Vui lòng nhập Họ tên, Số điện thoại và Số GPLX!');
      return;
    }

    if (createAccount) {
      if (!username) {
        alert('Vui lòng nhập tên đăng nhập cho tài xế!');
        return;
      }
      if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
      }
    }

    const driverId = `DRV-${Date.now()}`;
    const driverCode = `DRV-TC-${Math.floor(100 + Math.random() * 900)}`;

    const newDriver: DriverRecord = {
      id: driverId,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      driverCode,
      fullName,
      phone,
      email: email || undefined,
      dateOfBirth,
      citizenId,
      licenseNumber,
      licenseGrade,
      licenseIssueDate,
      licenseExpiryDate,
      address,
      assignedVehiclePlate: assignedVehiclePlate.toUpperCase(),
      assignedMoocPlate: assignedMoocPlate.toUpperCase(),
      status: 'ACTIVE',
      hasUserAccount: createAccount,
      username: createAccount ? username : undefined,
      password: createAccount ? password : undefined,
      allowOnlineGateIn: true,
      createdAt: '2026-08-16'
    };

    let newUserAccount: CustomerUser | undefined = undefined;
    if (createAccount) {
      newUserAccount = {
        id: `USR-${Date.now()}`,
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        username,
        password,
        fullName,
        email: email || `${username}@driver.vn`,
        phone,
        role: 'DRIVER',
        driverId,
        status: 'ACTIVE',
        createdAt: '2026-08-16'
      };
    }

    onAddDriver(newDriver, newUserAccount);
    setIsAddModalOpen(false);

    // Reset fields
    setFullName('');
    setPhone('');
    setUsername('');
  };

  const toggleDriverLock = (d: DriverRecord) => {
    const nextStatus = d.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    onUpdateDriver({ ...d, status: nextStatus });
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>QUẢN LÝ TÀI XẾ DOANH NGHIỆP (DRIVER MANAGEMENT)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Doanh nghiệp: <strong className="text-slate-900">{currentCustomer.name}</strong> • Quản lý hồ sơ lái xe và cấp quyền Gate-In Online
          </p>
        </div>

        <button
          onClick={() => {
            const randomUser = 'tx_' + Math.floor(1000 + Math.random() * 9000);
            setUsername(randomUser);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Tài Xế Mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Tìm theo tên tài xế, mã tài xế, SĐT, số GPLX, username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Driver Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Mã Tài Xế</th>
                <th className="px-4 py-3.5">Họ Tên</th>
                <th className="px-4 py-3.5">Điện Thoại</th>
                <th className="px-4 py-3.5">Số GPLX</th>
                <th className="px-4 py-3.5">Loại GPLX</th>
                <th className="px-4 py-3.5">Tài Khoản App</th>
                <th className="px-4 py-3.5">Xe Gán</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-medium">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    Không tìm thấy tài xế nào
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-100 transition">
                    <td className="px-4 py-3 font-mono font-bold text-pink-600">{d.driverCode}</td>
                    
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{d.fullName}</div>
                      <div className="text-[10px] text-slate-500">CCCD: {d.citizenId}</div>
                    </td>

                    <td className="px-4 py-3 font-mono text-emerald-600 font-bold">{d.phone}</td>

                    <td className="px-4 py-3 font-mono text-slate-700">{d.licenseNumber}</td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold rounded">
                        Hạng {d.licenseGrade}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {d.hasUserAccount ? (
                        <div>
                          <span className="text-emerald-600 font-bold font-mono text-xs">{d.username}</span>
                          <span className="text-[10px] text-slate-500 block">Gate-In: Bật</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-mono">Chưa cấp</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono text-amber-700 font-bold">{d.assignedVehiclePlate}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          d.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDriverForView(d)}
                          title="Xem Chi Tiết Tài Xế"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => alert(`Đã gửi mật khẩu mới về SĐT ${d.phone}`)}
                          title="Reset Mật Khẩu"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-amber-700 rounded-lg transition cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => toggleDriverLock(d)}
                          title="Khóa/Mở Khóa"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                        >
                          {d.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver View Modal */}
      {selectedDriverForView && (
        <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Hồ Sơ Tài Xế: {selectedDriverForView.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedDriverForView(null)}
                className="p-1 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã Tài Xế:</span>
                <span className="font-mono font-bold text-pink-600">{selectedDriverForView.driverCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số Điện Thoại:</span>
                <span className="font-mono font-bold text-emerald-600">{selectedDriverForView.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số GPLX:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedDriverForView.licenseNumber} (Hạng {selectedDriverForView.licenseGrade})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hạn GPLX:</span>
                <span className="font-mono text-slate-700">{selectedDriverForView.licenseExpiryDate || '2030-01-01'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Xe Đầu Kéo Phụ Trách:</span>
                <span className="font-mono font-bold text-amber-700">{selectedDriverForView.assignedVehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tài Khoản App Gate-In:</span>
                <span className="font-mono font-bold text-pink-700">{selectedDriverForView.username || 'Chưa cấp'}</span>
              </div>
              {selectedDriverForView.notes && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  Ghi chú: <span className="text-slate-700">{selectedDriverForView.notes}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDriverForView(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full my-auto p-6 space-y-4 shadow-2xl animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <span>Thêm Tài Xế &amp; Cấp Tài Khoản Gate-In</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Đăng ký tài xế cho: <strong className="text-slate-900">{currentCustomer.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Personal info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Họ và Tên Tài Xế (*):</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Số Điện Thoại (*):</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0903.xxx.xxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-emerald-600 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Ngày Sinh:</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Số CCCD / CMND:</label>
                  <input
                    type="text"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Số GPLX (*):</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="790xxxxxxxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Hạng GPLX:</label>
                  <select
                    value={licenseGrade}
                    onChange={(e) => setLicenseGrade(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="FC">Hạng FC (Xe Đầu Kéo Container)</option>
                    <option value="C">Hạng C (Xe Tải Nặng &gt; 3.5 Tấn)</option>
                    <option value="E">Hạng E (Xe Chuyên Dụng)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Xe Đầu Kéo Mặc Định:</label>
                  <input
                    type="text"
                    value={assignedVehiclePlate}
                    onChange={(e) => setAssignedVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="51C-xxx.xx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-amber-700 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Địa Chỉ Thường Trú:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Checkbox "Đồng thời tạo tài khoản đăng nhập" */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
                  />
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Đồng thời tạo tài khoản đăng nhập App Gate-In</span>
                  </span>
                </label>

                {createAccount && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="text-slate-500 text-[11px] font-bold block mb-1">Username:</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="tx_nguyenvana"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 text-[11px] font-bold block mb-1">Password:</label>
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 text-[11px] font-bold block mb-1">Xác Nhận Password:</label>
                      <input
                        type="text"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3 text-[11px] text-emerald-600 font-mono">
                      * Role mặc định được gán: <strong>Driver (Tài xế Gate-In Online)</strong>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateDriver}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg"
              >
                Lưu Hồ Sơ Tài Xế
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
