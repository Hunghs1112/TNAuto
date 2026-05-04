// src/screens/Login/DealerLoginScreen.tsx
import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Colors } from "../../constants/colors";
import { Button } from "../../components/ui";
import TextInputComponent from "../../components/TextInput/TextInput";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDealerLoginMutation } from "../../services/authApi";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { setGarageContext } from "../../redux/slices/garageContextSlice";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { createDealerLoginContract, mapDealerLoginFailure } from "./loginFlowService";
import { cleanPhone } from "../../utils/validation";
import AuthShell from "./AuthShell";
import { loginSharedStyles } from "./loginSharedStyles";

type DealerLoginRouteProp = RouteProp<AuthStackParamList, "DealerLogin">;
type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function DealerLoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DealerLoginRouteProp>();
  const dispatch = useAppDispatch();
  const currentGarageCode = useAppSelector((state) => state.garageContext.garageCode || "");

  const { phone, garageCode: garageCodeFromRoute } = route.params;
  const [garageCode, setGarageCode] = useState(garageCodeFromRoute || currentGarageCode);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [dealerLogin] = useDealerLoginMutation();

  const handleLogin = async () => {
    const normalizedGarageCode = garageCode.trim().toUpperCase();
    const normalizedPhone = cleanPhone(phone || "");
    const normalizedPassword = password.trim();

    if (!normalizedGarageCode) {
      Alert.alert("Lỗi", "Vui lòng nhập mã gara.");
      return;
    }

    if (!normalizedPhone) {
      Alert.alert("Lỗi", "Thiếu số điện thoại đăng nhập.");
      return;
    }

    if (!normalizedPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await dealerLogin({
        garage_code: normalizedGarageCode,
        phone: normalizedPhone,
        password: normalizedPassword,
      }).unwrap();

      const contract = createDealerLoginContract(result, normalizedGarageCode);

      if (!contract) {
        Alert.alert("Lỗi", result?.error || result?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      if (!contract.state.isReady) {
        Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      dispatch(setGarageContext(contract.content.garageContext));
      contract.actions.complete({ dispatch, navigation });
    } catch (error: any) {
      console.error("Dealer login error:", error);
      const failure = mapDealerLoginFailure(error);
      Alert.alert(failure.title, failure.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title="Chào mừng Đại lý" subtitle="Vui lòng nhập mật khẩu để tiếp tục">
      <View style={loginSharedStyles.inputContainer}>
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
          style={loginSharedStyles.readOnlyInput}
        />

        <TextInputComponent
          value={password}
          onChangeText={setPassword}
          placeholder="Mật khẩu"
          secureTextEntry
          autoFocus
          focusBorderColor={Colors.accent.yellow}
        />
      </View>

      <View style={loginSharedStyles.actions}>
        <Button title="Đăng nhập" onPress={handleLogin} loading={isLoading} disabled={isLoading} variant="primary" fullWidth />
      </View>
    </AuthShell>
  );
}
