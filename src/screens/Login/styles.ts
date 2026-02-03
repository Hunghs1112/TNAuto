import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { borderRadius } from "../../design-system/borders";
import { textStyles } from "../../design-system/typography";

export const styles = StyleSheet.create({
  form: {
    flex: 1,
    width: "100%",
  },
 
  welcomeText: {
    ...textStyles.h2,
    color: Colors.primary,
    marginTop: 0,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    marginBottom: spacing.xl,
  },
  logoFrame: {
    width: "100%",
    maxWidth: 520,
    height: 260,
    alignSelf: "center",
    marginVertical: spacing.xl,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  
  // Input area spacing
  inputContainer: {
    gap: spacing.base,
    width: "100%",
    marginBottom: spacing.xl,
  },
  // Backward compatible: single input wrapper
  inputWrapper: {
    marginBottom: spacing.base,
  },
  // Actions area (buttons)
  actions: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  
  customerLink: {
    marginTop: 0,
    marginBottom: spacing.base,
    alignItems: 'flex-end'
  },

  customerLinkText: {
    marginTop: spacing.base,
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    textAlign: "left",
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
  bar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "4.19%",
    alignItems: "center",
  },
  barInner: {
    width: 134,
    height: 5,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.text.placeholder,
    marginBottom: spacing.sm,
  },
});