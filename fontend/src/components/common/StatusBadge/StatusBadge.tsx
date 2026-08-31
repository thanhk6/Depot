import React from 'react';
import { CONTAINER_CONDITIONS, LIFECYCLE_STATUSES } from '../../../constants/status';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true
}) => {
  // Check if it's a condition (AV, CL, DM)
  const condition = CONTAINER_CONDITIONS[status as keyof typeof CONTAINER_CONDITIONS];
  const lifecycle = LIFECYCLE_STATUSES[status];

  const config = condition || lifecycle || {
    code: status,
    label: status,
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    bgClass: 'bg-slate-400',
    textClass: 'text-slate-600',
    description: ''
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-bold rounded-xl gap-2'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  return (
    <span
      className={`inline-flex items-center border shadow-xs transition-colors whitespace-nowrap ${config.badgeClass} ${sizeClasses[size]}`}
      title={config.description}
    >
      {showDot && (
        <span className={`rounded-full ${config.bgClass} ${dotSizes[size]} shrink-0 animate-pulse`} />
      )}
      <span>{config.label}</span>
    </span>
  );
};
