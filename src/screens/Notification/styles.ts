// src/screens/Notification/styles.ts
import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  header: {
    backgroundColor: Colors.background.red,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
  },
  loadingText: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
  },
  errorText: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
  },
});