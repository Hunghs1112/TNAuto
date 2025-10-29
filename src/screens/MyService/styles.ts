// src/screens/MyService/styles.ts
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
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
  },
  servicesContainer: {
    gap: 16,
    marginTop: 4,
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
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: Colors.text.secondary,
    fontSize: 16,
  },
  statusFilterContainer: {
    marginTop: 4,
    marginBottom: 8,
    height: 34,
    justifyContent: 'center',
    backgroundColor: Colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  statusFilter: {
    flex: 1,
  },
  statusFilterContent: {
    gap: 12,
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    minWidth: 60,
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statusTabActive: {
    backgroundColor: Colors.gradients.primary[0],
    shadowColor: Colors.background.red,
    shadowOpacity: 0.2,
  },
  statusTabText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
  },
  statusTabTextActive: {
    color: Colors.text.white,
    fontFamily: Typography.fontFamily.bold,
  },
});