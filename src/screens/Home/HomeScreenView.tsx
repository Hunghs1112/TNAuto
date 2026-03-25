import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Screen from "../../components/layout/Screen/Screen";
import Item from "../../components/Item";
import { Colors } from "../../constants/colors";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { getPrimaryCatalogProductImageUrl } from "../../utils/catalog";
import { styles } from "./styles";
import UserHeader from "./UserHeader";
import VehicleInfoCard from "./VehicleInfoCard";
import ServiceMenu from "./ServiceMenu";
import SectionHeader from "./SectionHeader";
import QuickBookingForm from "./QuickBookingForm";
import OrdersList from "./components/OrdersList";
import AvailableOrdersList from "./components/AvailableOrdersList";
import EmployeeOrdersList from "./components/EmployeeOrdersList";
import WarrantyInfo from "./components/WarrantyInfo";
import ViewMoreButton from "./ViewMoreButton";

export type HomeScreenViewProps = {
  navbarHeight: number;
  actualRefreshing: boolean;
  onRefresh: () => void;

  isLoggedIn: boolean;
  userType: any;
  userName: string;
  unreadCount?: number;

  userId: string;
  userPhone: string;
  services: any;
  homePreviewServices?: any[];
  homePreviewProducts?: any[];

  displayedOrders: any[];
  sortedOrders: any[];
  ordersLoading: boolean;

  sortedAvailableOrders: any[];
  availableLoading: boolean;
  claimingOrderId?: string | null;

  sortedAssignedOrders: any[];
  assignedLoading: boolean;

  onNotificationPress: () => void;
  onOrderPress: (id: string) => void;
  onClaimOrder: (id: string) => void;
  onViewMore: () => void;
  onLoginPress: () => void;
};

const HomeScreenView = ({
  isLoggedIn,
  userType,
  userName,
  unreadCount,
  userId,
  userPhone,
  services,
  homePreviewServices = [],
  homePreviewProducts = [],
  displayedOrders,
  sortedOrders,
  ordersLoading,
  sortedAvailableOrders,
  availableLoading,
  claimingOrderId,
  sortedAssignedOrders,
  assignedLoading,
  onNotificationPress,
  onOrderPress,
  onClaimOrder,
  onViewMore,
  onLoginPress,
}: HomeScreenViewProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

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
          <UserHeader
            userName={isLoggedIn ? userName : "Khách"}
            notificationCount={isLoggedIn ? unreadCount : undefined}
            onNotificationPress={isLoggedIn ? onNotificationPress : undefined}
            isLoggedIn={isLoggedIn}
          />
          <View style={styles.serviceMenuOverlay}>
            <ServiceMenu />
          </View>
        </View>

        <View style={styles.bottomSheet}>
          {isLoggedIn && userType === "employee" ? (
            <>
              <View style={styles.section}>
                <SectionHeader title="Việc mới tạo chưa giao ai" />
                <AvailableOrdersList
                  orders={sortedAvailableOrders as any}
                  isLoading={availableLoading}
                  services={services}
                  onOrderPress={onOrderPress}
                  onClaimPress={onClaimOrder}
                  claimingOrderId={claimingOrderId}
                  emptyMessage="Chưa có việc mới nào đang chờ nhận"
                />
              </View>

              <View style={styles.section}>
                <SectionHeader title="Việc đang đảm nhận" />
                <EmployeeOrdersList
                  orders={sortedAssignedOrders as any}
                  isLoading={assignedLoading}
                  services={services}
                  onOrderPress={onOrderPress}
                  emptyMessage="Chưa có việc nào đang đảm nhận"
                />
              </View>

              <View style={styles.section}>
                <SectionHeader title="Thông tin bảo hành" />
                <WarrantyInfo
                  orders={sortedAssignedOrders as any}
                  onWarrantyPress={(orderId: string) => {
                    onOrderPress(orderId);
                  }}
                />
              </View>
            </>
          ) : (
            <>
              {isLoggedIn && userType === "customer" && (
                <View style={styles.section}>
                  <VehicleInfoCard userId={userId} userPhone={userPhone} />
                </View>
              )}

              {isLoggedIn && userType === "customer" && (
                <View style={styles.section}>
                  <SectionHeader title="Dịch vụ đang sử dụng" />
                  <OrdersList
                    orders={displayedOrders as any}
                    isLoading={ordersLoading}
                    services={services}
                    userType={userType}
                    onOrderPress={onOrderPress}
                    emptyMessage="Chưa có đơn hàng nào"
                  />
                  {sortedOrders.length > 2 && <ViewMoreButton onPress={onViewMore} title="Xem tất cả đơn hàng" />}
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
                    {homePreviewProducts.map((product: any) => {
                      return (
                        <Item
                          key={product.id}
                          title={product.name}
                          description={product.description || "Xem chi tiết sản phẩm"}
                          imageUri={getPrimaryCatalogProductImageUrl(product)}
                          onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
                        />
                      );
                    })}
                  </View>
                  <ViewMoreButton
                    onPress={() => navigation.navigate("Category" as any)}
                    title="Xem thêm sản phẩm"
                  />
                </View>
              ) : !isLoggedIn ? (
                <>
                  <View style={styles.section}>
                    <SectionHeader title="Dịch vụ của chúng tôi" />
                    <View style={styles.servicesContainer}>
                      {homePreviewServices.map((service: any) => (
                        <Item
                          key={service.id}
                          title={service.name}
                          description={service.description}
                          imageUri={service.image_url}
                          onPress={() => navigation.navigate("ServiceDetail", { serviceId: service.id })}
                        />
                      ))}
                    </View>
                    <ViewMoreButton
                      onPress={() => navigation.navigate("ServiceCategory" as any)}
                      title="Xem thêm dịch vụ"
                    />
                  </View>

                  <View style={styles.section}>
                    <SectionHeader title="Sản phẩm nổi bật" />
                    <View style={styles.servicesContainer}>
                      {homePreviewProducts.map((product: any) => {
                        return (
                          <Item
                            key={product.id}
                            title={product.name}
                            description={product.description || "Xem chi tiết sản phẩm"}
                            imageUri={getPrimaryCatalogProductImageUrl(product)}
                            onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
                          />
                        );
                      })}
                    </View>
                    <ViewMoreButton
                      onPress={() => navigation.navigate("Category" as any)}
                      title="Xem thêm sản phẩm"
                    />
                  </View>

                  <View style={styles.section}>
                    <View style={styles.loginPromptCard}>
                      <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
                      <Text style={styles.loginPromptTitle}>Đăng nhập để đặt lịch dịch vụ</Text>
                      <Text style={styles.loginPromptDescription}>
                        Đăng nhập để đặt lịch dịch vụ, xem lịch sử đơn hàng và quản lý thông tin xe của bạn
                      </Text>
                      <TouchableOpacity style={styles.loginPromptButton} onPress={onLoginPress}>
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
};

export default React.memo(HomeScreenView);
