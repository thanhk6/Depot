import React, { useState, useMemo } from 'react';
import {
  CustomerCompany,
  CustomerType,
  CustomerStatus
} from '../types/customerTypes';
import {
  Search,
  Filter,
  Plus,
  Building2,
  Phone,
  Mail,
  Users,
  UserCheck,
  Eye,
  Edit,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  AlertCircle
} from 'lucide-react';

interface CustomerDataGridProps {
  customers: CustomerCompany[];
  onSelectCustomer: (customer: CustomerCompany) => void;
  onAddCustomer: () => void;
  onEditCustomer: (customer: CustomerCompany) => void;
  onToggleStatus: (customerId: string) => void;
}

export const CustomerDataGrid: React.FC<CustomerDataGridProps> = ({
  customers,
  onSelectCustomer,
  onAddCustomer,
  onEditCustomer,
  onToggleStatus
}) => {
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered dataset
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.taxCode.includes(searchTerm) ||
        c.phone.includes(searchTerm) ||
        c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'ALL' || c.customerType === typeFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [customers, searchTerm, typeFilter, statusFilter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const getTypeBadge = (type: CustomerType) => {
    switch (type) {
      case 'LOGISTICS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'TRUCKING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'FORWARDER':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'SHIPPER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getTypeName = (type: CustomerType) => {
    switch (type) {
      case 'LOGISTICS':
        return 'Logistics / 3PL';
      case 'TRUCKING':
        return 'Đội Xe Trucking';
      case 'FORWARDER':
        return 'Forwarder / FWD';
      case 'SHIPPER':
        return 'Chủ Hàng (Shipper)';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Quản Lý Khách Hàng (Customer CMS)</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản lý hồ sơ doanh nghiệp vận tải, tài khoản Portal, tài xế và đội phương tiện phục vụ Gate-In Online.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onAddCustomer}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Khách Hàng</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Mã, Tên, MST, SĐT, Người đại diện..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Loại:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả phân loại</option>
              <option value="LOGISTICS">Logistics / 3PL</option>
              <option value="TRUCKING">Trucking (Vận tải)</option>
              <option value="FORWARDER">Forwarder (Giao nhận)</option>
              <option value="SHIPPER">Shipper (Chủ hàng)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động (Active)</option>
              <option value="LOCKED">Tạm khóa (Locked)</option>
            </select>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700/60 cursor-pointer"
            title="Làm mới bộ lọc"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* DataGrid Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Mã KH</th>
                <th className="py-3.5 px-4 min-w-[220px]">Tên Khách Hàng</th>
                <th className="py-3.5 px-4">Mã Số Thuế</th>
                <th className="py-3.5 px-4">Điện Thoại / Email</th>
                <th className="py-3.5 px-4 text-center">Số Tài Khoản</th>
                <th className="py-3.5 px-4 text-center">Số Tài Xế</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Tạo</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => onSelectCustomer(customer)}
                  >
                    {/* Mã KH */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {customer.code}
                    </td>

                    {/* Tên KH */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-white group-hover:text-blue-300 transition">
                          {customer.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.2 rounded-md border ${getTypeBadge(
                              customer.customerType
                            )}`}
                          >
                            {getTypeName(customer.customerType)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Người LH: {customer.contactPerson} ({customer.contactPhone})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* MST */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {customer.taxCode}
                    </td>

                    {/* Điện thoại / Email */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{customer.email}</span>
                      </div>
                    </td>

                    {/* Số tài khoản */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Users className="w-3 h-3" />
                        {customer.userCount}
                      </span>
                    </td>

                    {/* Số tài xế */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <UserCheck className="w-3 h-3" />
                        {customer.driverCount}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center">
                      {customer.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Tạm khóa
                        </span>
                      )}
                    </td>

                    {/* Ngày tạo */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {customer.createdAt}
                    </td>

                    {/* Action buttons */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectCustomer(customer)}
                          className="p-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition border border-blue-500/20 cursor-pointer"
                          title="Xem chi tiết & Quản lý"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditCustomer(customer)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700 cursor-pointer"
                          title="Sửa thông tin khách hàng"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleStatus(customer.id)}
                          className={`p-1.5 rounded-lg transition border cursor-pointer ${
                            customer.status === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/20'
                          }`}
                          title={customer.status === 'ACTIVE' ? 'Khóa khách hàng' : 'Mở khóa khách hàng'}
                        >
                          {customer.status === 'ACTIVE' ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-400">Không tìm thấy khách hàng nào</p>
                      <p className="text-xs text-slate-600">Thử thay đổi từ khóa tìm kiếm hoặc làm mới bộ lọc</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 cursor-pointer"
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-950/80 border-t border-slate-800 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
            >
              <option value={5}>5 dòng</option>
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
            </select>
            <span>trên tổng số <strong className="text-white">{filteredCustomers.length}</strong> khách hàng</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg font-mono text-white">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
