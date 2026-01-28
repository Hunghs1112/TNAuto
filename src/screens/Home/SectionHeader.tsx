import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { borderRadius } from "../../design-system/borders";
import { textStyles } from "../../design-system/typography";

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradients.primary}
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
    paddingVertical: spacing.xs,
  },
  leftBar: {
    width: 4,
    height: 28,
    borderRadius: borderRadius.xs / 2,
    marginRight: spacing.md,
  },
  title: {
    color: Colors.text.primary,
    ...textStyles.h3,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.2,
  },
});

SectionHeader.displayName = 'SectionHeader';

export default React.memo(SectionHeader);