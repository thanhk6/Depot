import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { masterDataApi } from '../../api';
import { buildVietQrPayload, normalizeTransferContent } from '../../utils/vietqr';
import { formatVND } from '../../utils/format';
import { VietQrNotConfigured } from './VietQrNotConfigured';

export interface PaymentAccount {
  bankBin: string;
  bankName: string;
  accountNo: string;
  accountName: string;
}

// Tài khoản nhận tiền lấy từ danh mục PAYMENT_ACCOUNT trong DB (bản ghi đang áp dụng đầu tiên) — tải 1 lần dùng chung.
let accountCache: Promise<PaymentAccount | null> | null = null;
export const loadPaymentAccount = (): Promise<PaymentAccount | null> => {
  accountCache ??= masterDataApi
    .getCatalog('PAYMENT_ACCOUNT')
    .then((res: any) => {
      const item = (res?.data || []).find((x: any) => x.isActive !== false);
      if (!item) return null;
      let data: any = {};
      try { data = JSON.parse(item.jsonData || '{}'); } catch { data = {}; }
      if (!data.bankBin || !data.accountNo) return null;
      return {
        bankBin: String(data.bankBin),
        bankName: String(data.bankName || item.nameVi || ''),
        accountNo: String(data.accountNo),
        accountName: String(data.accountName || item.name || '')
      };
    })
    .catch(() => {
      accountCache = null;
      return null;
    });
  return accountCache;
};

interface VietQrCodeProps {
  amount: number;
  /** Nội dung chuyển khoản (số phiếu dịch vụ / số container). */
  addInfo?: string;
  compact?: boolean;
  /** Chưa khai báo tài khoản nhận tiền thì không hiện gì (màn Thanh Toán) thay vì thông báo chưa cấu hình. */
  hideWhenNotConfigured?: boolean;
}

/** Mã QR chuyển khoản VietQR (có sẵn số tiền + nội dung) cho tài khoản nhận tiền của công ty. */
export const VietQrCode: React.FC<VietQrCodeProps> = ({ amount, addInfo, compact, hideWhenNotConfigured = false }) => {
  const [account, setAccount] = useState<PaymentAccount | null | undefined>(undefined);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let alive = true;
    void loadPaymentAccount().then((acc) => { if (alive) setAccount(acc); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!account) return;
    const payload = buildVietQrPayload({ bankBin: account.bankBin, accountNo: account.accountNo, amount, addInfo });
    QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, width: compact ? 160 : 260 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [account, amount, addInfo, compact]);

  if (account === undefined) {
    if (hideWhenNotConfigured) return null;
    return <div className="text-xs text-slate-500 text-center p-4">Đang tải tài khoản nhận tiền...</div>;
  }
  if (account === null) return hideWhenNotConfigured ? null : <VietQrNotConfigured compact={compact} />;

  const content = addInfo ? normalizeTransferContent(addInfo) : '';
  return (
    <div className={`mx-auto text-center rounded-2xl border border-slate-200 bg-white ${compact ? 'p-2 max-w-[180px]' : 'p-4 max-w-xs'} space-y-2`}>
      {qrDataUrl ? (
        <img src={qrDataUrl} alt="Mã VietQR chuyển khoản" className={`mx-auto ${compact ? 'w-36 h-36' : 'w-56 h-56'}`} />
      ) : (
        <div className={`mx-auto bg-slate-100 rounded ${compact ? 'w-36 h-36' : 'w-56 h-56'}`} />
      )}
      <div className={`font-mono font-black text-emerald-700 ${compact ? 'text-sm' : 'text-xl'}`}>{formatVND(amount)}</div>
      {!compact && (
        <div className="text-[11px] text-slate-600 space-y-0.5">
          <div className="font-bold text-slate-800">{account.bankName}</div>
          <div>
            STK: <strong className="font-mono">{account.accountNo}</strong>
          </div>
          <div className="font-semibold">{account.accountName}</div>
          {content && (
            <div>
              Nội dung: <strong className="font-mono">{content}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
