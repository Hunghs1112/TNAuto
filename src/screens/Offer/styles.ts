// screens/Offer/styles.ts
import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  redSection: {
    backgroundColor: Colors.background.red,
    height: 80,
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  servicesContainer: {
    gap: 16,
    marginTop: 20,
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
});