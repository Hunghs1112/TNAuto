// src/screens/Login/EmployeePasswordScreen.tsx
import React, { useState } from "react";
import { View, Text, StatusBar, Alert, Image, KeyboardAvoidingView, Platform } from "react-native";
import { RootView } from "../../components/layout";
import { Colors } from "../../constants/colors";
import ConfirmButton from "../../components/ConfirmButton";
import TextInputComponent from "../../components/TextInput/TextInput";
import Header from "../../components/Header";
import { styles } from "./styles";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLoginEmployeeMutation } from "../../services";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { setLoggedIn } from "../../redux/slices/authSlice";
import { setCurrentEmployee } from "../../redux/slices/employeeSlice";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { registerFCMTokenAfterLogin } from "../../utils/fcmTokenManager";

type EmployeePasswordRouteProp = RouteProp<AuthStackParamList, 'EmployeePassword'>;
type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function EmployeePasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EmployeePasswordRouteProp>();
  const dispatch = useAppDispatch();
  
  const { phone, employeeData } = route.params;
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmployee] = useLoginEmployeeMutation();

  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu!");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginEmployee({ 
        phone: phone.trim(), 
        password: password.trim() 
      }).unwrap();
      
      if (result.success && result.employee) {
        const userId = result.employee.id.toString();
        
        dispatch(setLoggedIn({ 
          isLoggedIn: true, 
          userType: 'employee', 
          userId,
          userName: result.employee.name || 'Employee',
          userPhone: result.employee.phone || '',
          userLicensePlate: '',
          avatarUrl: result.employee.avatar_url || ''
        }));
        dispatch(setCurrentEmployee(result.employee));

        // Register FCM token in background
        registerFCMTokenAfterLogin(userId, 'employee').catch(error => {
          console.error('Failed to register FCM token:', error);
        });
      } else {
        Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error('Employee login error:', error);
      
      if (error?.status === 401) {
        Alert.alert(
          "Mật khẩu không đúng",
          "Vui lòng kiểm tra lại mật khẩu.",
          [{ text: "Đóng", style: "cancel" }]
        );
      } else if (error?.status === 500) {
        Alert.alert("Lỗi hệ thống", "Có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau.");
      } else {
        Alert.alert(
          "Lỗi kết nối",
          error?.data?.message || "Không thể kết nối đến máy chủ."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
    <RootView style={styles.root}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

          <Header title="Đăng nhập nhân viên" showBackButton />

          <View style={styles.body}>
            <View style={styles.form}>
              <Text style={styles.welcomeText}>Xin chào, {employeeData.name}</Text>
              <Text style={styles.subtitle}>Vui lòng nhập mật khẩu để tiếp tục</Text>

              <Image
                style={styles.logo}
                source={require('../../assets/logo.png')}
                resizeMode="cover"
              />

              <View style={styles.inputContainer}>
                <TextInputComponent
                  value={phone}
                  editable={false}
                  placeholder="Số điện thoại"
                  placeholderTextColor={Colors.text.placeholder}
                  style={{ backgroundColor: Colors.background.disabled }}
                />

                <TextInputComponent
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mật khẩu"
                  placeholderTextColor={Colors.text.placeholder}
                  secureTextEntry={true}
                  autoFocus={true}
                />
              </View>

              <ConfirmButton
                title="Đăng nhập"
                onPress={handleLogin}
                loading={isLoading}
                buttonColor={Colors.button.primary}
                textColor={Colors.text.inverted}
              />
            </View>
          </View>
    </RootView>
      </View>
    </KeyboardAvoidingView>
  );
}

