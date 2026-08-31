import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle2,
  Copy,
  ExternalLink,
  Search,
  Filter,
  Tag,
  Radio
} from 'lucide-react';
import { NotificationTemplate } from '../../notifications/models/notification.types';
import { notificationService } from '../../notifications/services/notificationService';
import { MessagePreview } from '../../notifications/components/MessagePreview';

interface ZaloTemplatesPageProps {
  onSelectSend?: (templateId: string) => void;
}

export const ZaloTemplatesPage: React.FC<ZaloTemplatesPageProps> = ({ onSelectSend }) => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState<string>('ALL');

  useEffect(() => {
    const fetchTemplates = async () => {
      const data = await notificationService.getNotificationTemplates();
      // Filter Zalo templates
      const zaloOnly = data.filter((t) => t.channel === 'ZALO_OA' || t.channel === 'ZALO_ZNS');
      setTemplates(zaloOnly);
      if (zaloOnly.length > 0) {
        setSelectedTemplate(zaloOnly[0]);
      }
    };
    fetchTemplates();
  }, []);

  const filtered = templates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.titleTemplate.toLowerCase().includes(search.toLowerCase());
    const matchAudience = filterAudience === 'ALL' || t.targetAudience === filterAudience;
    return matchSearch && matchAudience;
  });

  return (
    <div className="space-y-6">
      {/* Top Title */}
      <div className="p-5 rounded-3xl bg-[#0b132b] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-amber-400" />
            <span>MẪU THÔNG BÁO ZALO OA & ZNS CHUẨN NGHIỆP VỤ EMR</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Các mẫu tin nhắn Zalo đã được phê duyệt tham số động (Dynamic Parameters) và tích hợp nút hành động
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm mẫu tin Zalo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả đối tượng</option>
            <option value="CUSTOMER">Khách Hàng (Hãng Tàu/Tài Xế)</option>
            <option value="EMPLOYEE">Nhân Viên Nội Bộ EMR</option>
          </select>
        </div>
      </div>

      {/* Grid: Template List (7 cols) | Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Template Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filtered.map((tmpl) => {
            const isSelected = selectedTemplate?.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-4 rounded-3xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#0e1b38] border-blue-500/80 shadow-xl shadow-blue-500/10'
                    : 'bg-[#0b132b] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{tmpl.code}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          tmpl.channel === 'ZALO_ZNS'
                            ? 'bg-blue-950 text-blue-300 border border-blue-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        }`}
                      >
                        {tmpl.channel}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tmpl.targetAudience === 'CUSTOMER'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {tmpl.targetAudience === 'CUSTOMER' ? 'Khách Hàng' : 'Nội Bộ'}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mt-1">{tmpl.name}</h3>
                  </div>

                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md shadow-blue-400" />
                  )}
                </div>

                <div className="mt-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-300 font-mono line-clamp-2">
                  {tmpl.contentTemplate}
                </div>

                {/* Variables Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] text-slate-500 font-bold">Biến động:</span>
                  {tmpl.variables.map((v) => (
                    <span
                      key={v}
                      className="px-2 py-0.5 bg-slate-800/80 rounded-md text-[10px] font-mono text-amber-300 border border-slate-700/60"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Zalo Smartphone Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Giao Diện Tin Nhắn Zalo Người Nhận</span>
            </span>
            <span className="text-[10px] text-sky-400 font-bold">Zalo OA Live Screen</span>
          </div>

          {selectedTemplate ? (
            <MessagePreview
              channel={selectedTemplate.channel}
              title={selectedTemplate.titleTemplate}
              content={selectedTemplate.contentTemplate}
              recipientName="Nguyễn Văn Hùng (Tài Xế)"
              recipientPhone="0912112233"
              ctaText={selectedTemplate.ctaButtonText}
              ctaUrl={selectedTemplate.ctaButtonUrl}
            />
          ) : (
            <div className="p-8 rounded-3xl bg-[#0b132b] border border-slate-800 text-center text-slate-500 text-xs">
              Chọn một mẫu tin để xem trước
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
