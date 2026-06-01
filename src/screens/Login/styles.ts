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
  formGroup: {
    width: "100%",
    gap: 12,
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
    width: 200,
    height: 150,
    alignSelf: "center",
    marginVertical: spacing.lg,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  
  // Input area spacing
  inputContainer: {
    width: "100%",
    marginBottom: spacing.md,
  },
  // Wrapper bao quanh TextInput + error icon
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ff4d4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 15,
  },
  // Actions area (buttons)
  actions: {
    marginTop: spacing.xs,
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