import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { apiClient, containerApi, API_ENDPOINTS } from '../../../api';
import { getApiErrorMessage } from '../../../utils/apiError';

// Phí lưu bãi do server tính theo Cước Lưu Bãi (GET /DepotJobs/{id}/storage-fee) — hiện trong hộp cấp vỏ, chưa thu / chưa
// chặn ra cổng (depot-fullstack-storage-tariff-pricing). Thiếu quy tắc / thiếu giá thì hiện đúng lý do server trả.
interface StorageFeeLine { tierName: string; fromDay: number; toDay: number; days: number; unitPrice: number; amount: number }
interface StorageFee {
  ok: boolean; message: string; containerTypeCode: string; gateInDate: string; toDate: string;
  totalDays: number; freeDays: number; chargeableDays: number; ruleCode?: string; ruleName?: string;
  lines: StorageFeeLine[]; subtotal: number; vatPercent: number; vatAmount: number; total: number;
}

const vnd = (v: number) => `${Number(v || 0).toLocaleString('vi-VN')} đ`;

export const GateOutStorageFee: React.FC<{ containerNo: string }> = ({ containerNo }) => {
  const [fee, setFee] = useState<StorageFee | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const job: any = await containerApi.getById(containerNo);
        if (!job?.data?.id) throw new Error(job?.message || 'Không tìm thấy hồ sơ container.');
        const res = await apiClient.get<any>(API_ENDPOINTS.DEPOT_JOBS.STORAGE_FEE(String(job.data.id)));
        if (alive) setFee(res.data?.data as StorageFee);
      } catch (e) {
        if (alive) setError(getApiErrorMessage(e, 'Không tải được phí lưu bãi.'));
      }
    })();
    return () => { alive = false; };
  }, [containerNo]);

  return (
    <div data-testid="gateout-storage-fee" className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          Phí Lưu Bãi (theo Cước Lưu Bãi)
        </span>
        {fee && (
          <span className="text-[11px] text-slate-500 font-mono">
            Vào bãi {fee.gateInDate} → {fee.toDate} · {fee.totalDays} ngày · miễn phí {fee.freeDays}
            {fee.ruleCode ? ` · ${fee.ruleCode}` : ''}
          </span>
        )}
      </div>

      {!fee && !error && <div className="text-[11px] text-slate-500">Đang tính phí lưu bãi...</div>}
      {error && <div className="text-[11px] text-rose-700">{error}</div>}
      {fee && !fee.ok && (
        <div data-testid="gateout-storage-fee-warning" className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">{fee.message}</div>
      )}
      {fee && fee.ok && (
        <>
          {fee.lines.length > 0 ? (
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="py-1.5">Bậc giá</th>
                  <th className="py-1.5 text-right">Ngày</th>
                  <th className="py-1.5 text-right">Số ngày</th>
                  <th className="py-1.5 text-right">Đơn giá {fee.containerTypeCode}</th>
                  <th className="py-1.5 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 font-mono">
                {fee.lines.map((l, i) => (
                  <tr key={i}>
                    <td className="py-1.5 font-sans font-semibold text-slate-800">{l.tierName}</td>
                    <td className="py-1.5 text-right">{l.fromDay}–{l.toDay}</td>
                    <td className="py-1.5 text-right">{l.days}</td>
                    <td className="py-1.5 text-right">{vnd(l.unitPrice)}</td>
                    <td className="py-1.5 text-right font-bold">{vnd(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-[11px] text-emerald-700">{fee.message}</div>
          )}
          <div className="flex justify-end gap-4 text-[11px] font-mono">
            <span>Tạm tính: <b>{vnd(fee.subtotal)}</b></span>
            <span>VAT {fee.vatPercent}%: <b>{vnd(fee.vatAmount)}</b></span>
            <span data-testid="gateout-storage-fee-total" className="text-emerald-700">Tổng: <b>{vnd(fee.total)}</b></span>
          </div>
        </>
      )}
      <p className="text-[10px] text-slate-500">Phí lưu bãi tính cả ngày vào và ngày ra; hiện để tham khảo, chưa thu tại bước này.</p>
    </div>
  );
};
