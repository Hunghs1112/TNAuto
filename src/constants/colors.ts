// src/constants/colors.ts
export const Colors = {
  // 🎨 Brand Colors - Màu thương hiệu chính
  primary: '#DA1C12',      // Đỏ chính
  secondary: '#FF9500',    // Cam phụ
  
  // 🖼 Background Colors - Màu nền
  background: {
    light: '#FFFFFF',      // Trắng
    dark: '#111111',       // Đen
    muted: '#F5F5F5',      // Xám nhạt
    red: '#DA1C12',        // Đỏ (brand)
    yellow: '#FEB052',     // Vàng cam
    orange: '#FF9500',     // Cam
    green: '#34C759',      // Xanh lá
    blue: '#0A84FF',       // Xanh dương
    indigo: '#5856D6',     // Xanh tím
    purple: '#AF52DE',     // Tím
    pink: '#FF2D55',       // Hồng
    gray: '#9CA3AF',       // Xám
  },

  // 📝 Text Colors - Màu chữ
  text: {
    primary: '#111111',    // Đen chính
    secondary: '#6B7280',  // Xám
    tertiary: '#9CA3AF',   // Xám nhạt
    inverted: '#FFFFFF',   // Trắng (cho nền tối)
    placeholder: '#9CA3AF', // Xám placeholder
    disabled: '#D1D5DB',   // Xám disabled
  },

  // 🎯 Status Colors - Màu trạng thái
  status: {
    success: '#34C759',    // Xanh lá - Thành công
    error: '#FF3B30',      // Đỏ - Lỗi
    warning: '#FFCC00',    // Vàng - Cảnh báo
    info: '#0A84FF',       // Xanh dương - Thông tin
    pending: '#FEB052',    // Vàng cam - Đang chờ
    inProgress: '#DA1C12', // Đỏ - Đang xử lý
    completed: '#34C759',  // Xanh lá - Hoàn thành
    cancelled: '#9CA3AF',  // Xám - Đã hủy
  },

  // 🟣 Neutral Scale - Thang màu xám
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // 🌈 Accent Colors - Màu nhấn
  accent: {
    yellow: '#FBBF24',
    orange: '#FF9500',
    green: '#10B981',
    blue: '#0A84FF',
    purple: '#AF52DE',
    pink: '#FF2D55',
  },

  // 📦 UI Elements - Phần tử giao diện
  border: '#E5E7EB',       // Viền
  divider: '#D1D5DB',      // Đường phân cách
  shadow: '#00000029',     // Bóng đổ
  overlay: '#00000080',    // Lớp phủ

  // 🔘 Button Colors - Màu nút
  button: {
    primary: '#DA1C12',    // Nút chính
    secondary: '#FF9500',  // Nút phụ
    disabled: '#D1D5DB',   // Nút disabled
    text: '#FFFFFF',       // Chữ trên nút
  },

  // 🛡️ Warranty Colors - Màu bảo hành
  warranty: {
    active: '#34C759',     // Còn hiệu lực
    expiring: '#FFCC00',   // Sắp hết hạn
    expired: '#FF3B30',    // Hết hạn
  },
};