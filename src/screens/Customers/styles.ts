// src/screens/Customers/styles.ts
import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { spacing } from '../../design-system/spacing';

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    marginTop: spacing.md,
    color: Colors.text.secondary,
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
  },
  customerCard: {
    width: '100%',
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 13,
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
    flexWrap: 'wrap',
  },
  customerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerStatText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  customerStatTextActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  // Customer Detail styles
  customerDetailContainer: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  customerInfoSection: {
    backgroundColor: Colors.background.light,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  customerDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  customerDetailAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetailInfo: {
    flex: 1,
  },
  customerDetailName: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  customerDetailPhone: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  customerDetailMeta: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  customerDetailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerDetailMetaText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  ordersSection: {
    flex: 1,
    padding: spacing.md,
  },
  ordersSectionTitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary,
    marginBottom: spacing.md,
  },
  vehicleCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    gap: spacing.xs,
  },
  vehicleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vehiclePlate: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary,
  },
  vehicleMeta: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
});
