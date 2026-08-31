import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 py-2">
      <Home className="w-3.5 h-3.5 text-slate-500" />
      <span>Trang chủ</span>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className={idx === items.length - 1 ? 'text-slate-200 font-bold' : 'hover:text-slate-200 cursor-pointer'}>
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};
