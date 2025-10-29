// src/utils/animationHelpers.ts
// Optimized animation helpers with native driver support
import { Animated } from 'react-native';
import { PerformanceConfig } from '../config/performance';

/**
 * Creates an optimized spring animation
 */
export const createSpringAnimation = (
  value: Animated.Value,
  toValue: number,
  options?: {
    speed?: number;
    bounciness?: number;
    onComplete?: () => void;
  }
): Animated.CompositeAnimation => {
  return Animated.spring(value, {
    toValue,
    useNativeDriver: PerformanceConfig.animation.useNativeDriver,
    speed: options?.speed || 50,
    bounciness: options?.bounciness || 4,
  });
};

/**
 * Creates an optimized timing animation
 */
export const createTimingAnimation = (
  value: Animated.Value,
  toValue: number,
  duration?: number
): Animated.CompositeAnimation => {
  return Animated.timing(value, {
    toValue,
    duration: duration || PerformanceConfig.animation.duration.normal,
    useNativeDriver: PerformanceConfig.animation.useNativeDriver,
  });
};

/**
 * Creates a fade-in animation
 */
export const fadeIn = (
  value: Animated.Value,
  duration?: number
): Animated.CompositeAnimation => {
  return createTimingAnimation(value, 1, duration || PerformanceConfig.animation.duration.fast);
};

/**
 * Creates a fade-out animation
 */
export const fadeOut = (
  value: Animated.Value,
  duration?: number
): Animated.CompositeAnimation => {
  return createTimingAnimation(value, 0, duration || PerformanceConfig.animation.duration.fast);
};

/**
 * Creates a scale press animation
 */
export const createPressAnimation = (
  scaleValue: Animated.Value,
  pressed: boolean
): Animated.CompositeAnimation => {
  return createSpringAnimation(scaleValue, pressed ? 0.97 : 1);
};

/**
 * Runs multiple animations in parallel
 */
export const runParallelAnimations = (
  animations: Animated.CompositeAnimation[],
  onComplete?: () => void
): void => {
  Animated.parallel(animations).start(onComplete);
};

/**
 * Runs multiple animations in sequence
 */
export const runSequenceAnimations = (
  animations: Animated.CompositeAnimation[],
  onComplete?: () => void
): void => {
  Animated.sequence(animations).start(onComplete);
};

