/**
 * KeyboardAvoidingView Component - Optimized
 * 
 * Professional keyboard avoiding view with smooth animations
 * Optimized for performance and smooth user experience
 */

import React, { ReactNode, useEffect, useRef, useCallback } from 'react';
import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Platform,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ScrollView,
  ScrollViewProps,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';
import { selectPlatform, isIOS } from '../../../utils/platform';
import { spacing } from '../../../design-system/spacing';

export interface KeyboardAvoidingViewProps {
  /** Children content */
  children: ReactNode;
  /** Enable scroll view */
  withScroll?: boolean;
  /** Scroll view props */
  scrollViewProps?: ScrollViewProps;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Custom content container style */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Keyboard vertical offset (iOS only) */
  keyboardVerticalOffset?: number;
  /** Enable keyboard avoidance */
  enabled?: boolean;
  /** Behavior for iOS (padding, height, position) */
  behavior?: 'padding' | 'height' | 'position';
  /** Test ID */
  testID?: string;
}

const KeyboardAvoidingView: React.FC<KeyboardAvoidingViewProps> = ({
  children,
  withScroll = false,
  scrollViewProps,
  style,
  contentContainerStyle,
  keyboardVerticalOffset,
  enabled = true,
  behavior,
  testID,
}) => {
  // Animated value for smooth keyboard animation - using single ref for better performance
  const translateY = useRef(new Animated.Value(0)).current;
  const keyboardHeight = useRef(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Default behavior based on platform
  const defaultBehavior = behavior || selectPlatform('padding', undefined);

  // Keyboard vertical offset with safe defaults
  const defaultKeyboardOffset = keyboardVerticalOffset !== undefined
    ? keyboardVerticalOffset
    : selectPlatform(0, 0);

  // Cancel ongoing animation before starting new one
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  // Smooth keyboard show handler
  const handleKeyboardShow = useCallback((event: any) => {
    cancelAnimation();
    
    keyboardHeight.current = event.endCoordinates.height;
    const offset = keyboardHeight.current - (defaultKeyboardOffset || 0);
    
    // Use native event duration for iOS, fallback for Android
    const duration = Platform.OS === 'ios' 
      ? (event.duration || 250) 
      : 250;
    
    // Smooth bezier easing for natural feel
    animationRef.current = Animated.timing(translateY, {
      toValue: -offset,
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // iOS default easing - smoother
      useNativeDriver: true, // Critical for performance
    });
    
    animationRef.current.start((finished) => {
      if (finished) {
        animationRef.current = null;
      }
    });
  }, [translateY, defaultKeyboardOffset, cancelAnimation]);

  // Smooth keyboard hide handler
  const handleKeyboardHide = useCallback((event: any) => {
    cancelAnimation();
    
    const duration = Platform.OS === 'ios' 
      ? (event.duration || 250) 
      : 250;
    
    animationRef.current = Animated.timing(translateY, {
      toValue: 0,
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    });
    
    animationRef.current.start((finished) => {
      if (finished) {
        keyboardHeight.current = 0;
        animationRef.current = null;
      }
    });
  }, [translateY, cancelAnimation]);

  // Keyboard event listeners - optimized with useCallback
  useEffect(() => {
    if (!enabled) return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardWillShowListener = Keyboard.addListener(showEvent, handleKeyboardShow);
    const keyboardWillHideListener = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      cancelAnimation();
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [enabled, handleKeyboardShow, handleKeyboardHide, cancelAnimation]);

  // If ScrollView is enabled, use ScrollView with smooth keyboard animation
  if (withScroll) {
    const animatedStyle = enabled ? {
      transform: [{ translateY }],
    } : {};

    return (
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          style,
        ]}
        testID={testID}
      >
        <ScrollView
          {...scrollViewProps}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
            scrollViewProps?.contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          bounces={true}
          keyboardDismissMode="interactive" // Better UX - allows swipe to dismiss
          style={styles.scrollView} // Ensure ScrollView has full background
        >
          {children}
        </ScrollView>
      </Animated.View>
    );
  }

  // If no ScrollView, use smooth animated translation
  if (enabled) {
    const animatedStyle = {
      transform: [{ translateY }],
    };

    // For iOS, also use native KeyboardAvoidingView as fallback
    if (isIOS()) {
      return (
        <RNKeyboardAvoidingView
          testID={testID}
          style={[styles.container, style]}
          behavior={defaultBehavior}
          keyboardVerticalOffset={defaultKeyboardOffset}
          enabled={false} // Disable native behavior, use our animation
        >
          <Animated.View style={[styles.container, animatedStyle]}>
            {children}
          </Animated.View>
        </RNKeyboardAvoidingView>
      );
    }

    // For Android, use pure animation
    return (
      <Animated.View
        testID={testID}
        style={[
          styles.container,
          animatedStyle,
          style,
        ]}
      >
        {children}
      </Animated.View>
    );
  }

  // For disabled, just return children
  return (
    <RNKeyboardAvoidingView
      testID={testID}
      style={[styles.container, style]}
      behavior={undefined}
      enabled={false}
    >
      {children}
    </RNKeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%', // Ensure full width
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
});

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default React.memo(KeyboardAvoidingView);
