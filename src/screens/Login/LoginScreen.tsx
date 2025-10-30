// src/screens/Auth/LoginScreen.tsx - Unified login screen with automatic user type detection
import React, { useState, useEffect } from "react";
import { View, Text, StatusBar, TouchableOpacity, Image, InteractionManager, Alert, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Animated, Easing } from "react-native";
const AnimatedContainer: React.ComponentType<any> = Animated.createAnimatedComponent(View as any) as any;
import { RootView } from "../../components/layout";
import { Colors } from "../../constants/colors";
import ConfirmButton from "../../components/ConfirmButton";
import TextInputComponent from "../../components/TextInput/TextInput";
import Header from "../../components/Header";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLoginCustomerMutation } from "../../services";
import { useCheckPhoneMutation } from "../../services/authApi";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { setLoggedIn } from "../../redux/slices/authSlice";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { registerFCMTokenAfterLogin } from "../../utils/fcmTokenManager";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [headerOffset, setHeaderOffset] = useState(0);
  const translateY = React.useRef(new Animated.Value(0)).current;

  const [loginCustomer] = useLoginCustomerMutation();
  const [checkPhone] = useCheckPhoneMutation();

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      const keyboardHeight = e?.endCoordinates?.height || 0;
      const duration = e?.duration || 250;
      // Move form up by (keyboardHeight - safeOffset)
      const safeOffset = 60; // lowered further by ~30px
      const moveUp = Math.max(0, keyboardHeight - safeOffset);
      Animated.timing(translateY, {
        toValue: -moveUp,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const onHide = (e: any) => {
      const duration = e?.duration || 250;
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [translateY]);

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại!");
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Check phone type
      const checkResult = await checkPhone({ phone: phone.trim() }).unwrap();
      
      if (!checkResult.success) {
        Alert.alert("Lỗi", checkResult.error || "Không thể kiểm tra số điện thoại");
        setIsLoading(false);
        return;
      }

      // Step 2: Handle based on user_type
      if (checkResult.user_type === 'not_found') {
        // Phone not registered - suggest registration
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
        setIsLoading(false);
        return;
      }
      
      if (checkResult.user_type === 'customer') {
        // Auto-login customer (no password needed)
        try {
          const loginResult = await loginCustomer({ phone: phone.trim() }).unwrap();
          
          if (loginResult.success && loginResult.customer) {
            const userId = loginResult.customer.id?.toString() || '';
            
            dispatch(setLoggedIn({ 
              isLoggedIn: true, 
              userType: 'customer', 
              userId,
              userName: loginResult.customer?.name || 'Customer',
              userPhone: loginResult.customer?.phone || '',
              userLicensePlate: loginResult.customer?.license_plate || '',
              avatarUrl: loginResult.customer?.avatar_url || '',
              userEmail: loginResult.customer?.email || ''
            }));

            // Register FCM token in background
            registerFCMTokenAfterLogin(userId, 'customer').catch(error => {
              console.error('Failed to register FCM token:', error);
            });
          } else {
            Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại!");
          }
        } catch (error: any) {
          console.error('Customer login error:', error);
          Alert.alert("Lỗi", "Không thể đăng nhập. Vui lòng thử lại.");
        }
        setIsLoading(false);
        return;
      }
      
      if (checkResult.user_type === 'employee') {
        // Navigate to password screen for employee
        setIsLoading(false);
        navigation.navigate('EmployeePassword', {
          phone: phone.trim(),
          employeeData: checkResult.data!
        });
        return;
      }
      
    } catch (error: any) {
      console.error('Check phone error:', error);
      Alert.alert(
        "Lỗi kết nối",
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
      );
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <RootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View onLayout={(e) => setHeaderOffset(e.nativeEvent.layout.height)}>
          <Header title="Đăng nhập" />
        </View>

        <View style={styles.body}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <AnimatedContainer style={{ flex: 1, transform: [{ translateY }] }}>
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                <View style={styles.form}>
              <Text style={styles.welcomeText}>Chào mừng trở lại</Text>
              <Text style={styles.subtitle}>Nhập số điện thoại để tiếp tục</Text>

              <Image
                style={styles.logo}
                source={require('../../assets/logo.png')}
                resizeMode="cover"
              />

              <View style={styles.inputContainer}>
                <TextInputComponent
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Số điện thoại"
                  placeholderTextColor={Colors.text.placeholder}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.actions}>
                <ConfirmButton
                  title="Tiếp tục"
                  onPress={handleLogin}
                  loading={isLoading}
                  buttonColor={Colors.button.primary}
                  textColor={Colors.text.inverted}
                />
              </View>

                  <View style={styles.signup}>
                    <Text style={styles.registerPrompt}>Bạn chưa có tài khoản?</Text>
                    <TouchableOpacity onPress={handleRegister}>
                      <Text style={styles.registerLink}>Đăng ký</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </AnimatedContainer>
          </TouchableWithoutFeedback>
        </View>
      </RootView>
    </View>
  );
}