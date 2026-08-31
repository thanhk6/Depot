import React, { useState } from 'react';
import {
  FileText,
  Save,
  ArrowLeft,
  Sparkles,
  Smartphone,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  Radio
} from 'lucide-react';
import {
  NotificationTemplate,
  NotificationChannel,
  BusinessEventType,
  RecipientType
} from '../models/notification.types';
import { notificationService } from '../services/notificationService';
import { MessagePreview } from '../components/MessagePreview';

interface NotificationTemplateCreateProps {
  onBack: () => void;
  onSaved: () => void;
  editingTemplate?: NotificationTemplate | null;
}

export const NotificationTemplateCreate: React.FC<NotificationTemplateCreateProps> = ({
  onBack,
  onSaved,
  editingTemplate
}) => {
  const [name, setName] = useState(editingTemplate?.name || '');
  const [code, setCode] = useState(editingTemplate?.code || '');
  const [eventType, setEventType] = useState<BusinessEventType>(
    editingTemplate?.eventType || 'GATE_IN_COMPLETED'
  );
  const [targetAudience, setTargetAudience] = useState<RecipientType>(
    editingTemplate?.targetAudience || 'CUSTOMER'
  );
  const [channel, setChannel] = useState<NotificationChannel>(
    editingTemplate?.channel || 'ZALO_OA'
  );
  const [titleTemplate, setTitleTemplate] = useState(
    editingTemplate?.titleTemplate || '🟢 [GATE-IN THÀNH CÔNG] - Container {{ContainerNumber}}'
  );
  const [contentTemplate, setContentTemplate] = useState(
    editingTemplate?.contentTemplate ||
      'Kính gửi Quý Hãng tàu {{CustomerName}},\n\nContainer: {{ContainerNumber}} ({{ContainerSize}})\nĐã hoàn tất hạ bãi Depot lúc: {{GateInTime}}\nVị trí lưu bãi: {{YardLocation}}\nSố xe vận chuyển: {{LicensePlate}}\n\nDepot đang tiến hành khảo sát giám định e-EIR.'
  );
  const [ctaButtonText, setCtaButtonText] = useState(
    editingTemplate?.ctaButtonText || 'Tra Cứu Chi Tiết Container'
  );
  const [ctaButtonUrl, setCtaButtonUrl] = useState(
    editingTemplate?.ctaButtonUrl || 'https://depot.emr.vn/tracking'
  );
  const [isActive, setIsActive] = useState(editingTemplate?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  // Available tag placeholders
  const sampleVariables = [
    { tag: '{{ContainerNumber}}', label: 'Số Container' },
    { tag: '{{CustomerName}}', label: 'Tên Khách Hàng' },
    { tag: '{{ContainerSize}}', label: 'Kích Cỡ Cont' },
    { tag: '{{GateInTime}}', label: 'Thời Gian Gate-In' },
    { tag: '{{YardLocation}}', label: 'Vị Trí Bãi' },
    { tag: '{{LicensePlate}}', label: 'Biển Số Xe' },
    { tag: '{{DriverName}}', label: 'Tên Tài Xế' },
    { tag: '{{EstimateNo}}', label: 'Mã Estimate' },
    { tag: '{{WorkOrderNo}}', label: 'Mã Lệnh Sửa Chữa' },
    { tag: '{{Amount}}', label: 'Số Tiền' },
    { tag: '{{Status}}', label: 'Trạng Thái' },
    { tag: '{{InspectorName}}', label: 'Người Giám Định / QC' }
  ];

  const handleInsertTag = (tag: string) => {
    setContentTemplate((prev) => prev + ` ${tag}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      alert('Vui lòng nhập Tên mẫu và Mã mẫu!');
      return;
    }

    setSaving(true);
    try {
      if (editingTemplate) {
        await notificationService.updateNotificationTemplate(editingTemplate.id, {
          name,
          code,
          eventType,
          targetAudience,
          channel,
          titleTemplate,
          contentTemplate,
          ctaButtonText,
          ctaButtonUrl,
          isActive
        });
      } else {
        await notificationService.createNotificationTemplate({
          code,
          name,
          eventType,
          targetAudience,
          channel,
          titleTemplate,
          contentTemplate,
          variables: sampleVariables.map((v) => v.tag),
          ctaButtonText,
          ctaButtonUrl,
          isActive
        });
      }
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh Sách Mẫu</span>
        </button>

        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>{editingTemplate ? 'CHỈNH SỬA MẪU THÔNG BÁO' : 'TẠO MỚI MẪU THÔNG BÁO ZALO'}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Left Area (7 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-4">
          <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white pb-3 border-b border-slate-800">
              1. THÔNG TIN CƠ BẢN MẪU TIN
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tên Mẫu Thông Báo <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Thông Báo Gate-In Xe Vào Cổng"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mã Mẫu (Template Code) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="VD: TMPL_GATE_IN_01"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Loại Sự Kiện Nghiệp Vụ
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as BusinessEventType)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="GATE_IN_COMPLETED">Gate-In Container Vào Cổng</option>
                  <option value="INSPECTION_COMPLETED">Giám Định e-EIR Hoàn Tất</option>
                  <option value="ESTIMATE_CREATED">Phát Hành Báo Giá Sửa Chữa (Estimate)</option>
                  <option value="ESTIMATE_APPROVED">Báo Giá Đã Được Hãng Tàu Duyệt</option>
                  <option value="ESTIMATE_REJECTED">Báo Giá Bị Từ Chối</option>
                  <option value="WORK_ORDER_CREATED">Phát Hành Lệnh Sửa Chữa (WO)</option>
                  <option value="MATERIAL_REQUESTED">Yêu Cầu Xuất Kho Vật Tư</option>
                  <option value="MATERIAL_ISSUED">Đã Cấp Phát Vật Tư EMR</option>
                  <option value="REPAIR_COMPLETED">Sửa Chữa Xong Container</option>
                  <option value="QC_PASSED">QC Nghiệm Thu Đạt Chuẩn AV</option>
                  <option value="QC_FAILED">QC Nghiệm Thu Không Đạt</option>
                  <option value="GATE_OUT_READY">Sẵn Sàng Cấp Vỏ (Gate-Out)</option>
                  <option value="PAYMENT_RECEIVED">Nhận Thanh Toán VietQR</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Kênh Phát Tin</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as NotificationChannel)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ZALO_OA">🟢 Zalo Official Account (OA)</option>
                  <option value="ZALO_ZNS">🔵 Zalo ZNS Template (CSKH)</option>
                  <option value="IN_APP">🟣 Hệ Thống In-App</option>
                  <option value="SMS">🟠 Tin Nhắn SMS</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Tiêu Đề Thông Báo (Header Title)
              </label>
              <input
                type="text"
                value={titleTemplate}
                onChange={(e) => setTitleTemplate(e.target.value)}
                placeholder="VD: 🟢 [GATE-IN THÀNH CÔNG] - Container {{ContainerNumber}}"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            {/* Content & Tag Injection Bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Nội Dung Chi Tiết (Body Message)
                </label>
                <span className="text-[10px] text-amber-400">Click tag bên dưới để chèn nhanh</span>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl mb-2">
                {sampleVariables.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleInsertTag(v.tag)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-[10px] font-bold border border-slate-700 flex items-center gap-1 transition cursor-pointer active:scale-95"
                  >
                    <Plus className="w-2.5 h-2.5 text-sky-400" />
                    <span>{v.tag}</span>
                  </button>
                ))}
              </div>

              <textarea
                rows={7}
                value={contentTemplate}
                onChange={(e) => setContentTemplate(e.target.value)}
                placeholder="Nhập nội dung mẫu thông báo..."
                className="w-full p-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
              />
            </div>

            {/* CTA Button Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nhãn Nút Bấm Hành Động (CTA Label)
                </label>
                <input
                  type="text"
                  value={ctaButtonText}
                  onChange={(e) => setCtaButtonText(e.target.value)}
                  placeholder="VD: Tra Cứu Chi Tiết Container"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Đường Dẫn Liên Kết (CTA Url)
                </label>
                <input
                  type="text"
                  value={ctaButtonUrl}
                  onChange={(e) => setCtaButtonUrl(e.target.value)}
                  placeholder="https://depot.emr.vn/..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>Kích hoạt mẫu này ngay</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-600/30 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Đang lưu...' : 'Lưu Mẫu Thông Báo'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Right Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Xem Trước Mẫu Tin Zalo</span>
            </span>
          </div>

          <MessagePreview
            channel={channel}
            title={titleTemplate}
            content={contentTemplate}
            recipientName="MAERSK LINE VIỆT NAM"
            recipientPhone="0903888999"
            ctaText={ctaButtonText}
            ctaUrl={ctaButtonUrl}
          />
        </div>
      </div>
    </div>
  );
};
