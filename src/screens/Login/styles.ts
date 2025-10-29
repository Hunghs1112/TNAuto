import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
 
  welcomeText: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.secondary,
  },
  logo: {
    width: 320,
    height: 140,
    marginTop: 30,
    marginBottom: 30,
    alignSelf: "center",
  },
  
  // Input Container - Chỉ tăng gap giữa các input
  inputContainer: {
    gap: 10, // Gap giữa các input fields
    width: "100%",
    marginBottom: 10, // Khoảng cách với nút đăng nhập
  },
  
  // Single input style
  inputWrapper: {
    marginBottom: 10, // Khoảng cách với nút đăng nhập khi chỉ có 1 input
  },
  
  customerLink: {
    marginTop: 0,
    marginBottom: 10,
    alignItems: 'flex-end'
  },

  customerLinkText: {
    marginTop: 10,
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