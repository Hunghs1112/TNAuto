/**
 * Badge Component
 * 
 * Badge component for status indicators and labels
 */

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../../constants/colors';
import { spacing, SpacingKey } from '../../../design-system/spacing';
import { borderRadius, borderPresets } from '../../../design-system/borders';
import { TypographyUtils } from '../../../design-system/typography';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary';

export interface BadgeProps {
  /** Badge text */
  text: string;
  /** Badge variant */
  variant?: BadgeVariant;
  /** Size */
  size?: 'small' | 'medium' | 'large';
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
  /** Test ID */
  testID?: string;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'neutral',
  size = 'medium',
  backgroundColor,
  textColor,
  style,
  textStyle,
  testID,
}) => {
  // Get variant colors
  const getVariantColors = () => {
    if (backgroundColor && textColor) {
      return { bg: backgroundColor, text: textColor };
    }

    switch (variant) {
      case 'success':
        return { bg: Colors.status.success + '20', text: Colors.status.success };
      case 'error':
        return { bg: Colors.status.error + '20', text: Colors.status.error };
      case 'warning':
        return { bg: Colors.status.warning + '20', text: Colors.status.warning };
      case 'info':
        return { bg: Colors.status.info + '20', text: Colors.status.info };
      case 'primary':
        return { bg: Colors.primary + '20', text: Colors.primary };
      case 'neutral':
      default:
        return { bg: Colors.neutral[200], text: Colors.text.secondary };
    }
  };

  const colors = getVariantColors();

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: spacing.xs,
          paddingVertical: spacing.xs / 2,
          fontSize: TypographyUtils.size.xs,
        };
      case 'large':
        return {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          fontSize: TypographyUtils.size.sm,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs / 2,
          fontSize: TypographyUtils.size.xs,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderRadius: borderPresets.badge,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizeStyles.fontSize,
            fontFamily: TypographyUtils.fontFamily.medium,
            fontWeight: TypographyUtils.weight.medium,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

Badge.displayName = 'Badge';

export default React.memo(Badge);
