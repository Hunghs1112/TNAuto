/**
 * Card Component
 * 
 * Reusable card component with variants and consistent styling
 */

import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { Colors } from '../../../constants/colors';
import { spacing, SpacingKey } from '../../../design-system/spacing';
import { getShadowStyle, ShadowLevel } from '../../../design-system/shadows';
import { borderRadius, BorderRadiusKey, borderPresets } from '../../../design-system/borders';
import { getPadding } from '../../../design-system/layout';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card variant */
  variant?: CardVariant;
  /** Padding size (spacing key or number) */
  padding?: SpacingKey | number;
  /** Custom padding object */
  paddingCustom?: {
    horizontal?: SpacingKey | number;
    vertical?: SpacingKey | number;
    top?: SpacingKey | number;
    bottom?: SpacingKey | number;
  };
  /** Border radius (border radius key or number) */
  borderRadius?: BorderRadiusKey | number;
  /** Shadow level */
  shadow?: ShadowLevel;
  /** Background color */
  backgroundColor?: string;
  /** Border color (for outlined variant) */
  borderColor?: string;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Test ID */
  testID?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'base',
  paddingCustom,
  borderRadius: borderRadiusProp,
  shadow = 'sm',
  backgroundColor = Colors.background.light,
  borderColor = Colors.border,
  style,
  testID,
}) => {
  // Determine border radius
  const cardBorderRadius = borderRadiusProp 
    ? (typeof borderRadiusProp === 'number' ? borderRadiusProp : borderRadius[borderRadiusProp])
    : borderPresets.card;

  // Determine shadow based on variant
  const shadowStyle = variant === 'elevated' 
    ? getShadowStyle('lg')
    : variant === 'outlined'
    ? {}
    : getShadowStyle(shadow);

  // Determine border style
  const borderStyle: ViewStyle = variant === 'outlined' 
    ? {
        borderWidth: 1,
        borderColor,
      }
    : {};

  // Get padding style
  const paddingStyle = paddingCustom 
    ? getPadding(undefined, paddingCustom)
    : getPadding(padding);

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor,
          borderRadius: cardBorderRadius,
          ...shadowStyle,
          ...borderStyle,
          ...paddingStyle,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

Card.displayName = 'Card';

export default React.memo(Card);
