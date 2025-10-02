import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

type ItemProps = {
  title: string;
  description: string;
  imageUri?: string;
  onPress?: () => void;
  isPressable?: boolean;
};

const Item = ({ title, description, imageUri, onPress, isPressable = true }: ItemProps) => {
  console.log('Item rendered:', { title, description, hasImage: !!imageUri }); // Debug

  const content = (
    <View style={styles.cardShadowBox}>
      <View style={styles.contentRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        </View>
      </View>
    </View>
  );

  return isPressable ? (
    <Pressable style={styles.card} onPress={onPress} accessible={true} accessibilityRole="button">
      {content}
    </Pressable>
  ) : (
    <View style={styles.card}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 112,
    borderRadius: 12,
    backgroundColor: Colors.background.light,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  cardShadowBox: {
    width: "100%",
    height: "100%",
    padding: 16,
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[200],
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
});

export default Item;