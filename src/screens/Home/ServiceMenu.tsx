// screens/Service/ServiceMenu.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type NoParamsRoute = 'Offer' | 'Product';

interface MenuItem {
  id: number;
  title: string;
  icon: string;
  route?: NoParamsRoute;
}

const ServiceMenu: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const menuItems: MenuItem[] = [
    { id: 1, title: "Ưu đãi", icon: "pricetag-outline", route: "Offer" },
    { id: 2, title: "Sản phẩm", icon: "cube-outline", route: "Product" },
    { id: 3, title: "Tích điểm", icon: "star-outline" },
    { id: 4, title: "Bảo hành", icon: "shield-checkmark-outline" },
  ];

  const handlePress = (route?: NoParamsRoute) => {
    if (route) {
      console.log('ServiceMenu: Navigate to', route); // Debug
      navigation.navigate(route);
    }
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item) => (
        <Pressable
          key={item.id}
          style={styles.menuItem}
          onPress={() => handlePress(item.route)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={24} color={Colors.background.red} />
            </View>
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
});

export default ServiceMenu;