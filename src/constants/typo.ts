import { Platform } from 'react-native';

export const Typography = {
  fontFamily: {
    // iOS sẽ tự động dùng San Francisco (SF Pro), Android dùng Roboto
    regular: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'sans-serif',  // Sẽ dùng với fontWeight '700'
      default: 'System',
    }),
  },
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  },
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};
