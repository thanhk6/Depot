// Chuyển lỗi gọi API (axios/fetch) thành câu tiếng Việt cho người dùng. Trước đây nhiều màn hiện nguyên câu
// kỹ thuật của axios ("Request failed with status code 500") hoặc nuốt lỗi rồi hiện như "không có dữ liệu" (BUG-016).
export const getApiErrorMessage = (error: unknown, fallback = 'Không thể tải dữ liệu từ máy chủ.'): string => {
  const err = error as any;
  const status: number | undefined = err?.response?.status;
  const body = err?.response?.data;
  // Envelope backend: message là tiêu đề, data (chuỗi) là chi tiết lý do.
  const backendMessage = [body?.message, typeof body?.data === 'string' ? body.data : null].filter(Boolean).join(' — ');

  if (status === 403) return backendMessage || 'Bạn không có quyền xem dữ liệu này.';
  if (status && status >= 500) return `Máy chủ gặp lỗi (${status})${backendMessage ? ': ' + backendMessage : '. Vui lòng thử lại sau.'}`;
  if (backendMessage) return backendMessage;
  if (!err?.response && (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error' || err instanceof TypeError)) {
    return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  }
  if (status && status >= 500) return `Máy chủ gặp lỗi (${status}). Vui lòng thử lại sau.`;
  if (status === 404) return 'Không tìm thấy dữ liệu yêu cầu.';
  if (err instanceof Error && err.message && !/^Request failed with status code/.test(err.message)) return err.message;
  return fallback;
};
