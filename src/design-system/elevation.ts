/**
 * Elevation System
 * 
 * Android elevation mapping to iOS shadows
 * Ensures consistent visual hierarchy across platforms
 */

import { Platform } from 'react-native';
import { getShadowStyle, ShadowLevel } from './shadows';

export type ElevationLevel = 0 | 1 | 2 | 4 | 8 | 12 | 16 | 24;

/**
 * Map elevation levels to shadow levels
 */
const elevationToShadowMap: Record<ElevationLevel, ShadowLevel> = {
  0: 'none',
  1: 'sm',
  2: 'sm',
  4: 'md',
  8: 'md',
  12: 'lg',
  16: 'lg',
  24: 'xl',
};

/**
 * Get elevation style for Android
 * Returns elevation number for Android, shadow style for iOS
 * 
 * @param level - Elevation level (0-24)
 * @returns Style object with elevation (Android) or shadow (iOS)
 */
export const getElevationStyle = (level: ElevationLevel = 4) => {
  if (Platform.OS === 'android') {
    return { elevation: level };
  } else {
    const shadowLevel = elevationToShadowMap[level];
    return getShadowStyle(shadowLevel);
  }
};

/**
 * Elevation presets for common components
 */
export const elevationPresets = {
  /** No elevation */
  none: getElevationStyle(0),
  /** Small elevation (cards, buttons) */
  small: getElevationStyle(2),
  /** Medium elevation (elevated cards, modals) */
  medium: getElevationStyle(4),
  /** Large elevation (floating buttons, dropdowns) */
  large: getElevationStyle(8),
  /** Extra large elevation (dialogs, popovers) */
  xlarge: getElevationStyle(12),
  /** Maximum elevation (full-screen modals) */
  maximum: getElevationStyle(24),
} as const;
