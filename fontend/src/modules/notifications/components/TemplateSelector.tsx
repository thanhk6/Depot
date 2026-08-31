import React, { useState } from 'react';
import {
  FileText,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { NotificationTemplate } from '../models/notification.types';
import { ChannelBadge } from './NotificationStatus';

interface TemplateSelectorProps {
  templates: NotificationTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (template: NotificationTemplate) => void;
  variablesState: Record<string, string>;
  onChangeVariable: (key: string, value: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  variablesState,
  onChangeVariable
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId || t.code === selectedTemplateId);

  return (
    <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Mẫu Thông Báo Nghiệp Vụ</span>
          </label>
          <p className="text-[11px] text-slate-400">Chọn kịch bản tự động chuẩn theo quy trình Depot</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative my-3">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm mẫu (Gate-In, Estimate, WO, QC...)"
          className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto max-h-[220px] border border-slate-800/80 rounded-xl divide-y divide-slate-800/60 scrollbar-thin">
        {filteredTemplates.map((template) => {
          const isSelected = template.id === selectedTemplateId || template.code === selectedTemplateId;
          return (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`p-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/60 cursor-pointer transition select-none ${
                isSelected ? 'bg-amber-950/40 border-l-4 border-l-amber-500' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-200 truncate">
                    {template.name}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-slate-400">{template.code}</span>
                  <ChannelBadge channel={template.channel} />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Parameter Injection Fields for Selected Template */}
      {selectedTemplate && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Tham Số Động (Template Variables)</span>
            </span>
            <span className="text-[10px] text-slate-400">Tự động điền dữ liệu thực tế</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
            {selectedTemplate.variables.map((variable) => {
              const cleanKey = variable.replace(/[{}]/g, '');
              const currentValue = variablesState[variable] || '';
              return (
                <div key={variable} className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <label className="text-[10px] font-mono font-bold text-amber-300 block truncate">
                    {variable}
                  </label>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => onChangeVariable(variable, e.target.value)}
                    placeholder={`Nhập ${cleanKey}...`}
                    className="w-full mt-1 px-2 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
