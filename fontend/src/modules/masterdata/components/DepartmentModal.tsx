import React, { useState, useEffect } from 'react';
import { DepartmentItem } from '../types/department';
import { ROLES } from '../../../constants/permissions';
import {
  Building2,
  X,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  Users,
  ShieldCheck,
  FileText,
  Tag
} from 'lucide-react';

interface DepartmentModalProps {
  department: DepartmentItem | null;
  onClose: () => void;
  onSaveDepartment: (departmentData: Omit<DepartmentItem, 'id'> & { id?: string }) => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  department,
  onClose,
  onSaveDepartment
}) => {
  const isEditing = !!department;

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [division, setDivision] = useState<DepartmentItem['division']>('OPERATIONS');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [location, setLocation] = useState('');
  const [headcount, setHeadcount] = useState<number>(5);
  const [primaryRoleCode, setPrimaryRoleCode] = useState('ADMIN');
  const [operatingHours, setOperatingHours] = useState('24/7 (3 Ca liên tục)');
  const [costCenter, setCostCenter] = useState('CC-2000');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (department) {
      setCode(department.code);
      setName(department.name);
      setShortName(department.shortName);
      setDivision(department.division);
      setManagerName(department.managerName);
      setManagerPhone(department.managerPhone);
      setManagerEmail(department.managerEmail);
      setLocation(department.location);
      setHeadcount(department.headcount);
      setPrimaryRoleCode(department.primaryRoleCode);
      setOperatingHours(department.operatingHours);
      setCostCenter(department.costCenter);
      setStatus(department.status);
      setDescription(department.description);
      setTagsInput(department.tags.join(', '));
    } else {
      setCode(`DEPT-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setShortName('');
      setDivision('OPERATIONS');
      setManagerName('');
      setManagerPhone('');
      setManagerEmail('');
      setLocation('Tòa nhà Điều hành Depot - Tầng 2');
      setHeadcount(6);
      setPrimaryRoleCode('ADMIN');
      setOperatingHours('08:00 - 17:30 (Thứ 2 - Thứ 7)');
      setCostCenter('CC-2000');
      setStatus('ACTIVE');
      setDescription('');
      setTagsInput('Khai Thác, Vận Hành');
    }
  }, [department]);

  const divisionMap: Record<DepartmentItem['division'], string> = {
    EXECUTIVE: 'Khối Điều Hành & Quản Trị',
    OPERATIONS: 'Khối Khai Thác & Vận Hành Cổng',
    TECHNICAL: 'Khối Kỹ Thuật & Sửa Chữa M&R',
    FINANCE: 'Khối Tài Chính & Kế Toán',
    LOGISTICS_IT: 'Khối Hậu Cần & Công Nghệ'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!code.trim()) newErrors.code = 'Vui lòng nhập mã phòng ban';
    if (!name.trim()) newErrors.name = 'Vui lòng nhập tên phòng ban đầy đủ';
    if (!shortName.trim()) newErrors.shortName = 'Vui lòng nhập tên viết tắt';
    if (!managerName.trim()) newErrors.managerName = 'Vui lòng nhập tên trưởng phòng / phụ trách';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const matchedRole = ROLES.find((r) => r.code === primaryRoleCode) || ROLES[0];
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSaveDepartment({
      id: department?.id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      shortName: shortName.trim(),
      division,
      divisionName: divisionMap[division],
      managerName: managerName.trim(),
      managerPhone: managerPhone.trim(),
      managerEmail: managerEmail.trim(),
      location: location.trim(),
      headcount: Number(headcount) || 1,
      primaryRole: matchedRole.name,
      primaryRoleCode: matchedRole.code,
      status,
      operatingHours: operatingHours.trim(),
      costCenter: costCenter.trim().toUpperCase(),
      description: description.trim(),
      tags: parsedTags.length > 0 ? parsedTags : ['Depot Operations']
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? `Chỉnh Sửa Phòng Ban: ${department.name}` : 'Thêm Mới Phòng Ban Vào Danh Mục'}
              </h3>
              <p className="text-xs text-slate-500">
                Khai báo thông tin cơ cấu phòng ban, trưởng bộ phận, định biên nhân sự và trung tâm chi phí.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Row 1: Code, ShortName, Division */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4 space-y-1.5">
              <label className="block font-bold text-slate-700">
                Mã Phòng Ban (Code) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
                }}
                placeholder="VD: SURVEY-IICL"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-mono text-slate-900 text-xs focus:outline-none ${
                  errors.code ? 'border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {errors.code && <span className="text-[10px] text-rose-600 font-semibold">{errors.code}</span>}
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="block font-bold text-slate-700">
                Tên Viết Tắt (Short Name) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => {
                  setShortName(e.target.value);
                  if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: '' }));
                }}
                placeholder="VD: Phòng Giám Định IICL"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-900 text-xs focus:outline-none ${
                  errors.shortName ? 'border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {errors.shortName && <span className="text-[10px] text-rose-600 font-semibold">{errors.shortName}</span>}
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="block font-bold text-slate-700">
                Khối Phòng Ban (Division)
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value as DepartmentItem['division'])}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="OPERATIONS">Khối Khai Thác & Cổng</option>
                <option value="TECHNICAL">Khối Kỹ Thuật & M&R</option>
                <option value="FINANCE">Khối Tài Chính & Kế Toán</option>
                <option value="LOGISTICS_IT">Khối Hậu Cần & Công Nghệ</option>
                <option value="EXECUTIVE">Khối Điều Hành & Quản Trị</option>
              </select>
            </div>
          </div>

          {/* Row 2: Full Department Name */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Tên Đầy Đủ Phòng Ban <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="VD: Phòng Giám Định & Đánh Giá Tình Trạng Vỏ IICL-6"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-900 text-xs focus:outline-none ${
                errors.name ? 'border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.name && <span className="text-[10px] text-rose-600 font-semibold">{errors.name}</span>}
          </div>

          {/* Row 3: Manager Name, Phone, Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                Trưởng Bộ Phận / Phụ Trách <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => {
                    setManagerName(e.target.value);
                    if (errors.managerName) setErrors((prev) => ({ ...prev, managerName: '' }));
                  }}
                  placeholder="VD: Lê Hoàng Nam"
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-slate-900 text-xs focus:outline-none ${
                    errors.managerName ? 'border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.managerName && <span className="text-[10px] text-rose-600 font-semibold">{errors.managerName}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Số Điện Thoại Liên Hệ</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="VD: 0912.345.678"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Email Phòng Ban / Phụ Trách</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="VD: survey@solutiondepot.vn"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Location, Headcount, Cost Center */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6 space-y-1.5">
              <label className="block font-bold text-slate-700">Vị Trí Làm Việc / Văn Phòng</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="VD: Bệ Giám Định e-EIR - Khu Cổng Gate"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="block font-bold text-slate-700">Định Biên (Nhân sự)</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={headcount}
                  onChange={(e) => setHeadcount(parseInt(e.target.value) || 1)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="block font-bold text-slate-700">Trung Tâm Chi Phí (Cost Center)</label>
              <input
                type="text"
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                placeholder="VD: CC-2100"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 5: Operating Hours, Primary Role, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Giờ Làm Việc / Trực Ca</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="VD: 24/7 (3 Ca xoay vòng)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Vai Trò RBAC Gắn Liền</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={primaryRoleCode}
                  onChange={(e) => setPrimaryRoleCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Trạng Thái Hoạt Động</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="ACTIVE">🟢 Đang Hoạt Động</option>
                <option value="INACTIVE">⚪ Tạm Dừng Hoạt Động</option>
              </select>
            </div>
          </div>

          {/* Row 6: Description */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">Mô Tả Chức Năng &amp; Nhiệm Vụ Chính</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú chi tiết nhiệm vụ và trách nhiệm của phòng ban trong quy trình vận hành Depot..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Row 7: Tags */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Nhãn / Từ Khóa Nghiệp Vụ (Cách nhau bằng dấu phẩy)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="VD: IICL-6, e-EIR, Giám Định, Reefer PTI"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg "
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Lưu Thay Đổi Phòng Ban' : 'Tạo Mới Phòng Ban'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
