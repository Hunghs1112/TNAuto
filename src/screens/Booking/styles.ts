// src/screens/Booking/styles.ts
import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  redSection: {
    backgroundColor: Colors.background.red,
    height: 80,
  },
  whiteSection: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  body: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.background.light,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dateRowContainer: {
    flexDirection: "row",
    gap: 0,
  },
  confirmButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    width: "100%",
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
  inputFieldContainer: {
    width: "100%",
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.text.secondary,
    flex: 1,
  },
  inputWrapper: {
    width: "100%",
  },
  errorText: {
    textAlign: "center",
    color: Colors.text.secondary,
    fontSize: 16,
  },
});