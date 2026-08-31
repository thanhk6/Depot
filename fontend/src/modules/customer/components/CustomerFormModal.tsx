import React, { useState, useEffect } from 'react';
import { CustomerCompany, CustomerType } from '../types/customerTypes';
import { Building2, X, Plus, Edit } from 'lucide-react';

interface CustomerFormModalProps {
  isOpen: boolean;
  customer: CustomerCompany | null;
  onClose: () => void;
  onSave: (customerData: Partial<CustomerCompany>) => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  customer,
  onClose,
  onSave
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('LOGISTICS');
  const [creditLimit, setCreditLimit] = useState<number>(500000000);
  const [paymentTermDays, setPaymentTermDays] = useState<number>(30);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customer) {
      setCode(customer.code);
      setName(customer.name);
      setShortName(customer.shortName);
      setTaxCode(customer.taxCode);
      setPhone(customer.phone);
      setEmail(customer.email);
      setAddress(customer.address);
      setContactPerson(customer.contactPerson);
      setContactPhone(customer.contactPhone);
      setContactEmail(customer.contactEmail);
      setCustomerType(customer.customerType);
      setCreditLimit(customer.creditLimit);
      setPaymentTermDays(customer.paymentTermDays);
      setNotes(customer.notes || '');
    } else {
      setCode(`CUST-${Date.now().toString().slice(-4)}`);
      setName('');
      setShortName('');
      setTaxCode('');
      setPhone('');
      setEmail('');
      setAddress('');
      setContactPerson('');
      setContactPhone('');
      setContactEmail('');
      setCustomerType('LOGISTICS');
      setCreditLimit(500000000);
      setPaymentTermDays(30);
      setNotes('');
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !taxCode.trim()) return;

    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      shortName: shortName.trim() || name.trim().split(' ').slice(0, 3).join(' '),
      taxCode: taxCode.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      customerType,
      creditLimit: Number(creditLimit),
      paymentTermDays: Number(paymentTermDays),
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {customer ? 'Cập Nhật Hồ Sơ Khách Hàng' : 'Thêm Khách Hàng Doanh Nghiệp Mới'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Hệ thống Quản lý Khách hàng Depot & Chuẩn bị dữ liệu Gate-In Online
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Mã Khách Hàng <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: CUST-ABC01"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Phân Loại Doanh Nghiệp <span className="text-rose-400">*</span>
              </label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="LOGISTICS">Logistics / 3PL</option>
                <option value="TRUCKING">Trucking (Đội xe vận tải)</option>
                <option value="FORWARDER">Forwarder (Giao nhận vận tải)</option>
                <option value="SHIPPER">Shipper (Chủ hàng)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-semibold block mb-1">
                Tên Đầy Đủ Doanh Nghiệp <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Công ty TNHH Vận tải ABC Logistics"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Tên Viết Tắt / Thương Hiệu</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="VD: ABC Logistics"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Mã Số Thuế (MST) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder="VD: 0312345678"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Số Điện Thoại Tổng Đài</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 028.3888.9999"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Email Doanh Nghiệp</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: contact@abclogistics.vn"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-semibold block mb-1">Địa Chỉ Trụ Sở</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: Số 12 Mai Chí Thọ, P. An Phú, TP. Thủ Đức, TP.HCM"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Người Đại Diện Liên Hệ</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="VD: Trần Minh Tuấn"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Số ĐT Người Liên Hệ</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="VD: 0908.123.456"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Hạn Mức Tín Dụng (VND)</label>
              <input
                type="number"
                step="10000000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Kỳ Hạn Thanh Toán (Ngày)</label>
              <input
                type="number"
                value={paymentTermDays}
                onChange={(e) => setPaymentTermDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-semibold block mb-1">Ghi Chú Vận Hành / Nghiệp Vụ</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Lưu ý điều độ, luồng tiếp nhận, chính sách ưu tiên..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              {customer ? 'Lưu Thay Đổi' : 'Tạo Khách Hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
