// screens/Service/ServiceMenu.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
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
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={24} color={Colors.background.red} />
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
    gap: 13,
    justifyContent: "space-between",
    width: "100%",
  },
  menuItem: {
    alignItems: "center",
    gap: 8,
    flex: 1,
    paddingVertical: 10, // Thêm padding dọc để mở rộng vùng bấm
    paddingHorizontal: 8, // Thêm padding ngang để mở rộng vùng bấm
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.light,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background.light,
  },
  title: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 18,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.background.red,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.background.light,
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