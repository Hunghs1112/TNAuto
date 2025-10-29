import React from "react";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import LoginScreen from "../screens/Login/LoginScreen";
import RegisterScreen from "../screens/Register/RegisterScreen";
import EmployeePasswordScreen from "../screens/Login/EmployeePasswordScreen";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  EmployeePassword: {
    phone: string;
    employeeData: {
      id: number;
      name: string;
      phone: string;
      avatar_url?: string;
      position?: string;
    };
  };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  // Smooth screen transition configuration
  const screenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
    animationDuration: 250,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="EmployeePassword" component={EmployeePasswordScreen} />
    </Stack.Navigator>
  );
}