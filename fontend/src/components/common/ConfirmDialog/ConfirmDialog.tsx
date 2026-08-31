import React from 'react';
import { Modal } from '../Modal/Modal';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Xác Nhận',
  cancelText = 'Hủy Bỏ'
}) => {
  const iconMap = {
    danger: <AlertTriangle className="w-8 h-8 text-red-500" />,
    warning: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    info: <Info className="w-8 h-8 text-blue-500" />,
    success: <CheckCircle2 className="w-8 h-8 text-emerald-500" />
  };

  const btnMap = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${btnMap[type]}`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4 pt-2">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
          {iconMap[type]}
        </div>
        <div>
          <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};
