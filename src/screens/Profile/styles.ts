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
    backgroundColor: Colors.gradients.primary[0],
  },
  body: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.background.light,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Header Section với Avatar
  headerSection: {
    backgroundColor: Colors.background.light,
    paddingBottom: 32,
    paddingTop: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  avatarContainer: {
    alignItems: "center",
    paddingTop: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.background.light,
  },
  avatarBorder: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    top: 0,
    left: 0,
  },
  userName: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  userTypeText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.primary,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  
  // Menu Section
  menuSection: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  menuCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 20,
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    minHeight: 64,
  },
  menuItemPressed: {
    backgroundColor: Colors.neutral[50],
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.primary,
    lineHeight: 24,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 20,
  },
  
  // Action Section
  actionSection: {
    gap: 12,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    minHeight: 56,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  deleteButton: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.status.error + '30',
  },
  deleteButtonText: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.status.error,
  },
  logoutButton: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.background.red + '30',
  },
  logoutButtonText: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.background.red,
  },
  
  // Legacy styles (có thể xóa sau)
  form: {
    flex: 1,
  },
  spacer: {
    height: 20,
  },
  menuContainer: {
    flex: 1,
  },
  menuItemWrapper: {
    marginBottom: 0,
  },
  deleteAccountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 12,
  },
  deleteAccountItemDisabled: {
    opacity: 0.5,
  },
  deleteAccountText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.status.error,
    lineHeight: 24,
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  logoutIconContainer: {
    width: 16,
    height: 16,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.error,
    lineHeight: 24,
  },
});
