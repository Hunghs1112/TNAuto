// src/screens/Auth/LoginScreen.tsx - Unified login screen with automatic user type detection
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import Screen from "../../components/layout/Screen/Screen";
import { FormContainer } from "../../components/layout/FormContainer";
import { Colors } from "../../constants/colors";
import { Button } from "../../components/ui/Button";
import TextInputComponent from "../../components/TextInput/TextInput";
import { styles } from "./styles";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLoginCustomerMutation } from "../../services";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { setLoggedIn } from "../../redux/slices/authSlice";
import { registerFCMTokenAfterLogin } from "../../utils/fcmTokenManager";
import { saveAndSetActiveGarage, upsertSavedGarage } from "../../redux/slices/garageContextSlice";
import { AuthStackParamList } from "../../navigation/AuthNavigator";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;


export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loginCustomer] = useLoginCustomerMutation();

  const handleLogin = async () => {
    const normalizedPhone = phone.trim();

    if (!normalizedPhone) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại!");
      return;
    }

    setIsLoading(true);
    try {
      const loginResult = await loginCustomer({ phone: normalizedPhone }).unwrap();

      if (!loginResult.success || !loginResult.customer) {
        Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      const userId = String(loginResult.customer_id || loginResult.customer.id || "");

      dispatch(setLoggedIn({
        isLoggedIn: true,
        userType: 'customer',
        userId,
        userName: loginResult.customer?.name || 'Customer',
        userPhone: loginResult.customer?.phone || normalizedPhone,
        userLicensePlate: loginResult.customer?.license_plate || '',
        avatarUrl: loginResult.customer?.avatar_url || '',
        userEmail: loginResult.customer?.email || '',
        authMode: 'identity_lookup',
      }));

      const linkedGarages = Array.isArray(loginResult.linked_garages)
        ? loginResult.linked_garages
        : [];

      linkedGarages.forEach((garage, index) => {
        const payload = {
          garageId: garage.id,
          garageCode: garage.code,
          garageName: garage.name,
          address: garage.address,
          avatarUrl: garage.avatar_url,
          status: garage.status,
          resolved: true,
        };

        if (index === 0) {
          dispatch(saveAndSetActiveGarage(payload));
        } else {
          dispatch(upsertSavedGarage(payload));
        }
      });

      registerFCMTokenAfterLogin(userId, 'customer').catch(error => {
        console.error('Failed to register FCM token:', error);
      });

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: linkedGarages.length > 0 ? "Home" : "SelectGarage" }],
        })
      );
    } catch (error: any) {
      const backendMessage = error?.data?.error || error?.data?.message || error?.error;
      const message =
        backendMessage ||
        "Không thể đăng nhập. Vui lòng kiểm tra số điện thoại hoặc thử lại.";

      Alert.alert(
        "Đăng nhập thất bại",
        message,
        [
          { text: "Đóng", style: "cancel" },
          {
            text: "Đăng ký",
            onPress: () => navigation.navigate("Register"),
          },
        ],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <Screen
      statusBarStyle="light-content"
      showBackButton
    >
      <FormContainer
        keyboardAvoiding
        withScroll
        paddingCustom={{ horizontal: 'xl', top: 'lg', bottom: 'xl' }}
        dismissKeyboardOnPress
      >
        <Text style={styles.welcomeText}>Chào mừng trở lại</Text>
        <Text style={styles.subtitle}>Nhập số điện thoại để tiếp tục</Text>

        <View style={styles.logoFrame}>
          <Image
            style={styles.logo}
            source={require('../../assets/logo.png')}
            resizeMode="contain"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInputComponent
            value={phone}
            onChangeText={setPhone}
            placeholder="Số điện thoại"
            placeholderTextColor={Colors.text.placeholder}
            keyboardType="phone-pad"
            focusBorderColor={Colors.accent.yellow}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Tiếp tục"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            fullWidth
          />
        </View>

        <View style={styles.signup}>
          <Text style={styles.registerPrompt}>Bạn chưa có tài khoản?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </FormContainer>
    </Screen>
  );
}
