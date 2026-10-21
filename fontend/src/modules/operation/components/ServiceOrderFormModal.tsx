import React, { useState, useEffect } from 'react';
import { ServiceOrder, ServiceOrderItem, ServiceCategory } from '../types';
import { StandardTariffItem } from '../types';
import { masterDataApi, containerApi, customerApi, cleaningApi } from '../../../api';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatVND } from '../../../utils/format';
import {
  X,
  Plus,
  Trash2,
  Receipt,
  Printer,
  Truck,
  Building2,
  CreditCard,
  QrCode,
  Sparkles,
  ShieldCheck,
  Droplets,
  Wrench,
  Info
} from 'lucide-react';
import { useDepot } from '../../../context/DepotContext';
import { VietQrCode } from '../../../components/common/VietQrCode';
import { buildTransferContent } from '../../../utils/vietqr';
import { useContainerTypeOptions } from '../../masterdata/utils/containerTypeCatalog';
import { priceForContainer, TariffPriceResult } from '../../masterdata/utils/tariffPricing';

interface ServiceOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: ServiceOrder) => Promise<unknown>;
  /** Lưu phiếu rồi mở chứng từ để in ngay. */
  onSaveAndPrint?: (order: ServiceOrder, document: 'ORDER' | 'RECEIPT' | 'EEIR') => Promise<void>;
  prefillContainer?: {
    id?: string;
    containerNo: string;
    isoCode?: string;
    size?: string;
    type?: string;
    shippingLine?: string;
    licensePlate?: string;
    driverName?: string;
    driverPhone?: string;
    customerName?: string;
    gateInDate?: string;
    condition?: 'AV' | 'CL' | 'DM';
    surveyDetails?: any;
    cleaningDetails?: any;
  } | null;
  /** Chế độ lập phiếu mới (không mở từ hàng đợi): danh sách container đang trong bãi, chưa có phiếu dịch vụ. */
  selectableContainers?: Array<{ id: string; containerNo: string; shippingLine?: string; size?: string }>;
}

export const ServiceOrderFormModal: React.FC<ServiceOrderFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveAndPrint,
  prefillContainer,
  selectableContainers = []
}) => {
  const containerTypeOptions = useContainerTypeOptions();
  // Người thao tác = tài khoản đang đăng nhập thật (thay cho tên người mẫu viết cứng trước đây).
  const { loggedInUserProfile } = useDepot();
  const currentUserName = loggedInUserProfile?.fullName || loggedInUserProfile?.username || '';
  // Mọi thông tin container / khách hàng / xe / giám định lấy từ hồ sơ Gate-In trong DB — chỉ hiển thị, không gõ tay.
  const [containerNo, setContainerNo] = useState('');
  const [size, setSize] = useState('');
  const [type, setType] = useState('');
  const [shippingLine, setShippingLine] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerTaxCode, setCustomerTaxCode] = useState('');
  const [driverName, setDriverName] = useState('');
  const [truckPlate, setTruckPlate] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [condition, setCondition] = useState<'' | 'AV' | 'CL' | 'DM'>('');
  const [surveyNote, setSurveyNote] = useState('');
  const [surveyInfo, setSurveyInfo] = useState<{ surveyorName?: string; surveyDate?: string; damagesCount: number } | null>(null);
  const [cleaningNote, setCleaningNote] = useState('');
  const [cleaningStatus, setCleaningStatus] = useState<string>('NONE');
  const [notes] = useState('');
  const [gateInDate, setGateInDate] = useState<string>('');
  const [jobLoadedKey, setJobLoadedKey] = useState<string>('');
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);
  const itemsBuiltForRef = React.useRef<string>('');

  const [items, setItems] = useState<ServiceOrderItem[]>([]);

  // Selected new tariff line
  const [selectedTariffCode, setSelectedTariffCode] = useState<string>('');
  // Biểu cước nâng hạ chưa có giá cho cỡ container (hoặc loại không có trong DM) — báo, không thêm dòng giá 0 / giá thay thế.
  const [pricingWarning, setPricingWarning] = useState<string | null>(null);
  // Hạng mục của lệnh vệ sinh đã bàn giao Khai thác cho hồ sơ này — mỗi hạng mục 1 dòng trên phiếu (không gộp tổng).
  const [handedOverCleaning, setHandedOverCleaning] = useState<{ code: string; items: { cleaningCode: string; cleaningName: string }[] } | null>(null);

  // Trước đây handleSubmit/handleSaveAndGoToPayment gọi onSave rồi onClose() ngay lập tức, không await và
  // không bắt lỗi — nếu backend từ chối (container không có Job SQL, đã có phiếu dịch vụ rồi...) thì
  // Promise reject âm thầm trong console, modal vẫn đóng như đã lưu thành công, người dùng không biết phiếu
  // chưa hề được tạo. isSubmitting/submitError để chặn double-submit và báo lỗi thật cho người dùng.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Giá LOLO/STORAGE/CLEANING trước đây lấy từ GATE_IN_STANDARD_TARIFFS hardcode trong mockData.ts —
  // lệch hoàn toàn với bảng giá thật (ServiceTariff/StorageTariffRule/CLEANING_TARIFF) mà tab "Biểu Phí
  // Tariff Niêm Yết" bên cạnh đang hiển thị, khiến phiếu dịch vụ tính tiền sai so với biểu giá chính thức
  // đã cấu hình trong Master Data. PTI/REEFER_POWER/YARD_SHIFT/EXTRA chưa có bảng DB riêng (chưa tách
  // catalog) nên vẫn giữ hardcode — không bịa nguồn dữ liệu không tồn tại.
  const [realTariffs, setRealTariffs] = useState<StandardTariffItem[]>([]);
  useEffect(() => {
    const readJson = (value: unknown): Record<string, any> => {
      try { return JSON.parse(String(value || '{}')); } catch { return {}; }
    };
    Promise.all([
      masterDataApi.getServiceTariffs(),
      masterDataApi.getCleaningTariffs()
    ]).then(([loloRes, cleaningRes]: any[]) => {
      const lolo: StandardTariffItem[] = (loloRes.data || []).map((t: any) => ({
        code: t.code,
        name: t.nameVi || t.nameEn || t.code,
        // Phân loại theo ServiceTariff.ServiceCategory thật (PTI, giám sát hải quan, đảo chuyển, cân, phụ phí đêm...).
        category: t.serviceCategory === 'PTI' ? 'PTI' : t.serviceCategory === 'CUSTOMS' ? 'CUSTOMS' : t.serviceCategory === 'SHIFTING' ? 'YARD_SHIFT'
          : t.serviceCategory === 'WEIGHING' || t.serviceCategory === 'NIGHT_SURCHARGE' ? 'EXTRA' : 'LOLO',
        serviceCategory: t.serviceCategory,
        // Giá nâng hạ theo từng loại container của DM Loại Container (giống server, tariffPricing.ts) —
        // `rates` chỉ để giữ kiểu StandardTariffItem, không dùng cho dòng biểu cước nâng hạ.
        serviceTariff: { code: t.code, prices: t.prices || [] },
        unit: t.unit || 'Lần/Cont',
        rates: { '20DC': 0, '40DC': 0, '40HC': 0, '45HC': 0, '20RF': 0, '40HR': 0, DEFAULT: 0 },
        vatPercent: t.vatPercent ?? 8
      }));

      // Phí lưu bãi KHÔNG lập trên phiếu dịch vụ — hệ thống tự tính khi Gate-Out theo Cước Lưu Bãi (server cũng từ chối
      // hạng mục STORAGE, depot-fullstack-storage-tariff-pricing).

      // Biểu Phí Vệ Sinh (bảng CleaningTariffs): giá theo từng loại container của DM, tra bằng priceForContainer như dòng
      // nâng hạ — khoá đơn giá / VAT trên phiếu, server tra lại khi lưu (depot-fullstack-cleaning-tariff-pricing).
      const cleaning: StandardTariffItem[] = (cleaningRes.data || []).map((item: any) => ({
        code: item.code,
        name: item.nameVi || item.nameEn || item.code,
        category: 'CLEANING',
        serviceCategory: 'CLEANING',
        serviceTariff: { code: item.code, prices: item.prices || [] },
        unit: 'Cont',
        rates: { '20DC': 0, '40DC': 0, '40HC': 0, '45HC': 0, '20RF': 0, '40HR': 0, DEFAULT: 0 },
        vatPercent: item.vatPercent ?? 8
      }));

      setRealTariffs([...lolo, ...cleaning]);
    }).catch((error) => console.error('Không thể tải biểu phí Tariff thật từ backend:', error));
  }, []);

  const tariffCatalog = React.useMemo<StandardTariffItem[]>(
    () => realTariffs,
    [realTariffs]
  );

  // selectedTariffCode bắt đầu rỗng vì danh mục thật chỉ có sau khi fetch xong — tự chọn dòng đầu tiên
  // ngay khi có dữ liệu để dropdown + nút "Thêm Hạng Mục" luôn dùng được, không cần người dùng tự bấm chọn.
  useEffect(() => {
    if (!selectedTariffCode && tariffCatalog.length > 0) {
      setSelectedTariffCode(tariffCatalog[0].code);
    }
  }, [tariffCatalog, selectedTariffCode]);

  // Dòng phí tự động lấy ĐÚNG giá trong biểu cước thật (ServiceTariffs / CLEANING_TARIFF) theo cỡ container.
  // Trước đây khi không khớp biểu cước thì tự bịa giá (nâng hạ Reefer 350.000/520.000, vệ sinh 420.000/620.000,
  // PTI 650.000/850.000...) và form mới còn tự sinh số container ngẫu nhiên kèm 1 dòng 420.000đ. Nay không có giá
  // cấu hình thì KHÔNG thêm dòng — người dùng chọn thêm từ danh sách biểu phí.
  const priceFromTariff = (tariff: StandardTariffItem | undefined, sizeKey: string) =>
    tariff ? (tariff.rates[sizeKey as keyof typeof tariff.rates] || tariff.rates['DEFAULT'] || 0) : 0;
  // Biểu cước nâng hạ: tra đúng cột giá theo DM Loại Container, giá 0 = chưa có giá (server cũng tra lại khi lưu).
  // Lưu bãi / vệ sinh (ngoài phạm vi) vẫn theo `rates` như cũ.
  const tariffPrice = (tariff: StandardTariffItem, sizeKey: string): TariffPriceResult =>
    tariff.serviceTariff
      ? priceForContainer(tariff.serviceTariff, sizeKey, containerTypeOptions)
      : { ok: true, price: priceFromTariff(tariff, sizeKey) };
  const makeItem = (tariff: StandardTariffItem, price: number, remarks: string): ServiceOrderItem => ({
    id: 'ITM-' + Math.random().toString(36).substring(2, 7),
    serviceCode: tariff.code,
    serviceName: tariff.name,
    category: tariff.category as ServiceCategory,
    quantity: 1,
    unit: tariff.unit,
    unitPrice: price,
    vatPercent: tariff.vatPercent,
    amount: price,
    vatAmount: Math.round(price * (tariff.vatPercent / 100)),
    total: Math.round(price * (1 + tariff.vatPercent / 100)),
    remarks,
    locked: !!tariff.serviceTariff
  });

  // Mở form: số container lấy từ hàng đợi (prefill) hoặc chờ người dùng chọn trong danh sách.
  useEffect(() => {
    if (!isOpen) return;
    setContainerNo(prefillContainer?.containerNo || '');
    setItems([]);
    itemsBuiltForRef.current = '';
    setJobLoadedKey('');
    if (prefillContainer?.cleaningDetails) {
      setCleaningStatus(prefillContainer.cleaningDetails.status || 'COMPLETED');
      setCleaningNote(
        `Tiếp nhận từ Trạm Vệ Sinh: ${prefillContainer.cleaningDetails.cleaningType || ''} (Chi phí: ${(prefillContainer.cleaningDetails.totalCost || 0).toLocaleString('vi-VN')} đ)`
      );
    } else {
      setCleaningStatus('NONE');
      setCleaningNote('');
    }
  }, [prefillContainer, isOpen]);

  // Đọc hồ sơ Gate-In thật theo số container + danh mục khách hàng (tên, MST theo mã đơn vị vận tải lúc Gate-In).
  useEffect(() => {
    if (!isOpen || !containerNo) return;
    let alive = true;
    setJobLoading(true);
    setJobError(null);
    Promise.all([
      containerApi.getById(containerNo),
      customerApi.getAll().catch(() => ({ data: [] })),
      cleaningApi.getAll().catch(() => ({ data: [] }))
    ])
      .then(([jobRes, custRes, cleaningRes]: any[]) => {
        if (!alive) return;
        const job = jobRes?.data;
        if (!job) throw new Error('Không tìm thấy hồ sơ Gate-In của container này.');
        // Lệnh vệ sinh đã bàn giao gần nhất của đúng hồ sơ này (theo JobNo).
        const handed = ((cleaningRes?.data || []) as any[])
          .filter((r) => r.jobNo === job.jobNo && r.status === 'HANDOVER_TO_OPERATION')
          .sort((x, y) => String(y.code).localeCompare(String(x.code)))[0];
        setHandedOverCleaning(handed ? {
          code: handed.code,
          items: ((handed.items || handed.workItems || []) as any[]).map((i) => ({ cleaningCode: i.cleaningCode, cleaningName: i.cleaningName }))
        } : null);
        if (handed && !prefillContainer?.cleaningDetails) {
          setCleaningStatus('COMPLETED');
          setCleaningNote(`Tiếp nhận từ Trạm Vệ Sinh: lệnh ${handed.code} — ${((handed.items || handed.workItems || []) as any[]).map((i) => i.cleaningName).join(', ')}`);
        }
        const customer = (custRes?.data || []).find((c: any) => c?.code && c.code === job.gateInTruckingCompany);
        setShippingLine(job.shippingLineCode || '');
        setSize(job.isoSize || '');
        setType(job.isoSize || '');
        setTruckPlate(job.gateInTruckPlate || '');
        setDriverName(job.gateInDriverName || '');
        setDriverPhone(job.gateInDriverPhone || '');
        // Tên nhà xe lưu trên hồ sơ lúc Gate-In (gồm nhà xe vãng lai), rồi mới tra theo mã như hồ sơ cũ.
        setCustomerName(job.gateInTruckingName || customer?.name || job.gateInTruckingCompany || '');
        setCustomerTaxCode(customer?.taxCode || '');
        setGateInDate(job.gateInDate || '');
        const rating = job.survey?.conditionRating;
        const cond = rating === 'A' ? 'AV' : rating === 'B' ? 'CL' : rating ? 'DM' : '';
        setCondition(cond);
        if (job.survey) {
          const damagesCount = (job.survey.damages || []).length;
          setSurveyInfo({ surveyorName: job.survey.surveyorName, surveyDate: job.survey.surveyDate, damagesCount });
          setSurveyNote(
            [`Cấp ${rating || '—'}${cond ? ` (${cond})` : ''}`, `${damagesCount} hư hỏng`, job.survey.surveyorName ? `GĐV ${job.survey.surveyorName}` : '', job.survey.overallNotes || '']
              .filter(Boolean)
              .join(' · ')
          );
        } else {
          setSurveyInfo(null);
          setSurveyNote('');
        }
        setJobLoadedKey(`${containerNo}#${job.id}`);
      })
      .catch((error) => {
        if (alive) setJobError(getApiErrorMessage(error, 'Không đọc được hồ sơ Gate-In của container.'));
      })
      .finally(() => {
        if (alive) setJobLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isOpen, containerNo]);

  // Dòng phí tự động theo biểu phí thật, tạo 1 lần sau khi đã đọc hồ sơ và có biểu phí.
  useEffect(() => {
    if (!jobLoadedKey || tariffCatalog.length === 0 || containerTypeOptions.length === 0 || itemsBuiltForRef.current === jobLoadedKey) return;
    itemsBuiltForRef.current = jobLoadedKey;
    const initialItems: ServiceOrderItem[] = [];
    const sizeKey = size;
    const containerType = containerTypeOptions.find((t) => t.typeCode === sizeKey);
    const isReefer = String(containerType?.category || '').toUpperCase() === 'REEFER';
    setPricingWarning(null);

    // 1. Phí nâng hạ — biểu cước nhóm Nâng hạ vỏ rỗng (LIFT_EMPTY) đang dùng đầu tiên theo thứ tự (không lấy nhóm khác).
    //    Chưa có giá cho cỡ này → báo, không thêm dòng (server cũng từ chối).
    const lolo = tariffCatalog.find((t) => t.serviceCategory === 'LIFT_EMPTY');
    if (lolo) {
      const result = tariffPrice(lolo, sizeKey);
      if (result.ok) initialItems.push(makeItem(lolo, result.price, 'Tiếp nhận hạ bãi vỏ rỗng'));
      else setPricingWarning(`${result.reason} — nhập giá ở DANH MỤC MASTER DATA → Cước Nâng Hạ.`);
    }

    // 2. Phí vệ sinh — MỖI hạng mục của lệnh vệ sinh đã bàn giao là 1 dòng riêng, giá theo Biểu Phí Vệ Sinh (trước đây gộp
    //    tổng chi phí vào 1 dòng mang tên dịch vụ đầu tiên). Dịch vụ không còn / chưa có giá → báo, không thêm dòng.
    const cleaningWarnings: string[] = [];
    for (const work of handedOverCleaning?.items || []) {
      const tariff = tariffCatalog.find((t) => t.category === 'CLEANING' && t.code === work.cleaningCode);
      if (!tariff) { cleaningWarnings.push(`Dịch vụ vệ sinh ${work.cleaningCode} không còn trong Biểu Phí Vệ Sinh đang dùng`); continue; }
      const result = tariffPrice(tariff, sizeKey);
      if (result.ok) initialItems.push(makeItem(tariff, result.price, `Lệnh vệ sinh ${handedOverCleaning?.code}`));
      else cleaningWarnings.push(`${result.reason} — nhập giá ở DANH MỤC MASTER DATA → Biểu Phí Vệ Sinh Container`);
    }
    if (cleaningWarnings.length) setPricingWarning((prev) => [prev, ...cleaningWarnings].filter(Boolean).join(' · '));

    // 3. Phí PTI cho container lạnh — chỉ khi biểu cước có dịch vụ PTI.
    if (isReefer) {
      const pti = tariffCatalog.find((t) => t.serviceCategory === 'PTI');
      const ptiPrice = pti ? tariffPrice(pti, sizeKey) : null;
      if (pti && ptiPrice?.ok) initialItems.push(makeItem(pti, ptiPrice.price, 'Kiểm tra máy lạnh'));
    }
    setItems(initialItems);
  }, [jobLoadedKey, tariffCatalog, containerTypeOptions, handedOverCleaning]);

  // Mã ISO thật theo DM Loại Container (trước đây ghi lại chính mã loại, vd "45HC").
  const containerType = containerTypeOptions.find((t) => t.typeCode === size);
  const isoCode = containerType?.isoCode || '';

  if (!isOpen) return null;

  const handleAddItemFromTariff = () => {
    const tariff = tariffCatalog.find(t => t.code === selectedTariffCode);
    if (!tariff) return;

    const result = tariffPrice(tariff, size);
    if (!result.ok) {
      setPricingWarning(`${result.reason} — nhập giá ở DANH MỤC MASTER DATA → Cước Nâng Hạ.`);
      return;
    }
    setPricingWarning(null);
    const price = result.price;

    const newItem: ServiceOrderItem = {
      id: 'ITM-' + Math.random().toString(36).substring(2, 7),
      serviceCode: tariff.code,
      serviceName: tariff.name,
      category: tariff.category as ServiceCategory,
      quantity: 1,
      unit: tariff.unit,
      unitPrice: price,
      vatPercent: tariff.vatPercent,
      amount: price,
      vatAmount: Math.round(price * (tariff.vatPercent / 100)),
      total: Math.round(price * (1 + tariff.vatPercent / 100)),
      remarks: '',
      locked: !!tariff.serviceTariff
    };

    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof ServiceOrderItem, value: any) => {
    setItems(
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice' || field === 'vatPercent') {
            const qty = field === 'quantity' ? Number(value) : item.quantity;
            const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
            const vat = field === 'vatPercent' ? Number(value) : item.vatPercent;
            updated.amount = qty * price;
            updated.vatAmount = Math.round(updated.amount * (vat / 100));
            updated.total = updated.amount + updated.vatAmount;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const readonlyCls = 'w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-900 min-h-[36px]';
  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const totalVat = items.reduce((sum, i) => sum + i.vatAmount, 0);
  const grandTotal = subtotal + totalVat;

  // Phiếu dịch vụ dựng từ dữ liệu hồ sơ Gate-In đã đọc (không có giá trị bịa như "Giám Định Viên Depot",
  // "Xịt rửa áp lực 200 Bar" trước đây).
  const buildOrder = (): ServiceOrder => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const orderNo = 'SO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    return {
      id: 'SO-' + Math.random().toString(36).substring(2, 9),
      orderNo,
      containerId: prefillContainer?.id,
      containerNo: containerNo.toUpperCase().trim(),
      isoCode,
      size,
      type,
      shippingLine,
      customerName,
      customerTaxCode,
      driverName,
      truckPlate,
      driverPhone,
      gateInDate: gateInDate || now,
      createdAt: now,
      createdBy: currentUserName,
      condition: condition || undefined,
      surveyNote,
      cleaningNote,
      surveyRef: condition
        ? {
            condition,
            surveyor: surveyInfo?.surveyorName || '',
            surveyDate: surveyInfo?.surveyDate || '',
            damagesCount: surveyInfo?.damagesCount || 0,
            surveyNote
          }
        : undefined,
      cleaningRef: {
        cleaningStatus: (cleaningStatus as any) || 'NOT_REQUIRED',
        cleaningType: prefillContainer?.cleaningDetails?.cleaningType || 'Không yêu cầu',
        cleaningCost: items.find(i => i.category === 'CLEANING')?.total || 0,
        notes: cleaningNote
      },
      items,
      subtotal,
      totalVat,
      grandTotal,
      paymentStatus: 'UNPAID',
      qrPayload: '',
      qrImageUrl: '',
      notes,
      status: 'ISSUED'
    } as ServiceOrder;
  };

  const validateBeforeSave = () => {
    if (!containerNo.trim() || !jobLoadedKey) {
      alert('Chọn container (đã Gate-In) cần lập phiếu.');
      return false;
    }
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 hạng mục dịch vụ theo Tariff');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBeforeSave()) return;
    const newOrder = buildOrder();

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSave(newOrder);
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể lưu phiếu dịch vụ xuống hệ thống.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndPrint = async (document: 'ORDER' | 'RECEIPT' | 'EEIR') => {
    if (!validateBeforeSave()) return;
    const newOrder = buildOrder();

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      if (onSaveAndPrint) {
        await onSaveAndPrint(newOrder, document);
      } else {
        await onSave(newOrder);
      }
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể lưu phiếu dịch vụ xuống hệ thống.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 animate-fade-in">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-600/20 text-cyan-700 rounded-2xl border border-cyan-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>LẬP PHIẾU DỊCH VỤ GATE-IN THEO TARIFF</span>
                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 text-[11px] rounded-md font-mono">
                  3. KHAI THÁC GATE-IN (GATE-IN OPERATION)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Tiếp nhận dữ liệu từ Nghiệp vụ Giám Định & Vệ Sinh &bull; Tự động tính phí nâng hạ, lưu bãi, vệ sinh theo Biểu giá Tariff
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Dữ liệu container lấy từ hồ sơ Gate-In / Giám định / Vệ sinh — chỉ hiển thị */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                <span>1. Dữ Liệu Từ Gate-In, Giám Định &amp; Vệ Sinh</span>
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Tình trạng vỏ:</span>
                <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-900 rounded-lg font-bold">
                  {condition === 'AV' ? 'AV (Đạt chuẩn)' : condition === 'CL' ? 'CL (Cần vệ sinh)' : condition === 'DM' ? 'DM (Hư hỏng)' : 'Chưa giám định'}
                </span>
              </div>
            </div>

            {jobError && <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">{jobError}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Container No. *</label>
                {prefillContainer ? (
                  <div className={readonlyCls + ' font-mono font-bold'}>{containerNo}</div>
                ) : (
                  <select
                    value={containerNo}
                    onChange={(e) => setContainerNo(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-cyan-500 rounded-xl text-slate-900 font-mono font-bold focus:outline-none"
                  >
                    <option value="">{selectableContainers.length === 0 ? '— Không có container chờ lập phiếu —' : '— Chọn container đã Gate-In —'}</option>
                    {selectableContainers.map((c) => (
                      <option key={c.id} value={c.containerNo}>
                        {c.containerNo}{c.shippingLine ? ` — ${c.shippingLine}` : ''}{c.size ? ` (${c.size})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Hãng Tàu</label>
                <div className={readonlyCls + ' font-bold'}>{shippingLine || '—'}</div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Kích Cỡ / Loại</label>
                <div className={readonlyCls}>{size ? `${size}${containerType ? ' - ' + (containerType.name || containerType.vietnameseName) : ''}` : '—'}</div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Mã ISO Code</label>
                <div className={readonlyCls + ' font-mono'}>{isoCode || '—'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">1.1. Kết quả Giám Định (e-EIR)</label>
                <div className={readonlyCls}>{surveyNote || 'Chưa có phiếu giám định'}</div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">1.2. Kết quả Nghiệp Vụ Vệ Sinh</label>
                <div className={readonlyCls + ' text-cyan-700'}>{cleaningNote || 'Không có lệnh vệ sinh bàn giao'}</div>
              </div>
            </div>
            {jobLoading && <div className="text-[11px] text-slate-500">Đang đọc hồ sơ Gate-In...</div>}
          </div>

          {/* Section 2: Khách hàng / xe / tài xế theo hồ sơ Gate-In — chỉ hiển thị */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4" />
              <span>2. Khách Hàng / Đơn Vị Vận Tải &amp; Xe Đầu Kéo (theo Gate-In)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-500 font-semibold mb-1">Khách Hàng / Công Ty Vận Tải</label>
                <div className={readonlyCls + ' font-semibold'}>{customerName || '— (Gate-In không chọn đơn vị vận tải)'}</div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Mã Số Thuế (MST)</label>
                <div className={readonlyCls + ' font-mono'}>{customerTaxCode || '—'}</div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Biển Số Xe Kéo</label>
                <div className={readonlyCls + ' font-mono font-bold text-amber-700'}>{truckPlate || '—'}</div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Tên Tài Xế</label>
                <div className={readonlyCls}>{driverName || '—'}</div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Số Điện Thoại</label>
                <div className={readonlyCls + ' font-mono'}>{driverPhone || '—'}</div>
              </div>
            </div>
          </div>

          {/* Section 3: Tariff Line Items */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span>3. Các Khoản Thu Dịch Vụ Theo Biểu Giá Tariff</span>
              </h3>

              <div className="flex items-center gap-2">
                <select
                  value={selectedTariffCode}
                  onChange={(e) => setSelectedTariffCode(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none max-w-[260px]"
                >
                  {tariffCatalog.map((t) => (
                    <option key={t.code} value={t.code}>
                      + {t.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddItemFromTariff}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Hạng Mục</span>
                </button>
              </div>
            </div>

            {pricingWarning && (
              <div data-testid="pricing-warning" className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                {pricingWarning}
              </div>
            )}
            <p className="text-[11px] text-slate-500">Dòng nâng hạ và vệ sinh: đơn giá và VAT theo biểu cước / biểu phí, không sửa tay (chỉ sửa số lượng).</p>

            {/* Table of Items */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                    <th className="py-2.5 px-3">Dịch Vụ Tariff</th>
                    <th className="py-2.5 px-3 text-center w-20">ĐVT</th>
                    <th className="py-2.5 px-3 text-center w-20">Số Lượng</th>
                    <th className="py-2.5 px-3 text-right w-28">Đơn Giá</th>
                    <th className="py-2.5 px-3 text-center w-16">VAT %</th>
                    <th className="py-2.5 px-3 text-right w-32">Thành Tiền</th>
                    <th className="py-2.5 px-3 text-center w-12">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.serviceName}
                          onChange={(e) => handleUpdateItem(item.id, 'serviceName', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-medium focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                          className="w-16 px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs text-center focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                          className="w-16 px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs text-center focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="1000"
                          value={item.unitPrice}
                          disabled={item.locked}
                          title={item.locked ? 'Giá theo biểu cước nâng hạ — không sửa tay' : undefined}
                          onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                          className="w-24 px-1.5 py-1 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed bg-white border border-slate-200 rounded-lg text-emerald-700 font-mono font-bold text-xs text-right focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          value={item.vatPercent}
                          disabled={item.locked}
                          title={item.locked ? 'VAT theo biểu cước nâng hạ — không sửa tay' : undefined}
                          onChange={(e) => handleUpdateItem(item.id, 'vatPercent', e.target.value)}
                          className="w-12 px-1 py-1 disabled:bg-slate-100 disabled:cursor-not-allowed bg-white border border-slate-200 rounded-lg text-slate-500 text-xs text-center focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {formatVND(item.total)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Grand Total & VietQR Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Tiền Dịch Vụ Trước Thuế:</span>
                <span className="font-mono text-slate-700">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tiền Thuế VAT (8%):</span>
                <span className="font-mono text-slate-700">{formatVND(totalVat)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>TỔNG CỘNG THANH TOÁN:</span>
                <span className="font-mono text-emerald-700 text-xl font-black">{formatVND(grandTotal)}</span>
              </div>
              <p className="text-[11px] text-slate-500 italic pt-1">
                * Phiếu dịch vụ sau khi tạo chuyển sang trạng thái chờ thanh toán.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
              <VietQrCode compact amount={grandTotal} addInfo={buildTransferContent(customerName, containerNo)} />
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-700" />
                  <span>VietQR Tự Động</span>
                </div>
                <div className="text-slate-500 text-[11px]">Nội dung CK: <strong className="text-cyan-700 font-mono">{buildTransferContent(customerName, containerNo)}</strong></div>
                <div className="text-emerald-700 font-mono font-bold text-xs">{formatVND(grandTotal)}</div>
              </div>
            </div>
          </div>

          {/* Save Error Alert — hiện khi backend từ chối tạo phiếu (thiếu Job SQL, container đã có phiếu...) */}
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-700">
              <span className="font-semibold">{submitError}</span>
              <button type="button" onClick={() => setSubmitError(null)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>
          )}

          {/* Footer Submit Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy Bỏ
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Receipt className="w-4 h-4 text-cyan-700" />
                <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Phiếu Dịch Vụ'}</span>
              </button>

              {([
                ['ORDER', 'Lưu & In Phiếu DV', 'from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500'],
                ['RECEIPT', 'Lưu & In Phiếu Thu', 'from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500'],
                ['EEIR', 'Lưu & In e-EIR', 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500']
              ] as const).map(([doc, label, color]) => (
                <button
                  key={doc}
                  type="button"
                  onClick={() => void handleSaveAndPrint(doc)}
                  disabled={isSubmitting}
                  className={`flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r ${color} text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Printer className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang lưu...' : label}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
