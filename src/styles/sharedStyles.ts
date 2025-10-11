// src/styles/sharedStyles.ts
// Shared styles to reduce duplication across screens
import { StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";

export const sharedStyles = StyleSheet.create({
  // Root container
  root: {
    flex: 1,
  },
  
  // Header section (red)
  redSection: {
    backgroundColor: Colors.background.red,
    height: 80,
  },
  
  // Content section (white)
  whiteSection: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  
  // Body container
  body: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.background.light,
  },
  
  // Form container
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  
  // List container
  listContainer: {
    gap: 16,
    marginTop: 20,
  },
  
  // Bottom bar
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
  
  // Empty state
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  
  emptyText: {
    marginTop: 12,
    color: Colors.text.secondary,
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
  },
  
  // Centered content (for loading/error states)
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  
  errorText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
  },
});

