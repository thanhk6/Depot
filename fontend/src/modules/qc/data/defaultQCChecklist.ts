import { QCCheckItem } from '../types/qc';

export const DEFAULT_QC_CHECKLIST: QCCheckItem[] = [
  {
    id: 'QC-01',
    category: 'LIGHT',
    titleVi: '1. Thử Kín Sáng Buồng Tối (Light Test In Closed Container)',
    standardVi: 'Đóng kín 2 cánh cửa từ bên trong, không có bất kỳ tia sáng nào lọt qua nóc, vách, góc gù hay gioăng cửa.',
    isPassed: true
  },
  {
    id: 'QC-02',
    category: 'WATER',
    titleVi: '2. Thử Kín Nước & Mối Hàn (Water Tightness & Weld Integrity)',
    standardVi: 'Phun nước áp lực cao vào các mối hàn chắp vá và gioăng cửa. Không rò rỉ hoặc đọng nước vào khoang trong.',
    isPassed: true
  },
  {
    id: 'QC-03',
    category: 'STRUCTURE',
    titleVi: '3. Kết Cấu Cơ Khí & Khung Gầm (Structural Geometry & Side Rails)',
    standardVi: 'Xà dọc đáy, xà nóc, dầm ngang số 1-5 và góc gù đúc thẳng hàng theo dung sai IICL-6 (độ võng < 15mm).',
    isPassed: true
  },
  {
    id: 'QC-04',
    category: 'FLOOR',
    titleVi: '4. Mặt Sàn Gỗ & Bắt Vít (Plywood Floor Flatness & Screws)',
    standardVi: 'Sàn gỗ Apitong 28mm phẳng nhẵn, vít bắt chìm dưới mặt sàn 2-3mm, trám keo polyurethane kín khít mép.',
    isPassed: true
  },
  {
    id: 'QC-05',
    category: 'PAINT',
    titleVi: '5. Xử Lý Bề Mặt & Độ Dày Màng Sơn (Surface Prep & Paint DFT)',
    standardVi: 'Mối hàn được mài nhẵn bavia, tẩy gỉ chuẩn Sa 2.5, sơn lót epoxy + sơn phủ đồng màu vỏ, DFT ≥ 80 µm.',
    isPassed: true
  },
  {
    id: 'QC-06',
    category: 'DOOR',
    titleVi: '6. Cánh Cửa, Tay Khóa & Ron Đệm (Door Hardware & Rubber Gaskets)',
    standardVi: 'Bản lề trơn tru, tay khóa đóng mở nhẹ nhàng, chốt niêm phong hải quan nguyên vẹn, ron cao su đàn hồi tốt.',
    isPassed: true
  },
  {
    id: 'QC-07',
    category: 'CLEANLINESS',
    titleVi: '7. Vệ Sinh & Khử Mùi Hóa Chất (Cleanliness & Odor-Free)',
    standardVi: 'Khoang trong khô ráo, quét sạch phoi sắt xỉ hàn, không có mùi dầu mỡ hóa chất độc hại, đạt chuẩn cấp hàng.',
    isPassed: true
  }
];
