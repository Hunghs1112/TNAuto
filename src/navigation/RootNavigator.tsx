// navigation/RootNavigator.tsx - Root navigator with navigation reference
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from "../redux/stores";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import Loading from "../components/Loading/Loading";
import { useSelector } from "react-redux";
import { navigationRef } from "./RootNavigation";

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const { isLoading, message } = useSelector((state: RootState) => state.loading);

  console.log('RootNavigator debug - isLoggedIn from persist:', isLoggedIn); // Debug persist state

  return (
    <NavigationContainer ref={navigationRef}>
      <Loading visible={isLoading} text={message} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function RootNavigator() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading visible={true} text="Đang tải..." />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}