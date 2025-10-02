// screens/Offer/OfferScreen.tsx
import React from "react";
import { View, Text, StatusBar, Image, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import Header from "../../components/Header/Header";
import Item from "../../components/Item/Item";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useGetOffersQuery } from "../../services/offerApi";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const OfferScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const { data, isLoading, error } = useGetOffersQuery();

  console.log('OfferScreen debug - data:', data);
  console.log('OfferScreen debug - isLoading:', isLoading);
  console.log('OfferScreen debug - error:', error);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Ưu đãi" />
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
          <Header title="Ưu đãi" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <Text>Lỗi tải ưu đãi</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const offers = data.data.map((offer) => ({
    id: offer.id,
    title: offer.name,
    description: `Dịch vụ: ${offer.service_name}`,
    onPress: () => console.log(`Offer ${offer.id} pressed`),
  }));

  console.log('OfferScreen debug - offers:', offers);

  if (offers.length === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Ưu đãi" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={48} color={Colors.text.secondary} />
              <Text style={styles.emptyText}>Chưa có ưu đãi nào</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <View style={styles.redSection}>
        <Header title="Ưu đãi" />
      </View>
      
      <View style={styles.whiteSection}>
        <View style={styles.body}>
          <View style={styles.form}>
            <FlatList
              data={offers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Item
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  onPress={item.onPress}
                />
              )}
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

export default OfferScreen;