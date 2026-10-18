import React, { useEffect, useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { masterDataApi } from '../../../api';
import { getApiErrorMessage } from '../../../utils/apiError';

// Cấu hình cấp vỏ lưu thành 1 mục danh mục (giống PAYMENT_ACCOUNT) — khớp DepotJobService.GateOutSettingCatalog /
// BookingValidityHoursCode ở backend. Chưa lưu thì backend dùng mặc định 24 giờ.
const CATALOG_TYPE = 'GATE_OUT_SETTING';
const CODE = 'BOOKING_VALIDITY_HOURS';
const DEFAULT_HOURS = 24;
const MAX_HOURS = 8760;

interface CatalogRow {
  id: number | string;
  code: string;
  name: string;
  jsonData?: string;
  isActive: boolean;
  sortOrder?: number;
}

const readHours = (json?: string): number | null => {
  try {
    const h = JSON.parse(json || '{}')?.hours;
    return Number.isInteger(h) && h >= 1 && h <= MAX_HOURS ? h : null;
  } catch {
    return null;
  }
};

export const GateOutSettingsPage: React.FC = () => {
  const [row, setRow] = useState<CatalogRow | null>(null);
  const [hoursInput, setHoursInput] = useState(String(DEFAULT_HOURS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await masterDataApi.getCatalog(CATALOG_TYPE, { includeInactive: true });
      const found = ((res?.data as CatalogRow[]) || []).find((x) => (x.code || '').toUpperCase() === CODE) || null;
      setRow(found);
      setHoursInput(String((found?.isActive && readHours(found.jsonData)) || DEFAULT_HOURS));
    } catch (error) {
      setMessage({ ok: false, text: getApiErrorMessage(error, 'Không tải được cấu hình cấp vỏ.') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSave = async () => {
    const hours = Number(hoursInput);
    if (!Number.isInteger(hours) || hours < 1 || hours > MAX_HOURS) {
      setMessage({ ok: false, text: `Số giờ hiệu lực booking phải là số nguyên từ 1 đến ${MAX_HOURS} giờ.` });
      return;
    }
    setSaving(true);
    setMessage(null);
    const request = {
      catalogType: CATALOG_TYPE,
      code: CODE,
      name: 'Số giờ hiệu lực booking',
      description: 'Hạn cuối booking = 00:00 ngày ValidUntil (giờ Việt Nam) + số giờ này',
      jsonData: JSON.stringify({ hours }),
      isActive: true,
      sortOrder: 0
    };
    try {
      const res: any = row ? await masterDataApi.updateCatalog(String(row.id), request) : await masterDataApi.createCatalog(request);
      if (res?.statusCode !== 200) throw new Error(res?.message || 'Lưu cấu hình thất bại.');
      setMessage({ ok: true, text: `Đã lưu: booking còn hiệu lực ${hours} giờ kể từ 00:00 ngày hết hạn ghi trên booking.` });
      await load();
    } catch (error) {
      setMessage({ ok: false, text: getApiErrorMessage(error, 'Lưu cấu hình thất bại.') });
    } finally {
      setSaving(false);
    }
  };

  const preview = Number(hoursInput);
  const previewText = Number.isInteger(preview) && preview >= 1 && preview <= MAX_HOURS
    ? preview % 24 === 0
      ? `Booking có ngày hết hạn 23/09 còn dùng được đến hết ngày ${(() => {
          const d = new Date(2026, 8, 23 + preview / 24 - 1);
          return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        })()}.`
      : `Booking có ngày hết hạn 23/09 còn dùng được đến ${preview} giờ sau 00:00 ngày 23/09.`
    : '';

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Cấu Hình Cấp Vỏ (Gate-Out)</h2>
          <p className="text-xs text-slate-500">Quy tắc hạn booking khi cấp vỏ — áp dụng ngay cho lần Gate-Out tiếp theo.</p>
        </div>
      </div>

      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 text-sm">
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">Số giờ hiệu lực booking</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={MAX_HOURS}
              step={1}
              value={hoursInput}
              disabled={loading}
              onChange={(e) => setHoursInput(e.target.value)}
              className="w-40 px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-indigo-500"
            />
            <span className="text-slate-500">giờ</span>
          </div>
          <p className="text-xs text-slate-500">
            Hạn cuối = 00:00 ngày hết hạn ghi trên booking (giờ Việt Nam) + số giờ này. 24 = còn hạn hết ngày hết hạn; 48 = thêm 1 ngày; 720 = thêm 29 ngày.
            {row ? '' : ` Chưa cấu hình — đang dùng mặc định ${DEFAULT_HOURS} giờ.`}
          </p>
          {previewText && <p className="text-xs text-indigo-700 font-bold">{previewText}</p>}
        </div>

        {message && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${message.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-300 text-rose-700'}`}>
            {message.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
        </button>
      </div>
    </div>
  );
};
