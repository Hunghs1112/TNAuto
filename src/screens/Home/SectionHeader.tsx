import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.leftBar}
      />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  leftBar: {
    width: 4,
    height: 28,
    borderRadius: 2,
    marginRight: 12,
  },
  title: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});

export default SectionHeader;