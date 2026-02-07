import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { spacing } from "../../design-system/spacing";
import { textStyles } from "../../design-system/typography";

export const styles = StyleSheet.create({
  // Root
  container: {
    flex: 1,
    backgroundColor: Colors.background.muted,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero (Phần màu)
  heroContainer: {
    height: 220,
  },
  heroGradient: {
    flex: 1,
    paddingBottom: spacing["6xl"],
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing["2xl"],
    paddingHorizontal: spacing.xl,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.65)",
    marginRight: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.12)",
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
    color: "rgba(255,255,255,0.85)",
  },
  userRole: {
    ...textStyles.bodySmall,
    color: "rgba(255,255,255,0.78)",
    marginTop: 4,
  },

  // White sheet (Phần trắng)
  sheet: {
    marginTop: -28,
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    flex: 1,
  },
  sheetContent: {
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },

  // Section
  section: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.bodyStrong,
    color: Colors.text.secondary,
    marginBottom: spacing.sm,
  },

  // List
  listCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginLeft: spacing.lg + 40 + spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rowText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowTitle: {
    ...textStyles.bodyStrong,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  rowSubtitle: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
  },

  // Actions
  actions: {
    paddingHorizontal: spacing.xl,
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
