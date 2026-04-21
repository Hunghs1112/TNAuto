// src/screens/Login/DealerLoginScreen.tsx
import React, { useState } from "react";
import { View, Text, Alert, Image } from "react-native";
import { Screen, FormContainer } from "../../components/layout";
import { Colors } from "../../constants/colors";
import { Button } from "../../components/ui";
import TextInputComponent from "../../components/TextInput/TextInput";
import { styles } from "./styles";
import { CommonActions, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDealerLoginMutation } from "../../services/authApi";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { setLoggedIn } from "../../redux/slices/authSlice";
import { setGarageContext } from "../../redux/slices/garageContextSlice";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { registerFCMTokenAfterLogin } from "../../utils/fcmTokenManager";

type DealerLoginRouteProp = RouteProp<AuthStackParamList, 'DealerLogin'>;
type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function DealerLoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DealerLoginRouteProp>();
  const dispatch = useAppDispatch();
  const currentGarageCode = useAppSelector((state) => state.garageContext.garageCode || '');
  
  const { phone, garageCode: garageCodeFromRoute } = route.params;
  const [garageCode, setGarageCode] = useState(garageCodeFromRoute || currentGarageCode);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [dealerLogin] = useDealerLoginMutation();

  const handleLogin = async () => {
    if (!garageCode.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã gara!");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu!");
      return;
    }

    setIsLoading(true);
    try {
      const result = await dealerLogin({ 
        garage_code: garageCode.trim(),
        phone: phone.trim(), 
        password: password.trim() 
      }).unwrap();
      
      const dealer = result.dealer || result.data;

      if (result.success && dealer) {
        const userId = String(result.dealer_id || dealer.id || '');
        
        dispatch(setLoggedIn({ 
          isLoggedIn: true, 
          userType: 'dealer', 
          userId,
          userName: dealer.name || 'Dealer',
          userPhone: dealer.phone || '',
          userLicensePlate: '',
          avatarUrl: dealer.avatar_url || '',
          userEmail: dealer.email || '',
          token: result.token || '',
          expiresAt: result.expires_at || '',
        }));
        dispatch(setGarageContext({
          garageId: result.garage?.id ?? result.garage_id,
          garageCode: result.garage?.code || garageCode.trim(),
          garageName: result.garage?.name,
          address: result.garage?.address,
          avatarUrl: result.garage?.avatar_url,
          status: result.garage?.status,
          resolved: true,
        }));

        // Register FCM token in background
        registerFCMTokenAfterLogin(userId, 'dealer').catch(error => {
          console.error('Failed to register FCM token:', error);
        });

        // Navigate to Home (which contains MainTabs) after successful login
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" as never }],
          })
        );
      } else {
        Alert.alert("Lỗi", result.message || "Đăng nhập thất bại. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error('Dealer login error:', error);
      Alert.alert(
        "Lỗi",
        error?.data?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen
      headerTitle="Đăng nhập Đại lý"
      showBackButton
      statusBarStyle="light-content"
    >
      <FormContainer
        keyboardAvoiding
        withScroll
        paddingCustom={{ horizontal: 'xl', top: 'lg', bottom: 'xl' }}
        dismissKeyboardOnPress
      >
        <Text style={styles.welcomeText}>Chào mừng Đại lý</Text>
        <Text style={styles.subtitle}>Vui lòng nhập mật khẩu để tiếp tục</Text>

        <View style={styles.logoFrame}>
          <Image
            style={styles.logo}
            source={require('../../assets/logo.png')}
            resizeMode="contain"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInputComponent
            value={garageCode}
            onChangeText={setGarageCode}
            placeholder="Mã gara"
            autoCapitalize="characters"
            focusBorderColor={Colors.accent.yellow}
          />

          <TextInputComponent
            value={phone}
            editable={false}
            placeholder="Số điện thoại"
            style={{ backgroundColor: Colors.neutral[100] }}
          />

          <TextInputComponent
            value={password}
            onChangeText={setPassword}
            placeholder="Mật khẩu"
            secureTextEntry={true}
            autoFocus={true}
            focusBorderColor={Colors.accent.yellow}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Đăng nhập"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            fullWidth
          />
        </View>
      </FormContainer>
    </Screen>
  );
}
