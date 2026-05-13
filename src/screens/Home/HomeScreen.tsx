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
import { isManagerRole as isManagerUserRole } from "../../navigation/rolePolicy";
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

  const isManager = isManagerUserRole(storeUserType);

  if (isManager) {
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
        onGaragePress={() => navigation.navigate("GarageManagement")}
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
                <Text style={styles.loginPromptTitle}>Liên kết mã gara để sử dụng đầy đủ tính năng</Text>
                <Text style={styles.loginPromptDescription}>
                  Tài khoản của bạn chưa được gắn với mã gara nào. Hãy nhập mã gara để kết nối tài khoản, đồng bộ dữ liệu và bắt đầu sử dụng dịch vụ.
                </Text>
                <TouchableOpacity style={styles.loginPromptButton} onPress={actions.onGaragePress}>
                  <Text style={styles.loginPromptButtonText}>Nhập mã gara</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.background.light} />
                </TouchableOpacity>
              </View>
            </View>
          ) : isLoggedIn && userType === "employee" ? (
            <>
              <View style={styles.section}>
                <SectionHeader title="Việc mới tạo chưa giao ai" />
                <AvailableOrdersList
                  orders={ordersState.sortedAvailableOrders}
                  isLoading={ordersState.availableLoading}
                  onOrderPress={actions.onOrderPress}
                  onClaimPress={actions.onClaimOrder}
                  claimingOrderId={ordersState.claimingOrderId}
                  emptyMessage="Chưa có việc mới nào đang chờ nhận"
                />
              </View>

              <View style={styles.section}>
                <SectionHeader title="Việc đang đảm nhận" />
                <EmployeeOrdersList
                  orders={ordersState.sortedAssignedOrders}
                  isLoading={ordersState.assignedLoading}
                  onOrderPress={actions.onOrderPress}
                  emptyMessage="Chưa có việc nào đang đảm nhận"
                />
              </View>

              <View style={styles.section}>
                <SectionHeader title="Thông tin bảo hành" />
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
                  <SectionHeader title="Dịch vụ đang sử dụng" />
                  <OrdersList
                    orders={ordersState.displayedOrders}
                    isLoading={ordersState.ordersLoading}
                    userType={userType}
                    onOrderPress={actions.onOrderPress}
                    emptyMessage="Chưa có đơn hàng nào"
                  />
                  {ordersState.sortedOrders.length > 2 && <ViewMoreButton onPress={actions.onViewMore} title="Xem tất cả đơn hàng" />}
                </View>
              )}

              {isLoggedIn && userType === "customer" ? (
                <View style={styles.section}>
                  <QuickBookingForm />
                </View>
              ) : isLoggedIn && userType === "dealer" ? (
                <View style={styles.section}>
                  <SectionHeader title="Sản phẩm nổi bật" />
                  <View style={styles.servicesContainer}>
                    {homeContent.previewProducts.map((product: any) => (
                      <Item
                        key={product.id}
                        title={product.name}
                        description={product.description || "Xem chi tiết sản phẩm"}
                        imageUri={getPrimaryCatalogProductImageUrl(product)}
                        onPress={() => actions.onProductPress(String(product.id))}
                      />
                    ))}
                  </View>
                  <ViewMoreButton onPress={actions.onViewMore} title="Xem thêm sản phẩm" />
                </View>
              ) : !isLoggedIn ? (
                <>
                  <View style={styles.section}>
                    <SectionHeader title="Dịch vụ của chúng tôi" />
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
                    <ViewMoreButton onPress={actions.onViewMore} title="Xem thêm dịch vụ" />
                  </View>

                  <View style={styles.section}>
                    <SectionHeader title="Sản phẩm nổi bật" />
                    <View style={styles.servicesContainer}>
                      {homeContent.previewProducts.map((product: any) => (
                        <Item
                          key={product.id}
                          title={product.name}
                          description={product.description || "Xem chi tiết sản phẩm"}
                          imageUri={getPrimaryCatalogProductImageUrl(product)}
                          onPress={() => actions.onProductPress(String(product.id))}
                        />
                      ))}
                    </View>
                    <ViewMoreButton onPress={actions.onViewMore} title="Xem thêm sản phẩm" />
                  </View>

                  <View style={styles.section}>
                    <View style={styles.loginPromptCard}>
                      <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
                      <Text style={styles.loginPromptTitle}>Đăng nhập để đặt lịch dịch vụ</Text>
                      <Text style={styles.loginPromptDescription}>
                        Đăng nhập để đặt lịch dịch vụ, xem lịch sử đơn hàng và quản lý thông tin xe của bạn
                      </Text>
                      <TouchableOpacity style={styles.loginPromptButton} onPress={actions.onLoginPress}>
                        <Text style={styles.loginPromptButtonText}>Đăng nhập / Đăng ký</Text>
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
