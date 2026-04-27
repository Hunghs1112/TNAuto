import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { textStyles } from '../../design-system/typography';
import { spacing } from '../../design-system/spacing';
import { borderRadius } from '../../design-system/borders';
import { OptimizedImage } from '../OptimizedImage';
import { Ionicons } from '@react-native-vector-icons/ionicons';

interface GarageSummaryCardProps {
  name: string;
  address?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  canChangeGarage?: boolean;
  onPress?: () => void;
  testID?: string;
}

/**
 * GarageSummaryCard Component
 * 
 * Displays garage information including name, address, avatar, and banner image.
 * Supports lazy loading for images with placeholders.
 * Disables garage switching for garage_admin role.
 * Applies responsive layout that works across different screen sizes.
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 6.6**
 */
export const GarageSummaryCard: React.FC<GarageSummaryCardProps> = ({
  name,
  address,
  avatarUrl,
  bannerUrl,
  canChangeGarage = false,
  onPress,
  testID = 'garage-summary-card',
}) => {
  const handlePress = () => {
    if (canChangeGarage && onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!canChangeGarage}
      accessible={true}
      accessibilityRole={canChangeGarage ? 'button' : 'none'}
      accessibilityLabel={`Garage ${name}${address ? `, ${address}` : ''}`}
      accessibilityHint={canChangeGarage ? 'Nhấn để thay đổi garage' : undefined}
      style={({ pressed }) => [
        styles.container,
        canChangeGarage && pressed && styles.pressed,
      ]}
      testID={testID}
    >
      {/* Banner Image */}
      {bannerUrl && (
        <View style={styles.bannerContainer}>
          <OptimizedImage
            source={{ uri: bannerUrl }}
            width={undefined}
            height={120}
            borderRadius={0}
            style={styles.banner}
            showPlaceholder={true}
            fallbackIcon="image-outline"
            testID={`${testID}-banner`}
          />
          <View style={styles.bannerOverlay} />
        </View>
      )}

      {/* Content */}
      <View style={[styles.content, !bannerUrl && styles.contentNoBanner]}>
        {/* Avatar and Info */}
        <View style={styles.infoRow}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <OptimizedImage
                source={{ uri: avatarUrl }}
                width={56}
                height={56}
                borderRadius={28}
                showPlaceholder={true}
                fallbackIcon="business-outline"
                testID={`${testID}-avatar`}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons 
                  name="business-outline" 
                  size={28} 
                  color={Colors.text.secondary} 
                />
              </View>
            )}
          </View>

          {/* Garage Name and Address */}
          <View style={styles.textContainer}>
            <Text 
              style={styles.garageName} 
              numberOfLines={1}
              testID={`${testID}-name`}
            >
              {name}
            </Text>
            {address && (
              <View style={styles.addressRow}>
                <Ionicons 
                  name="location-outline" 
                  size={14} 
                  color={Colors.text.secondary} 
                />
                <Text 
                  style={styles.address} 
                  numberOfLines={2}
                  testID={`${testID}-address`}
                >
                  {address}
                </Text>
              </View>
            )}
          </View>

          {/* Change Garage Icon */}
          {canChangeGarage && (
            <View style={styles.iconContainer}>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={Colors.text.secondary} 
              />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    overflow: 'hidden',
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: Colors.neutral[100],
  },
  banner: {
    width: '100%',
    height: 120,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    padding: spacing.base,
    paddingTop: spacing.sm,
  },
  contentNoBanner: {
    paddingTop: spacing.base,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.sm,
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  garageName: {
    ...textStyles.h3,
    color: Colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs / 2,
  },
  address: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
