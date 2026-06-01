// src/screens/Booking/styles.ts
import { StyleSheet, Platform } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.gradients.primary[0],
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

  // ── Garage badge row ──────────────────────────────
  activeGarageContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: spacing.base,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.primarySoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
  },
  activeGarageLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 13,
    color: Colors.text.secondary,
  },

  // ── Input field with label ────────────────────────
  inputFieldContainer: {
    width: "100%",
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    marginBottom: 5,
    gap: 5,
  },
  iconContainer: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.secondary,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    width: "100%",
  },

  // ── Info cards (vehicle, estimated time) ─────────
  estimatedTimeContainer: {
    width: "100%",
    marginBottom: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  estimatedTimeValue: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: 13,
    color: Colors.primary,
  },
  vehicleInfoContainer: {
    width: "100%",
    marginBottom: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
    gap: 6,
  },
  vehicleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vehicleInfoLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 13,
    color: Colors.text.secondary,
  },
  vehicleInfoValue: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: 13,
    color: Colors.primary,
    flex: 1,
  },

  // ── Confirm button ────────────────────────────────
  confirmButtonContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
    width: "100%",
  },

  dateRowContainer: {
    flexDirection: "row",
    gap: 0,
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
