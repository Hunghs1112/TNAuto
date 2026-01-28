/**
 * Safe Area Utilities
 * 
 * Utilities for handling safe area insets consistently
 */

import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid, isIOS } from './platform';

/**
 * Hook to get safe area insets with platform-specific handling
 * 
 * @param options - Options for safe area handling
 * @returns Safe area insets object
 */
export const useSafeArea = (options?: {
  disableTop?: boolean;
  disableBottom?: boolean;
  disableLeft?: boolean;
  disableRight?: boolean;
}) => {
  const insets = useSafeAreaInsets();

      return {
    top: options?.disableTop ? 0 : getTopInset(insets.top),
    bottom: options?.disableBottom ? 0 : insets.bottom,
    left: options?.disableLeft ? 0 : insets.left,
    right: options?.disableRight ? 0 : insets.right,
      };
};

/**
 * Get top inset with platform-specific fallback
 * 
 * @param topInset - Top inset from useSafeAreaInsets
 * @returns Top inset value
 */
export const getTopInset = (topInset: number): number => {
  if (isAndroid()) {
    // For Android, use StatusBar height as fallback
    return Math.max(topInset, StatusBar.currentHeight || 0);
  }
  return topInset;
};

/**
 * Get safe area style object
 * 
 * @param insets - Safe area insets
 * @param options - Options for safe area
 * @returns Style object with padding for safe areas
 */
export const getSafeAreaStyle = (
  insets: { top: number; bottom: number; left: number; right: number },
  options?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  }
) => {
  const style: {
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  } = {};

  if (options?.top !== false && insets.top > 0) {
    style.paddingTop = insets.top;
  }
  if (options?.bottom !== false && insets.bottom > 0) {
    style.paddingBottom = insets.bottom;
  }
  if (options?.left !== false && insets.left > 0) {
    style.paddingLeft = insets.left;
  }
  if (options?.right !== false && insets.right > 0) {
    style.paddingRight = insets.right;
  }

  return style;
};

/**
 * Safe area presets
 */
export const safeAreaPresets = {
  /** Screen with top and bottom safe area */
  screen: {
    top: true,
    bottom: true,
    left: false,
    right: false,
  },
  /** Full screen (no safe area) */
  fullScreen: {
    top: false,
    bottom: false,
    left: false,
    right: false,
  },
  /** Only top safe area */
  topOnly: {
    top: true,
    bottom: false,
    left: false,
    right: false,
  },
  /** Only bottom safe area */
  bottomOnly: {
    top: false,
    bottom: true,
    left: false,
    right: false,
  },
} as const;
