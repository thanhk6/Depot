export interface ApiResponse<T = any> {
  success: boolean;      // Trạng thái thành công hay thất bại
  message: string;       // Thông báo trả về từ API
  data?: T;              // Dữ liệu chính
  errors?: string[];     // Danh sách lỗi chi tiết
  timestamp: string;     // Thời điểm phản hồi
}

export interface PaginationParams {
  page: number;          // Trang hiện tại
  pageSize: number;      // Số bản ghi mỗi trang
  sortBy?: string;       // Trường sắp xếp
  sortOrder?: 'asc' | 'desc'; // Thứ tự sắp xếp
  search?: string;       // Từ khóa tìm kiếm
}

export interface PaginatedResult<T> {
  items: T[];            // Danh sách dữ liệu
  totalCount: number;    // Tổng số bản ghi
  page: number;          // Trang hiện tại
  pageSize: number;      // Số bản ghi mỗi trang
  totalPages: number;    // Tổng số trang
}

export interface SelectOption<T = string | number> {
  label: string;         // Nhãn hiển thị
  value: T;              // Giá trị thực
  disabled?: boolean;    // Có bị vô hiệu hóa hay không
  group?: string;        // Nhóm tùy chọn
}

export interface TableColumn<T = any> {
  key: string;           // Khóa cột
  title: string;         // Tiêu đề cột
  render?: (row: T) => React.ReactNode; // Hàm render tùy biến
  sortable?: boolean;    // Có thể sắp xếp
  width?: string | number; // Độ rộng cột
  align?: 'left' | 'center' | 'right'; // Căn lề
}
