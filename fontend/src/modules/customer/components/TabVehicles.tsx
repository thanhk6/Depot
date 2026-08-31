import React, { useState, useMemo } from 'react';
import {
  CustomerCompany,
  VehicleRecord,
  DriverRecord,
  VehicleType,
  VehicleStatus
} from '../types/customerTypes';
import {
  Truck,
  Search,
  Plus,
  Edit,
  Lock,
  Unlock,
  Eye,
  Calendar,
  AlertCircle,
  X,
  Wrench,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface TabVehiclesProps {
  customer: CustomerCompany;
  vehicles: VehicleRecord[];
  drivers: DriverRecord[];
  onAddVehicle: (newVehicle: Omit<VehicleRecord, 'id' | 'createdAt'>) => void;
  onUpdateVehicle: (vehicleId: string, updatedData: Partial<VehicleRecord>) => void;
  onToggleVehicleStatus: (vehicleId: string) => void;
}

export const TabVehicles: React.FC<TabVehiclesProps> = ({
  customer,
  vehicles,
  drivers,
  onAddVehicle,
  onUpdateVehicle,
  onToggleVehicleStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleRecord | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<VehicleRecord | null>(null);

  // Form states
  const [formPlateNumber, setFormPlateNumber] = useState('');
  const [formVehicleType, setFormVehicleType] = useState<VehicleType>('TRACTOR');
  const [formBrand, setFormBrand] = useState('');
  const [formPayloadTon, setFormPayloadTon] = useState<number>(38.5);
  const [formOwnerName, setFormOwnerName] = useState(customer.name);
  const [formDefaultDriverId, setFormDefaultDriverId] = useState<string>('');
  const [formInspectionExpiry, setFormInspectionExpiry] = useState('2027-12-31');

  // Customer specific datasets
  const customerVehicles = useMemo(() => {
    return vehicles.filter((v) => v.customerId === customer.id);
  }, [vehicles, customer.id]);

  const customerDrivers = useMemo(() => {
    return drivers.filter((d) => d.customerId === customer.id);
  }, [drivers, customer.id]);

  const filteredVehicles = useMemo(() => {
    return customerVehicles.filter((v) => {
      const matchSearch =
        v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.defaultDriverName && v.defaultDriverName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = typeFilter === 'ALL' || v.vehicleType === typeFilter;

      return matchSearch && matchType;
    });
  }, [customerVehicles, searchTerm, typeFilter]);

  const handleOpenAdd = () => {
    setFormPlateNumber('');
    setFormVehicleType('TRACTOR');
    setFormBrand('');
    setFormPayloadTon(38.5);
    setFormOwnerName(customer.name);
    setFormDefaultDriverId('');
    setFormInspectionExpiry('2027-12-31');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v: VehicleRecord) => {
    setEditingVehicle(v);
    setFormPlateNumber(v.plateNumber);
    setFormVehicleType(v.vehicleType);
    setFormBrand(v.brand);
    setFormPayloadTon(v.payloadTon);
    setFormOwnerName(v.ownerName);
    setFormDefaultDriverId(v.defaultDriverId || '');
    setFormInspectionExpiry(v.inspectionExpiry);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlateNumber.trim() || !formBrand.trim()) return;

    const driverObj = customerDrivers.find((d) => d.id === formDefaultDriverId);

    if (editingVehicle) {
      onUpdateVehicle(editingVehicle.id, {
        plateNumber: formPlateNumber.trim().toUpperCase(),
        vehicleType: formVehicleType,
        brand: formBrand.trim(),
        payloadTon: Number(formPayloadTon),
        ownerName: formOwnerName.trim(),
        defaultDriverId: formDefaultDriverId || undefined,
        defaultDriverName: driverObj ? driverObj.fullName : undefined,
        inspectionExpiry: formInspectionExpiry
      });
      setEditingVehicle(null);
    } else {
      onAddVehicle({
        customerId: customer.id,
        customerCode: customer.code,
        customerName: customer.shortName,
        plateNumber: formPlateNumber.trim().toUpperCase(),
        vehicleType: formVehicleType,
        brand: formBrand.trim(),
        payloadTon: Number(formPayloadTon),
        ownerName: formOwnerName.trim() || customer.name,
        defaultDriverId: formDefaultDriverId || undefined,
        defaultDriverName: driverObj ? driverObj.fullName : undefined,
        inspectionExpiry: formInspectionExpiry,
        status: 'ACTIVE'
      });
      setIsAddModalOpen(false);
    }
  };

  const getVehicleTypeLabel = (t: VehicleType) => {
    switch (t) {
      case 'TRACTOR':
        return 'Xe Đầu Kéo';
      case 'TRAILER':
        return 'Rơ-Moóc (Sơ-mi)';
      case 'TRUCK':
        return 'Xe Tải Thùng';
      default:
        return t;
    }
  };

  const getVehicleTypeBadge = (t: VehicleType) => {
    switch (t) {
      case 'TRACTOR':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'TRAILER':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'TRUCK':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
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
              placeholder="Tìm biển số, nhãn hiệu, chủ sở hữu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Loại phương tiện:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Tất cả loại phương tiện</option>
              <option value="TRACTOR">Xe Đầu Kéo (Tractor)</option>
              <option value="TRAILER">Rơ-Moóc (Trailer)</option>
              <option value="TRUCK">Xe Tải (Truck)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/20 cursor-pointer self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Phương Tiện</span>
        </button>
      </div>

      {/* DataGrid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Biển Số Xe</th>
                <th className="py-3.5 px-4">Loại Phương Tiện</th>
                <th className="py-3.5 px-4">Nhãn Hiệu / Tải Trọng</th>
                <th className="py-3.5 px-4 min-w-[180px]">Chủ Sở Hữu</th>
                <th className="py-3.5 px-4">Tài Xế Mặc Định</th>
                <th className="py-3.5 px-4">Hạn Đăng Kiểm</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition">
                    {/* Biển số */}
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {v.plateNumber}
                    </td>

                    {/* Loại xe */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getVehicleTypeBadge(v.vehicleType)}`}>
                        {getVehicleTypeLabel(v.vehicleType)}
                      </span>
                    </td>

                    {/* Nhãn hiệu / Tải trọng */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-white">{v.brand}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Tải trọng: {v.payloadTon} Tấn</div>
                    </td>

                    {/* Chủ sở hữu */}
                    <td className="py-3.5 px-4 text-slate-200">
                      {v.ownerName}
                    </td>

                    {/* Tài xế mặc định */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {v.defaultDriverName ? (
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>{v.defaultDriverName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Chưa gán tài xế</span>
                      )}
                    </td>

                    {/* Hạn đăng kiểm */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                      {v.inspectionExpiry}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {v.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Hoạt động
                        </span>
                      )}
                      {v.status === 'MAINTENANCE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Wrench className="w-3 h-3" />
                          Bảo dưỡng
                        </span>
                      )}
                      {v.status === 'LOCKED' && (
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
                          onClick={() => setViewingVehicle(v)}
                          className="p-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition border border-blue-500/20 cursor-pointer"
                          title="Xem chi tiết phương tiện"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700 cursor-pointer"
                          title="Chỉnh sửa phương tiện"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleVehicleStatus(v.id)}
                          className={`p-1.5 rounded-lg transition border cursor-pointer ${
                            v.status === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/20'
                          }`}
                          title={v.status === 'ACTIVE' ? 'Khóa phương tiện' : 'Mở khóa phương tiện'}
                        >
                          {v.status === 'ACTIVE' ? (
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
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Không có phương tiện nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Phương Tiện */}
      {(isAddModalOpen || editingVehicle) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-600/20 text-amber-400 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingVehicle ? 'Cập Nhật Phương Tiện' : 'Thêm Phương Tiện Vận Tải Mới'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Khách hàng: {customer.shortName} ({customer.code})
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingVehicle(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="p-6 space-y-4 text-xs overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Biển Số Xe <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPlateNumber}
                    onChange={(e) => setFormPlateNumber(e.target.value)}
                    placeholder="VD: 51C-889.92"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Loại Phương Tiện <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formVehicleType}
                    onChange={(e) => setFormVehicleType(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="TRACTOR">Xe Đầu Kéo (Tractor)</option>
                    <option value="TRAILER">Rơ-Moóc (Sơ-mi 40ft/45ft)</option>
                    <option value="TRUCK">Xe Tải Thùng (Truck)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Nhãn Hiệu / Chủng Loại <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="VD: Hyundai Xcient 440PS"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tải Trọng Thiết Kế (Tấn)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formPayloadTon}
                    onChange={(e) => setFormPayloadTon(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Chủ Sở Hữu Phương Tiện</label>
                  <input
                    type="text"
                    value={formOwnerName}
                    onChange={(e) => setFormOwnerName(e.target.value)}
                    placeholder="VD: Tên công ty hoặc chủ sở hữu cá nhân"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tài Xế Mặc Định</label>
                  <select
                    value={formDefaultDriverId}
                    onChange={(e) => setFormDefaultDriverId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Chưa gán tài xế --</option>
                    {customerDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.driverCode} - {d.licenseGrade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Hạn Đăng Kiểm</label>
                  <input
                    type="date"
                    value={formInspectionExpiry}
                    onChange={(e) => setFormInspectionExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingVehicle(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition shadow-lg shadow-amber-600/20 cursor-pointer"
                >
                  {editingVehicle ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm Phương Tiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết Phương Tiện */}
      {viewingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Chi Tiết Phương Tiện Vận Tải</span>
              </h3>
              <button onClick={() => setViewingVehicle(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Biển số xe:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{viewingVehicle.plateNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Loại phương tiện:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getVehicleTypeBadge(viewingVehicle.vehicleType)}`}>
                  {getVehicleTypeLabel(viewingVehicle.vehicleType)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Nhãn hiệu / Model:</span>
                <span className="font-bold text-white">{viewingVehicle.brand}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tải trọng thiết kế:</span>
                <span className="font-mono text-slate-200">{viewingVehicle.payloadTon} Tấn</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Chủ sở hữu:</span>
                <span className="text-slate-200">{viewingVehicle.ownerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tài xế mặc định:</span>
                <span className="font-bold text-white">{viewingVehicle.defaultDriverName || 'Chưa gán'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Hạn đăng kiểm:</span>
                <span className="font-mono text-slate-300">{viewingVehicle.inspectionExpiry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="text-emerald-400 font-bold">
                  {viewingVehicle.status === 'ACTIVE' ? 'Đang hoạt động' : viewingVehicle.status === 'MAINTENANCE' ? 'Đang bảo dưỡng' : 'Tạm khóa'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingVehicle(null)}
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
