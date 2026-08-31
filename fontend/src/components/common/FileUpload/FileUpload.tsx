import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 5,
  accept = 'image/*',
  label = 'Tải ảnh tổn thất / Biên bản e-EIR'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files).slice(0, maxFiles);
      onFilesSelected(selected);

      const newPreviews = selected.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removePreview = (index: number) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-300">{label}</label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 bg-slate-900/50 hover:bg-slate-900 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
      >
        <div className="p-3 bg-slate-800 rounded-xl group-hover:scale-110 transition text-blue-400">
          <Upload className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-400">
          <span className="font-semibold text-blue-400">Tải tệp lên</span> hoặc kéo thả vào đây
        </div>
        <p className="text-[10px] text-slate-500">Định dạng JPG, PNG, WEBP (Tối đa {maxFiles} ảnh, 10MB/ảnh)</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-5 gap-2 pt-2">
          {previews.map((src, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 h-20 bg-slate-950">
              <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePreview(idx)}
                className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
