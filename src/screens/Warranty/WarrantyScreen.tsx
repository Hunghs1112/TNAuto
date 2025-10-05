// src/screens/Warranty/WarrantyScreen.tsx
import React from "react";
import { View, Text, StatusBar, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../../constants/colors";
import Header from "../../components/Header/Header";
import Item from "../../components/Item/Item";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { useGetAllWarrantiesQuery } from "../../services/warrantyApi";
import { styles } from "./styles";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const WarrantyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const customer = useSelector((state: RootState) => state.customer.customer);

  console.log('WarrantyScreen: customer', customer); // Debug customer data

  const { data, isLoading, error, refetch } = useGetAllWarrantiesQuery(
    { customer_id: customer?.id },
    { skip: !customer?.id }
  );

  console.log('WarrantyScreen: data', data);
  console.log('WarrantyScreen: isLoading', isLoading);
  console.log('WarrantyScreen: error', error);
  console.log('WarrantyScreen: refetch', refetch);

  React.useEffect(() => {
    console.log('WarrantyScreen: useEffect refreshing', refreshing); // Debug refresh trigger
    if (refreshing) refetch();
  }, [refreshing, refetch]);

  if (isLoading) {
    console.log('WarrantyScreen: rendering loading'); // Debug loading state
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Bảo hành" />
        </View>
        <View style={[styles.whiteSection, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    console.log('WarrantyScreen: rendering error', error); // Debug error details
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Bảo hành" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <Text>Lỗi tải bảo hành</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const warranties = (data || []).map((warranty) => {
    console.log('WarrantyScreen: mapping warranty', warranty); // Debug each warranty item
    return {
      id: warranty.id,
      title: `Bảo hành đơn hàng #${warranty.order_id}`,
      description: `Thời gian: ${warranty.warranty_period} tháng từ ${warranty.start_date} đến ${warranty.end_date}`,
      onPress: () => console.log(`Warranty ${warranty.id} pressed`),
    };
  });

  console.log('WarrantyScreen: warranties', warranties);

  if (warranties.length === 0) {
    console.log('WarrantyScreen: rendering empty'); // Debug empty state
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Bảo hành" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <View style={styles.emptyContainer}>
              <Ionicons name="shield-checkmark-outline" size={48} color={Colors.text.secondary} />
              <Text style={styles.emptyText}>Chưa có bảo hành nào</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  console.log('WarrantyScreen: rendering list'); // Debug list render
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      <View style={styles.redSection}>
        <Header title="Bảo hành" />
      </View>
      <View style={styles.whiteSection}>
        <View style={styles.body}>
          <View style={styles.form}>
            <FlatList
              data={warranties}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                console.log('WarrantyScreen: rendering item', item); // Debug each FlatList item
                return <Item title={item.title} description={item.description} onPress={item.onPress} />;
              }}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              showsVerticalScrollIndicator={false}
              style={styles.servicesContainer}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
          </View>
          <View style={styles.bar}>
            <View style={styles.barInner} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WarrantyScreen;