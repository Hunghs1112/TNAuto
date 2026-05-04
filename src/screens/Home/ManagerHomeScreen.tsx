import React, { useCallback, useState } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Screen from "../../components/layout/Screen/Screen";
import { Colors } from "../../constants/colors";
import { styles } from "./styles";
import UserHeader from "./UserHeader";
import GarageSummaryCard from "./GarageSummaryCard";
import { KPISection } from "../../components/ManagerHome";
import { useManagerHomeScreen } from "../../hooks/useManagerHomeScreen";

type ManagerHomeScreenProps = {
  userName: string;
  isLoggedIn: boolean;
  garageSummary: {
    name: string;
    address?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    canChangeGarage: boolean;
  };
  onGaragePress: () => void;
};

export default function ManagerHomeScreen({
  userName,
  isLoggedIn,
  garageSummary,
  onGaragePress,
}: ManagerHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const {
    kpis,
    isLoading,
    refetchSummary,
  } = useManagerHomeScreen({
    isEnabled: true,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchSummary();
    } finally {
      setRefreshing(false);
    }
  }, [refetchSummary]);

  return (
    <Screen hideHeader statusBarStyle="light-content" useScrollView={false}>
      <View style={styles.homeRoot}>
        <LinearGradient
          colors={[...Colors.gradients.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.homeBackground}
        >
          <View style={styles.homeDecorativeContainer}>
            <View style={[styles.homeDecorativeCircle, styles.homeCircle1]} />
            <View style={[styles.homeDecorativeCircle, styles.homeCircle2]} />
            <View style={[styles.homeDecorativeCircle, styles.homeCircle3]} />
          </View>
        </LinearGradient>

        <View style={styles.headerBackground}>
          {garageSummary.name ? (
            <View style={styles.garageSummaryWrap}>
              <GarageSummaryCard
                garageName={garageSummary.name}
                garageAddress={garageSummary.address}
                garageAvatarUrl={garageSummary.avatarUrl}
                garageBannerUrl={garageSummary.bannerUrl}
                canChangeGarage={garageSummary.canChangeGarage}
                onPress={onGaragePress}
              />
            </View>
          ) : null}

          <UserHeader userName={userName} isLoggedIn={isLoggedIn} />
        </View>

        <ScrollView
          style={styles.bottomSheet}
          contentContainerStyle={{ paddingBottom: insets.bottom + 76 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          <View style={styles.section}>
            <KPISection kpis={kpis} isLoading={isLoading} />
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
