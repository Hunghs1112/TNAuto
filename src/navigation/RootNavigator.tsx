// navigation/RootNavigator.tsx - Root navigator with navigation reference
import React, { useMemo, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from "../redux/stores";
import AppNavigator from "./AppNavigator";
import Loading from "../components/Loading/Loading";
import { useAppSelector } from "../redux/hooks/useAppSelector";
import { navigationRef } from "./RootNavigation";
import { ErrorBoundary } from "../components/ErrorBoundary";
import SplashScreen from "../screens/Splash/SplashScreen";

export type RootStackParamList = {
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent = React.memo(() => {
  const [showSplash, setShowSplash] = useState(true);
  const loadingState = useAppSelector((state: RootState) => state.loading);
  const { isLoading, message } = useMemo(() => loadingState, [loadingState]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <ErrorBoundary>
      <NavigationContainer ref={navigationRef}>
        <Loading visible={isLoading} text={message} />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="App">
          <Stack.Screen name="App" component={AppNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
});

AppContent.displayName = 'AppContent';

export default function RootNavigator() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}
