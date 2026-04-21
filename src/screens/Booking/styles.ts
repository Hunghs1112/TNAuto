// src/screens/Booking/styles.ts
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
    backgroundColor: Colors.gradients.primary[0], // Red for top safe area
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
  },
  scrollContent: {
    paddingBottom: 20,
  },
  activeGarageContainer: {
    width: "100%",
    marginBottom: 16,
    gap: 8,
  },
  activeGarageLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 13,
    color: Colors.text.secondary,
  },
  dateRowContainer: {
    flexDirection: "row",
    gap: 0,
  },
  confirmButtonContainer: {
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
  estimatedTimeContainer: {
    width: "100%",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
  },
  estimatedTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  estimatedTimeLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 14,
    color: Colors.text.primary,
  },
  estimatedTimeValue: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: 14,
    color: Colors.primary,
  },
  vehicleInfoContainer: {
    width: "100%",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
    gap: 8,
  },
  vehicleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vehicleInfoLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  vehicleInfoValue: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: 14,
    color: Colors.primary,
    flex: 1,
  },
});
