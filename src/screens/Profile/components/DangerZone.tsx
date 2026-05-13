// src/screens/Profile/components/DangerZone.tsx
import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typo';
import { spacing } from '../../../design-system/spacing';
import { textStyles } from '../../../design-system/typography';
import { DangerZoneProps } from '../types';

const DangerZone = ({
  onLogout,
  onDeleteAccount,
  isDeleting,
  userType,
}: DangerZoneProps) => {
  const isCustomer = userType === 'customer';

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.topDivider} />

      {/* Logout */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
        onPress={onLogout}
        accessibilityRole="button"
        accessibilityLabel="Đăng xuất"
      >
        <Ionicons name="log-out-outline" size={18} color={Colors.primary} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>

      {/* Delete account — customer only */}
      {isCustomer && (
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
            isDeleting && styles.deleteButtonDisabled,
          ]}
          onPress={onDeleteAccount}
          disabled={isDeleting}
          accessibilityRole="button"
          accessibilityLabel="Xóa tài khoản"
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={Colors.status.error} />
          ) : (
            <>
              <Ionicons
                name="trash-outline"
                size={16}
                color={Colors.status.error}
              />
              <Text style={styles.deleteText}>Xóa tài khoản</Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  topDivider: {
    height: 1,
    backgroundColor: Colors.alpha.primary08,
    marginBottom: spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  logoutButtonPressed: {
    backgroundColor: Colors.primarySoft,
  },
  logoutText: {
    ...textStyles.body,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.status.error,
  },
});

export default React.memo(DangerZone);
