import React from "react";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import LinearGradient from "react-native-linear-gradient";

import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

interface GarageSummaryCardProps {
  garageName?: string;
  garageAddress?: string;
  garageAvatarUrl?: string | null;
  garageBannerUrl?: string | null;
  canChangeGarage?: boolean;
  onPress?: () => void;
}

const GarageSummaryCard: React.FC<GarageSummaryCardProps> = ({
  garageName,
  garageAddress,
  garageAvatarUrl,
  garageBannerUrl,
  canChangeGarage = false,
  onPress,
}) => {
  if (!garageName) return null;

  return (
    <TouchableOpacity
      style={[styles.card, !canChangeGarage && styles.cardReadonly]}
      onPress={canChangeGarage ? onPress : undefined}
      activeOpacity={canChangeGarage ? 0.85 : 1}
      disabled={!canChangeGarage}
    >
      <View style={styles.bannerWrap}>
        {garageBannerUrl ? (
          <ImageBackground source={{ uri: garageBannerUrl }} style={styles.banner} imageStyle={styles.bannerImage}>
            <View style={styles.bannerOverlayDisabled} />
          </ImageBackground>
        ) : (
          <LinearGradient colors={Colors.gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
            <View style={styles.bannerPatternCircleOne} />
            <View style={styles.bannerPatternCircleTwo} />
            <View style={styles.bannerPatternCircleThree} />
          </LinearGradient>
        )}
      </View>

      {false && (
        <View style={styles.identityRow}>
          <View style={styles.avatarWrap}>
            {garageAvatarUrl ? (
              <Image source={{ uri: garageAvatarUrl }} style={styles.avatar} resizeMode="contain" />
            ) : (
              <Ionicons name="business-outline" size={24} color={Colors.primary} />
            )}
          </View>

          <View style={styles.content}>
            <Text style={styles.name} numberOfLines={1}>
              {garageName}
            </Text>
            {!!garageAddress && (
              <Text style={styles.address} numberOfLines={1}>
                {garageAddress}
              </Text>
            )}
          </View>

          {canChangeGarage && <Ionicons name="chevron-forward" size={18} color={Colors.background.light} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    overflow: "visible",
  },
  cardReadonly: {
    opacity: 0.92,
  },
  bannerWrap: {
    width: "100%",
    height: 220,
    borderRadius: 0,
    overflow: "hidden",
  },
  banner: {
    flex: 1,
  },
  bannerImage: {
    resizeMode: "cover",
  },
  bannerOverlayDisabled: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerPatternCircleOne: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 999,
    top: -28,
    right: -12,
    backgroundColor: Colors.alpha.white20,
  },
  bannerPatternCircleTwo: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 999,
    top: 20,
    right: 44,
    backgroundColor: Colors.alpha.white20,
  },
  bannerPatternCircleThree: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 999,
    bottom: -14,
    left: 26,
    backgroundColor: Colors.alpha.white20,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 0,
    marginTop: -20,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    borderWidth: 2,
    borderColor: Colors.alpha.white65,
  },
  avatar: {
    width: "82%",
    height: "82%",
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 0,
  },
  name: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 17,
    fontWeight: Typography.weight.bold,
  },
  address: {
    marginTop: 2,
    color: Colors.alpha.white85,
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default GarageSummaryCard;
