import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Screen from "../../components/layout/Screen/Screen";
import Item from "../../components/Item";
import FloatingNoticeBanner from "../../components/FloatingNoticeBanner";
import { Colors } from "../../constants/colors";
import { getPrimaryCatalogProductImageUrl } from "../../utils/catalog";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { selectActiveGarage, selectGarageAvatarUrl, selectGarageBannerUrl, selectGarageName, selectUserName, selectUserType } from "../../redux/selectors";
import { styles } from "./styles";
import UserHeader from "./UserHeader";
import GarageSummaryCard from "./GarageSummaryCard";
import VehicleInfoCard from "./VehicleInfoCard";
import SectionHeader from "./SectionHeader";
import QuickBookingForm from "./QuickBookingForm";
import OrdersList from "./components/OrdersList";
import AvailableOrdersList from "./components/AvailableOrdersList";
import EmployeeOrdersList from "./components/EmployeeOrdersList";
import WarrantyInfo from "./components/WarrantyInfo";
import ViewMoreButton from "./ViewMoreButton";
import DocumentExpiryCards from "./DocumentExpiryCards";
import { useHomeScreen } from "./useHomeScreen";
import ManagerHomeScreen from "./ManagerHomeScreen";

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const storeUserType = useAppSelector(selectUserType);
  const storeUserName = useAppSelector(selectUserName);
  const storeGarageName = useAppSelector(selectGarageName);
  const storeGarageAvatarUrl = useAppSelector(selectGarageAvatarUrl);
  const storeGarageBannerUrl = useAppSelector(selectGarageBannerUrl);
  const activeGarage = useAppSelector(selectActiveGarage);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  const isManagerRole = storeUserType === "garage_manager" || storeUserType === "garage_admin";

  if (isManagerRole) {
    return (
      <ManagerHomeScreen
        userName={storeUserName}
        isLoggedIn={isLoggedIn}
        garageSummary={{
          name: storeGarageName,
          address: activeGarage?.address || undefined,
          avatarUrl: storeGarageAvatarUrl || undefined,
          bannerUrl: storeGarageBannerUrl || undefined,
          canChangeGarage: false,
        }}
        onGaragePress={() => navigation.navigate("Category")}
      />
    );
  }

  return <StandardHomeScreen />;
}

function StandardHomeScreen() {
  const {
    userType,
    userName,
    garageSummary,
    homeContent,
    shouldShowPromoHome,
    ordersState,
    actions,
    promoBanner,
    isLoggedIn,
  } = useHomeScreen();

  return (
    <Screen hideHeader statusBarStyle="light-content">
      <View style={styles.homeRoot}>
        <LinearGradient
          colors={[...Colors.gradients.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.homeBackground}
        >
          <View style={styles.homeDecorativeContainer}>
            <View style={[styles.homeDecorativeCircle, styles.homeCircle1]} />
            <View style={[styles.homeDecorativeCircle, styles.homeCircle2]} />
            <View style={[styles.homeDecorativeCircle, styles.homeCircle3]} />
          </View>
        </LinearGradient>

        <View style={styles.headerBackground}>
          {isLoggedIn && garageSummary.name && (
            <View style={styles.garageSummaryWrap}>
              <GarageSummaryCard
                garageName={garageSummary.name}
                garageAddress={garageSummary.address}
                garageAvatarUrl={garageSummary.avatarUrl}
                garageBannerUrl={garageSummary.bannerUrl}
                canChangeGarage={garageSummary.canChangeGarage}
                onPress={actions.onGaragePress}
              />
            </View>
          )}
          {isLoggedIn && (
            <View style={styles.heroActionsOverlay}>
              <TouchableOpacity style={styles.heroActionButton} onPress={actions.onOfferPress}>
                <Ionicons name="pricetag-outline" size={16} color={Colors.background.light} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroActionButton} onPress={actions.onWarrantyPress}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.background.light} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroActionButton} onPress={actions.onNotificationPress}>
                <Ionicons name="notifications-outline" size={16} color={Colors.background.light} />
              </TouchableOpacity>
            </View>
          )}
          <UserHeader
            userName={userName}
            garageName={garageSummary.name}
            onLoginPress={actions.onLoginPress}
            onGaragePress={actions.onGaragePress}
            isLoggedIn={isLoggedIn}
            canChangeGarage={garageSummary.canChangeGarage}
          />
        </View>

        {!shouldShowPromoHome && isLoggedIn && userType === "customer" && (
          <View style={styles.documentExpiryOverlay}>
            <DocumentExpiryCards />
          </View>
        )}

        {!shouldShowPromoHome && promoBanner && (
          <View style={styles.bannerInlineWrap}>
            <FloatingNoticeBanner
              title={promoBanner.title}
              subtitle={promoBanner.subtitle}
              onDismiss={promoBanner.dismiss}
              onPress={undefined}
            />
          </View>
        )}

        <View style={styles.bottomSheet}>
          {shouldShowPromoHome ? (
            <View style={styles.section}>
              <View style={styles.loginPromptCard}>
                <Ionicons name="business-outline" size={48} color={Colors.primary} />
                <Text style={styles.loginPromptTitle}>Lien ket ma gara de su dung day du tinh nang</Text>
                <Text style={styles.loginPromptDescription}>
                  Tai khoan cua ban chua duoc gan voi ma gara nao. Hay nhap ma gara de ket noi tai khoan, dong bo du lieu va bat dau su dung dich vu.
                </Text>
                <TouchableOpacity style={styles.loginPromptButton} onPress={actions.onGaragePress}>
                  <Text style={styles.loginPromptButtonText}>Nhap ma gara</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.background.light} />
                </TouchableOpacity>
              </View>
            </View>
          ) : isLoggedIn && userType === "employee" ? (
            <>
              <View style={styles.section}>
                <SectionHeader title="Viec moi tao chua giao ai" />
                <AvailableOrdersList
                  orders={ordersState.sortedAvailableOrders}
                  isLoading={ordersState.availableLoading}
                  onOrderPress={actions.onOrderPress}
                  onClaimPress={actions.onClaimOrder}
                  claimingOrderId={ordersState.claimingOrderId}
                  emptyMessage="Chua co viec moi nao dang cho nhan"
                />
              </View>

              <View style={styles.section}>
                <SectionHeader title="Viec dang dam nhan" />
                <EmployeeOrdersList
                  orders={ordersState.sortedAssignedOrders}
                  isLoading={ordersState.assignedLoading}
                  onOrderPress={actions.onOrderPress}
                  emptyMessage="Chua co viec nao dang dam nhan"
                />
              </View>

              <View style={styles.section}>
                <SectionHeader title="Thong tin bao hanh" />
                <WarrantyInfo
                  orders={ordersState.sortedAssignedOrders}
                  onWarrantyPress={(orderId: string) => actions.onOrderPress(orderId)}
                />
              </View>
            </>
          ) : (
            <>
              {isLoggedIn && userType === "customer" && (
                <View style={styles.section}>
                  <VehicleInfoCard />
                </View>
              )}

              {isLoggedIn && userType === "customer" && (
                <View style={styles.section}>
                  <SectionHeader title="Dich vu dang su dung" />
                  <OrdersList
                    orders={ordersState.displayedOrders}
                    isLoading={ordersState.ordersLoading}
                    userType={userType}
                    onOrderPress={actions.onOrderPress}
                    emptyMessage="Chua co don hang nao"
                  />
                  {ordersState.sortedOrders.length > 2 && <ViewMoreButton onPress={actions.onViewMore} title="Xem tat ca don hang" />}
                </View>
              )}

              {isLoggedIn && userType === "customer" ? (
                <View style={styles.section}>
                  <QuickBookingForm />
                </View>
              ) : isLoggedIn && userType === "dealer" ? (
                <View style={styles.section}>
                  <SectionHeader title="San pham noi bat" />
                  <View style={styles.servicesContainer}>
                    {homeContent.previewProducts.map((product: any) => (
                      <Item
                        key={product.id}
                        title={product.name}
                        description={product.description || "Xem chi tiet san pham"}
                        imageUri={getPrimaryCatalogProductImageUrl(product)}
                        onPress={() => actions.onProductPress(String(product.id))}
                      />
                    ))}
                  </View>
                  <ViewMoreButton onPress={actions.onViewMore} title="Xem them san pham" />
                </View>
              ) : !isLoggedIn ? (
                <>
                  <View style={styles.section}>
                    <SectionHeader title="Dich vu cua chung toi" />
                    <View style={styles.servicesContainer}>
                      {homeContent.previewServices.map((service: any) => (
                        <Item
                          key={service.id}
                          title={service.name}
                          description={service.description}
                          imageUri={service.image_url}
                          onPress={() => actions.onServicePress(String(service.id))}
                        />
                      ))}
                    </View>
                    <ViewMoreButton onPress={actions.onViewMore} title="Xem them dich vu" />
                  </View>

                  <View style={styles.section}>
                    <SectionHeader title="San pham noi bat" />
                    <View style={styles.servicesContainer}>
                      {homeContent.previewProducts.map((product: any) => (
                        <Item
                          key={product.id}
                          title={product.name}
                          description={product.description || "Xem chi tiet san pham"}
                          imageUri={getPrimaryCatalogProductImageUrl(product)}
                          onPress={() => actions.onProductPress(String(product.id))}
                        />
                      ))}
                    </View>
                    <ViewMoreButton onPress={actions.onViewMore} title="Xem them san pham" />
                  </View>

                  <View style={styles.section}>
                    <View style={styles.loginPromptCard}>
                      <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
                      <Text style={styles.loginPromptTitle}>Dang nhap de dat lich dich vu</Text>
                      <Text style={styles.loginPromptDescription}>
                        Dang nhap de dat lich dich vu, xem lich su don hang va quan ly thong tin xe cua ban
                      </Text>
                      <TouchableOpacity style={styles.loginPromptButton} onPress={actions.onLoginPress}>
                        <Text style={styles.loginPromptButtonText}>Dang nhap / Dang ky</Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.background.light} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : null}
            </>
          )}
        </View>
      </View>
    </Screen>
  );
}
