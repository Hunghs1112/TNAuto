/**
 * Enhanced Typography System
 * 
 * Extends the base Typography with line height, letter spacing, and text presets
 */

import { Platform, TextStyle } from 'react-native';
import { Typography as BaseTypography } from '../constants/typo';

  /**
 * Line height scale (relative to font size)
 */
export const lineHeight = {
  /** Tight line height (1.2x) */
  tight: 1.2,
  /** Normal line height (1.5x) */
  normal: 1.5,
  /** Relaxed line height (1.75x) */
  relaxed: 1.75,
  /** Loose line height (2x) */
  loose: 2,
} as const;
  
  /**
   * Letter spacing scale
   */
export const letterSpacing = {
  /** Tighter letter spacing */
  tighter: -0.5,
  /** Tight letter spacing */
  tight: -0.25,
  /** Normal letter spacing */
    normal: 0,
  /** Wide letter spacing */
  wide: 0.25,
  /** Wider letter spacing */
  wider: 0.5,
  /** Widest letter spacing */
  widest: 1,
} as const;
  
  /**
 * Calculate line height from font size
 * 
 * @param fontSize - Font size in pixels
 * @param ratio - Line height ratio (default: 1.5)
 * @returns Line height in pixels
 */
export const getLineHeight = (fontSize: number, ratio: number = lineHeight.normal): number => {
  return Math.round(fontSize * ratio);
};

/**
 * Text style presets for common use cases
   */
export const textStyles = {
  /** Heading 1 - Large title */
    h1: {
    fontSize: BaseTypography.size['3xl'], // 28px
      fontFamily: BaseTypography.fontFamily.bold,
      fontWeight: BaseTypography.weight.bold,
    lineHeight: getLineHeight(BaseTypography.size['3xl'], lineHeight.tight),
    letterSpacing: letterSpacing.tight,
    } as TextStyle,

  /** Heading 2 - Section title */
    h2: {
    fontSize: BaseTypography.size['2xl'], // 24px
      fontFamily: BaseTypography.fontFamily.bold,
      fontWeight: BaseTypography.weight.bold,
    lineHeight: getLineHeight(BaseTypography.size['2xl'], lineHeight.tight),
    letterSpacing: letterSpacing.tight,
    } as TextStyle,

  /** Heading 3 - Subsection title */
    h3: {
    fontSize: BaseTypography.size.xl, // 20px
      fontFamily: BaseTypography.fontFamily.bold,
      fontWeight: BaseTypography.weight.semibold,
    lineHeight: getLineHeight(BaseTypography.size.xl, lineHeight.normal),
    letterSpacing: letterSpacing.normal,
    } as TextStyle,

  /** Body large - Large body text */
  bodyLarge: {
    fontSize: BaseTypography.size.lg, // 18px
      fontFamily: BaseTypography.fontFamily.regular,
      fontWeight: BaseTypography.weight.regular,
    lineHeight: getLineHeight(BaseTypography.size.lg, lineHeight.normal),
    letterSpacing: letterSpacing.normal,
    } as TextStyle,

  /** Body - Default body text */
  body: {
    fontSize: BaseTypography.size.base, // 16px
      fontFamily: BaseTypography.fontFamily.regular,
      fontWeight: BaseTypography.weight.regular,
    lineHeight: getLineHeight(BaseTypography.size.base, lineHeight.normal),
    letterSpacing: letterSpacing.normal,
    } as TextStyle,

  /** Body small - Small body text */
  bodySmall: {
    fontSize: BaseTypography.size.sm, // 14px
      fontFamily: BaseTypography.fontFamily.regular,
      fontWeight: BaseTypography.weight.regular,
    lineHeight: getLineHeight(BaseTypography.size.sm, lineHeight.normal),
    letterSpacing: letterSpacing.normal,
    } as TextStyle,
  
  /** Caption - Small caption text */
  caption: {
    fontSize: BaseTypography.size.xs, // 12px
    fontFamily: BaseTypography.fontFamily.regular,
    fontWeight: BaseTypography.weight.regular,
    lineHeight: getLineHeight(BaseTypography.size.xs, lineHeight.normal),
    letterSpacing: letterSpacing.wide,
    } as TextStyle,
  
  /** Button text - Medium weight */
  button: {
    fontSize: BaseTypography.size.base, // 16px
      fontFamily: BaseTypography.fontFamily.semibold,
      fontWeight: BaseTypography.weight.semibold,
    lineHeight: getLineHeight(BaseTypography.size.base, lineHeight.tight),
    letterSpacing: letterSpacing.wide,
    } as TextStyle,

  /** Label - Form labels */
  label: {
    fontSize: BaseTypography.size.sm, // 14px
    fontFamily: BaseTypography.fontFamily.medium,
    fontWeight: BaseTypography.weight.medium,
    lineHeight: getLineHeight(BaseTypography.size.sm, lineHeight.normal),
    letterSpacing: letterSpacing.normal,
    } as TextStyle,
} as const;

/**
 * Typography utilities
 */
export const TypographyUtils = {
  ...BaseTypography,
  lineHeight,
  letterSpacing,
  textStyles,
  getLineHeight,
};
