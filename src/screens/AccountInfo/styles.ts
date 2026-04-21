import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { textStyles } from "../../design-system/typography";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.muted,
  },
  scrollContent: {
    paddingBottom: spacing["2xl"],
  },

  heroContainer: {
    minHeight: 250,
  },
  heroSurface: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: 72,
    backgroundColor: Colors.primary,
    overflow: "hidden",
  },
  heroDecorativeContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.12,
  },
  heroDecorativeCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: Colors.background.light,
  },
  heroCircle1: {
    width: 220,
    height: 220,
    top: -84,
    right: -60,
  },
  heroCircle2: {
    width: 150,
    height: 150,
    bottom: 20,
    left: -48,
  },
  heroCircle3: {
    width: 120,
    height: 120,
    top: "36%",
    right: 28,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  avatarPressable: {
    marginRight: spacing.lg,
  },
  avatarShell: {
    width: 108,
    height: 108,
    borderRadius: 34,
    padding: 4,
    backgroundColor: Colors.alpha.white12,
    borderWidth: 1,
    borderColor: Colors.alpha.white20,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  avatarContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: Colors.alpha.white12,
    overflow: "hidden",
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  avatarLoading: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.alpha.white12,
  },
  avatarEditBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.secondaryLight,
    borderWidth: 2,
    borderColor: Colors.background.light,
  },
  heroTextBlock: {
    flex: 1,
    gap: 4,
  },
  heroName: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    letterSpacing: -0.4,
    color: Colors.background.light,
  },
  heroPhone: {
    ...textStyles.body,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.alpha.white85,
  },
  heroEmail: {
    ...textStyles.bodySmall,
    color: Colors.alpha.white65,
    marginTop: 2,
  },

  sheet: {
    marginTop: -36,
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 420,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  sectionCard: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.primary,
  },

  lockedInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    marginBottom: spacing.lg,
  },
  lockedInfoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
    marginRight: spacing.md,
  },
  lockedInfoText: {
    flex: 1,
  },
  lockedInfoLabel: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  lockedInfoValue: {
    ...textStyles.bodyStrong,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.primary,
  },

  fieldBlock: {
    marginBottom: spacing.md,
  },
  fieldBlockLast: {
    marginBottom: 0,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  fieldLabel: {
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.secondary,
  },
  input: {
    marginBottom: 0,
  },
  dateInput: {
    marginBottom: 0,
  },
  vehicleManageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
  },
  vehicleManageRowPressed: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.alpha.primary20,
  },
  vehicleManageIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
    marginRight: spacing.md,
  },
  vehicleManageText: {
    flex: 1,
    marginRight: spacing.md,
  },
  vehicleManageTitle: {
    ...textStyles.bodyStrong,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.primary,
  },
  vehicleManageSubtitle: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  actionSection: {
    paddingTop: spacing.xs,
    gap: 0,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.alpha.black90,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: Colors.alpha.black50,
    borderRadius: 20,
    padding: 10,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
