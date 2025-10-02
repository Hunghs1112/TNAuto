import React from "react";
import { View, Text, StatusBar, Image, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import Header from "../../components/Header/Header";
import Item from "../../components/Item/Item";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useGetServicesQuery } from "../../services";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ServiceScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const { data, isLoading, error } = useGetServicesQuery();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Dịch vụ" />
        </View>
        <View style={[styles.whiteSection, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data?.success) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Dịch vụ" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <Text>Lỗi tải dịch vụ</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const services = data.data.map((service) => ({
    id: service.id,
    title: service.name,
    description: `${service.description} - Thời gian ước tính: ${service.estimated_time} ngày`,
    onPress: () => console.log(`Service ${service.id} pressed`),
  }));

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <View style={styles.redSection}>
        <Header title="Dịch vụ" />
      </View>
      
      <View style={styles.whiteSection}>
        <View style={styles.body}>
          <View style={styles.form}>
            <View style={styles.servicesContainer}>
              {services.map((service) => (
                <Item
                  key={service.id}
                  title={service.title}
                  description={service.description}
                  onPress={service.onPress}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.bar}>
            <View style={styles.barInner} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ServiceScreen;