// screens/Service/ServiceMenu.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppSelector } from "../../redux/hooks/useAppSelector";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type NoParamsRoute = 'Offer' | 'Category' | 'Warranty';

interface MenuItem {
  id: number;
  title: string;
  icon: string;
  route?: NoParamsRoute;
}

const ServiceMenu: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const offerCount = useAppSelector((state) => state.offers.count);
  
  const menuItems: MenuItem[] = [
    { id: 1, title: "Ưu đãi", icon: "pricetag-outline", route: "Offer" },
    { id: 2, title: "Sản phẩm", icon: "cube-outline", route: "Category" },
    { id: 3, title: "Tích điểm", icon: "star-outline" },
    { id: 4, title: "Bảo hành", icon: "shield-checkmark-outline", route: "Warranty" },
  ];

  const handlePress = (item: MenuItem) => {
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
      console.log('ServiceMenu: Navigate to', item.route); // Debug
      navigation.navigate(item.route);
    }
  };

  const showOfferBadge = offerCount > 0;

  return (
    <View style={styles.container}>
      {menuItems.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            styles.menuItem,
            { opacity: pressed ? 0.7 : 1 }, // Hiệu ứng khi bấm
          ]}
          onPress={() => handlePress(item)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[Colors.primarySoft, Colors.background.light]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Ionicons name={item.icon} size={28} color={Colors.primary} />
            </LinearGradient>
            {item.id === 1 && showOfferBadge && (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>
                  {offerCount > 99 ? '99+' : offerCount}
                </Text>
              </LinearGradient>
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
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: 'rgba(218, 28, 18, 0.1)',
    shadowColor: Colors.shadow.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    color: Colors.text.primary,
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
    borderWidth: 2,
    borderColor: Colors.background.light,
    shadowColor: Colors.shadow.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: Colors.text.inverted,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
});

export default ServiceMenu;