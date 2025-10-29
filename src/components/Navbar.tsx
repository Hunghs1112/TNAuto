// src/components/Navbar/Navbar.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function Navbar() {
  const navigation = useNavigation<NavigationProp>();

  const handleHomePress = () => {
    console.log('Navbar: Home pressed');
    navigation.navigate('Home');
  };

  const handleBookingPress = () => {
    console.log('Navbar: Booking pressed');
    navigation.navigate('Booking');
  };

  return (
    <View style={styles.viewBg}>
      <View style={styles.view}>
        <Pressable 
          onPress={handleHomePress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Trang chủ"
          style={({ pressed }) => [
            styles.homeContainer,
            { opacity: pressed ? 0.85 : 1 }
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.homeParent}
          >
            <Ionicons name="home-outline" size={24} color={Colors.background.light} />
            <Text style={styles.trangCh}>Trang chủ</Text>
          </LinearGradient>
        </Pressable>
        
        <Pressable 
          style={styles.wrapper} 
          onPress={handleBookingPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Đặt lịch"
        >
          <Ionicons name="calendar-outline" size={24} color={Colors.text.secondary} />
        </Pressable>
        
        <Pressable 
          style={styles.wrapper} 
          onPress={() => {
            console.log('Navbar: Service pressed');
            navigation.navigate("Service");
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Dịch vụ"
        >
          <Ionicons name="chatbubble-outline" size={24} color={Colors.text.secondary} />
        </Pressable>
        
        <Pressable 
          style={styles.wrapper} 
          onPress={() => {
            console.log('Navbar: Profile pressed');
            navigation.navigate("Profile");
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Hồ sơ"
        >
          <Ionicons name="person-outline" size={24} color={Colors.text.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewBg: {
    backgroundColor: Colors.background.light,
  },
  view: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
    backgroundColor: Colors.background.light,
    borderTopWidth: 0.5,
  },
  homeContainer: {
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  homeParent: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  trangCh: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: "700",
    color: Colors.background.light,
    textAlign: "left",
  },
  wrapper: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: Colors.background.light,
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});