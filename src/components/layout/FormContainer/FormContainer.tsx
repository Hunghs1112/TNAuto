/**
 * FormContainer Component - Optimized with Full Background
 * 
 * Professional form container with optimized keyboard handling
 * Ensures entire container with background moves up smoothly
 */

import React, { ReactNode, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableWithoutFeedback, Keyboard, Animated, Easing, Platform, RefreshControl } from 'react-native';
import { KeyboardAvoidingView } from '../KeyboardAvoidingView';
import { spacing, SpacingKey } from '../../../design-system/spacing';
import { selectPlatform } from '../../../utils/platform';
import { Colors } from '../../../constants/colors';

export interface FormContainerProps {
  /** Form content */
  children: ReactNode;
  /** Enable keyboard avoiding */
  keyboardAvoiding?: boolean;
  /** Enable scroll view */
  withScroll?: boolean;
  /** Dismiss keyboard on outside press */
  dismissKeyboardOnPress?: boolean;
  /** Form padding (spacing key or number) */
  padding?: SpacingKey | number;
  /** Custom padding object */
  paddingCustom?: {
    horizontal?: SpacingKey | number;
    vertical?: SpacingKey | number;
    top?: SpacingKey | number;
    bottom?: SpacingKey | number;
  };
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Custom content container style */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Keyboard vertical offset */
  keyboardVerticalOffset?: number;
  /** Background color */
  backgroundColor?: string;
  /** Refresh control for scroll view */
  refreshControl?: React.ReactElement<typeof RefreshControl>;
  /** Test ID */
  testID?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  keyboardAvoiding = true,
  withScroll = true,
  dismissKeyboardOnPress = true,
  padding = 'xl',
  paddingCustom,
  style,
  contentContainerStyle,
  keyboardVerticalOffset,
  backgroundColor = Colors.background.light,
  refreshControl,
  testID,
}) => {
  // Animated value for smooth keyboard animation - using single ref
  const translateY = useRef(new Animated.Value(0)).current;
  const keyboardHeight = useRef(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Get padding value
  const getPaddingValue = useCallback((key: SpacingKey | number): number => {
    return typeof key === 'number' ? key : spacing[key];
  }, []);

  // Build padding style
  const paddingStyle: ViewStyle = React.useMemo(() => {
    const style: ViewStyle = {};
    if (paddingCustom) {
      if (paddingCustom.horizontal !== undefined) {
        style.paddingHorizontal = getPaddingValue(paddingCustom.horizontal);
      }
      if (paddingCustom.vertical !== undefined) {
        style.paddingVertical = getPaddingValue(paddingCustom.vertical);
      }
      if (paddingCustom.top !== undefined) {
        style.paddingTop = getPaddingValue(paddingCustom.top);
      }
      if (paddingCustom.bottom !== undefined) {
        style.paddingBottom = getPaddingValue(paddingCustom.bottom);
      }
    } else {
      const paddingValue = getPaddingValue(padding);
      style.padding = paddingValue;
    }
    return style;
  }, [padding, paddingCustom, getPaddingValue]);

  // Keyboard vertical offset with safe defaults
  const defaultKeyboardOffset = keyboardVerticalOffset !== undefined
    ? keyboardVerticalOffset
    : selectPlatform(0, 0);

  // Cancel ongoing animation
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
    // Đẩy lên 35% chiều cao bàn phím — đủ để input không bị che
    const offset = Math.max(keyboardHeight.current * 0.35 - (defaultKeyboardOffset || 0), 0);
    
    const duration = Platform.OS === 'ios' 
      ? (event.duration || 250) 
      : 250;
    
    animationRef.current = Animated.timing(translateY, {
      toValue: -offset,
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // iOS default easing
      useNativeDriver: true,
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

  // Keyboard event listeners - optimized
  useEffect(() => {
    if (!keyboardAvoiding) return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardWillShowListener = Keyboard.addListener(showEvent, handleKeyboardShow);
    const keyboardWillHideListener = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      cancelAnimation();
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardAvoiding, handleKeyboardShow, handleKeyboardHide, cancelAnimation]);

  const content = (
    <View
      style={[
        styles.content,
        paddingStyle,
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  // Add padding top to prevent content from overlapping header when keyboard appears
  const scrollContentStyle = withScroll ? {
    ...paddingStyle,
    paddingTop: paddingStyle.paddingTop !== undefined 
      ? paddingStyle.paddingTop 
      : (paddingStyle.padding !== undefined && paddingStyle.padding > 0)
        ? paddingStyle.padding
        : spacing.md,
    ...contentContainerStyle,
  } : undefined;

  // Animated style for entire container - includes background
  const animatedContainerStyle = keyboardAvoiding ? {
    transform: [{ translateY }],
    backgroundColor, // Ensure background moves with container
  } : {
    backgroundColor, // Background even when not animating
  };

  const keyboardAvoidingView = (
    <Animated.View
      style={[
        styles.container,
        animatedContainerStyle,
        style,
      ]}
      testID={testID}
    >
      <KeyboardAvoidingView
        withScroll={withScroll}
        contentContainerStyle={withScroll ? undefined : contentContainerStyle}
        scrollViewProps={withScroll ? {
          contentContainerStyle: scrollContentStyle,
          refreshControl: refreshControl,
        } : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
        enabled={false} // Disable KeyboardAvoidingView animation, use our container animation
      >
        {withScroll ? children : content}
      </KeyboardAvoidingView>
    </Animated.View>
  );

  if (dismissKeyboardOnPress) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {keyboardAvoidingView}
      </TouchableWithoutFeedback>
    );
  }

  return keyboardAvoidingView;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%', // Ensure full width
  },
  content: {
    flex: 1,
    width: '100%',
  },
});

FormContainer.displayName = 'FormContainer';

export default React.memo(FormContainer);
