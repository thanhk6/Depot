import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Send,
  Layers,
  Sparkles,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { NotificationTemplate } from '../models/notification.types';
import { notificationService } from '../services/notificationService';
import { ChannelBadge } from '../components/NotificationStatus';
import { NotificationTemplateCreate } from './NotificationTemplateCreate';

interface NotificationTemplatesProps {
  onSelectSendWithTemplate?: (templateId: string) => void;
}

export const NotificationTemplates: React.FC<NotificationTemplatesProps> = ({
  onSelectSendWithTemplate
}) => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotificationTemplates();
      setTemplates(data);
      if (data.length > 0 && !previewTemplate) {
        setPreviewTemplate(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredList = useMemo(() => {
    return templates.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.eventType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchChannel = channelFilter === 'ALL' || t.channel === channelFilter;
      const matchAudience = audienceFilter === 'ALL' || t.targetAudience === audienceFilter;
      return matchSearch && matchChannel && matchAudience;
    });
  }, [templates, searchTerm, channelFilter, audienceFilter]);

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mẫu thông báo này?')) {
      await notificationService.deleteNotificationTemplate(id);
      loadData();
    }
  };

  const handleToggleStatus = async (tmpl: NotificationTemplate) => {
    await notificationService.updateNotificationTemplate(tmpl.id, {
      isActive: !tmpl.isActive
    });
    loadData();
  };

  if (isCreating || editingTemplate) {
    return (
      <NotificationTemplateCreate
        onBack={() => {
          setIsCreating(false);
          setEditingTemplate(null);
        }}
        onSaved={() => {
          setIsCreating(false);
          setEditingTemplate(null);
          loadData();
        }}
        editingTemplate={editingTemplate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Creation Controls */}
      <div className="p-5 rounded-3xl bg-[#0b132b] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>MẪU THÔNG BÁO NGHIỆP VỤ (NOTIFICATION TEMPLATES)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            16 kịch bản chuẩn cho toàn bộ vòng đời Container (Gate-In, Estimate, WO, Vật tư, QC, Gate-Out, VietQR)
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tạo Mẫu Thông Báo Mới</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0b132b] border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="relative sm:col-span-6">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên mẫu, mã template, sự kiện nghiệp vụ..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Channel Filter */}
        <div className="sm:col-span-3">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Tất cả kênh gửi</option>
            <option value="ZALO_OA">🟢 Zalo Official Account</option>
            <option value="ZALO_ZNS">🔵 Zalo ZNS CSKH</option>
            <option value="IN_APP">🟣 In-App Notification</option>
            <option value="SMS">🟠 Tin nhắn SMS</option>
          </select>
        </div>

        {/* Target Audience Filter */}
        <div className="sm:col-span-3">
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Tất cả đối tượng</option>
            <option value="CUSTOMER">Khách Hàng / Hãng Tàu</option>
            <option value="EMPLOYEE">Nhân Viên Nội Bộ</option>
            <option value="ALL">Cả Hai</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Templates List & Detail Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Templates (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0b132b] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Danh Sách Mẫu ({filteredList.length} Mẫu Khả Dụng)
            </span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredList.map((tmpl) => {
              const isSelected = previewTemplate?.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setPreviewTemplate(tmpl)}
                  className={`p-4 rounded-2xl border transition cursor-pointer select-none ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-lg'
                      : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white">{tmpl.name}</h4>
                        <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-slate-800 text-amber-300 border border-slate-700">
                          {tmpl.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">{tmpl.eventType}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <ChannelBadge channel={tmpl.channel} />
                    </div>
                  </div>

                  {/* Variables Preview */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {tmpl.variables.slice(0, 4).map((v) => (
                      <span
                        key={v}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-sky-300"
                      >
                        {v}
                      </span>
                    ))}
                    {tmpl.variables.length > 4 && (
                      <span className="px-1 py-0.5 text-[9px] text-slate-500 font-mono">
                        +{tmpl.variables.length - 4} tham số
                      </span>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(tmpl);
                      }}
                      className="flex items-center gap-1.5 text-[11px] cursor-pointer"
                    >
                      {tmpl.isActive ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đang sử dụng
                        </span>
                      ) : (
                        <span className="text-slate-500 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Tạm dừng
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {onSelectSendWithTemplate && (
                        <button
                          type="button"
                          onClick={() => onSelectSendWithTemplate(tmpl.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dùng Gửi Ngay</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setEditingTemplate(tmpl)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(tmpl.id)}
                        className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-800 text-rose-400 hover:text-white transition cursor-pointer"
                        title="Xóa mẫu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Preview Panel (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          {previewTemplate ? (
            <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Chi Tiết Mẫu Tin Nhắn</span>
                </span>
                <span className="font-mono text-xs text-amber-300 font-bold">
                  {previewTemplate.code}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tiêu đề:</span>
                <p className="text-xs font-bold text-white mt-0.5">{previewTemplate.titleTemplate}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nội dung mẫu:</span>
                <div className="mt-1 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {previewTemplate.contentTemplate}
                </div>
              </div>

              {previewTemplate.ctaButtonText && (
                <div className="p-3 bg-blue-950/30 rounded-2xl border border-blue-800/40 text-xs">
                  <span className="text-[10px] font-bold text-blue-300 uppercase block">Nút CTA:</span>
                  <span className="font-bold text-white">{previewTemplate.ctaButtonText}</span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    {previewTemplate.ctaButtonUrl}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Danh sách tham số động ({previewTemplate.variables.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {previewTemplate.variables.map((v) => (
                    <span
                      key={v}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-900 text-amber-300 border border-slate-800"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs bg-[#0b132b] rounded-3xl border border-slate-800">
              Chọn một mẫu ở cột bên trái để xem trước
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
