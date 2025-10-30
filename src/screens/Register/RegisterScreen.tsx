import React, { useState } from "react";
import { View, Text, StatusBar, TouchableOpacity, Image, Alert, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Animated, Easing } from "react-native";
const AnimatedContainer: React.ComponentType<any> = Animated.createAnimatedComponent(View as any) as any;
import { RootView } from "../../components/layout";
import { Colors } from "../../constants/colors";
import ConfirmButton from "../../components/ConfirmButton";
import TextInputComponent from "../../components/TextInput/TextInput";
import Header from "../../components/Header";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRegisterCustomerMutation } from "../../services";
import { 
  validateName, 
  validatePhone, 
  validateLicensePlate,
  cleanPhone,
  formatLicensePlate 
} from "../../utils/validation";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [headerOffset, setHeaderOffset] = useState(0);
  const translateY = React.useRef(new Animated.Value(0)).current;

  const [registerCustomer] = useRegisterCustomerMutation();

  const handleRegister = async () => {
    // Validate name (required)
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      Alert.alert("Lỗi xác thực", nameValidation.error || "Họ và tên không hợp lệ");
      return;
    }

    // Validate phone (required)
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      Alert.alert("Lỗi xác thực", phoneValidation.error || "Số điện thoại không hợp lệ");
      return;
    }

    // Validate license plate (optional but must be valid format if provided)
    const plateValidation = validateLicensePlate(licensePlate);
    if (!plateValidation.isValid) {
      Alert.alert("Lỗi xác thực", plateValidation.error || "Biển số xe không hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      // Clean and format data before sending
      const cleanedPhone = cleanPhone(phone);
      const formattedPlate = licensePlate.trim() ? formatLicensePlate(licensePlate) : undefined;
      
      const requestBody: { name: string; phone: string; license_plate?: string; avatar_url?: string } = {
        name: name.trim(),
        phone: cleanedPhone,
      };

      // Only include license_plate if provided
      if (formattedPlate) {
        requestBody.license_plate = formattedPlate;
      }

      console.log('RegisterScreen: Registering with:', requestBody);
      const result = await registerCustomer(requestBody).unwrap();
      console.log('RegisterScreen: Registration result:', result);
      
      if (result.success) {
        Alert.alert(
          "Đăng ký thành công! 🎉", 
          result.message || "Bạn có thể đăng nhập ngay bây giờ",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login")
            }
          ]
        );
      } else {
        Alert.alert("Lỗi", "Đăng ký thất bại!");
      }
    } catch (error: any) {
      console.error('RegisterScreen: Registration error:', error);
      
      // Handle specific error cases from backend
      let errorMessage = "Đăng ký thất bại! Vui lòng thử lại.";
      
      if (error?.data?.error || error?.message) {
        const errorText = error?.data?.error || error?.message || '';
        
        // Phone already exists
        if (errorText.toLowerCase().includes('phone') && 
            (errorText.toLowerCase().includes('exist') || errorText.toLowerCase().includes('duplicate'))) {
          errorMessage = "Số điện thoại này đã được đăng ký.\nVui lòng sử dụng số điện thoại khác hoặc đăng nhập.";
        }
        // License plate already exists
        else if (errorText.toLowerCase().includes('license') && 
                 (errorText.toLowerCase().includes('exist') || errorText.toLowerCase().includes('duplicate'))) {
          errorMessage = "Biển số xe này đã được đăng ký.\nVui lòng kiểm tra lại biển số xe.";
        }
        // Duplicate entry (generic)
        else if (errorText.toLowerCase().includes('duplicate')) {
          errorMessage = "Thông tin này đã tồn tại trong hệ thống.\nVui lòng kiểm tra lại số điện thoại hoặc biển số xe.";
        }
        // Missing required fields
        else if (errorText.toLowerCase().includes('required') || 
                 errorText.toLowerCase().includes('missing')) {
          errorMessage = "Vui lòng nhập đầy đủ thông tin bắt buộc (Họ tên và Số điện thoại).";
        }
        // Invalid format
        else if (errorText.toLowerCase().includes('format') || 
                 errorText.toLowerCase().includes('invalid')) {
          errorMessage = "Định dạng thông tin không hợp lệ.\nVui lòng kiểm tra lại số điện thoại hoặc biển số xe.";
        }
        // Server error
        else if (errorText.toLowerCase().includes('server') || 
                 errorText.toLowerCase().includes('internal')) {
          errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau.";
        }
        // Default: show backend error message
        else {
          errorMessage = errorText;
        }
      }
      
      Alert.alert("Lỗi đăng ký", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      const keyboardHeight = e?.endCoordinates?.height || 0;
      const duration = e?.duration || 250;
      const safeOffset = 0; // user preference (Register)
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

  return (
    <View style={styles.container}>
      <RootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

        <View onLayout={(e) => setHeaderOffset(e.nativeEvent.layout.height)}>
          <Header title="Đăng ký" />
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
              <Text style={styles.welcomeText}>Chào mừng đến với TN Auto</Text>
              <Text style={styles.subtitle}>Đăng ký tại đây</Text>

              <Image
                style={styles.logo}
                source={require('../../assets/logo.png')}
                resizeMode="cover"
              />

              <View style={styles.inputContainer}>
                <TextInputComponent
                  value={name}
                  onChangeText={setName}
                  placeholder="Họ và tên *"
                  placeholderTextColor={Colors.text.placeholder}
                />
                <TextInputComponent
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Số điện thoại * (VD: 0909123456)"
                  placeholderTextColor={Colors.text.placeholder}
                  keyboardType="phone-pad"
                />
                <TextInputComponent
                  value={licensePlate}
                  onChangeText={(text) => setLicensePlate(text.toUpperCase())}
                  placeholder="Biển số xe (VD: 29A-12345)"
                  placeholderTextColor={Colors.text.placeholder}
                />
                <Text style={styles.helperText}>* Trường bắt buộc</Text>
              </View>

              <View style={styles.actions}>
                <ConfirmButton
                  title="Đăng ký"
                  onPress={handleRegister}
                  loading={isLoading}
                  buttonColor={Colors.button.primary}
                  textColor={Colors.text.inverted}
                />
              </View>

                  <View style={styles.signup}>
                    <Text style={styles.registerPrompt}>Bạn đã có tài khoản?</Text>
                    <TouchableOpacity onPress={handleLogin}>
                      <Text style={styles.registerLink}>Đăng nhập</Text>
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