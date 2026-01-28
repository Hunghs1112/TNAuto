/**
 * Keyboard Utilities
 * 
 * Utilities for handling keyboard events consistently across platforms
 */

import { Platform, Keyboard, EmitterSubscription, KeyboardEvent, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { isIOS } from './platform';

/**
 * Keyboard event names for iOS and Android
 */
export const keyboardEvents = {
  show: isIOS() ? 'keyboardWillShow' : 'keyboardDidShow',
  hide: isIOS() ? 'keyboardWillHide' : 'keyboardDidHide',
} as const;

/**
 * Hook to handle keyboard show/hide events
 * 
 * @param callbacks - Callbacks for keyboard events
 * @returns Cleanup function
 * 
 * @example
 * ```tsx
 * useKeyboardEvents({
 *   onShow: (height) => console.log('Keyboard shown:', height),
 *   onHide: () => console.log('Keyboard hidden'),
 * });
 * ```
 */
export const useKeyboardEvents = (callbacks: {
  onShow?: (height: number, duration?: number) => void;
  onHide?: (duration?: number) => void;
}) => {
  const showSubscription = useRef<EmitterSubscription | null>(null);
  const hideSubscription = useRef<EmitterSubscription | null>(null);

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      const height = e.endCoordinates?.height || 0;
      const duration = e.duration || 250;
      callbacks.onShow?.(height, duration);
    };

    const onHide = (e: KeyboardEvent) => {
      const duration = e.duration || 250;
      callbacks.onHide?.(duration);
    };

    showSubscription.current = Keyboard.addListener(keyboardEvents.show, onShow);
    hideSubscription.current = Keyboard.addListener(keyboardEvents.hide, onHide);

    return () => {
      showSubscription.current?.remove();
      hideSubscription.current?.remove();
    };
  }, [callbacks.onShow, callbacks.onHide]);

  return () => {
    showSubscription.current?.remove();
    hideSubscription.current?.remove();
  };
};

/**
 * Hook for keyboard avoidance with animated value
 * 
 * @param options - Options for keyboard avoidance
 * @returns Animated translateY value and cleanup function
 * 
 * @example
 * ```tsx
 * const { translateY } = useKeyboardAvoidance({
 *   offset: 60,
 *   enabled: true,
 * });
 * ```
 */
export const useKeyboardAvoidance = (options?: {
  offset?: number;
  enabled?: boolean;
}) => {
  const { offset = 60, enabled = true } = options || {};
  const translateY = useRef(new Animated.Value(0)).current;

  useKeyboardEvents({
    onShow: (height, duration) => {
    if (!enabled) return;

      const moveUp = Math.max(0, height - offset);
      Animated.timing(translateY, {
        toValue: -moveUp,
        duration: duration || 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    onHide: (duration) => {
      if (!enabled) return;

      Animated.timing(translateY, {
        toValue: 0,
        duration: duration || 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
  });

  return { translateY };
};

/**
 * Dismiss keyboard
 */
export const dismissKeyboard = (): void => {
  Keyboard.dismiss();
};

/**
 * Check if keyboard is currently visible
 * Note: This is a best-effort check and may not be 100% accurate
 */
export const isKeyboardVisible = (): boolean => {
  // This is a simple check - for more accurate detection,
  // you might want to track keyboard state in your app
  return false;
};
