/**
 * Platform Utilities
 * 
 * Centralized platform detection and utilities
 * Replaces scattered Platform.select and Platform.OS usage
 */

import { Platform, PlatformOSType } from 'react-native';

/**
 * Check if current platform is iOS
 */
export const isIOS = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Check if current platform is Android
 */
export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
};

/**
 * Get current platform name
 */
export const getPlatform = (): PlatformOSType => {
  return Platform.OS;
};

/**
 * Get platform version
 */
export const getPlatformVersion = (): number => {
  return Platform.Version as number;
};

/**
 * Select value based on platform
 * 
 * @param ios - Value for iOS
 * @param android - Value for Android
 * @param default - Default value (optional)
 * @returns Selected value based on platform
 * 
 * @example
 * ```ts
 * const padding = selectPlatform(16, 12); // 16 for iOS, 12 for Android
 * ```
 */
export const selectPlatform = <T>(
  ios: T,
  android: T,
  defaultValue?: T
): T => {
  if (Platform.OS === 'ios') {
    return ios;
  } else if (Platform.OS === 'android') {
    return android;
  }
  return defaultValue ?? ios;
};

/**
 * Get platform-specific value from object
 * 
 * @param values - Object with platform-specific values
 * @returns Selected value based on platform
 * 
 * @example
 * ```ts
 * const padding = getPlatformValue({
 *   ios: 16,
 *   android: 12,
 *   default: 14,
 * });
 * ```
 */
export const getPlatformValue = <T>(values: {
  ios?: T;
  android?: T;
  default?: T;
}): T | undefined => {
  if (Platform.OS === 'ios' && values.ios !== undefined) {
    return values.ios;
  } else if (Platform.OS === 'android' && values.android !== undefined) {
    return values.android;
  }
  return values.default;
};

/**
 * Get platform-specific value with fallback
 * 
 * @param values - Object with platform-specific values
 * @param fallback - Fallback value if no match found
 * @returns Selected value or fallback
 */
export const getPlatformValueWithFallback = <T>(
  values: {
    ios?: T;
    android?: T;
    default?: T;
  },
  fallback: T
): T => {
  return getPlatformValue(values) ?? fallback;
};

/**
 * Check if Android version is >= specified version
 * 
 * @param version - Android version to check
 * @returns true if Android version >= specified version
 */
export const isAndroidVersion = (version: number): boolean => {
  return isAndroid() && getPlatformVersion() >= version;
};

/**
 * Check if iOS version is >= specified version
 * 
 * @param version - iOS version to check
 * @returns true if iOS version >= specified version
 */
export const isIOSVersion = (version: number): boolean => {
  return isIOS() && getPlatformVersion() >= version;
};

/**
 * Platform constants
 */
export const PlatformConstants = {
  /** Current platform OS */
  OS: Platform.OS,
  /** Current platform version */
  Version: Platform.Version,
  /** Is iOS */
  isIOS: isIOS(),
  /** Is Android */
  isAndroid: isAndroid(),
} as const;
