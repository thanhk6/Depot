import React from 'react';
import { Modal } from '../Modal/Modal';
import { ExternalLink } from 'lucide-react';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  code?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Ảnh Giám Định e-EIR',
  code
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          {title} {code && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700 font-mono">{code}</span>}
        </span>
      }
      maxWidth="4xl"
      footer={
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Mở Tab Mới</span>
        </a>
      }
    >
      <div className="flex items-center justify-center p-2 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
          onError={(e) => {
            // Ảnh lỗi thì ẩn đi thay vì thay bằng ảnh mẫu Unsplash (dễ bị hiểu nhầm là ảnh container thật).
            (e.target as HTMLImageElement).style.visibility = 'hidden';
          }}
        />
      </div>
    </Modal>
  );
};
