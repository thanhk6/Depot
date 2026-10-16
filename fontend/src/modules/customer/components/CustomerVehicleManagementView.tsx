import React, { useState } from 'react';
import {
  Car,
  Search,
  Plus,
  Truck,
  ShieldCheck,
  Calendar,
  Eye,
  CheckCircle2,
  X,
  Radio
} from 'lucide-react';
import { VehicleRecord, CustomerCompany, DriverRecord } from '../types/customerPortal';

interface CustomerVehicleManagementViewProps {
  currentCustomer: CustomerCompany;
  vehicles: VehicleRecord[];
  drivers: DriverRecord[];
  onAddVehicle: (vehicle: VehicleRecord) => void;
}

export const CustomerVehicleManagementView: React.FC<CustomerVehicleManagementViewProps> = ({
  currentCustomer,
  vehicles,
  drivers,
  onAddVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<'TRACTOR' | 'CHASSIS_MOOC' | 'TRUCK'>('TRACTOR');
  const [brand, setBrand] = useState<string>('Freightliner Cascadia');
  const [modelYear, setModelYear] = useState<number>(2023);
  const [payloadCapacity, setPayloadCapacity] = useState<string>('40 Tấn');
  const [assignedDriverId, setAssignedDriverId] = useState<string>('');
  const [inspectionExpiry, setInspectionExpiry] = useState<string>('2027-08-20');

  const customerVehicles = vehicles.filter((v) => v.customerId === currentCustomer.id);
  const customerDrivers = drivers.filter((d) => d.customerId === currentCustomer.id);

  const filteredVehicles = customerVehicles.filter(
    (v) =>
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = () => {
    if (!licensePlate) {
      alert('Vui lòng nhập biển số xe!');
      return;
    }
    const driver = customerDrivers.find((d) => d.id === assignedDriverId);
    const newVeh: VehicleRecord = {
      id: `VEH-${Date.now()}`,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      licensePlate: licensePlate.toUpperCase(),
      vehicleType,
      brand,
      modelYear,
      payloadCapacity,
      assignedDriverId: driver?.id,
      assignedDriverName: driver?.fullName,
      inspectionExpiry,
      gpsStatus: 'ONLINE',
      status: 'ACTIVE',
      createdAt: '2026-08-16'
    };
    onAddVehicle(newVeh);
    setIsAddModalOpen(false);
    setLicensePlate('');
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-600" />
            <span>QUẢN LÝ ĐỘI XE &amp; RƠ-MOÓC (VEHICLE FLEET)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Doanh nghiệp: <strong className="text-slate-900">{currentCustomer.name}</strong> • Giám sát biển số xe đầu kéo và đăng kiểm
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Phương Tiện Mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Tìm theo biển số xe, nhãn hiệu, tài xế phụ trách..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Biển Số Xe</th>
                <th className="px-4 py-3.5">Loại Phương Tiện</th>
                <th className="px-4 py-3.5">Nhãn Hiệu / Đời Xe</th>
                <th className="px-4 py-3.5">Tải Trọng Cho Phép</th>
                <th className="px-4 py-3.5">Tài Xế Phụ Trách</th>
                <th className="px-4 py-3.5">Hạn Đăng Kiểm</th>
                <th className="px-4 py-3.5">GPS Giám Sát</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-medium">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-100 transition">
                  <td className="px-4 py-3 font-mono font-bold text-amber-700 text-sm">{v.licensePlate}</td>
                  
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-bold">
                      {v.vehicleType === 'TRACTOR'
                        ? 'Đầu Kéo Container'
                        : v.vehicleType === 'CHASSIS_MOOC'
                        ? 'Rơ-Moóc (Chassis)'
                        : 'Xe Tải Thùng'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {v.brand} ({v.modelYear})
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-700">{v.payloadCapacity}</td>

                  <td className="px-4 py-3 font-bold text-slate-900">
                    {v.assignedDriverName || <span className="text-slate-500 font-normal">Chưa phân công</span>}
                  </td>

                  <td className="px-4 py-3 font-mono text-emerald-600">{v.inspectionExpiry}</td>

                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>{v.gpsStatus}</span>
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-emerald-600 font-mono font-bold text-[10px]">{v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-cyan-600" />
                <span>Thêm Phương Tiện Vào Đội Xe</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 font-bold block mb-1">Biển Số Xe (*):</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="VD: 51C-123.45"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-amber-700 font-mono font-bold uppercase focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Loại Phương Tiện:</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-cyan-500 focus:outline-none"
                >
                  <option value="TRACTOR">Đầu Kéo Container (Tractor)</option>
                  <option value="CHASSIS_MOOC">Rơ-Moóc 3 Trục (Chassis)</option>
                  <option value="TRUCK">Xe Tải Chuyên Dụng (Truck)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Nhãn Hiệu:</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Tải Trọng:</label>
                  <input
                    type="text"
                    value={payloadCapacity}
                    onChange={(e) => setPayloadCapacity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Tài Xế Phụ Trách:</label>
                <select
                  value={assignedDriverId}
                  onChange={(e) => setAssignedDriverId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">-- Chưa gán tài xế --</option>
                  {customerDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Hạn Đăng Kiểm:</label>
                <input
                  type="date"
                  value={inspectionExpiry}
                  onChange={(e) => setInspectionExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-cyan-500 focus:outline-none"
                />
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
                onClick={handleSave}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl"
              >
                Lưu Phương Tiện
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
