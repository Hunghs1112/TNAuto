import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

interface GarageSummaryCardProps {
  garageName?: string;
  garageAvatarUrl?: string | null;
  canChangeGarage?: boolean;
  onPress?: () => void;
}

const GarageSummaryCard: React.FC<GarageSummaryCardProps> = ({
  garageName,
  garageAvatarUrl,
  canChangeGarage = false,
  onPress,
}) => {
  if (!garageName) return null;

  return (
    <TouchableOpacity
      style={[styles.card, !canChangeGarage && styles.cardReadonly]}
      onPress={canChangeGarage ? onPress : undefined}
      activeOpacity={canChangeGarage ? 0.8 : 1}
      disabled={!canChangeGarage}
    >
      <View style={styles.avatarWrap}>
        {garageAvatarUrl ? (
          <Image source={{ uri: garageAvatarUrl }} style={styles.avatar} resizeMode="contain" />
        ) : (
          <Ionicons name="business-outline" size={16} color={Colors.primary} />
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Gara đang dùng</Text>
        <Text style={styles.name} numberOfLines={1}>
          {garageName}
        </Text>
      </View>

      {canChangeGarage && <Ionicons name="chevron-forward" size={16} color={Colors.primary} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 18,
    backgroundColor: Colors.alpha.white18,
    borderWidth: 1,
    borderColor: Colors.alpha.white30,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  cardReadonly: {
    opacity: 0.92,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: Typography.weight.medium,
    opacity: 0.9,
  },
  name: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: Typography.weight.bold,
  },
});

export default GarageSummaryCard;
