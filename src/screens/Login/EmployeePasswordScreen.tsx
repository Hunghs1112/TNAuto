// src/screens/Login/EmployeePasswordScreen.tsx
import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Colors } from "../../constants/colors";
import { Button } from "../../components/ui";
import TextInputComponent from "../../components/TextInput/TextInput";
import { CommonActions, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLoginEmployeeMutation } from "../../services";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { setLoggedIn } from "../../redux/slices/authSlice";
import { setCurrentEmployee } from "../../redux/slices/employeeSlice";
import { setGarageContext } from "../../redux/slices/garageContextSlice";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { registerFCMTokenAfterLogin } from "../../utils/fcmTokenManager";
import { cleanPhone } from "../../utils/validation";
import AuthShell from "./AuthShell";
import { loginSharedStyles } from "./loginSharedStyles";

type EmployeePasswordRouteProp = RouteProp<AppStackParamList, "EmployeePassword">;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function EmployeePasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EmployeePasswordRouteProp>();
  const dispatch = useAppDispatch();

  const { phone, employeeData } = route.params;
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmployee] = useLoginEmployeeMutation();

  const handleLogin = async () => {
    const normalizedPhone = cleanPhone(phone || "");
    const normalizedPassword = password.trim();

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
      const result = await loginEmployee({
        phone: normalizedPhone,
        password: normalizedPassword,
      }).unwrap();

      if (result.success && result.employee) {
        const userId = result.employee.id.toString();

        dispatch(
          setLoggedIn({
            isLoggedIn: true,
            userType: "employee",
            userId,
            userName: result.employee.name || "Employee",
            userPhone: result.employee.phone || "",
            userLicensePlate: "",
            avatarUrl: result.employee.avatar_url || "",
            token: result.token || "",
            expiresAt: result.expires_at || "",
          })
        );

        dispatch(setCurrentEmployee(result.employee));
        dispatch(
          setGarageContext({
            garageId: result.garage?.id ?? result.garage_id,
            garageCode: result.garage?.code,
            garageName: result.garage?.name,
            address: result.garage?.address,
            avatarUrl: result.garage?.avatar_url,
            bannerUrl: result.garage?.banner_url,
            status: result.garage?.status,
            resolved: true,
          })
        );

        registerFCMTokenAfterLogin(userId, "employee").catch((error) => {
          console.error("Failed to register FCM token:", error);
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" as never }],
          })
        );
      } else {
        Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Employee login error:", error);

      if (error?.status === 401) {
        Alert.alert("Mật khẩu không đúng", "Vui lòng kiểm tra lại mật khẩu.");
      } else if (error?.status === 403) {
        Alert.alert(
          "Gara tam ngung hoat dong",
          error?.data?.error || error?.data?.message || "Gara cua nhan vien dang khong o trang thai active."
        );
      } else if (error?.status === 400) {
        Alert.alert(
          "Thiếu thông tin đăng nhập",
          error?.data?.error || error?.data?.message || "Vui lòng nhập đầy đủ số điện thoại và mật khẩu."
        );
      } else if (error?.status === 500) {
        Alert.alert("Lỗi hệ thống", "Có lỗi xảy ra từ máy chủ. Vui lòng thử lại sau.");
      } else {
        Alert.alert("Lỗi kết nối", error?.data?.error || error?.data?.message || "Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title={`Xin chào, ${employeeData?.name || "Nhân viên"}`} subtitle="Vui lòng nhập mật khẩu để tiếp tục">
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
