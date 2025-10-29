// src/utils/haptics.ts
import { Vibration, Platform } from 'react-native';

/**
 * Haptic feedback utilities for React Native
 * Provides cross-platform haptic/vibration feedback
 */

export const HapticFeedback = {
  /**
   * Light impact - for button taps
   */
  light: () => {
    if (Platform.OS === 'ios') {
      // iOS supports haptic feedback natively
      Vibration.vibrate(10);
    } else {
      // Android vibration pattern for light tap
      Vibration.vibrate(10);
    }
  },

  /**
   * Medium impact - for selection changes
   */
  medium: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(20);
    } else {
      Vibration.vibrate(20);
    }
  },

  /**
   * Heavy impact - for important actions
   */
  heavy: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(30);
    } else {
      Vibration.vibrate(30);
    }
  },

  /**
   * Success notification
   */
  success: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 10, 20, 10]);
    } else {
      Vibration.vibrate([0, 10, 20, 10]);
    }
  },

  /**
   * Error notification
   */
  error: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 20, 40, 20]);
    } else {
      Vibration.vibrate([0, 20, 40, 20]);
    }
  },

  /**
   * Warning notification
   */
  warning: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 15, 30]);
    } else {
      Vibration.vibrate([0, 15, 30]);
    }
  },

  /**
   * Selection change
   */
  selection: () => {
    Vibration.vibrate(5);
  },
};

