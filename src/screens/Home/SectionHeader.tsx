import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 0, // Padding cho section title
  },
  title: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.base,
    lineHeight: 20,
  },
});

export default SectionHeader;