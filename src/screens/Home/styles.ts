import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { textStyles } from "../../design-system/typography";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light, // White background
  },
  homeRoot: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  homeBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  homeDecorativeContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.12,
  },
  homeDecorativeCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: Colors.background.light,
  },
  homeCircle1: {
    width: 220,
    height: 220,
    top: -80,
    right: -60,
  },
  homeCircle2: {
    width: 150,
    height: 150,
    bottom: 180,
    left: -50,
  },
  homeCircle3: {
    width: 120,
    height: 120,
    top: "38%",
    right: 30,
  },
  headerBackground: {
    width: "100%",
  },
  serviceMenuOverlay: {
    width: "100%",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  bottomSheetContent: {
    paddingTop: spacing.lg,
  },
  bottomSheet: {
    width: "100%",
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.background.light, // White background for content
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
    width: "100%",
  },
  servicesContainer: {
    gap: spacing.lg,
    width: "100%",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    color: Colors.text.secondary,
    ...textStyles.body,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    marginTop: spacing.md,
    color: Colors.text.secondary,
    ...textStyles.body,
  },
  loginPromptCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    gap: spacing.md,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  loginPromptDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  loginPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    gap: spacing.sm,
    marginTop: spacing.sm,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginPromptButtonText: {
    color: Colors.background.light,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
  },
  // Employee Orders List
  employeeOrdersContainer: {
    width: '100%',
  },
  statusFilterContainer: {
    marginBottom: spacing.md,
  },
  statusFilterContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  statusFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  statusFilterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusFilterText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text.secondary,
  },
  statusFilterTextActive: {
    color: Colors.background.light,
  },
  // Customers List
  customersContainer: {
    width: '100%',
  },
  customersContent: {
    gap: spacing.md,
  },
  customerCard: {
    width: '100%',
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: spacing.md,
  },
  customerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  activeOrdersBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  activeOrdersBadgeText: {
    color: Colors.background.light,
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: 'bold',
  },
  customerStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  customerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerStatText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  // Warranty Info
  warrantyContainer: {
    width: '100%',
    gap: spacing.md,
  },
  warrantyCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warrantyCardExpired: {
    borderColor: Colors.status.error,
    backgroundColor: Colors.status.error + '10',
  },
  warrantyCardExpiring: {
    borderColor: Colors.status.warning,
    backgroundColor: Colors.status.warning + '10',
  },
  warrantyCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  warrantyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warrantyInfo: {
    flex: 1,
  },
  warrantyServiceName: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  warrantyCustomerName: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  warrantyLicensePlate: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  warrantyBadge: {
    backgroundColor: Colors.status.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  warrantyBadgeWarning: {
    backgroundColor: Colors.status.warning,
  },
  warrantyBadgeText: {
    color: Colors.background.light,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: 'bold',
  },
  warrantyDetails: {
    gap: spacing.xs,
  },
  warrantyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warrantyDetailText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  warrantyDetailTextExpired: {
    color: Colors.status.error,
  },
  warrantyNote: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
  },
  warrantyNoteText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});