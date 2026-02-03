// screens/Service/ServiceMenu.tsx
import React, { useCallback, useMemo, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { useGetOffersQuery } from "../../services/offerApi";
import { setOffers } from "../../redux/slices/offersSlice";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type NoParamsRoute = 'Offer' | 'CategoryTab' | 'Warranty' | 'ServiceTab';

interface MenuItem {
  id: number;
  title: string;
  icon: string;
  route?: NoParamsRoute;
}

const ServiceMenu: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const offerCount = useAppSelector((state) => state.offers.count);

  // Fetch offers for badge if not yet fetched
  const { data: offersData, isSuccess: offersSuccess } = useGetOffersQuery(undefined, {
    skip: offerCount > 0, // avoid refetch if we already have offers
  });

  // Sync to redux when fetched
  useEffect(() => {
    if (offersSuccess && offersData?.data) {
      dispatch(setOffers({ data: offersData.data, count: offersData.count }));
    }
  }, [offersSuccess, offersData, dispatch]);
  
  const menuItems: MenuItem[] = useMemo(() => [
    { id: 1, title: "Ưu đãi", icon: "pricetag-outline", route: "Offer" },
    { id: 2, title: "Sản phẩm", icon: "cube-outline", route: "CategoryTab" },
    { id: 3, title: "Tích điểm", icon: "star-outline" },
    { id: 4, title: "Bảo hành", icon: "shield-checkmark-outline", route: "Warranty" },
  ], []);

  const handlePress = useCallback((item: MenuItem) => {
    // Xử lý đặc biệt cho tính năng Tích điểm
    if (item.id === 3) {
      Alert.alert(
        "Thông báo",
        "Tính năng đang được phát triển",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Xử lý các route khác
    if (item.route) {
      navigation.navigate(item.route);
    }
  }, [navigation]);

  const showOfferBadge = offerCount > 0;

  return (
    <View style={styles.container}>
      {menuItems.map((item) => (
        <Pressable
          key={item.id}
          style={styles.menuItem}
          onPress={() => handlePress(item)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircleShadow}>
              <LinearGradient
                colors={[Colors.primarySoft, Colors.background.light]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconCircle}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons name={item.icon} size={28} color={Colors.primary} />
                </View>
              </LinearGradient>
            </View>
            {item.id === 1 && showOfferBadge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {offerCount > 99 ? '99+' : offerCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{item.title}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
    width: "100%",
  },
  menuItem: {
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  iconCircleShadow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: 'rgba(12, 119, 121, 0.3)',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  iconWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 18,
    fontWeight: Typography.weight.medium,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: Colors.background.light,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
});

ServiceMenu.displayName = 'ServiceMenu';

export default React.memo(ServiceMenu);
