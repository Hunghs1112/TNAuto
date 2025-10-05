import React, { useState } from "react";
import { View, Text, StatusBar, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import ConfirmButton from "../../components/Button/ConfirmButton";
import TextInputComponent from "../../components/TextInput/TextInput";
import Header from "../../components/Header/Header";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRegisterCustomerMutation } from "../../services";

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

  const [registerCustomer] = useRegisterCustomerMutation();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      if (!name || !phone || !licensePlate) {
        Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
        return;
      }
      console.log('Registering with:', { name, phone, licensePlate });
      const result = await registerCustomer({ name, phone, licensePlate }).unwrap();
      console.log('Registration result:', result);
      if (result.success) {
        Alert.alert("Thành công", "Đăng ký thành công!");
        navigation.navigate("Login");
      } else {
        Alert.alert("Lỗi", "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert("Lỗi", "Đăng ký thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />

      <Header title="Đăng ký" />

      <View style={styles.body}>
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
              placeholder="Họ và tên"
              placeholderTextColor={Colors.text.placeholder}
            />
            <TextInputComponent
              value={phone}
              onChangeText={setPhone}
              placeholder="Số điện thoại"
              placeholderTextColor={Colors.text.placeholder}
              keyboardType="phone-pad"
            />
            <TextInputComponent
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="Biển số xe"
              placeholderTextColor={Colors.text.placeholder}
            />
          </View>

          <ConfirmButton
            title="Đăng ký"
            onPress={handleRegister}
            loading={isLoading}
            buttonColor={Colors.confirmbutton}
            textColor={Colors.text.inverted}
          />

          <View style={styles.signup}>
            <Text style={styles.registerPrompt}>Bạn đã có tài khoản?</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.registerLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}