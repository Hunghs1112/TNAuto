export const Typography = {
  fontFamily: {
    regular: 'System', // đổi thành tên font custom nếu bạn import
    medium: 'System',
    bold: 'System',
  },
  size: {
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
};
