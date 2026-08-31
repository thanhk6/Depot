import React, { useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { DataTable, Column } from '../../../components/common/DataTable/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge/StatusBadge';
import { ContainerDetailPage } from './ContainerDetailPage';
import { Container as ContainerIcon, Plus, Eye, Filter } from 'lucide-react';

interface ContainerListPageProps {
  containers: ContainerRecord[];
  onUpdateStatus: (containerId: string, newStatus: string, newCondition?: 'AV' | 'CL' | 'DM') => void;
  onNavigateTab?: (tabId: string) => void;
}

export const ContainerListPage: React.FC<ContainerListPageProps> = ({
  containers,
  onUpdateStatus,
  onNavigateTab
}) => {
  const [selectedContainer, setSelectedContainer] = useState<ContainerRecord | null>(null);
  const [filterCondition, setFilterCondition] = useState<string>('ALL');

  if (selectedContainer) {
    return (
      <ContainerDetailPage
        container={selectedContainer}
        onBack={() => setSelectedContainer(null)}
        onUpdateStatus={(id, st, cond) => {
          onUpdateStatus(id, st, cond);
          // Update local view
          setSelectedContainer((prev) =>
            prev
              ? {
                  ...prev,
                  status: st,
                  condition: cond || prev.condition
                }
              : null
          );
        }}
      />
    );
  }

  const filteredData = containers.filter((c) => {
    if (filterCondition === 'ALL') return true;
    return c.condition === filterCondition;
  });

  const columns: Column<ContainerRecord>[] = [
    {
      key: 'containerNo',
      header: 'Số Container No',
      render: (item) => (
        <div className="flex items-center gap-2">
          <ContainerIcon className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-mono font-bold text-white text-xs">{item.containerNo}</span>
        </div>
      )
    },
    {
      key: 'shippingLine',
      header: 'Hãng Tàu',
      render: (item) => (
        <span className="font-semibold text-blue-300">{item.shippingLine}</span>
      )
    },
    {
      key: 'size',
      header: 'ISO / Kích Thước',
      render: (item) => (
        <span>{item.size} ({item.isoCode})</span>
      )
    },
    {
      key: 'condition',
      header: 'Phân Loại',
      render: (item) => <StatusBadge status={item.condition} size="sm" />
    },
    {
      key: 'status',
      header: 'Trạng Thái Workflow',
      render: (item) => <StatusBadge status={item.status} size="sm" />
    },
    {
      key: 'yardLocation',
      header: 'Vị Trí Bãi 2D',
      render: (item) =>
        item.yardLocation ? (
          <span className="font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800 text-[11px]">
            Blk {item.yardLocation.block}-{item.yardLocation.bay}-{item.yardLocation.row}-{item.yardLocation.tier}
          </span>
        ) : (
          <span className="text-slate-500 font-mono">Chờ xếp</span>
        )
    },
    {
      key: 'gateInDate',
      header: 'Ngày Check-in',
      render: (item) => <span className="font-mono text-slate-400">{item.gateInDate}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ContainerIcon className="w-5 h-5 text-blue-400" />
            <span>Danh Sách Vòng Đời Container</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý tập trung toàn bộ dữ liệu container trong Depot & Lịch sử EMR
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Condition Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterCondition('ALL')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                filterCondition === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả ({containers.length})
            </button>
            <button
              onClick={() => setFilterCondition('AV')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                filterCondition === 'AV' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              AV (Sẵn Sàng)
            </button>
            <button
              onClick={() => setFilterCondition('CL')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                filterCondition === 'CL' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              CL (Cần Rửa)
            </button>
            <button
              onClick={() => setFilterCondition('DM')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                filterCondition === 'DM' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              DM (Hư Hỏng)
            </button>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('gate')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Gate-In</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Component */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm theo số container, hãng tàu, xe đầu kéo..."
        onRowClick={(item) => setSelectedContainer(item)}
        actions={(item) => (
          <button
            onClick={() => setSelectedContainer(item)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition cursor-pointer"
            title="Xem Chi Tiết & Workflow"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
};
