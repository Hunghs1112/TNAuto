/**
 * Layout System
 * 
 * Common layout patterns and utilities
 */

import { ViewStyle } from 'react-native';
import { spacing, SpacingKey } from './spacing';
import { Colors } from '../constants/colors';

  /**
   * Flexbox utilities
   */
export const flex = {
  /** Flex row with center alignment */
  rowCenter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  /** Flex row with space between */
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  /** Flex row with space around */
  rowAround: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-around' as const,
  },
  /** Flex column with center alignment */
  columnCenter: {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  /** Flex column with start alignment */
  columnStart: {
    flexDirection: 'column' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
  },
} as const;

/**
 * Get padding style
 * 
 * @param all - Padding for all sides
 * @param options - Individual padding values
 * @returns Padding style object
 */
export const getPadding = (
  all?: SpacingKey | number,
  options?: {
    horizontal?: SpacingKey | number;
    vertical?: SpacingKey | number;
    top?: SpacingKey | number;
    bottom?: SpacingKey | number;
    left?: SpacingKey | number;
    right?: SpacingKey | number;
  }
): ViewStyle => {
  const style: ViewStyle = {};

  if (all !== undefined) {
    const value = typeof all === 'number' ? all : spacing[all];
    style.padding = value;
  }

  if (options) {
    if (options.horizontal !== undefined) {
      const value = typeof options.horizontal === 'number' 
        ? options.horizontal 
        : spacing[options.horizontal];
      style.paddingHorizontal = value;
    }
    if (options.vertical !== undefined) {
      const value = typeof options.vertical === 'number' 
        ? options.vertical 
        : spacing[options.vertical];
      style.paddingVertical = value;
    }
    if (options.top !== undefined) {
      const value = typeof options.top === 'number' ? options.top : spacing[options.top];
      style.paddingTop = value;
    }
    if (options.bottom !== undefined) {
      const value = typeof options.bottom === 'number' ? options.bottom : spacing[options.bottom];
      style.paddingBottom = value;
    }
    if (options.left !== undefined) {
      const value = typeof options.left === 'number' ? options.left : spacing[options.left];
      style.paddingLeft = value;
    }
    if (options.right !== undefined) {
      const value = typeof options.right === 'number' ? options.right : spacing[options.right];
      style.paddingRight = value;
    }
  }

  return style;
};
  
  /**
 * Get margin style
 * 
 * @param all - Margin for all sides
 * @param options - Individual margin values
 * @returns Margin style object
 */
export const getMargin = (
  all?: SpacingKey | number,
  options?: {
    horizontal?: SpacingKey | number;
    vertical?: SpacingKey | number;
    top?: SpacingKey | number;
    bottom?: SpacingKey | number;
    left?: SpacingKey | number;
    right?: SpacingKey | number;
  }
): ViewStyle => {
  const style: ViewStyle = {};

  if (all !== undefined) {
    const value = typeof all === 'number' ? all : spacing[all];
    style.margin = value;
  }

  if (options) {
    if (options.horizontal !== undefined) {
      const value = typeof options.horizontal === 'number' 
        ? options.horizontal 
        : spacing[options.horizontal];
      style.marginHorizontal = value;
    }
    if (options.vertical !== undefined) {
      const value = typeof options.vertical === 'number' 
        ? options.vertical 
        : spacing[options.vertical];
      style.marginVertical = value;
    }
    if (options.top !== undefined) {
      const value = typeof options.top === 'number' ? options.top : spacing[options.top];
      style.marginTop = value;
    }
    if (options.bottom !== undefined) {
      const value = typeof options.bottom === 'number' ? options.bottom : spacing[options.bottom];
      style.marginBottom = value;
    }
    if (options.left !== undefined) {
      const value = typeof options.left === 'number' ? options.left : spacing[options.left];
      style.marginLeft = value;
    }
    if (options.right !== undefined) {
      const value = typeof options.right === 'number' ? options.right : spacing[options.right];
      style.marginRight = value;
    }
  }

  return style;
};
  
  /**
 * Common layout presets
 */
export const layoutPresets = {
  /** Screen container */
  screen: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  /** Content container */
  content: {
    flex: 1,
    width: '100%',
  },
  /** Centered container */
  centered: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  /** Full width */
  fullWidth: {
    width: '100%',
  },
  /** Full height */
  fullHeight: {
    height: '100%',
  },
} as const;
