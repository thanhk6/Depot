import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 text-slate-500">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-xs font-medium tracking-wide">{text}</p>
    </div>
  );
};
