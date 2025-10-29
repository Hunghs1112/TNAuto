import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light, // White background
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary, // Red for top safe area (matches UserHeader)
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.background.light, // White background for content
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
    gap: 20,
  },
  section: {
    gap: 16,
    width: "100%",
  },
  servicesContainer: {
    gap: 14,
    width: "100%",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.text.secondary,
    fontSize: 16,
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
});