/**
 * Border System
 * 
 * Consistent border radius and width values
 */

export type BorderRadiusKey = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
export type BorderWidthKey = 'none' | 'thin' | 'base' | 'thick';

/**
 * Border radius scale
 */
export const borderRadius = {
  /** 0px - No border radius */
  none: 0,
  /** 4px - Small radius */
  sm: 4,
  /** 8px - Medium radius */
  md: 8,
  /** 12px - Large radius */
  lg: 12,
  /** 16px - Extra large radius */
  xl: 16,
  /** 20px - 2x large radius */
  '2xl': 20,
  /** 24px - 3x large radius */
  '3xl': 24,
  /** 999px - Fully rounded (pill shape) */
  full: 999,
} as const;

/**
 * Border width scale
 */
export const borderWidth = {
  /** 0px - No border */
  none: 0,
  /** 1px - Thin border */
  thin: 1,
  /** 2px - Base border */
  base: 2,
  /** 3px - Thick border */
  thick: 3,
} as const;

/**
 * Get border radius value by key
 * 
 * @param key - Border radius key
 * @returns Border radius value in pixels
 */
export const getBorderRadius = (key: BorderRadiusKey): number => {
  return borderRadius[key];
};

/**
 * Get border width value by key
 * 
 * @param key - Border width key
 * @returns Border width value in pixels
 */
export const getBorderWidth = (key: BorderWidthKey): number => {
  return borderWidth[key];
};

/**
 * Border presets for common components
 */
export const borderPresets = {
  /** Button border radius */
  button: borderRadius.xl,        // 16px
  /** Card border radius */
  card: borderRadius.lg,          // 12px
  /** Input border radius */
  input: borderRadius.xl,         // 16px
  /** Badge border radius */
  badge: borderRadius.full,       // 999px (pill)
  /** Avatar border radius */
  avatar: borderRadius.full,      // 999px (circle)
  /** Small button border radius */
  buttonSmall: borderRadius.lg,   // 12px
  /** Large card border radius */
  cardLarge: borderRadius['2xl'], // 20px
} as const;
