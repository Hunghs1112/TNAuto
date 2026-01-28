// src/constants/colors.ts
export const Colors = {
  // 🎨 Brand Colors - Màu thương hiệu chính
  primary: '#0C7779',      // Xanh teal chính
  primaryLight: '#3BC1A8', // Xanh teal nhạt cho gradients
  primarySoft: '#E6F6F6',  // Xanh teal rất nhạt cho backgrounds
  secondary: '#249E94',    // Xanh teal phụ
  
  // 🖼 Background Colors - Màu nền
  background: {
    light: '#FFFFFF',      // Trắng
    dark: '#002A3A',       // Xanh đen
    muted: '#F0F9F9',      // Xanh xám rất nhạt
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
    primary: '#005461',    // Xanh đen (thay cho đen)
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
    inProgress: '#0C7779', // Xanh teal - Đang xử lý
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
  shadow: {
    default: '#00000029',  // Bóng đổ mặc định
    primary: '#0C777920',  // Bóng đổ màu teal
  },
  overlay: '#00000080',    // Lớp phủ

  // 🔘 Button Colors - Màu nút
  button: {
    primary: '#0C7779',    // Nút chính
    secondary: '#249E94',  // Nút phụ
    disabled: '#D1D5DB',   // Nút disabled
    text: '#FFFFFF',       // Chữ trên nút
  },

  // 🛡️ Warranty Colors - Màu bảo hành
  warranty: {
    active: '#34C759',     // Còn hiệu lực
    expiring: '#FFCC00',   // Sắp hết hạn
    expired: '#FF3B30',    // Hết hạn
  },

  // 🌈 Gradients - Màu gradient
  gradients: {
    // Gradient đỏ cam chủ đạo
    primary: ['#0C7779', '#3BC1A8'],           // Teal → Teal nhạt
    primaryReverse: ['#3BC1A8', '#0C7779'],    // Teal nhạt → Teal
    
    // Gradient warm - ấm áp
    warm: ['#FF9500', '#FEB052'],              // Cam → Vàng cam
    sunset: ['#DA1C12', '#FF9500', '#FEB052'], // Đỏ → Cam → Vàng
    
    // Gradient cool - mát mẻ
    ocean: ['#0A84FF', '#5856D6'],             // Xanh dương → Tím
    success: ['#34C759', '#10B981'],           // Xanh lá
    
    // Gradient neutral
    dark: ['#1F2937', '#111827'],              // Xám tối
    light: ['#FFFFFF', '#F5F5F5'],             // Trắng → Xám nhạt
    
    // Gradient special effects
    shimmer: ['#E5E7EB', '#F5F5F5', '#E5E7EB'], // Cho skeleton
  },
};