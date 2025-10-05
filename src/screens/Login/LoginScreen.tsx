// src/screens/Auth/LoginScreen.tsx (Updated: Add avatarUrl from backend response to auth state)
import React, { useState, useEffect } from "react";
import { View, Text, StatusBar, TouchableOpacity, Image, InteractionManager, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import ConfirmButton from "../../components/Button/ConfirmButton";
import TextInputComponent from "../../components/TextInput/TextInput";
import Header from "../../components/Header/Header";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLoginCustomerMutation, useLoginEmployeeMutation } from "../../services";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { setLoggedIn } from "../../redux/slices/authSlice";
import { setCurrentEmployee } from "../../redux/slices/employeeSlice";
import { AuthStackParamList } from "../../navigation/AuthNavigator";

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
        if (!phone) {
          Alert.alert("Lỗi", "Vui lòng nhập số điện thoại!");
          return;
        }
        const result = await loginCustomer({ phone }).unwrap();
        console.log('LoginScreen debug - Customer login result:', result);
        if (result.success && result.customer) {
          dispatch(setLoggedIn({ 
            isLoggedIn: true, 
            userType: 'customer', 
            userId: result.customer.id?.toString() || '', // Add userId from backend
            userName: result.customer?.name || 'Customer',
            userPhone: result.customer?.phone || '',
            userLicensePlate: result.customer?.license_plate || '',
            avatarUrl: result.customer?.avatar_url || ''
          }));
          console.log('LoginScreen debug - Set customer userId:', result.customer.id, 'avatarUrl:', result.customer.avatar_url); // Debug
        } else {
          Alert.alert("Lỗi", "Đăng nhập thất bại!");
        }
      } else {
        if (!phone || !password) {
          Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
          return;
        }
        const result = await loginEmployee({ phone, password }).unwrap();
        console.log('LoginScreen debug - Employee login result:', result);
        if (result.success && result.employee) {
          dispatch(setLoggedIn({ 
            isLoggedIn: true, 
            userType: 'employee', 
            userId: result.employee.id.toString(), // Add userId from backend
            userName: result.employee.name || 'Employee',
            userPhone: result.employee.phone || '',
            userLicensePlate: '',
            avatarUrl: result.employee.avatar_url || ''
          }));
          dispatch(setCurrentEmployee(result.employee));
          console.log('LoginScreen debug - Set employee userId:', result.employee.id, 'avatarUrl:', result.employee.avatar_url, 'Dispatched setCurrentEmployee:', result.employee); // Debug
        } else {
          Alert.alert("Lỗi", "Đăng nhập thất bại!");
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Lỗi", "Đăng nhập thất bại!");
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
            buttonColor={Colors.confirmbutton}
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