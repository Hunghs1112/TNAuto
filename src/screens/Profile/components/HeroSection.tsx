// src/screens/Profile/components/HeroSection.tsx
import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typo';
import { spacing } from '../../../design-system/spacing';
import { textStyles } from '../../../design-system/typography';
import { HeroSectionProps } from '../types';

const HeroSection = ({
  userName,
  userPhone,
  avatarUrl,
  roleLabel,
  onAvatarPress,
}: HeroSectionProps) => {
  const [avatarError, setAvatarError] = useState(false);

  const displayAvatar = avatarUrl && !avatarError ? avatarUrl : null;
  const initial = userName ? userName.charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.container}>
      {/* Decorative circles */}
      <View style={styles.decorativeContainer} pointerEvents="none">
        <View style={[styles.decorativeCircle, styles.circle1]} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
        <View style={[styles.decorativeCircle, styles.circle3]} />
      </View>

      {/* Centered content */}
      <View style={styles.content}>
        {/* Avatar */}
        <Pressable
          onPress={onAvatarPress}
          style={({ pressed }) => [pressed && styles.avatarPressed]}
          accessibilityRole="button"
          accessibilityLabel="Chỉnh sửa ảnh đại diện"
        >
          <View style={styles.avatarShell}>
            {displayAvatar ? (
              <Image
                source={{ uri: displayAvatar }}
                style={styles.avatar}
                resizeMode="cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
          </View>

          {/* Camera badge */}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={11} color={Colors.background.light} />
          </View>
        </Pressable>

        {/* Name */}
        <Text style={styles.userName} numberOfLines={1}>
          {userName}
        </Text>

        {/* Phone */}
        <Text style={styles.userPhone}>{userPhone}</Text>

        {/* Role chip */}
        <View style={styles.roleChip}>
          <Ionicons name="sparkles-outline" size={11} color={Colors.background.light} />
          <Text style={styles.roleChipText}>{roleLabel}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  decorativeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.12,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.background.light,
  },
  circle1: {
    width: 220,
    height: 220,
    top: -80,
    right: -60,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -40,
    left: -50,
  },
  circle3: {
    width: 100,
    height: 100,
    top: '20%',
    right: 30,
  },

  // ── Centered layout ──────────────────────────────────────────────────────────
  content: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'] + spacing.lg, // extra for sheet overlap
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },

  // ── Avatar ───────────────────────────────────────────────────────────────────
  avatarPressed: {
    opacity: 0.85,
  },
  avatarShell: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 3,
    backgroundColor: Colors.alpha.white12,
    borderWidth: 2,
    borderColor: Colors.alpha.white30,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 30,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.background.light,
    letterSpacing: -0.5,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Text ─────────────────────────────────────────────────────────────────────
  userName: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    letterSpacing: -0.3,
    color: Colors.background.light,
    textAlign: 'center',
  },
  userPhone: {
    ...textStyles.bodySmall,
    color: Colors.alpha.white65,
    textAlign: 'center',
  },

  // ── Role chip ─────────────────────────────────────────────────────────────────
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.alpha.white14,
    borderWidth: 1,
    borderColor: Colors.alpha.white20,
  },
  roleChipText: {
    ...textStyles.caption,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    letterSpacing: 0.3,
    color: Colors.background.light,
  },
});

export default React.memo(HeroSection);
