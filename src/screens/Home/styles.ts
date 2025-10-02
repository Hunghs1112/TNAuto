import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  section: {
    gap: 14,
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
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
    backgroundColor: Colors.background.red,
    borderRadius: 8,
    width: '100%',
  },
  viewMoreText: {
    color: Colors.background.light,
    fontSize: 16,
    fontFamily: 'System',
  },
});