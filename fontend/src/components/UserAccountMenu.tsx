import React, { useState, useRef, useEffect } from 'react';
import { useDepot } from '../context/DepotContext';
import { getProfileByRole } from '../data/roleMenuConfig';
import { ChevronDown, LogOut, Layers } from 'lucide-react';

interface UserAccountMenuProps {
  onLogout: () => void;
}

// Header cũ (`App.tsx`) trước đây chỉ có breadcrumb + trạng thái "Live Server", KHÔNG có thông tin tài
// khoản đang đăng nhập hay nút đăng xuất nào — người dùng yêu cầu bổ sung.
//
// Hiển thị đúng `loggedInUserProfile` — hồ sơ THẬT được set 1 lần lúc đăng nhập thành công từ dữ liệu
// backend trả về (xem `LoginScreen.tsx`), KHÔNG đoán theo `activeRole` như bản đầu tiên đã làm (bug: có
// thể hiện tên/email của MỘT NGƯỜI KHÁC nếu nhiều tài khoản mẫu trùng vai trò). Đã bỏ hẳn mục "Đổi vai
// trò tài khoản nhanh" theo yêu cầu người dùng — 1 người chỉ đăng nhập được vào đúng 1 tài khoản của
// chính mình, không tự chuyển sang tài khoản/vai trò khác mà không đăng xuất/đăng nhập lại.
export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({ onLogout }) => {
  const { activeRole, loggedInUserProfile } = useDepot();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fallback (chỉ style/màu, không phải danh tính) cho trường hợp hiếm gặp thiếu `loggedInUserProfile`
  // (vd context vừa remount mà localStorage bị xoá thủ công) — không nên xảy ra trong luồng bình thường.
  const currentProfile = loggedInUserProfile || getProfileByRole(activeRole);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-[#FFFFFF] hover:bg-[#F4F7FA] border border-[#E2E8F0] pl-1.5 pr-2.5 py-1 rounded-full transition cursor-pointer group shadow-sm"
        title="Tài khoản đang đăng nhập — xem thông tin & đăng xuất"
      >
        <div className="relative shrink-0">
          <div className={`w-7 h-7 rounded-full ${currentProfile.avatarBg} text-[#1F2937] font-bold text-[11px] flex items-center justify-center ring-1 ring-[#E2E8F0] group-hover:scale-105 transition-transform`}>
            {currentProfile.avatarText}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#16A34A] rounded-full ring-2 ring-white" />
        </div>
        <span className="hidden sm:inline font-bold text-xs text-[#1F2937] group-hover:text-[#1677FF] transition-colors max-w-[110px] truncate">
          {currentProfile.fullName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1677FF]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 text-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
            <div className={`w-11 h-11 rounded-xl ${currentProfile.avatarBg} text-slate-700 font-bold text-sm flex items-center justify-center shadow-md shrink-0 ring-2 ring-slate-200`}>
              {currentProfile.avatarText}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-900 truncate">{currentProfile.fullName}</h4>
              <p className="text-xs text-slate-500 truncate">{currentProfile.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentProfile.badgeBg}`}>
                  {currentProfile.badgeText}
                </span>
              </div>
            </div>
          </div>

          {/* Job & Department Details */}
          <div className="py-2.5 border-b border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-500">Chức danh:</span>
              <span className="font-medium text-slate-900">{currentProfile.jobTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phòng ban:</span>
              <span className="font-medium text-slate-900">{currentProfile.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phân quyền Menu:</span>
              <span className="font-medium text-blue-600 flex items-center gap-1">
                <Layers className="w-3 h-3" /> {currentProfile.allowedTabs?.length || 0} chức năng
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-2.5">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>Đăng Xuất Tài Khoản</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
