import React, { useState } from "react";
import { View, Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Colors } from "../../constants/colors";
import { Button } from "../../components/ui";
import TextInputComponent from "../../components/TextInput/TextInput";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { useManagerLoginMutation } from "../../services/authApi";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { setGarageContext } from "../../redux/slices/garageContextSlice";
import { createManagerLoginContract, mapManagerLoginFailure } from "./loginFlowService";
import AuthShell from "./AuthShell";
import { loginSharedStyles } from "./loginSharedStyles";

type ManagerPasswordRouteProp = RouteProp<AuthStackParamList, "ManagerPassword">;
type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function ManagerPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ManagerPasswordRouteProp>();
  const dispatch = useAppDispatch();

  const { phone, expectedRole } = route.params;
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [managerLogin] = useManagerLoginMutation();

  const handleLogin = async () => {
    const normalizedLogin = phone.trim();
    const normalizedPassword = password.trim();

    if (!normalizedLogin) {
      Alert.alert("Lỗi", "Thiếu số điện thoại đăng nhập.");
      return;
    }

    if (!normalizedPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await managerLogin({
        login: normalizedLogin,
        password: normalizedPassword,
      }).unwrap();

      const contract = createManagerLoginContract(result, normalizedLogin, expectedRole);
      if (!contract || !contract.state.isReady) {
        Alert.alert("Lỗi", result?.error || result?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      dispatch(setGarageContext(contract.content.garageContext));
      contract.actions.complete({ dispatch, navigation });
    } catch (error: any) {
      const failure = mapManagerLoginFailure(error);
      Alert.alert(failure.title, failure.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={expectedRole === "garage_admin" ? "Đăng nhập admin gara" : "Đăng nhập quản lý gara"}
      subtitle="Vui lòng nhập mật khẩu để tiếp tục"
    >
      <View style={loginSharedStyles.inputContainer}>
        <TextInputComponent
          value={phone}
          editable={false}
          placeholder="Số điện thoại"
          placeholderTextColor={Colors.text.placeholder}
          style={loginSharedStyles.readOnlyInput}
        />

        <TextInputComponent
          value={password}
          onChangeText={setPassword}
          placeholder="Mật khẩu"
          placeholderTextColor={Colors.text.placeholder}
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
