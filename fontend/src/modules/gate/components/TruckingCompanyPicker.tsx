import React, { useEffect, useMemo, useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { customerApi } from '../../../api';

// Mã nhà xe vãng lai — khớp DepotJobService.WalkInTruckingCode ở backend (tên lưu riêng ở GateInTruckingName).
export const WALK_IN_TRUCKING_CODE = 'VANG_LAI';

export type TruckingOption = { code: string; name: string };

type PickerMode = 'EXISTING' | 'NEW' | 'WALK_IN';

const MODES: { value: PickerMode; label: string }[] = [
  { value: 'EXISTING', label: 'Chọn nhà xe có sẵn' },
  { value: 'NEW', label: 'Thêm nhà xe mới' },
  { value: 'WALK_IN', label: 'Khách vãng lai' }
];

interface TruckingCompanyPickerProps {
  /** Nhà xe đang hoạt động trong danh mục khách hàng. */
  options: TruckingOption[];
  /** Mã đã chọn ('' = chưa chọn, VANG_LAI = vãng lai). */
  code: string;
  /** Tên đã chọn (tên nhà xe trong danh mục, hoặc tên gõ tay khi vãng lai). */
  name: string;
  onChange: (code: string, name: string) => void;
  /** Báo nhà xe mới tạo tại cổng để trang cha thêm vào danh sách gợi ý. */
  onCreated: (option: TruckingOption) => void;
  /** Trang cha tăng sau mỗi lần Gate-In thành công → về radio mặc định, xoá chữ đang gõ. */
  resetKey?: number;
}

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Ô "Đơn Vị Vận Tải / Nhà Xe" ở Gate-In với 3 radio: Chọn nhà xe có sẵn (mặc định, gõ để tìm) / Thêm nhà xe mới
 * (vào danh mục, mã NX-xxxx, backend chống trùng tên / MST) / Khách vãng lai (chỉ ghi tên, không tạo khách hàng).
 * Chỉ hiện ô của radio đang chọn; đổi radio thì bỏ lựa chọn cũ để không gửi nhầm.
 */
export const TruckingCompanyPicker: React.FC<TruckingCompanyPickerProps> = ({ options, code, name, onChange, onCreated, resetKey }) => {
  const [mode, setMode] = useState<PickerMode>(code === WALK_IN_TRUCKING_CODE ? 'WALK_IN' : 'EXISTING');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTax, setNewTax] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const clearInputs = () => {
    setQuery('');
    setOpen(false);
    setNewName('');
    setNewPhone('');
    setNewTax('');
    setMessage(null);
  };

  // Sau Gate-In thành công trang cha xoá trắng form → về radio mặc định.
  useEffect(() => {
    if (resetKey === undefined) return;
    setMode('EXISTING');
    clearInputs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const matches = useMemo(() => {
    const q = normalize(query);
    const list = q ? options.filter((o) => normalize(`${o.code} ${o.name}`).includes(q)) : options;
    return list.slice(0, 30);
  }, [options, query]);

  const selectedLabel = code && code !== WALK_IN_TRUCKING_CODE ? `[${code}] ${name}` : '';

  const switchMode = (next: PickerMode) => {
    if (next === mode) return;
    const typed = query.trim();
    clearInputs();
    if (next === 'NEW') setNewName(typed);
    // Bỏ nhà xe / tên của lựa chọn cũ; vãng lai báo trang cha bằng mã VANG_LAI chưa có tên.
    onChange(next === 'WALK_IN' ? WALK_IN_TRUCKING_CODE : '', '');
    setMode(next);
  };

  const pick = (o: TruckingOption) => {
    onChange(o.code, o.name);
    setQuery('');
    setOpen(false);
  };

  const saveNew = async () => {
    if (!newName.trim()) {
      setMessage({ ok: false, text: 'Nhập tên nhà xe.' });
      return;
    }
    setSaving(true);
    const res = await customerApi.quickCreateTrucking({
      name: newName.trim(),
      phone: newPhone.trim() || undefined,
      taxCode: newTax.trim() || undefined
    });
    setSaving(false);
    if (res.customer && (res.ok || res.duplicate)) {
      const option = { code: res.customer.code, name: res.customer.name };
      if (res.ok) onCreated(option);
      // Lưu xong (hoặc trùng nhà xe đã có) → về "Chọn nhà xe có sẵn" với nhà xe đó đã chọn.
      setNewName('');
      setNewPhone('');
      setNewTax('');
      setMode('EXISTING');
      pick(option);
      setMessage({ ok: true, text: res.duplicate ? `${res.message} — đã chọn nhà xe này.` : res.message });
      return;
    }
    setMessage({ ok: false, text: res.message });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {MODES.map((m) => (
          <label key={m.value} className={`flex items-center gap-1.5 cursor-pointer font-semibold ${mode === m.value ? 'text-sky-700' : 'text-slate-600'}`}>
            <input
              type="radio"
              name="trucking-mode"
              value={m.value}
              checked={mode === m.value}
              onChange={() => switchMode(m.value)}
              className="accent-sky-600"
            />
            {m.label}
          </label>
        ))}
      </div>

      {mode === 'EXISTING' && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={open ? query : selectedLabel || query}
            onFocus={() => { setOpen(true); setQuery(''); }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            placeholder="Gõ mã / tên nhà xe để tìm…"
            className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl font-bold focus:border-sky-500 focus:outline-none min-h-[42px] shadow-sm"
          />
          {open && (
            <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg text-xs">
              {matches.length === 0 && (
                <div className="px-3 py-2 text-slate-500">
                  Không có nhà xe khớp "{query}" — chọn radio "Thêm nhà xe mới" hoặc "Khách vãng lai".
                </div>
              )}
              {matches.map((o) => (
                <button
                  key={o.code}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { pick(o); setMessage(null); }}
                  className="w-full text-left px-3 py-2 hover:bg-sky-50 font-semibold text-slate-800"
                >
                  [{o.code}] {o.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'NEW' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
          <div className="font-bold text-emerald-800">Thêm nhà xe mới vào danh mục (mã tự sinh NX-xxxx)</div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tên nhà xe*"
            maxLength={200}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="SĐT (tuỳ chọn)"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              value={newTax}
              onChange={(e) => setNewTax(e.target.value)}
              placeholder="Mã số thuế (tuỳ chọn)"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400"
            />
          </div>
          <button
            type="button"
            onClick={saveNew}
            disabled={saving}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : 'Lưu nhà xe'}
          </button>
        </div>
      )}

      {mode === 'WALK_IN' && (
        <input
          type="text"
          value={name}
          onChange={(e) => onChange(WALK_IN_TRUCKING_CODE, e.target.value)}
          placeholder="Tên nhà xe / chủ xe vãng lai*"
          maxLength={200}
          className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-200 text-xs text-slate-900 rounded-xl font-semibold focus:outline-none focus:border-amber-400"
        />
      )}

      {message && (
        <div className={`text-[11px] font-bold flex items-center gap-1 ${message.ok ? 'text-emerald-700' : 'text-rose-700'}`}>
          {!message.ok && <AlertCircle className="w-3.5 h-3.5" />}
          {message.text}
        </div>
      )}
    </div>
  );
};
