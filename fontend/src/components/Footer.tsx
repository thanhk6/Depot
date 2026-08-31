import React from 'react';
import { Cpu, ShieldCheck, Database, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500 py-3 px-6 text-xs mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900">SolutionDepot ERP</span>
          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono">
            Metronic v8.2.0
          </span>
          <span className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono">
            .NET 8.0 C# Core API
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            System Status: Operational (12ms)
          </span>
          <span>© 2026 Enterprise Depot Systems. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
