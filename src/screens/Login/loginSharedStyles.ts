import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { borderRadius } from "../../design-system/borders";
import { textStyles } from "../../design-system/typography";

export const loginSharedStyles = StyleSheet.create({
  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
    marginBottom: spacing.lg,
  },
  // Không dùng logo lớn nữa — logo nằm trong headerBand của AuthShell
  logoFrame: {
    display: "none",
    width: 0,
    height: 0,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  formBody: {
    width: "100%",
    marginTop: spacing.md,
  },
  inputContainer: {
    gap: spacing.base,
    width: "100%",
    marginBottom: spacing.xl,
  },
  actions: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  signup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  registerPrompt: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
  },
  registerLink: {
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginLeft: spacing.xs,
  },
  roleIntroText: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    marginBottom: spacing.md,
  },
  roleList: {
    gap: spacing.base,
  },
  roleCard: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: Colors.background.light,
  },
  roleTitle: {
    ...textStyles.body,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },
  roleMeta: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    marginTop: spacing.xs,
  },
  secondaryAction: {
    marginTop: spacing.lg,
  },
  readOnlyInput: {
    opacity: 0.8,
  },
});
