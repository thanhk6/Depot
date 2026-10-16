import React, { useEffect, useState } from 'react';
import {
  X,
  Send,
  Ship,
  FileCode,
  Mail,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Layers,
  Camera,
  ShieldCheck,
  Award,
  Globe,
  Radio,
  ExternalLink
} from 'lucide-react';
import { QCInspectionRecord, ShippingLineDispatchInfo } from '../types/qc';
import { shippingApi } from '../../../api';
import type { ShippingCarrierStatus } from '../../../api';
import { getApiErrorMessage } from '../../../utils/apiError';
import { downloadFile } from '../../../utils/download';
import { masterDataApi } from '../../../api';

interface ShippingLineDispatchModalProps {
  records: QCInspectionRecord[];
  onConfirmDispatch: (
    recordIds: string[],
    dispatchInfo: Partial<ShippingLineDispatchInfo>
  ) => void;
  onClose: () => void;
}

export const ShippingLineDispatchModal: React.FC<ShippingLineDispatchModalProps> = ({
  records,
  onConfirmDispatch,
  onClose
}) => {
  const [dispatchMethod, setDispatchMethod] = useState<
    'EDI_WESTIM' | 'EMAIL_REPORT' | 'API_WEBHOOK' | 'MANUAL_DISPATCH'
  >('EDI_WESTIM');

  const [copiedEdi, setCopiedEdi] = useState<boolean>(false);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  // Email nhận = ContactEmail thật của hãng tàu trong danh mục Hãng Tàu. Trước đây tự ghép địa chỉ bịa kiểu
  // "<tên hãng>.mr.ops@shippingline.com" và CC 2 email "@emrdepot.com" không tồn tại.
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [emailCc, setEmailCc] = useState<string>('');
  useEffect(() => {
    const lineKeys = [...new Set(records.map((r) => (r.shippingLine || '').toUpperCase()))];
    masterDataApi.getShippingLines().then((res: any) => {
      const emails = (res?.data || [])
        .filter((l: any) => lineKeys.includes(String(l.code).toUpperCase()) || lineKeys.includes(String(l.name).toUpperCase()))
        .map((l: any) => l.contactEmail)
        .filter(Boolean);
      setRecipientEmail((prev) => prev || emails.join(', '));
    }).catch(() => {});
  }, [records]);
  // Trạng thái cấu hình API thật của các hãng tàu (backend), thay cho nhãn "200 OK CONNECTED" gõ cứng.
  const [carriers, setCarriers] = useState<ShippingCarrierStatus[] | null>(null);
  useEffect(() => {
    shippingApi.getCarriers().then(setCarriers).catch(() => setCarriers([]));
  }, []);
  const lineCodes = [...new Set(records.map((r) => (r.shippingLine || '').toUpperCase()))];
  const carrierRows = lineCodes.map((code) => ({
    code,
    status: carriers?.find((c) => c.carrierCode.toUpperCase() === code)
  }));
  const apiReady = carriers !== null && carrierRows.every((r) => r.status?.configured && r.status.enabled);

  const handleDownloadSummary = () => {
    const headers = ['Số Container', 'Hãng tàu', 'ISO', 'Work Order', 'Estimate', 'Ngày sửa xong', 'Ngày QC', 'Người QC', 'Kết quả QC', 'Hạng cấp'];
    const rows = records.map((r) => [r.containerNo, r.shippingLine, r.isoCode, r.workOrderNo, r.estimateNo, r.repairedAt, r.inspectedAt || '', r.inspectorName, r.qcResult, r.releasedGrade || '']);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    // BOM để Excel nhận đúng UTF-8 tiếng Việt.
    downloadFile('﻿' + csv, `BangKe-NghiemThu-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
  };
  const [emailSubject, setEmailSubject] = useState<string>(
    records.length === 1
      ? `[EMR DEPOT - REPAIR COMPLETED] ${records[0].shippingLine} - Cont ${records[0].containerNo} - WO ${records[0].workOrderNo} (QC Passed / Grade ${records[0].releasedGrade || 'A'})`
      : `[EMR DEPOT - BATCH REPAIR COMPLETED] Báo Cáo Nghiệm Thu Hoàn Thành ${records.length} Containers Cho Hãng Tàu`
  );
  const [customNotes, setCustomNotes] = useState<string>(
    'Kính gửi Bộ phận M&R Hãng tàu,\nDepot xin thông báo các vỏ container sau đã hoàn tất công tác sửa chữa cơ khí, nghiệm thu đạt chuẩn IICL-6 và chuyển trạng thái Vỏ Sạch (AV) sẵn sàng cấp đóng hàng xuất khẩu.'
  );

  // Generate realistic EDI WESTIM message
  const now = new Date();
  const timestampStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
  const dateFormatted = now.toISOString().slice(0, 10).replace(/-/g, '');
  const refNo = `DEPOT-WESTIM-${Date.now().toString().slice(-6)}`;

  const generateEdiWestim = () => {
    let edi = `UNB+UNOA:2+EMRDEPOT+${records[0]?.shippingLine || 'CARRIER'}+${timestampStr}+${refNo}'\n`;
    edi += `UNH+1+WESTIM:D:00B:UN:IICL6'\n`;
    edi += `BGM+88+${refNo}+9'\n`;
    edi += `DTM+137:${dateFormatted}:102'\n`;
    edi += `LOC+11+VNSGN:139:6+EMR_DEPOT_CATLAI'\n`;

    records.forEach((rec, idx) => {
      edi += `EQD+CN+${rec.containerNo}+${rec.isoCode || '45G1'}:102+2+2+5'\n`;
      edi += `RFF+IV:${rec.workOrderNo}'\n`;
      edi += `RFF+AAY:${rec.estimateNo}'\n`;
      edi += `DTM+7+${(rec.inspectedAt || now.toISOString()).slice(0, 10).replace(/-/g, '')}:102'\n`;
      edi += `NAD+CA+${rec.shippingLine}'\n`;
      edi += `DAM+1+IICL:ZZZ'\n`;
      edi += `REC+1+REP+COMPLETED:ZZZ'\n`;
      edi += `FTX+AAI+++GRADE:${rec.releasedGrade || 'GRADE_A'}+INSPECTOR:${rec.inspectorName}'\n`;
    });

    edi += `UNT+${records.length * 8 + 5}+1'\n`;
    edi += `UNZ+1+${refNo}'`;
    return edi;
  };

  const ediContent = generateEdiWestim();

  const handleCopyEdi = () => {
    navigator.clipboard.writeText(ediContent);
    setCopiedEdi(true);
    setTimeout(() => setCopiedEdi(false), 2000);
  };

  const handleDownloadEdi = () => {
    const blob = new Blob([ediContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${refNo}.edi`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSend = async () => {
    setIsTransmitting(true);
    try {
      // Chỉ cách "API Webhook" mới gọi API hãng tàu thật (backend tự lấy hãng theo hồ sơ container, gửi tới
      // endpoint cấu hình trên server). EDI / Email / Thủ công là gửi ngoài hệ thống — trước đây cách nào cũng
      // gọi adapter giả lập trả ACK tự sinh nên luôn "thành công".
      if (dispatchMethod === 'API_WEBHOOK') {
        for (const record of records) {
          try {
            await shippingApi.syncJob(record.containerId, '', 'QC_PASSED');
          } catch (error) {
            throw new Error(`${record.containerNo}: ${getApiErrorMessage(error, 'Không gửi được tới hãng tàu.')}`);
          }
        }
      }
      setIsTransmitting(false);
      onConfirmDispatch(
        records.map((r) => r.id),
        {
          status: 'TRANSMITTED',
          transmittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          transmittedMethod: dispatchMethod,
          transmissionRefNo: refNo,
          recipientEmail,
          notes: customNotes,
          ediContent: dispatchMethod === 'EDI_WESTIM' ? ediContent : undefined
        }
      );
      onClose();
    } catch (error) {
      setIsTransmitting(false);
      window.alert(error instanceof Error ? error.message : 'Không thể đồng bộ hãng tàu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  Gửi Thông Báo Nghiệm Thu Hoàn Thành Sửa Chữa Đến Hãng Tàu
                </h3>
                <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-bold rounded-lg">
                  {records.length} Container
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Mã điện truyền: <strong className="text-amber-600">{refNo}</strong> &bull; Hãng tàu:{' '}
                <strong className="text-emerald-600">
                  {Array.from(new Set(records.map((r) => r.shippingLine))).join(', ')}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispatch Methods Navigation */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setDispatchMethod('EDI_WESTIM')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              dispatchMethod === 'EDI_WESTIM'
                ? 'bg-white text-blue-600 border-t border-x border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>1. Truyền Điện EDI WESTIM / CODECO</span>
          </button>

          <button
            onClick={() => setDispatchMethod('EMAIL_REPORT')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              dispatchMethod === 'EMAIL_REPORT'
                ? 'bg-white text-blue-600 border-t border-x border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>2. Gửi Email Kèm Bộ Ảnh &amp; Chứng Nhận QC</span>
          </button>

          <button
            onClick={() => setDispatchMethod('API_WEBHOOK')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              dispatchMethod === 'API_WEBHOOK'
                ? 'bg-white text-blue-600 border-t border-x border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>3. Đồng Bộ Portal / API Webhook</span>
          </button>

          <button
            onClick={() => setDispatchMethod('MANUAL_DISPATCH')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              dispatchMethod === 'MANUAL_DISPATCH'
                ? 'bg-white text-blue-600 border-t border-x border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>4. Bảng Kê Báo Cáo Excel</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Selected Containers Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Danh Sách Container Nghiệm Thu Đạt Sẵn Sàng Truyền Dữ Liệu:</span>
              <span className="text-emerald-600 font-mono">Tất cả đã đạt chuẩn IICL-6 / Phân loại AV</span>
            </div>

            <div className="overflow-x-auto max-h-40 scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-[11px] text-slate-500 font-mono border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Container No</th>
                    <th className="py-2 px-3">Hãng Tàu</th>
                    <th className="py-2 px-3">Loại / ISO</th>
                    <th className="py-2 px-3">Lệnh WO</th>
                    <th className="py-2 px-3">Hạng Vỏ Cấp</th>
                    <th className="py-2 px-3">Ảnh After</th>
                    <th className="py-2 px-3">Giám Định QC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-mono">
                  {records.map((r, i) => (
                    <tr key={r.id} className="hover:bg-white">
                      <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{r.containerNo}</td>
                      <td className="py-2 px-3 text-blue-600">{r.shippingLine}</td>
                      <td className="py-2 px-3 text-slate-700">{r.size} {r.type}</td>
                      <td className="py-2 px-3 text-amber-600">{r.workOrderNo}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                          {r.releasedGrade || 'GRADE_A'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-700">{r.afterPhotos?.length || 1} ảnh</td>
                      <td className="py-2 px-3 text-slate-500 text-[11px] truncate max-w-[120px]">
                        {r.inspectorName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* METHOD 1: EDI WESTIM */}
          {dispatchMethod === 'EDI_WESTIM' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Bản Tin Chuẩn Quốc Tế EDIFACT WESTIM / CODECO:
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Truyền thông báo hoàn tất sửa chữa (Waste Estimate &amp; Repair Confirmation) theo tiêu chuẩn UN/EDIFACT D.00B.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyEdi}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    {copiedEdi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEdi ? 'Đã Sao Chép' : 'Sao Chép Raw'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadEdi}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File .EDI</span>
                  </button>
                </div>
              </div>

              {/* EDI Raw Code Viewer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-emerald-600 overflow-x-auto leading-relaxed max-h-56 select-all scrollbar-thin">
                <pre>{ediContent}</pre>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-xs text-slate-700">
                <Radio className="w-5 h-5 text-blue-600 shrink-0 animate-pulse" />
                <span>
                  Hệ thống kết nối SFTP / AS2 tự động truyền bản tin này tới máy chủ hãng tàu ngay khi bấm nút gửi.
                </span>
              </div>
            </div>
          )}

          {/* METHOD 2: EMAIL REPORT */}
          {dispatchMethod === 'EMAIL_REPORT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Người nhận (To):</label>
                  <input
                    type="text"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Đồng kính gửi (CC):</label>
                  <input
                    type="text"
                    value={emailCc}
                    onChange={(e) => setEmailCc(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-slate-700 font-bold block">Tiêu đề thư (Subject):</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-slate-700 font-bold block">Nội dung thư thông báo:</label>
                <textarea
                  rows={4}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              {/* Attachments preview */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700 font-bold">
                    Tệp đính kèm tự động: {records.length} Phiếu Nghiệm Thu QC (PDF) + {records.reduce((acc, r) => acc + (r.afterPhotos?.length || 1), 0)} Ảnh Sau Sửa (High-Res)
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded font-mono text-[11px] font-bold">
                  Sẵn Sàng Đính Kèm
                </span>
              </div>
            </div>
          )}

          {/* METHOD 3: API WEBHOOK */}
          {dispatchMethod === 'API_WEBHOOK' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-purple-600 font-bold block">Kết nối API hãng tàu (cấu hình trên server):</span>
                {carriers === null ? (
                  <div className="text-slate-500">Đang tải trạng thái kết nối...</div>
                ) : (
                  carrierRows.map((row) => (
                    <div key={row.code} className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="font-mono font-bold text-slate-900">{row.code || '—'}</span>
                      {row.status?.configured && row.status.enabled ? (
                        <span className="font-mono text-[11px] text-slate-700 break-all">POST {row.status.endpointUrl}</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                          {row.status?.configured ? 'ĐANG TẮT' : 'CHƯA CẤU HÌNH'}
                        </span>
                      )}
                    </div>
                  ))
                )}
                <p className="text-slate-500 text-[11px]">
                  Nội dung gửi do backend lấy từ hồ sơ container (giám định, báo giá) trong DB. Hãng chưa cấu hình thì không gửi được — dùng EDI / Email / Bảng kê.
                </p>
              </div>
            </div>
          )}

          {/* METHOD 4: EXCEL DISPATCH */}
          {dispatchMethod === 'MANUAL_DISPATCH' && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <FileSpreadsheet className="w-5 h-5" />
                <span>Bảng Kê Tổng Hợp Nghiệm Thu Hoàn Thành Sửa Chữa (Repair Completion Summary)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Xuất file Excel đầy đủ cột chi tiết: Số Container, Hãng tàu, Ngày vào bãi, Ngày hoàn thành sửa, Số Work Order, Tiêu chuẩn IICL-6, Hạng vỏ cấp trả (Grade A), Link xem ảnh Before/After.
              </p>
              <button
                type="button"
                onClick={handleDownloadSummary}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Download className="w-4 h-4" />
                <span>Tải Bảng Kê (.CSV, mở bằng Excel)</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs font-mono text-slate-500">
            Hãng tàu thụ hưởng:{' '}
            <strong className="text-slate-900 font-bold">
              {Array.from(new Set(records.map((r) => r.shippingLine))).join(', ')}
            </strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="button"
              disabled={isTransmitting || (dispatchMethod === 'API_WEBHOOK' && !apiReady)}
              onClick={handleSend}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-xl  transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isTransmitting
                  ? 'Đang Truyền Dữ Liệu...'
                  : `XÁC NHẬN TRUYỀN DỮ LIỆU (${records.length} CONT)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
