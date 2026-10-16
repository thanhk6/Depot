import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  // Đổi key (id màn đang mở) để tự xoá trạng thái lỗi khi người dùng chuyển sang màn khác.
  screenKey: string;
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

// Lỗi render ở 1 màn trước đây làm trắng toàn bộ app (Sidebar cũng mất, phải F5) — xem BUG-005 màn Zalo.
// Bọc vùng nội dung để chỉ màn lỗi hiện thông báo, Sidebar/header vẫn dùng được.
export class ScreenErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`Lỗi hiển thị màn "${this.props.screenKey}":`, error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.screenKey !== this.props.screenKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="max-w-xl mx-auto mt-10 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto text-[#D97706]" />
        <h2 className="text-base font-bold text-[#1F2937]">Màn hình gặp lỗi hiển thị</h2>
        <p className="text-sm text-[#64748B]">
          Không hiển thị được màn này. Các màn khác vẫn dùng bình thường — chọn menu khác hoặc thử lại.
        </p>
        <button
          onClick={() => this.setState({ error: null })}
          className="px-4 py-2 rounded-xl bg-[#1677FF] text-white text-sm font-semibold hover:bg-[#0958D9] transition cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }
}
