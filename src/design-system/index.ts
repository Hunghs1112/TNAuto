/**
 * Design System
 * 
 * Centralized design system for consistent UI/UX across iOS and Android
 * 
 * @example
 * ```tsx
 * import { spacing, getShadowStyle, borderRadius } from '@/design-system';
 * 
 * const styles = StyleSheet.create({
 *   container: {
 *     padding: spacing.xl,
 *     borderRadius: borderRadius.xl,
 *     ...getShadowStyle('md'),
 *   },
 * });
 * ```
 */

// Spacing
export * from './spacing';

// Shadows
export * from './shadows';

// Borders
export * from './borders';

// Elevation
export * from './elevation';

// Typography
export * from './typography';

// Layout
export * from './layout';
