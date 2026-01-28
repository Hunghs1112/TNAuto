/**
 * Shadow System
 * 
 * Unified shadow system for both iOS and Android
 * iOS uses shadow properties, Android uses elevation
 */

import { Platform, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface ShadowConfig {
  /** iOS shadow properties */
  ios: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  /** Android elevation */
  android: {
    elevation: number;
  };
}

const shadowConfigs: Record<ShadowLevel, ShadowConfig> = {
  none: {
    ios: {
      shadowColor: Colors.shadow.default,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    android: {
      elevation: 0,
    },
  },
  sm: {
    ios: {
      shadowColor: Colors.shadow.default,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  },
  md: {
    ios: {
      shadowColor: Colors.shadow.default,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  },
  lg: {
    ios: {
      shadowColor: Colors.shadow.default,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  },
  xl: {
    ios: {
      shadowColor: Colors.shadow.default,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    android: {
      elevation: 12,
    },
  },
};

/**
 * Get shadow style for a given level
 * Automatically selects iOS or Android properties based on platform
 * 
 * @param level - Shadow level ('none' | 'sm' | 'md' | 'lg' | 'xl')
 * @returns Style object with appropriate shadow/elevation properties
 */
export const getShadowStyle = (level: ShadowLevel = 'md'): ViewStyle => {
  const config = shadowConfigs[level];
  
  if (Platform.OS === 'ios') {
    return {
      shadowColor: config.ios.shadowColor,
      shadowOffset: config.ios.shadowOffset,
      shadowOpacity: config.ios.shadowOpacity,
      shadowRadius: config.ios.shadowRadius,
    };
  } else {
  return {
    elevation: config.android.elevation,
  };
  }
};

/**
 * Get shadow style with custom color
 * 
 * @param level - Shadow level
 * @param color - Custom shadow color (default: Colors.shadow.default)
 * @returns Style object with custom shadow color
 */
export const getShadowStyleWithColor = (
  level: ShadowLevel = 'md',
  color: string = Colors.shadow.default
): ViewStyle => {
  const config = shadowConfigs[level];
  
  if (Platform.OS === 'ios') {
    return {
      shadowColor: color,
      shadowOffset: config.ios.shadowOffset,
      shadowOpacity: config.ios.shadowOpacity,
      shadowRadius: config.ios.shadowRadius,
    };
  } else {
  return {
    elevation: config.android.elevation,
  };
  }
};

/**
 * Get red shadow style (for primary color elements)
 * 
 * @param level - Shadow level
 * @returns Style object with red shadow
 */
export const getRedShadowStyle = (level: ShadowLevel = 'md'): ViewStyle => {
  return getShadowStyleWithColor(level, Colors.shadow.red);
};

/**
 * Shadow presets for common components
 */
export const shadowPresets = {
  /** Button shadow */
  button: getShadowStyle('md'),
  /** Card shadow */
  card: getShadowStyle('sm'),
  /** Elevated card shadow */
  cardElevated: getShadowStyle('lg'),
  /** Header shadow */
  header: getShadowStyle('sm'),
  /** Modal shadow */
  modal: getShadowStyle('xl'),
  /** Primary button shadow (red) */
  buttonPrimary: getRedShadowStyle('md'),
} as const;
