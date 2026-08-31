import React from 'react';
import { DepotJob, JobStatus } from '../types/depot';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface JobLifecycleBarProps {
  job: DepotJob;
}

interface StepConfig {
  key: string;
  label: string;
  roleTag: string;
  isPassed: (status: JobStatus) => boolean;
  isActive: (status: JobStatus) => boolean;
  isFailed: (status: JobStatus) => boolean;
}

const LIFECYCLE_STEPS: StepConfig[] = [
  {
    key: 'GATE_IN',
    label: 'Cổng Vào Depot',
    roleTag: 'Gate In',
    isPassed: (s) => s !== 'GATE_IN',
    isActive: (s) => s === 'GATE_IN',
    isFailed: () => false
  },
  {
    key: 'SURVEY',
    label: 'Giám Định',
    roleTag: 'Survey',
    isPassed: (s) => !['GATE_IN', 'SURVEYING'].includes(s),
    isActive: (s) => s === 'SURVEYING' || s === 'SURVEYED',
    isFailed: () => false
  },
  {
    key: 'OPERATION_PAYMENT',
    label: 'Khai Thác & Thanh Toán',
    roleTag: 'Operation & Payment',
    isPassed: (s) => !['GATE_IN', 'SURVEYING', 'SURVEYED', 'OPERATION_PENDING', 'PAYMENT_PENDING'].includes(s),
    isActive: (s) => s === 'OPERATION_PENDING' || s === 'PAYMENT_PENDING',
    isFailed: () => false
  },
  {
    key: 'ESTIMATE',
    label: 'Báo Giá & Duyệt',
    roleTag: 'Estimate',
    isPassed: (s) => ['ESTIMATE_APPROVED', 'REPAIRING', 'QC_PENDING', 'QC_PASSED', 'YARD_STORED', 'GATE_OUT'].includes(s),
    isActive: (s) => s === 'ESTIMATE_PENDING_APPROVAL',
    isFailed: (s) => s === 'ESTIMATE_REJECTED'
  },
  {
    key: 'REPAIR',
    label: 'Sửa Chữa',
    roleTag: 'Repair',
    isPassed: (s) => ['QC_PENDING', 'QC_PASSED', 'YARD_STORED', 'GATE_OUT'].includes(s),
    isActive: (s) => s === 'REPAIRING',
    isFailed: () => false
  },
  {
    key: 'QC',
    label: 'Kiểm Tra QC',
    roleTag: 'QC Inspection',
    isPassed: (s) => ['QC_PASSED', 'YARD_STORED', 'GATE_OUT'].includes(s),
    isActive: (s) => s === 'QC_PENDING',
    isFailed: (s) => s === 'QC_FAILED'
  },
  {
    key: 'YARD_GATEOUT',
    label: 'Lưu Bãi & Xuất Cổng',
    roleTag: 'Yard & Gate Out',
    isPassed: (s) => s === 'GATE_OUT',
    isActive: (s) => s === 'YARD_STORED' || s === 'QC_PASSED',
    isFailed: () => false
  }
];

export const JobLifecycleBar: React.FC<JobLifecycleBarProps> = ({ job }) => {
  if (!job) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 my-2 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-blue-700">{job.id}</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">{job.containerNo}</span>
          <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 font-mono text-xs border border-slate-200">{job.isoSize}</span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs border border-blue-200">{job.shippingLine}</span>
        </div>
        <div className="text-xs text-slate-500">
          Vị trí bãi: <strong className="text-emerald-600 font-mono">Block {job.currentLocation?.block?.replace('BLOCK_', '') || 'A'} - B{job.currentLocation?.bay || 1}-R{job.currentLocation?.row || 1}-T{job.currentLocation?.tier || 1}</strong>
        </div>
      </div>

      {/* Stepper bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {LIFECYCLE_STEPS.map((step) => {
          const passed = step.isPassed(job.status);
          const active = step.isActive(job.status);
          const failed = step.isFailed(job.status);

          let bgStyle = 'bg-white border-slate-200 text-slate-500';
          let icon = <Clock className="w-3.5 h-3.5" />;

          if (passed) {
            bgStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700';
            icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
          } else if (active) {
            bgStyle = 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-200/60';
            icon = <AlertCircle className="w-3.5 h-3.5 text-blue-600 animate-pulse" />;
          } else if (failed) {
            bgStyle = 'bg-red-50 border-red-200 text-red-700';
            icon = <XCircle className="w-3.5 h-3.5 text-red-600" />;
          }

          return (
            <div
              key={step.key}
              className={`p-2 rounded-lg border text-xs flex flex-col justify-between transition-all ${bgStyle}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold truncate text-[11px]">{step.label}</span>
                {icon}
              </div>
              <div className="text-[10px] text-slate-500">
                {passed && <span className="text-emerald-700">Đã xong</span>}
                {active && <span className="text-blue-700 font-medium animate-pulse">Đang thực hiện</span>}
                {failed && <span className="text-red-700 font-medium">Bị từ chối</span>}
                {!passed && !active && !failed && <span>Chờ thực hiện</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
