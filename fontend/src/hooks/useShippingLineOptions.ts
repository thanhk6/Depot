import { useEffect, useState } from 'react';
import { masterDataApi } from '../api';

export interface ShippingLineOption {
  code: string;
  name: string;
}

// Danh mục Hãng Tàu thật (bảng ShippingLines) cho các ô chọn/lọc hãng tàu — thay các danh sách gõ cứng
// (MAERSK/MSC/EVERGREEN/HAPAG-LLOYD...) trước đây nằm rải rác ở từng màn. Dùng chung 1 lần tải cho cả phiên.
let cache: Promise<ShippingLineOption[]> | null = null;

export const fetchShippingLineOptions = (): Promise<ShippingLineOption[]> => {
  cache ??= masterDataApi.getShippingLines()
    .then((res: any) => (res?.data || []).map((l: any) => ({ code: String(l.code), name: String(l.name || l.code) })))
    .catch(() => { cache = null; return []; });
  return cache;
};

export const useShippingLineOptions = (): ShippingLineOption[] => {
  const [options, setOptions] = useState<ShippingLineOption[]>([]);
  useEffect(() => {
    let alive = true;
    fetchShippingLineOptions().then((list) => { if (alive) setOptions(list); });
    return () => { alive = false; };
  }, []);
  return options;
};
