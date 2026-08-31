import React, { useState, useEffect } from 'react';
import { ServiceOrder, ServiceOrderItem, ServiceCategory } from '../types';
import { GATE_IN_STANDARD_TARIFFS, StandardTariffItem } from '../mockData';
import { masterDataApi } from '../../../api';
import { formatVND } from '../../../utils/format';
import {
  X,
  Plus,
  Trash2,
  Receipt,
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

interface ServiceOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: ServiceOrder) => Promise<void>;
  onSaveAndNavigateToPayment?: (order: ServiceOrder) => Promise<void>;
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
}

export const ServiceOrderFormModal: React.FC<ServiceOrderFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveAndNavigateToPayment,
  prefillContainer
}) => {
  const [containerNo, setContainerNo] = useState('');
  const [isoCode, setIsoCode] = useState('45G1');
  const [size, setSize] = useState('40HC');
  const [type, setType] = useState('Dry High Cube');
  const [shippingLine, setShippingLine] = useState('MSC');
  const [customerName, setCustomerName] = useState('Công ty Cổ Phần Tiếp Vận Quốc Tế');
  const [customerTaxCode, setCustomerTaxCode] = useState('0312345678');
  const [driverName, setDriverName] = useState('Nguyễn Văn Tiến');
  const [truckPlate, setTruckPlate] = useState('51C-992.10');
  const [driverPhone, setDriverPhone] = useState('0909123456');
  const [condition, setCondition] = useState<'AV' | 'CL' | 'DM'>('AV');
  const [surveyNote, setSurveyNote] = useState('');
  const [cleaningNote, setCleaningNote] = useState('');
  const [cleaningStatus, setCleaningStatus] = useState<string>('NONE');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<ServiceOrderItem[]>([]);

  // Selected new tariff line
  const [selectedTariffCode, setSelectedTariffCode] = useState<string>('');

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
      masterDataApi.getStorageTariffs(),
      masterDataApi.getCatalog('CLEANING_TARIFF')
    ]).then(([loloRes, storageRes, cleaningRes]: any[]) => {
      const lolo: StandardTariffItem[] = (loloRes.data || []).map((t: any) => ({
        code: t.code,
        name: t.nameVi || t.nameEn || t.code,
        category: 'LOLO',
        unit: t.unit || 'Lần/Cont',
        rates: {
          '20DC': t.price20GP || 0, '40DC': t.price40HC || 0, '40HC': t.price40HC || 0,
          '45HC': t.price45HC || 0, '20RF': t.price20RF || 0, '40HR': t.price40RH || 0,
          DEFAULT: t.priceSpecial || t.price40HC || 0
        },
        vatPercent: t.vatPercent ?? 8
      }));

      // Cước lưu bãi tính theo bậc thang ngày (tiers) — mỗi tier hiện thành 1 dòng chọn riêng trong
      // dropdown (kèm khoảng ngày áp dụng trong tên) thay vì cố tính tự động số ngày lưu bãi thực tế,
      // để nhân viên Gate-In tự chọn đúng bậc rồi tự nhập số lượng ngày ở cột Số Lượng như các hạng mục khác.
      const storage: StandardTariffItem[] = (storageRes.data || []).flatMap((rule: any) =>
        (rule.tiers || []).map((tier: any, idx: number) => ({
          code: `${rule.code}_T${idx + 1}`,
          name: `Lưu bãi ${rule.code}${rule.shippingLineCode && rule.shippingLineCode !== 'ALL' ? ' - ' + rule.shippingLineCode : ''} (${tier.tierName || `Ngày ${tier.fromDay}-${tier.toDay ?? '∞'}`})`,
          category: 'STORAGE',
          unit: rule.calculationUnit || 'Cont/Ngày',
          rates: {
            '20DC': tier.price20Dry || 0, '40DC': tier.price40Dry || 0, '40HC': tier.price40Dry || 0,
            '45HC': tier.price45Dry || 0, '20RF': tier.price20Reefer || 0, '40HR': tier.price40Reefer || 0,
            DEFAULT: tier.priceSpecial || tier.price40Dry || 0
          },
          vatPercent: rule.vatPercent ?? 8
        }))
      );

      const cleaning: StandardTariffItem[] = (cleaningRes.data || []).map((item: any) => {
        const data = readJson(item.jsonData);
        return {
          code: item.code,
          name: item.nameVi || item.name || item.code,
          category: 'CLEANING',
          unit: 'Cont',
          rates: {
            '20DC': data.price20DC || 0, '40DC': data.price40DC || 0, '40HC': data.price40HC || 0,
            '45HC': data.price45HC || 0, '20RF': data.price20RF || 0, '40HR': data.price40HR || 0,
            DEFAULT: data.price40HC || 0
          },
          vatPercent: data.vatPercent ?? 8
        };
      });

      setRealTariffs([...lolo, ...storage, ...cleaning]);
    }).catch((error) => console.error('Không thể tải biểu phí Tariff thật từ backend:', error));
  }, []);

  const tariffCatalog = React.useMemo<StandardTariffItem[]>(
    () => [...realTariffs, ...GATE_IN_STANDARD_TARIFFS.filter((t) => !['LOLO', 'STORAGE', 'CLEANING'].includes(t.category))],
    [realTariffs]
  );

  // selectedTariffCode bắt đầu rỗng vì danh mục thật chỉ có sau khi fetch xong — tự chọn dòng đầu tiên
  // ngay khi có dữ liệu để dropdown + nút "Thêm Hạng Mục" luôn dùng được, không cần người dùng tự bấm chọn.
  useEffect(() => {
    if (!selectedTariffCode && tariffCatalog.length > 0) {
      setSelectedTariffCode(tariffCatalog[0].code);
    }
  }, [tariffCatalog, selectedTariffCode]);

  useEffect(() => {
    if (prefillContainer) {
      setContainerNo(prefillContainer.containerNo || '');
      setIsoCode(prefillContainer.isoCode || '45G1');
      setSize(prefillContainer.size || '40HC');
      setType(prefillContainer.type || 'Dry High Cube');
      setShippingLine(prefillContainer.shippingLine || 'MSC');
      setCustomerName(prefillContainer.customerName || `Khách hàng đại diện Hãng ${prefillContainer.shippingLine || 'Tàu'}`);
      setDriverName(prefillContainer.driverName || 'Tài xế giao nhận');
      setTruckPlate(prefillContainer.licensePlate || '51C-000.00');
      setDriverPhone(prefillContainer.driverPhone || '0909000111');
      setCondition(prefillContainer.condition || 'AV');
      setSurveyNote(
        prefillContainer.condition === 'DM'
          ? 'Phát hiện hư hỏng cấu kiện IICL-6 tại cổng giám định'
          : prefillContainer.condition === 'CL'
          ? 'Yêu cầu xịt rửa vệ sinh theo biên bản giám định e-EIR'
          : 'Vỏ đạt chuẩn cấp AV sạch đẹp'
      );

      if (prefillContainer.cleaningDetails) {
        setCleaningStatus(prefillContainer.cleaningDetails.status || 'COMPLETED');
        setCleaningNote(
          `Tiếp nhận từ Trạm Vệ Sinh: ${prefillContainer.cleaningDetails.cleaningType || 'Xịt rửa hóa chất & nước nóng'} (Chi phí: ${(prefillContainer.cleaningDetails.totalCost || 0).toLocaleString('vi-VN')} đ)`
        );
      } else if (prefillContainer.condition === 'CL') {
        setCleaningStatus('IN_CLEANING');
        setCleaningNote('Chuyển trạm xịt rửa vệ sinh theo chỉ định giám định');
      } else {
        setCleaningStatus('NONE');
        setCleaningNote('Container chuẩn AV - Không yêu cầu vệ sinh');
      }

      // Auto generate standard items from tariff
      const initialItems: ServiceOrderItem[] = [];
      const isReefer =
        prefillContainer.type?.toLowerCase().includes('reefer') ||
        prefillContainer.size?.includes('RF') ||
        prefillContainer.size?.includes('HR');

      // 1. Phí Nâng Hạ (Lift-Off Gate-In)
      const loloTariff = tariffCatalog.find(t => t.category === 'LOLO');
      const sizeKey = (prefillContainer.size || '40HC') as any;
      const loloPrice = isReefer
        ? (sizeKey.includes('20') ? 350000 : 520000)
        : (loloTariff?.rates[sizeKey as keyof typeof loloTariff.rates] || (sizeKey.includes('20') ? 280000 : 420000));

      initialItems.push({
        id: 'ITM-' + Math.random().toString(36).substring(2, 7),
        serviceCode: 'LOLO_MT_NORMAL',
        serviceName: `Phí nâng hạ vỏ rỗng Gate-In (${prefillContainer.size || '40HC'})`,
        category: 'LOLO',
        quantity: 1,
        unit: 'Lần',
        unitPrice: loloPrice,
        vatPercent: 8,
        amount: loloPrice,
        vatAmount: Math.round(loloPrice * 0.08),
        total: Math.round(loloPrice * 1.08),
        remarks: 'Tiếp nhận hạ bãi vỏ rỗng'
      });

      // 2. Phí Vệ Sinh nếu CL hoặc có cleaningDetails
      if (prefillContainer.condition === 'CL' || prefillContainer.cleaningDetails) {
        const cleanPrice = prefillContainer.cleaningDetails?.totalCost || (isReefer ? 620000 : 420000);
        initialItems.push({
          id: 'ITM-' + Math.random().toString(36).substring(2, 7),
          serviceCode: isReefer ? 'CLEAN_CHEM_HOT' : 'CLEAN_WASH_200BAR',
          serviceName: isReefer ? 'Phí tẩy rửa hóa chất & khử mùi vi sinh Reefer' : 'Phí xịt rửa nước áp lực cao 200 Bar',
          category: 'CLEANING',
          quantity: 1,
          unit: 'Cont',
          unitPrice: cleanPrice,
          vatPercent: 8,
          amount: cleanPrice,
          vatAmount: Math.round(cleanPrice * 0.08),
          total: Math.round(cleanPrice * 1.08),
          remarks: 'Tiếp nhận từ Nghiệp vụ Vệ sinh'
        });
      }

      // 3. Phí PTI nếu Reefer
      if (isReefer) {
        const ptiPrice = sizeKey.includes('20') ? 650000 : 850000;
        initialItems.push({
          id: 'ITM-' + Math.random().toString(36).substring(2, 7),
          serviceCode: 'PTI_REEFER_STD',
          serviceName: 'Kiểm tra kỹ thuật máy lạnh trước chuyến (PTI Test)',
          category: 'PTI',
          quantity: 1,
          unit: 'Cont',
          unitPrice: ptiPrice,
          vatPercent: 8,
          amount: ptiPrice,
          vatAmount: Math.round(ptiPrice * 0.08),
          total: Math.round(ptiPrice * 1.08),
          remarks: 'Kiểm tra máy lạnh'
        });
      }

      setItems(initialItems);
    } else {
      // Default new form
      setContainerNo('TGHU' + Math.floor(1000000 + Math.random() * 9000000));
      setItems([
        {
          id: 'ITM-01',
          serviceCode: 'LOLO_MT_NORMAL',
          serviceName: 'Phí nâng hạ vỏ rỗng Gate-In (Lift-Off 40HC)',
          category: 'LOLO',
          quantity: 1,
          unit: 'Lần',
          unitPrice: 420000,
          vatPercent: 8,
          amount: 420000,
          vatAmount: 33600,
          total: 453600,
          remarks: 'Tiếp nhận hạ vỏ rỗng tại bãi'
        }
      ]);
    }
  }, [prefillContainer, isOpen]);

  if (!isOpen) return null;

  const handleAddItemFromTariff = () => {
    const tariff = tariffCatalog.find(t => t.code === selectedTariffCode);
    if (!tariff) return;

    const sizeKey = (size || '40HC') as any;
    const price = tariff.rates[sizeKey as keyof typeof tariff.rates] || tariff.rates['DEFAULT'] || 200000;

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
      remarks: ''
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

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const totalVat = items.reduce((sum, i) => sum + i.vatAmount, 0);
  const grandTotal = subtotal + totalVat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerNo.trim()) {
      alert('Vui lòng nhập Số Container');
      return;
    }
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 hạng mục dịch vụ theo Tariff');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const orderNo = 'SO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const newOrder: ServiceOrder = {
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
      gateInDate: prefillContainer?.gateInDate || now,
      createdAt: now,
      createdBy: 'Lê Hoàng Nam (Khai Thác Cổng)',
      condition,
      surveyNote,
      cleaningNote,
      surveyRef: {
        condition,
        surveyor: prefillContainer?.surveyDetails?.surveyorName || 'Giám Định Viên Depot',
        surveyDate: prefillContainer?.surveyDetails?.surveyDate || now,
        damagesCount: prefillContainer?.surveyDetails?.damages?.length || 0,
        surveyNote
      },
      cleaningRef: {
        cleaningStatus: (cleaningStatus as any) || 'NOT_REQUIRED',
        cleaningType: condition === 'CL' ? 'Xịt rửa áp lực 200 Bar' : 'Không yêu cầu',
        cleaningCost: items.find(i => i.category === 'CLEANING')?.total || 0,
        notes: cleaningNote
      },
      items,
      subtotal,
      totalVat,
      grandTotal,
      paymentStatus: 'UNPAID',
      qrPayload: `STB_SOLUTION_DEPOT_${containerNo.toUpperCase()}_${grandTotal}`,
      qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STB_SOLUTION_DEPOT_${containerNo.toUpperCase()}_${grandTotal}`,
      notes,
      status: 'ISSUED'
    };

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

  const handleSaveAndGoToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerNo.trim()) {
      alert('Vui lòng nhập Số Container');
      return;
    }
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 hạng mục dịch vụ theo Tariff');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const orderNo = 'SO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const newOrder: ServiceOrder = {
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
      gateInDate: prefillContainer?.gateInDate || now,
      createdAt: now,
      createdBy: 'Lê Hoàng Nam (Khai Thác Cổng)',
      condition,
      surveyNote,
      cleaningNote,
      surveyRef: {
        condition,
        surveyor: prefillContainer?.surveyDetails?.surveyorName || 'Giám Định Viên Depot',
        surveyDate: prefillContainer?.surveyDetails?.surveyDate || now,
        damagesCount: prefillContainer?.surveyDetails?.damages?.length || 0,
        surveyNote
      },
      cleaningRef: {
        cleaningStatus: (cleaningStatus as any) || 'NOT_REQUIRED',
        cleaningType: condition === 'CL' ? 'Xịt rửa áp lực 200 Bar' : 'Không yêu cầu',
        cleaningCost: items.find(i => i.category === 'CLEANING')?.total || 0,
        notes: cleaningNote
      },
      items,
      subtotal,
      totalVat,
      grandTotal,
      paymentStatus: 'UNPAID',
      qrPayload: `STB_SOLUTION_DEPOT_${containerNo.toUpperCase()}_${grandTotal}`,
      qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STB_SOLUTION_DEPOT_${containerNo.toUpperCase()}_${grandTotal}`,
      notes,
      status: 'ISSUED'
    };

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      if (onSaveAndNavigateToPayment) {
        await onSaveAndNavigateToPayment(newOrder);
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
          {/* Section 1: Intake from Survey & Cleaning */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                <span>1. Tiếp Nhận Dữ Liệu Từ Nghiệp Vụ Giám Định & Vệ Sinh</span>
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Tình trạng vỏ:</span>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-900 rounded-lg font-bold text-xs"
                >
                  <option value="AV">AV (Sạch sẽ đạt chuẩn cấp)</option>
                  <option value="CL">CL (Cần xịt rửa vệ sinh)</option>
                  <option value="DM">DM (Hư hỏng cần sửa EMR)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Container No. *</label>
                <input
                  type="text"
                  required
                  value={containerNo}
                  onChange={(e) => setContainerNo(e.target.value.toUpperCase())}
                  placeholder="MSCU1234567"
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-cyan-500 rounded-xl text-slate-900 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Hãng Tàu</label>
                <input
                  type="text"
                  value={shippingLine}
                  onChange={(e) => setShippingLine(e.target.value)}
                  placeholder="MSC, MAERSK, CMA..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-cyan-500 rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Kích Cỡ ISO</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none"
                >
                  <option value="20DC">20' DC (Dry General)</option>
                  <option value="40DC">40' DC (Dry General)</option>
                  <option value="40HC">40' HC (High Cube)</option>
                  <option value="45HC">45' HC (High Cube)</option>
                  <option value="20RF">20' RF (Reefer Lạnh)</option>
                  <option value="40HR">40' HR (Reefer Lạnh)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Mã ISO Code</label>
                <input
                  type="text"
                  value={isoCode}
                  onChange={(e) => setIsoCode(e.target.value)}
                  placeholder="45G1, 22G1, 45R1..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-500 text-xs font-semibold mb-1">
                  1.1. Kết quả từ Giám Định (e-EIR)
                </label>
                <input
                  type="text"
                  value={surveyNote}
                  onChange={(e) => setSurveyNote(e.target.value)}
                  placeholder="Ghi chú tình trạng vỏ từ Giám định viên..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-xs font-semibold mb-1">
                  1.2. Kết quả từ Nghiệp Vụ Vệ Sinh
                </label>
                <input
                  type="text"
                  value={cleaningNote}
                  onChange={(e) => setCleaningNote(e.target.value)}
                  placeholder="Dữ liệu trạm xịt rửa / nghiệm thu vệ sinh..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-cyan-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Customer & Driver Info */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4" />
              <span>2. Thông Tin Khách Hàng / Đơn Vị Vận Tải & Xe Đầu Kéo</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-500 font-semibold mb-1">Khách Hàng / Công Ty Vận Tải *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Công ty CP Logistics..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 font-semibold rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Mã Số Thuế (MST)</label>
                <input
                  type="text"
                  value={customerTaxCode}
                  onChange={(e) => setCustomerTaxCode(e.target.value)}
                  placeholder="0312345678"
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 font-mono rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Biển Số Xe Kéo *</label>
                <input
                  type="text"
                  required
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                  placeholder="51C-889.12"
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-amber-700 font-mono font-bold rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Tên Tài Xế</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="0909xxxxxx"
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 font-mono rounded-xl focus:outline-none"
                />
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
                          onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                          className="w-24 px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-emerald-700 font-mono font-bold text-xs text-right focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          value={item.vatPercent}
                          onChange={(e) => handleUpdateItem(item.id, 'vatPercent', e.target.value)}
                          className="w-12 px-1 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 text-xs text-center focus:outline-none"
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
                * Phiếu dịch vụ sau khi tạo sẽ kích hoạt tạo mã VietQR Napas247 và chuyển sang trạng thái chờ thanh toán.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
              <div className="p-2 bg-white rounded-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=STB_DEPOT_${containerNo}_${grandTotal}`}
                  alt="VietQR Demo"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-700" />
                  <span>VietQR Tự Động</span>
                </div>
                <div className="text-slate-500 text-[11px]">Nội dung CK: <strong className="text-cyan-700 font-mono">{containerNo}</strong></div>
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

              <button
                type="button"
                onClick={handleSaveAndGoToPayment}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang lưu...' : 'Lập Phiếu & Chuyển Sang Thanh Toán'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
