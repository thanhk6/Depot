import React, { useCallback, useEffect, useState } from 'react';
import { ClipboardCheck, Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { masterDataApi } from '../../../api';
import { resetSurveyChecklistCache } from '../utils/checklistCatalog';

// Danh mục khu vực Checklist giám định (catalog SURVEY_CHECKLIST) — depot-fullstack-survey-checklist-catalog.
// Mỗi thao tác gọi đúng 1 API của dòng đó (không dùng persistCatalog ghi lại cả loạt); mọi quy tắc (không đổi mã,
// mặc định PASS/NA, không tạm ngưng / xoá khi còn vị trí gắn hoặc đã có trong phiếu) do server kiểm tra và báo lỗi.

interface ZoneRow {
  id: string;
  code: string;
  name: string;
  nameVi: string;
  description: string;
  defaultStatus: 'PASS' | 'NA';
  isActive: boolean;
  sortOrder: number;
}

const readJson = (value: unknown): Record<string, any> => {
  try { return JSON.parse(String(value || '{}')); } catch { return {}; }
};

const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.response?.data?.data || (error instanceof Error ? error.message : fallback);

const STATUS_LABEL: Record<ZoneRow['defaultStatus'], string> = { PASS: 'Đạt', NA: 'N/A' };

export const SurveyChecklistMaster: React.FC = () => {
  const [rows, setRows] = useState<ZoneRow[]>([]);
  const [linkedCount, setLinkedCount] = useState<Record<string, number>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ZoneRow | null>(null);
  const [code, setCode] = useState('');
  const [nameVi, setNameVi] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultStatus, setDefaultStatus] = useState<ZoneRow['defaultStatus']>('PASS');
  const [sortOrder, setSortOrder] = useState('1');
  const [modalError, setModalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [zoneRes, locRes]: any[] = await Promise.all([
        masterDataApi.getCatalog('SURVEY_CHECKLIST', { includeInactive: true }),
        masterDataApi.getCatalog('DAMAGE_LOCATION', { includeInactive: true })
      ]);
      setRows((zoneRes?.data || []).map((item: any) => ({
        id: String(item.id),
        code: item.code,
        name: item.name || '',
        nameVi: item.nameVi || '',
        description: item.description || '',
        defaultStatus: readJson(item.jsonData).defaultStatus === 'NA' ? 'NA' : 'PASS',
        isActive: !!item.isActive,
        sortOrder: item.sortOrder ?? 0
      })).sort((a: ZoneRow, b: ZoneRow) => a.sortOrder - b.sortOrder));
      const counts: Record<string, number> = {};
      (locRes?.data || []).forEach((loc: any) => {
        const zone = readJson(loc.jsonData).checklistZone;
        if (zone) counts[zone] = (counts[zone] || 0) + 1;
      });
      setLinkedCount(counts);
      setLoadError(null);
    } catch (error) {
      setLoadError(errorMessage(error, 'Không tải được danh mục khu vực Checklist.'));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toRequest = (row: ZoneRow) => ({
    catalogType: 'SURVEY_CHECKLIST',
    code: row.code,
    name: row.name || row.nameVi,
    nameVi: row.nameVi,
    description: row.description,
    jsonData: JSON.stringify({ defaultStatus: row.defaultStatus }),
    isActive: row.isActive,
    sortOrder: row.sortOrder
  });

  // Sau mỗi thao tác thành công: tải lại bảng + báo các màn khác (DM Vị Trí Cấu Kiện, form giám định) dùng danh mục mới.
  const afterChange = async (text: string) => {
    resetSurveyChecklistCache();
    await load();
    setNotice({ type: 'success', text });
  };

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      await afterChange(success);
      return true;
    } catch (error) {
      setNotice({ type: 'error', text: errorMessage(error, 'Thao tác không thành công.') });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const openModal = (row?: ZoneRow) => {
    setEditing(row || null);
    setCode(row?.code || '');
    setNameVi(row?.nameVi || '');
    setName(row?.name || '');
    setDescription(row?.description || '');
    setDefaultStatus(row?.defaultStatus || 'PASS');
    setSortOrder(String(row?.sortOrder ?? (rows.length ? Math.max(...rows.map((r) => r.sortOrder)) + 1 : 1)));
    setModalError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !nameVi.trim()) return;
    const row: ZoneRow = {
      id: editing?.id || '',
      code: editing ? editing.code : code.trim().toUpperCase(),
      name: name.trim(),
      nameVi: nameVi.trim(),
      description: description.trim(),
      defaultStatus,
      isActive: editing ? editing.isActive : true,
      sortOrder: Number(sortOrder) || 1
    };
    setBusy(true);
    setModalError(null);
    try {
      if (editing) await masterDataApi.updateCatalog(editing.id, toRequest(row));
      else await masterDataApi.createCatalog(toRequest(row));
      setShowModal(false);
      await afterChange(editing ? `Đã cập nhật khu vực ${row.code}.` : `Đã thêm khu vực ${row.code}.`);
    } catch (error) {
      setModalError(errorMessage(error, 'Không lưu được khu vực.'));
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = (row: ZoneRow) =>
    run(
      () => masterDataApi.updateCatalog(row.id, toRequest({ ...row, isActive: !row.isActive })),
      row.isActive ? `Đã tạm ngưng khu vực ${row.code}.` : `Đã bật lại khu vực ${row.code}.`
    );

  const handleDelete = (row: ZoneRow) => {
    if (!confirm(`Xoá khu vực ${row.code} - ${row.nameVi}? Khu vực đã có trong phiếu giám định chỉ được Tạm ngưng.`)) return;
    void run(() => masterDataApi.deactivateCatalog(row.id), `Đã xoá khu vực ${row.code}.`);
  };

  const activeCount = rows.filter((r) => r.isActive).length;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">Danh Mục Khu Vực Checklist Giám Định</h2>
            <p className="text-xs text-slate-500">
              Các khu vực giám định viên đánh giá Đạt / Không Đạt / N/A trên mỗi phiếu. Hư hỏng ở một vị trí tự đánh
              "Không Đạt" khu vực mà vị trí đó gắn vào (gắn ở DM Vị Trí Cấu Kiện).
            </p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          disabled={busy}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khu Vực</span>
        </button>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 shrink-0" /> <span>{loadError}</span>
        </div>
      )}
      {notice && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs border ${notice.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {notice.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="text-xs text-slate-500 font-mono">
        Đang dùng: <strong className="text-slate-900">{activeCount}</strong> / {rows.length} khu vực
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-16 text-center">Thứ Tự</th>
                <th className="py-3.5 px-4">Mã Khu Vực</th>
                <th className="py-3.5 px-4">Tên Tiếng Việt</th>
                <th className="py-3.5 px-4">Tên Quốc Tế (EN)</th>
                <th className="py-3.5 px-4 text-center">Mặc Định</th>
                <th className="py-3.5 px-4 text-center">Số Vị Trí Gắn</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">Chưa có khu vực nào.</td></tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className={`hover:bg-slate-50 transition ${row.isActive ? '' : 'opacity-60'}`}>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">{row.sortOrder}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md">{row.code}</span>
                    {row.code === 'CLEANING' && (
                      <span className="block mt-1 text-[10px] text-slate-500" title="Chọn Không Đạt ở khu vực này đổi phân loại AV → CL">
                        <Info className="w-3 h-3 inline -mt-0.5" /> Không Đạt → phân loại CL
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.nameVi}</td>
                  <td className="py-3.5 px-4 text-slate-700">{row.name}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${row.defaultStatus === 'NA' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {STATUS_LABEL[row.defaultStatus]}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">{linkedCount[row.code] || 0}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggle(row)}
                      disabled={busy}
                      title={row.isActive ? 'Bấm để tạm ngưng' : 'Bấm để bật lại'}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer disabled:cursor-wait ${row.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                    >
                      {row.isActive ? <><CheckCircle2 className="w-3 h-3" /> ĐANG DÙNG</> : <><XCircle className="w-3 h-3" /> TẠM NGƯNG</>}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openModal(row)} disabled={busy} title="Sửa" className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(row)} disabled={busy} title="Xóa" className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg transition cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-500" />
              {editing ? 'Chỉnh Sửa Khu Vực Checklist' : 'Thêm Khu Vực Checklist'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã Khu Vực*</label>
                  <input
                    type="text"
                    required
                    disabled={!!editing}
                    placeholder="VD: TANK_VALVE"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-blue-700 font-mono font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {editing ? 'Không đổi mã sau khi tạo.' : 'Chữ in hoa, số, dấu gạch dưới. Không đổi được sau khi tạo.'}
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Trạng Thái Mặc Định</label>
                  <select
                    value={defaultStatus}
                    onChange={(e) => setDefaultStatus(e.target.value as ZoneRow['defaultStatus'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none font-medium"
                  >
                    <option value="PASS">Đạt</option>
                    <option value="NA">N/A (không áp dụng)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Tiếng Việt*</label>
                <input type="text" required value={nameVi} onChange={(e) => setNameVi(e.target.value)} placeholder="VD: 12. Van Bồn (Tank Valve)" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Quốc Tế (EN)</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Thứ Tự</label>
                  <input type="number" min={1} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mô Tả</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none" />
              </div>
              {modalError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> <span>{modalError}</span>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">Hủy Bỏ</button>
                <button type="submit" disabled={busy} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg cursor-pointer">
                  {editing ? 'Lưu Thay Đổi' : 'Thêm Khu Vực'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
