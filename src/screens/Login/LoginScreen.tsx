// src/screens/Auth/LoginScreen.tsx - Login screen with FCM token registration
import React, { useState, useEffect } from "react";
import { View, Text, StatusBar, TouchableOpacity, Image, InteractionManager, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import ConfirmButton from "../../components/ConfirmButton";
import TextInputComponent from "../../components/TextInput/TextInput";
import Header from "../../components/Header";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLoginCustomerMutation, useLoginEmployeeMutation } from "../../services";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { setLoggedIn } from "../../redux/slices/authSlice";
import { setCurrentEmployee } from "../../redux/slices/employeeSlice";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { registerFCMTokenAfterLogin } from "../../utils/fcmTokenManager";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomerMode, setIsCustomerMode] = useState(true); // Default customer
  const [ready, setReady] = useState(false);

  const [loginCustomer] = useLoginCustomerMutation();
  const [loginEmployee] = useLoginEmployeeMutation();

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (isCustomerMode) {
        // 👤 CUSTOMER LOGIN - Chỉ cần số điện thoại
        if (!phone.trim()) {
          Alert.alert("Lỗi", "Vui lòng nhập số điện thoại!");
          setIsLoading(false);
          return;
        }
        
        try {
          const result = await loginCustomer({ phone: phone.trim() }).unwrap();
          
          if (result.success && result.customer) {
            const userId = result.customer.id?.toString() || '';
            
            dispatch(setLoggedIn({ 
              isLoggedIn: true, 
              userType: 'customer', 
              userId,
              userName: result.customer?.name || 'Customer',
              userPhone: result.customer?.phone || '',
              userLicensePlate: result.customer?.license_plate || '',
              avatarUrl: result.customer?.avatar_url || '',
              userEmail: result.customer?.email || ''
            }));

            // Register FCM token in background
            registerFCMTokenAfterLogin(userId, 'customer').catch(error => {
              console.error('Failed to register FCM token:', error);
              // Don't show error to user, token will be re-registered on next app start
            });
          } else {
            Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại!");
          }
        } catch (error: any) {
          console.error('Customer login error:', error);
          
          // Handle specific error codes
          if (error?.status === 400) {
            // 400 Bad Request - Thiếu phone (nhưng đã check ở trên)
            Alert.alert(
              "Thiếu thông tin",
              "Vui lòng nhập số điện thoại để đăng nhập."
            );
          } else if (error?.status === 404) {
            // 404 Not Found - Phone chưa đăng ký
            Alert.alert(
              "Tài khoản không tồn tại",
              "Số điện thoại này chưa được đăng ký. Vui lòng đăng ký trước khi đăng nhập.",
              [
                { text: "Đóng", style: "cancel" },
                { 
                  text: "Đăng ký ngay", 
                  onPress: () => navigation.navigate("Register")
                }
              ]
            );
          } else if (error?.status === 500) {
            // 500 Internal Server Error
            Alert.alert(
              "Lỗi hệ thống",
              "Có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau."
            );
          } else {
            // Unknown error
            Alert.alert(
              "Lỗi kết nối",
              error?.data?.message || "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
            );
          }
        }
      } else {
        // 👷 EMPLOYEE LOGIN - Yêu cầu phone + password
        if (!phone.trim() || !password.trim()) {
          Alert.alert("Lỗi", "Vui lòng nhập đầy đủ số điện thoại và mật khẩu!");
          setIsLoading(false);
          return;
        }
        
        try {
          const result = await loginEmployee({ phone: phone.trim(), password: password.trim() }).unwrap();
          
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
              // Don't show error to user, token will be re-registered on next app start
            });
          } else {
            Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại!");
          }
        } catch (error: any) {
          console.error('Employee login error:', error);
          
          // Handle specific error codes
          if (error?.status === 400) {
            // 400 Bad Request - Thiếu phone hoặc password
            Alert.alert(
              "Thiếu thông tin",
              "Vui lòng nhập đầy đủ số điện thoại và mật khẩu."
            );
          } else if (error?.status === 401) {
            // 401 Unauthorized - Sai thông tin (phone không tồn tại HOẶC password sai)
            Alert.alert(
              "Thông tin không chính xác",
              "Số điện thoại hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.",
              [
                { text: "Đóng", style: "cancel" }
              ]
            );
          } else if (error?.status === 500) {
            // 500 Internal Server Error
            Alert.alert(
              "Lỗi hệ thống",
              "Có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau."
            );
          } else {
            // Unknown error
            Alert.alert(
              "Lỗi kết nối",
              error?.data?.message || "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
            );
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  const handleCustomerLogin = () => {
    setIsCustomerMode(!isCustomerMode);
    setPhone("");
    setPassword("");
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />

      <Header title="Đăng nhập" />

      <View style={styles.body}>
        <View style={styles.form}>
          <Text style={styles.welcomeText}>Chào mừng trở lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

          <Image
            style={styles.logo}
            source={require('../../assets/logo.png')}
            resizeMode="cover"
          />

          {isCustomerMode ? (
            <TextInputComponent
              value={phone}
              onChangeText={setPhone}
              placeholder="Số điện thoại"
              placeholderTextColor={Colors.text.placeholder}
              keyboardType="phone-pad"
            />
          ) : (
            <View style={styles.inputContainer}>
              <TextInputComponent
                value={phone}
                onChangeText={setPhone}
                placeholder="Số điện thoại"
                placeholderTextColor={Colors.text.placeholder}
                keyboardType="phone-pad"
              />
              <TextInputComponent
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu"
                placeholderTextColor={Colors.text.placeholder}
                secureTextEntry={true}
              />
            </View>
          )}

          <TouchableOpacity onPress={handleCustomerLogin} style={styles.customerLink}>
            <Text style={styles.customerLinkText}>
              {isCustomerMode ? "Chuyển sang đăng nhập nhân viên" : "Chuyển sang đăng nhập khách hàng"}
            </Text>
          </TouchableOpacity>

          <ConfirmButton
            title="Đăng nhập"
            onPress={handleLogin}
            loading={isLoading}
            buttonColor={Colors.button.primary}
            textColor={Colors.text.inverted}
          />

          <View style={styles.signup}>
            <Text style={styles.registerPrompt}>Bạn chưa có tài khoản?</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}