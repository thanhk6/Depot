// Dựng chuỗi VietQR (chuẩn EMVCo / NAPAS 247) để vẽ mã QR chuyển khoản ngay trên trình duyệt — không gửi số tài
// khoản/số tiền ra dịch vụ bên ngoài. App ngân hàng quét sẽ tự điền: ngân hàng, số tài khoản, số tiền, nội dung.

const tlv = (id: string, value: string) => `${id}${String(value.length).padStart(2, '0')}${value}`;

// CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) — trường 63 của EMVCo.
const crc16 = (input: string) => {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

/** Nội dung chuyển khoản: bỏ dấu tiếng Việt + ký tự đặc biệt (nhiều ngân hàng không nhận), tối đa 50 ký tự. */
export const normalizeTransferContent = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9 -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50);

/**
 * Nội dung chuyển khoản = tên công ty khách hàng + số container. Giới hạn 50 ký tự: rút gọn phần tên công ty,
 * luôn giữ nguyên số container để đối chiếu.
 */
export const buildTransferContent = (companyName: string | null | undefined, containerNo: string) => {
  const cont = normalizeTransferContent(containerNo || '');
  const company = normalizeTransferContent(companyName || '');
  if (!company) return cont;
  const room = 50 - cont.length - 1;
  return room > 0 ? `${company.slice(0, room).trim()} ${cont}` : cont;
};

export interface VietQrInput {
  /** Mã BIN ngân hàng theo NAPAS (Techcombank = 970407). */
  bankBin: string;
  accountNo: string;
  /** Số tiền VND (số nguyên). Bỏ trống = QR tĩnh, người chuyển tự nhập tiền. */
  amount?: number;
  /** Nội dung chuyển khoản. */
  addInfo?: string;
}

export const buildVietQrPayload = ({ bankBin, accountNo, amount, addInfo }: VietQrInput): string => {
  const beneficiary = tlv('00', bankBin) + tlv('01', accountNo);
  const merchantAccount = tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA');
  const hasAmount = amount != null && amount > 0;
  let payload =
    tlv('00', '01') +
    tlv('01', hasAmount ? '12' : '11') +
    tlv('38', merchantAccount) +
    tlv('53', '704') +
    (hasAmount ? tlv('54', String(Math.round(amount!))) : '') +
    tlv('58', 'VN');
  const content = addInfo ? normalizeTransferContent(addInfo) : '';
  if (content) payload += tlv('62', tlv('08', content));
  payload += '6304';
  return payload + crc16(payload);
};
