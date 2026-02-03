// src/screens/AccountInfo/styles.ts
import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollContent: {},

  // Avatar Section
  avatarSection: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 12,
  },
  avatarPressable: {
    marginBottom: 8,
  },
  avatarContainer: {
    position: "relative",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[100],
    overflow: "hidden",
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
  },
  avatarLoading: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral[100],
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background.light,
  },
  avatarHint: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: "center",
  },

  // Card
  profileCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.primary,
    marginBottom: 10,
  },

  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.secondary,
  },
  input: {
    marginTop: 0,
  },
  disabledField: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  disabledFieldText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.primary,
  },
  fieldHint: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 6,
    marginLeft: 26,
  },

  // Action Section
  actionSection: {
    paddingTop: 12,
    paddingBottom: 8,
  },

  // Modal styles for full screen image
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 10,
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 10,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
