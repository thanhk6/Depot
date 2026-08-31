import React, { useState } from 'react';
import { Supplier } from '../types';
import { Truck, Search, Phone, Mail, MapPin, Building, CheckCircle2 } from 'lucide-react';

interface SuppliersTabProps {
  suppliers: Supplier[];
}

export const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = suppliers.filter(
    (s) =>
      s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.supplierCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-400" />
          <span>Danh Bạ Nhà Cung Cấp Vật Tư Sửa Chữa Depot EMR</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Các đơn vị cung cấp chính hãng thép Corten, ván sàn Apitong, gioăng EPDM và sơn công nghiệp hàng hải
        </p>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo Tên NCC (CIMCO, Jotun, Hòa Phát...), Mã NCC hoặc Người liên hệ..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="p-5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition shadow-lg space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg font-mono font-bold text-xs">
                  {s.supplierCode}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đối tác tin cậy
                </span>
              </div>
              <h3 className="font-bold text-white text-base leading-snug">{s.supplierName}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Liên hệ: <strong className="text-white">{s.contactPerson}</strong></span>
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-mono text-slate-200">{s.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-slate-300">{s.email}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-tight">{s.address}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
