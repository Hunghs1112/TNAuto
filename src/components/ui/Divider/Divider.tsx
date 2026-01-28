/**
 * Divider Component
 * 
 * Divider component for separating content
 */

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../../constants/colors';
import { spacing, SpacingKey } from '../../../design-system/spacing';

export type DividerVariant = 'horizontal' | 'vertical';

export interface DividerProps {
  /** Divider variant */
  variant?: DividerVariant;
  /** Divider color */
  color?: string;
  /** Divider thickness */
  thickness?: number;
  /** Margin (spacing key or number) */
  margin?: SpacingKey | number;
  /** Custom margin object */
  marginCustom?: {
    horizontal?: SpacingKey | number;
    vertical?: SpacingKey | number;
    top?: SpacingKey | number;
    bottom?: SpacingKey | number;
  };
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Test ID */
  testID?: string;
}

const Divider: React.FC<DividerProps> = ({
  variant = 'horizontal',
  color = Colors.divider,
  thickness = 1,
  margin,
  marginCustom,
  style,
  testID,
}) => {
  // Get margin value
  const getMarginValue = (key?: SpacingKey | number): number | undefined => {
    if (key === undefined) return undefined;
    return typeof key === 'number' ? key : spacing[key];
  };

  const marginStyle: ViewStyle = {};
  
  if (margin !== undefined) {
    const marginValue = getMarginValue(margin);
  if (variant === 'horizontal') {
      marginStyle.marginVertical = marginValue;
  } else {
      marginStyle.marginHorizontal = marginValue;
    }
  }

  if (marginCustom) {
    if (marginCustom.horizontal !== undefined) {
      marginStyle.marginHorizontal = getMarginValue(marginCustom.horizontal);
    }
    if (marginCustom.vertical !== undefined) {
      marginStyle.marginVertical = getMarginValue(marginCustom.vertical);
    }
    if (marginCustom.top !== undefined) {
      marginStyle.marginTop = getMarginValue(marginCustom.top);
    }
    if (marginCustom.bottom !== undefined) {
      marginStyle.marginBottom = getMarginValue(marginCustom.bottom);
    }
  }

  return (
    <View
      testID={testID}
      style={[
        variant === 'horizontal' ? styles.horizontal : styles.vertical,
        {
          backgroundColor: color,
          [variant === 'horizontal' ? 'height' : 'width']: thickness,
        },
        marginStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
});

Divider.displayName = 'Divider';

export default React.memo(Divider);
