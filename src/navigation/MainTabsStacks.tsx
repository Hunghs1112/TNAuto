import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Navbar from "../components/Navbar";
import HomeScreen from "../screens/Home/HomeScreen";
import CategoryScreen from "../screens/Category/CategoryScreen";
import ProductScreen from "../screens/Product/ProductScreen";
import ProductDetailScreen from "../screens/ProductDetail/ProductDetailScreen";
import BookingScreen from "../screens/Booking/BookingScreen";
import ServiceCategoryScreen from "../screens/ServiceCategory/ServiceCategoryScreen";
import ServiceScreen from "../screens/Service/ServiceScreen";
import ServiceDetailScreen from "../screens/Service/ServiceDetailScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import AccountInfoScreen from "../screens/AccountInfo/AccountInfoScreen";

// Define param lists for each tab stack
export type HomeStackParamList = {
  HomeRoot: undefined;
};
export type CategoryParamList = {
  CategoryRoot: undefined;
  Product: { categoryId?: number; categoryName?: string } | undefined;
  ProductDetail: { productId: number };
};
export type BookingStackParamList = {
  BookingScreen: { serviceId?: number } | undefined;
};
export type ServiceStackParamList = {
  ServiceCategory: undefined;
  Service: { categoryId?: number; categoryName?: string } | undefined;
  ServiceDetail: { serviceId: number };
};
export type ProfileStackParamList = {
  Profile: undefined;
  AccountInfo: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CategoryStack = createNativeStackNavigator<CategoryStackParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();
const ServiceStack = createNativeStackNavigator<ServiceStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeRoot" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function CategoryStackScreen() {
  return (
    <CategoryStack.Navigator screenOptions={{ headerShown: false }}>
      <CategoryStack.Screen name="CategoryRoot" component={CategoryScreen} />
      <CategoryStack.Screen name="Product" component={ProductScreen} />
      <CategoryStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </CategoryStack.Navigator>
  );
}

function BookingStackScreen() {
  return (
    <BookingStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingStack.Screen name="Booking" component={BookingScreen} />
    </BookingStack.Navigator>
  );
}

function ServiceStackScreen() {
  return (
    <ServiceStack.Navigator screenOptions={{ headerShown: false }}>
      <ServiceStack.Screen name="ServiceCategory" component={ServiceCategoryScreen} />
      <ServiceStack.Screen name="Service" component={ServiceScreen} />
      <ServiceStack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
    </ServiceStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="AccountInfo" component={AccountInfoScreen} />
    </ProfileStack.Navigator>
  );
}

export type MainTabParamList = {
  HomeTab: undefined;
  CategoryTab: undefined;
  BookingTab: undefined;
  ServiceTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabsStacks() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={props => <Navbar {...props} />}>
      <Tab.Screen name="HomeTab" component={HomeStackScreen} />
      <Tab.Screen name="CategoryTab" component={CategoryStackScreen} />
      <Tab.Screen name="BookingTab" component={BookingStackScreen} />
      <Tab.Screen name="ServiceTab" component={ServiceStackScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

