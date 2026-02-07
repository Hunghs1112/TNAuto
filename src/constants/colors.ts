// src/constants/colors.ts
export const Colors = {
  // 🎨 Brand Colors - Màu thương hiệu TN Gara (từ logo)
  primary: '#0F3D5E',        // Xanh dương đậm (main brand)
  primaryLight: '#2563EB',   // Xanh dương sáng hơn
  primarySoft: '#EFF6FF',    // Xanh rất nhạt (background phụ)
  
  secondary: '#22C55E',      // Xanh lá (từ logo) - CTA chính
  secondaryLight: '#4ADE80', // Xanh lá sáng
  secondarySoft: '#F0FDF4',  // Xanh lá rất nhạt
  
  tertiary: '#F59E0B',       // Vàng/Cam (accent)

  // 🖼 Background Colors - Màu nền
  background: {
    primary: '#FFFFFF',      // Nền chính
    secondary: '#F8FAFC',    // Nền phụ (cards)
    tertiary: '#F1F5F9',     // Nền input
    light: '#FFFFFF',        // Trắng (giữ lại cho tương thích)
    dark: '#0B1F2A',         // Xanh đen (dark mode)
    muted: '#F8FAFC',        // Xám rất nhạt (surface)
    overlay: 'rgba(15, 61, 94, 0.6)', // Overlay với primary
    red: '#EF4444',
    yellow: '#F59E0B',
    orange: '#FB923C',
    green: '#22C55E',
    blue: '#0F3D5E',
    indigo: '#1E40AF',
    purple: '#7C3AED',
    pink: '#EC4899',
    gray: '#9CA3AF',
  },

  // 📝 Text Colors - Màu chữ
  text: {
    primary: '#0F172A',      // Text chính (đậm hơn)
    secondary: '#475569',    // Text phụ
    tertiary: '#94A3B8',     // Text mờ
    disabled: '#CBD5E1',     // Text disabled
    inverted: '#FFFFFF',     // Trắng (text trên nền tối)
    placeholder: '#94A3B8',  // Placeholder
    link: '#2563EB',         // Link
  },

  // 🎯 Status Colors - Màu trạng thái (RÕ - KHÔNG PASTEL)
  status: {
    success: '#22C55E',      // Thành công (xanh lá brand)
    error: '#EF4444',        // Lỗi
    warning: '#F59E0B',      // Cảnh báo
    info: '#3B82F6',         // Thông tin
    pending: '#F59E0B',      // Đang chờ (vàng)
    inProgress: '#3B82F6',   // Đang xử lý (xanh dương)
    completed: '#22C55E',    // Hoàn thành (xanh lá)
    cancelled: '#94A3B8',    // Hủy (xám)
  },

  // 🚗 Service Status - Cho garage app
  service: {
    pending: '#F59E0B',      // Chờ xử lý
    inProgress: '#3B82F6',   // Đang sửa
    completed: '#22C55E',    // Hoàn thành
    cancelled: '#94A3B8',    // Hủy
    warranty: '#8B5CF6',     // Bảo hành
  },

  // 🟦 Neutral Scale - Slate (hiện đại hơn gray)
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // 🌈 Accent Colors - Màu nhấn
  accent: {
    green: '#22C55E',        // CTA chính (FAB, xác nhận)
    blue: '#0F3D5E',         // Brand blue
    yellow: '#FACC15',       // Vàng
    orange: '#FB923C',       // Cam
    purple: '#8B5CF6',       // Tím
    pink: '#EC4899',         // Hồng
  },

  // 📦 UI Elements - Phần tử giao diện
  border: {
    light: '#E2E8F0',        // Border nhẹ
    default: '#CBD5E1',      // Border mặc định
    focus: '#0F3D5E',        // Border khi focus
    error: '#EF4444',        // Border lỗi
  },
  
  divider: '#E2E8F0',        // Divider
  
  shadow: {
    default: '#0000001A',    // Shadow nhẹ
    primary: '#0F3D5E26',    // Shadow theo brand
    red: '#EF44441A',        // Shadow đỏ (matching error)
  },
  
  overlay: '#00000066',      // Overlay modal (giữ lại cho tương thích)

  // 🎨 Surface Colors - Cho cards, modals
  surface: {
    default: '#FFFFFF',      // Surface mặc định
    elevated: '#FFFFFF',     // Card nổi (có shadow)
    muted: '#F8FAFC',        // Background nhẹ
  },

  // 💫 Interactive States
  interactive: {
    hover: 'rgba(15, 61, 94, 0.04)',   // Hover
    pressed: 'rgba(15, 61, 94, 0.08)',  // Pressed
    focus: 'rgba(15, 61, 94, 0.12)',    // Focus
    disabled: '#F1F5F9',                 // Disabled
  },

  // 🔘 Button Colors - Màu nút (mở rộng)
  button: {
    primary: {
      bg: '#0F3D5E',         // Nút chính
      text: '#FFFFFF',
      hover: '#1E5A82',
      disabled: '#CBD5E1',
    },
    secondary: {
      bg: '#22C55E',         // Nút hành động (FAB)
      text: '#FFFFFF',
      hover: '#16A34A',
    },
    ghost: {
      bg: 'transparent',
      text: '#0F3D5E',
      hover: '#EFF6FF',
    },
    outline: {
      bg: 'transparent',
      border: '#E2E8F0',
      text: '#334155',
      hover: '#F8FAFC',
    },
  },

  // 🛡️ Warranty / Service Status - Màu bảo hành / dịch vụ
  warranty: {
    active: '#22C55E',       // Còn hiệu lực
    expiring: '#F59E0B',     // Sắp hết hạn
    expired: '#64748B',      // Hết hạn (đổi sang xám thay vì đỏ)
  },

  // 🎯 Priority Colors - Cho độ ưu tiên
  priority: {
    critical: '#EF4444',     // Nghiêm trọng
    high: '#F59E0B',         // Cao
    medium: '#3B82F6',       // Trung bình
    low: '#94A3B8',          // Thấp
  },

  // 🌈 Gradients - Gradient (TIẾT CHẾ)
  gradients: {
    primary: ['#0F3D5E', '#1E5A82'],           // Xanh dương
    primaryReverse: ['#1E5A82', '#0F3D5E'],   
    secondary: ['#22C55E', '#16A34A'],         // Xanh lá
    brand: ['#0F3D5E', '#22C55E'],             // Brand mix (xanh dương → xanh lá)
    light: ['#FFFFFF', '#F8FAFC'],             // Light
    dark: ['#1F2933', '#111827'],              // Dark
    shimmer: ['#F8FAFC', '#F1F5F9', '#F8FAFC'], // Shimmer
    overlay: ['rgba(15,61,94,0)', 'rgba(15,61,94,0.8)'], // Overlay gradient
  },

  // 🎨 Chart Colors - Nếu có biểu đồ
  chart: [
    '#0F3D5E',  // Primary (xanh dương)
    '#22C55E',  // Secondary (xanh lá)
    '#3B82F6',  // Blue
    '#F59E0B',  // Orange
    '#8B5CF6',  // Purple
    '#EC4899',  // Pink
  ],
};