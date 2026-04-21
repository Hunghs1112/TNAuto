/**
 * Button Component
 * 
 * Enhanced button component with variants, sizes, and consistent styling
 * Replaces and extends ConfirmButton
 */

import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Animated, StyleProp, ViewStyle, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedView = Animated.createAnimatedComponent(View);
import { Colors } from '../../../constants/colors';
import { spacing } from '../../../design-system/spacing';
import { getShadowStyle, ShadowLevel } from '../../../design-system/shadows';
import { borderRadius, borderPresets } from '../../../design-system/borders';
import { TypographyUtils } from '../../../design-system/typography';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /** Button text */
  title: string;
  /** Button press handler */
  onPress?: () => void;
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom button color (for primary variant) */
  buttonColor?: string;
  /** Custom gradient colors */
  gradientColors?: string[];
  /** Custom text color */
  textColor?: string;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
  /** Test ID */
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress = () => {},
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
  disabled = false,
  loading = false,
  buttonColor,
  gradientColors,
  textColor,
  style,
  textStyle,
  testID,
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 36,
          paddingHorizontal: spacing.md,
          fontSize: TypographyUtils.size.sm,
        };
      case 'large':
        return {
          height: 52,
          paddingHorizontal: spacing.xl,
          fontSize: TypographyUtils.size.lg,
        };
      case 'medium':
      default:
        return {
          height: 44,
          paddingHorizontal: spacing.lg,
          fontSize: TypographyUtils.size.base,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Get variant styles
  const getVariantStyles = () => {
    const baseBorderRadius = borderPresets.button;

    switch (variant) {
      case 'primary':
        return {
          borderRadius: baseBorderRadius,
          shadow: getShadowStyle('md') as ViewStyle,
          useGradient: true,
        };
      case 'secondary':
        return {
          borderRadius: baseBorderRadius,
          shadow: getShadowStyle('sm') as ViewStyle,
          useGradient: false,
          backgroundColor: Colors.secondary,
        };
      case 'outline':
        return {
          borderRadius: baseBorderRadius,
          shadow: {},
          useGradient: false,
          backgroundColor: Colors.transparent,
          borderWidth: 2,
          borderColor: Colors.primary,
        };
      case 'ghost':
        return {
          borderRadius: baseBorderRadius,
          shadow: {},
          useGradient: false,
          backgroundColor: Colors.transparent,
        };
      default:
        return {
          borderRadius: baseBorderRadius,
          shadow: getShadowStyle('md') as ViewStyle,
          useGradient: true,
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Get text color
  const getTextColor = (): string => {
    if (textColor) return textColor;
    
    switch (variant) {
      case 'outline':
      case 'ghost':
        return Colors.primary;
      case 'secondary':
        return Colors.primary;
      case 'primary':
      default:
        return Colors.text.inverted;
    }
  };

  // Get gradient colors
  const getGradientColors = (): string[] => {
    if (gradientColors) return gradientColors;
    if (buttonColor) return [buttonColor, buttonColor];
    return Colors.gradients.primary;
  };

  const handlePressIn = useCallback(() => {
    if (!disabled && !loading) {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  }, [disabled, loading, scaleValue]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleValue]);

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  const buttonContent = (
    <AnimatedView
      style={[
        styles.buttonContainer,
        {
          width: fullWidth ? '100%' : undefined,
          height: sizeStyles.height,
          borderRadius: variantStyles.borderRadius,
          opacity: disabled || loading ? 0.5 : 1,
          transform: [{ scale: scaleValue }],
          ...variantStyles.shadow,
        },
        variantStyles.useGradient ? {} : {
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: (variantStyles as any).borderWidth,
          borderColor: (variantStyles as any).borderColor,
        },
        style,
      ]}
    >
      {variantStyles.useGradient ? (
        <AnimatedLinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            {
              height: sizeStyles.height,
              borderRadius: variantStyles.borderRadius,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={getTextColor()} />
          ) : (
            <Text
              style={[
                styles.buttonText,
                {
                  color: getTextColor(),
                  fontSize: sizeStyles.fontSize,
                  fontFamily: TypographyUtils.fontFamily.semibold,
                  fontWeight: TypographyUtils.weight.semibold,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </AnimatedLinearGradient>
      ) : (
        <View
          style={[
            styles.buttonContent,
            {
              height: sizeStyles.height,
              paddingHorizontal: sizeStyles.paddingHorizontal,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={getTextColor()} />
          ) : (
            <Text
              style={[
                styles.buttonText,
                {
                  color: getTextColor(),
                  fontSize: sizeStyles.fontSize,
                  fontFamily: TypographyUtils.fontFamily.semibold,
                  fontWeight: TypographyUtils.weight.semibold,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </View>
      )}
    </AnimatedView>
  );

  return (
    <TouchableOpacity
      testID={testID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={fullWidth ? styles.fullWidth : undefined}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

Button.displayName = 'Button';

export default React.memo(Button);
