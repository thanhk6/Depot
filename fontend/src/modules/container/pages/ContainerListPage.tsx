import React, { useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { DataTable, Column } from '../../../components/common/DataTable/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge/StatusBadge';
import { formatDateTime } from '../../../utils/format';
import { useContainerTypeOptions } from '../../masterdata/utils/containerTypeCatalog';
import { ContainerDetailPage } from './ContainerDetailPage';
import { Container as ContainerIcon, Plus, Eye, Filter } from 'lucide-react';

interface ContainerListPageProps {
  containers: ContainerRecord[];
  onNavigateTab?: (tabId: string) => void;
}

export const ContainerListPage: React.FC<ContainerListPageProps> = ({
  containers,
  onNavigateTab
}) => {
  const [selectedContainer, setSelectedContainer] = useState<ContainerRecord | null>(null);
  const [filterCondition, setFilterCondition] = useState<string>('ALL');
  const containerTypes = useContainerTypeOptions();
  const isoOf = (typeCode: string) => containerTypes.find((t) => t.typeCode === typeCode)?.isoCode;

  if (selectedContainer) {
    return (
      <ContainerDetailPage
        container={selectedContainer}
        onBack={() => setSelectedContainer(null)}
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
          <ContainerIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-mono font-bold text-slate-900 text-xs">{item.containerNo}</span>
        </div>
      )
    },
    {
      key: 'shippingLine',
      header: 'Hãng Tàu',
      render: (item) => (
        <span className="font-semibold text-blue-700">{item.shippingLine}</span>
      )
    },
    {
      key: 'size',
      header: 'ISO / Kích Thước',
      render: (item) => (
        <span>{item.size}{isoOf(item.size) ? ` (${isoOf(item.size)})` : ''}</span>
      )
    },
    {
      key: 'condition',
      header: 'Phân Loại',
      render: (item) =>
        item.condition ? (
          <StatusBadge status={item.condition} size="sm" />
        ) : (
          <span className="text-slate-500 text-[11px] font-semibold">Chưa giám định</span>
        )
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
          <span className="font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[11px]">
            Blk {item.yardLocation.block}-{item.yardLocation.bay}-{item.yardLocation.row}-{item.yardLocation.tier}
          </span>
        ) : (
          <span className="text-slate-500 font-mono">Chưa hạ bãi</span>
        )
    },
    {
      key: 'gateInDate',
      header: 'Ngày Check-in',
      render: (item) => <span className="font-mono text-slate-500">{formatDateTime(item.gateInDate)}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ContainerIcon className="w-5 h-5 text-blue-600" />
            <span>Danh Sách Vòng Đời Container</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý tập trung toàn bộ dữ liệu container trong Depot & Lịch sử EMR
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Condition Filter */}
          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterCondition('ALL')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                filterCondition === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tất Cả ({containers.length})
            </button>
            <button
              onClick={() => setFilterCondition('AV')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                filterCondition === 'AV' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              AV (Sẵn Sàng)
            </button>
            <button
              onClick={() => setFilterCondition('CL')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                filterCondition === 'CL' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              CL (Cần Rửa)
            </button>
            <button
              onClick={() => setFilterCondition('DM')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                filterCondition === 'DM' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-900'
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
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-blue-600 rounded-xl transition cursor-pointer"
            title="Xem Chi Tiết & Workflow"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
};
