import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light, // White for bottom safe area
  },
  root: {
    flex: 1,
    backgroundColor: Colors.gradients.primary[0], // Gradient color for top safe area
  },
  body: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.background.light,
  },
  form: {
    flex: 1,
    marginTop: "2%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.background.light || "#FFFFFF",
  },
  textSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginTop: 0,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.secondary,
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
  
  // Input Container - unified spacing
  inputContainer: {
    gap: 16,
    width: "100%",
    marginBottom: 24,
  },
  helperText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
    marginTop: -8,
    marginLeft: 4,
  },
  
  customerLink: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: "flex-end",
  },
  customerLinkText: {
    fontSize: Typography.size.sm,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    textAlign: "left",
  },
  signup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  // Actions area (buttons)
  actions: {
    marginTop: 8,
    marginBottom: 4,
  },
  registerPrompt: {
    fontSize: Typography.size.sm,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  registerLink: {
    fontSize: Typography.size.sm,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginLeft: 5,
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
    borderRadius: 100,
    backgroundColor: Colors.text.placeholder,
    marginBottom: 9,
  },
});