import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { spacing } from '../../design-system/spacing';
import { borderRadius } from '../../design-system/borders';
import { textStyles } from '../../design-system/typography';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';
import SectionHeader from '../../screens/Home/SectionHeader';
import { ManagementSectionData, ManagementSectionProps } from '../../types/managerHome';

// ─── ManagementCard ───────────────────────────────────────────────────────────

interface ManagementCardProps {
  section: ManagementSectionData;
  testID?: string;
}

/**
 * ManagementCard (internal)
 *
 * Displays a single management domain card with icon, title, count, and subtitle.
 * When totalCount === 0 AND activeCount === 0 (error state), shows "—" instead of "0".
 * Pressable with minimum 44px touch target (WCAG 2.5.5).
 */
const ManagementCard: React.FC<ManagementCardProps> = ({ section, testID }) => {
  const isErrorState = section.totalCount === 0 && section.activeCount === 0;
  const displayCount = isErrorState ? '—' : section.totalCount.toLocaleString('en-US');

  return (
    <Pressable
      onPress={section.onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${section.title}: ${displayCount}`}
      accessibilityHint={`Điều hướng đến màn hình ${section.title}`}
      testID={testID ?? `management-card-${section.key}`}
    >
      {/* Icon container */}
      <View style={styles.iconContainer}>
        <Ionicons
          name={section.icon as any}
          size={24}
          color={Colors.primary}
        />
      </View>

      {/* Title */}
      <Text
        style={styles.title}
        numberOfLines={2}
        testID={`${testID ?? `management-card-${section.key}`}-title`}
      >
        {section.title}
      </Text>

      {/* Count */}
      <Text
        style={styles.count}
        testID={`${testID ?? `management-card-${section.key}`}-count`}
      >
        {displayCount}
      </Text>

      {/* Subtitle */}
      <Text
        style={styles.subtitle}
        numberOfLines={2}
        testID={`${testID ?? `management-card-${section.key}`}-subtitle`}
      >
        {section.subtitle}
      </Text>
    </Pressable>
  );
};

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

/**
 * SkeletonCard (internal)
 *
 * Placeholder card shown while management stats are loading.
 * Matches the same dimensions as ManagementCard.
 */
const SkeletonCard: React.FC<{ testID?: string }> = ({ testID }) => (
  <View style={[styles.card, styles.skeletonCard]} testID={testID}>
    {/* Icon placeholder */}
    <SkeletonLoader
      width={40}
      height={40}
      borderRadius={borderRadius.full}
      style={styles.skeletonIcon}
    />
    {/* Title placeholder */}
    <SkeletonLoader
      width="70%"
      height={14}
      borderRadius={borderRadius.sm}
      style={styles.skeletonTitle}
    />
    {/* Count placeholder */}
    <SkeletonLoader
      width={48}
      height={28}
      borderRadius={borderRadius.sm}
      style={styles.skeletonCount}
    />
    {/* Subtitle placeholder */}
    <SkeletonLoader
      width="90%"
      height={12}
      borderRadius={borderRadius.sm}
    />
  </View>
);

// ─── ManagementSection ────────────────────────────────────────────────────────

const SKELETON_COUNT = 6;

/**
 * ManagementSection Component
 *
 * Renders a 2-column grid of management domain cards (customers, employees,
 * orders, services, products, etc.). Shows skeleton cards while loading.
 *
 * When a section has an error (totalCount === 0 AND activeCount === 0),
 * the card displays "—" instead of "0" for the count.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */
const ManagementSection: React.FC<ManagementSectionProps> = ({
  sections,
  isLoading,
}) => {
  return (
    <View style={styles.container} testID="management-section">
      <SectionHeader title="Quản lý" />

      <View style={styles.grid} testID="management-section-grid">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <SkeletonCard
                key={`skeleton-${index}`}
                testID={`management-skeleton-card-${index}`}
              />
            ))
          : sections.map((section) => (
              <ManagementCard
                key={section.key}
                section={section}
                testID={`management-card-${section.key}`}
              />
            ))}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  // ── Card ──
  card: {
    width: '48%',
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    minHeight: 44, // WCAG minimum touch target
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: Colors.interactive.pressed,
  },

  // ── Card content ──
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...textStyles.label,
    color: Colors.text.primary,
    marginBottom: spacing.xs,
  },
  count: {
    ...textStyles.h2,
    color: Colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.caption,
    color: Colors.text.secondary,
  },

  // ── Skeleton card ──
  skeletonCard: {
    // Override card defaults for skeleton layout
    shadowOpacity: 0,
    elevation: 0,
  },
  skeletonIcon: {
    marginBottom: spacing.sm,
  },
  skeletonTitle: {
    marginBottom: spacing.xs,
  },
  skeletonCount: {
    marginBottom: spacing.xs,
  },
});

export default React.memo(ManagementSection);
