import React, { useState } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { ShieldCheck, UserCheck, ChevronDown, Check } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { currentUser, currentRole, roles, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition cursor-pointer group shadow-sm"
      >
        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xs flex items-center justify-center">
          {currentUser.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
            <span>{currentUser.name}</span>
          </div>
          <div className="text-[10px] text-blue-600 font-medium">
            {currentRole.name}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-3xl shadow-2xl p-3 z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-2">
            <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 font-mono">{currentUser.email}</p>
          </div>

          <div className="px-2 py-1 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            Chuyển Đổi Vai Trò Demo (RBAC)
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin py-1">
            {roles.map((r) => {
              const isSelected = r.id === currentRole.id;
              return (
                <button
                  key={r.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    switchRole(r.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-slate-400" />
                    <div>
                      <div>{r.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{r.code}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
