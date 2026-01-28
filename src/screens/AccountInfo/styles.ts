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
    backgroundColor: Colors.primary,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollContent: {
  },
  
  // Avatar Section
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 0,
  },
  avatarPressable: {
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.background.light,
    backgroundColor: Colors.neutral[100],
    overflow: 'hidden',
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarLoading: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background.light,
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarHint: {
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  
  // Profile Card
  profileCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 20,
    padding: 20,
    marginBottom: 0,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text.primary,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  fieldLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.primary,
    letterSpacing: -0.1,
  },
  input: {
    marginTop: 0,
  },
  disabledField: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  disabledFieldText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  fieldHint: {
    fontSize: Typography.size.xs,
    color: Colors.text.tertiary,
    marginTop: 6,
    marginLeft: 26,
  },
  
  // Action Section
  actionSection: {
    marginBottom: 0,
  },
  // Modal styles for full screen image
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
