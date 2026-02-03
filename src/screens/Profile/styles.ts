import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { spacing } from "../../design-system/spacing";
import { textStyles } from "../../design-system/typography";

export const styles = StyleSheet.create({
  // Root & ScrollView
  container: {
    flex: 1,
    backgroundColor: Colors.background.muted,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Hero Header Section
  heroContainer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["4xl"],
    paddingHorizontal: spacing.xl,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.background.light,
    marginRight: spacing.lg,
  },
  heroText: {
    flex: 1,
  },
  userName: {
    ...textStyles.h2,
    color: Colors.background.light,
    marginBottom: 2,
  },
  userPhone: {
    ...textStyles.body,
    color: Colors.neutral[200],
  },

  // White sheet under header
  body: {
    marginTop: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  bodyInner: {
    backgroundColor: Colors.background.light,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Settings List
  settingsCard: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 64,
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  settingItemPressed: {
    backgroundColor: Colors.neutral[50],
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.lg,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  settingTitle: {
    ...textStyles.bodyStrong,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
  },

  // Action Buttons
  actionSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    minHeight: 48,
    borderWidth: 1,
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  actionButtonPressed: {
    opacity: 0.92,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },

  actionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  // Delete: filled danger
  deleteButton: {
    backgroundColor: Colors.status.error,
    borderColor: Colors.status.error,
  },
  deleteIconWrap: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  deleteButtonText: {
    ...textStyles.bodyStrong,
    color: Colors.background.light,
  },

  // Logout: outline (secondary hierarchy) but still prominent
  logoutButton: {
    backgroundColor: Colors.background.light,
    borderColor: Colors.primary,
  },
  logoutIconWrap: {
    backgroundColor: Colors.primarySoft,
  },
  logoutButtonText: {
    ...textStyles.bodyStrong,
    color: Colors.primary,
  },
});
