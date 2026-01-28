/**
 * Spacing System
 * 
 * Consistent spacing scale for padding, margin, and gaps
 * Based on 4px base unit for better alignment and consistency
 */

export const spacing = {
  /** 4px - Extra small spacing */
  xs: 4,
  /** 8px - Small spacing */
  sm: 8,
  /** 12px - Medium-small spacing */
  md: 12,
  /** 16px - Base spacing (1rem equivalent) */
  base: 16,
  /** 20px - Large spacing */
  lg: 20,
  /** 24px - Extra large spacing */
  xl: 24,
  /** 32px - 2x large spacing */
  '2xl': 32,
  /** 40px - 3x large spacing */
  '3xl': 40,
  /** 48px - 4x large spacing */
  '4xl': 48,
  /** 64px - 5x large spacing */
  '5xl': 64,
} as const;

export type SpacingKey = keyof typeof spacing;

/**
 * Get spacing value by key
 * @param key - Spacing key (xs, sm, md, base, lg, xl, etc.)
 * @returns Spacing value in pixels
 */
export const getSpacing = (key: SpacingKey): number => {
  return spacing[key];
};

/**
 * Get spacing value with multiplier
 * @param key - Spacing key
 * @param multiplier - Multiplier (default: 1)
 * @returns Spacing value * multiplier
 */
export const getSpacingWithMultiplier = (key: SpacingKey, multiplier: number = 1): number => {
  return spacing[key] * multiplier;
};

/**
 * Spacing presets for common use cases
 */
export const spacingPresets = {
  /** Container padding */
  container: {
    horizontal: spacing.xl, // 24px
    vertical: spacing.lg,   // 20px
  },
  /** Screen padding */
  screen: {
    horizontal: spacing.base, // 16px
    vertical: spacing.sm, // 8px
  },
  /** Card padding */
  card: {
    horizontal: spacing.base, // 16px
    vertical: spacing.base,    // 16px
  },
  /** Form spacing */
  form: {
    inputGap: spacing.base,   // 16px between inputs
    sectionGap: spacing.xl,    // 24px between sections
  },
  /** List spacing */
  list: {
    itemGap: spacing.md,      // 12px between items
    sectionGap: spacing.xl,    // 24px between sections
  },
} as const;
