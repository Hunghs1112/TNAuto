// src/screens/Service/ServiceDetailScreen.tsx
import React, { useState, useCallback, useEffect as useReactEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from "react-native";
import { Screen } from "../../components/layout";
import { Colors } from "../../constants/colors";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useGetServiceByIdQuery } from "../../services/serviceApi";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { styles } from "./styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import ConfirmButton from "../../components/ConfirmButton";
import { formatSecondsToDaysHours, secondsToMonths } from "../../utils/dateHelpers";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { selectGarageCode, selectGarageName } from "../../redux/selectors";
import GarageBadge from "../../components/GarageBadge";

type ServiceDetailRouteProp = RouteProp<AppStackParamList, "ServiceDetail">;
type ServiceDetailNavigationProp = NativeStackNavigationProp<AppStackParamList, "ServiceDetail">;

// Placeholder image URL
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x400/cccccc/666666?text=No+Image";

const ServiceDetailScreen = () => {
  const route = useRoute<ServiceDetailRouteProp>();
  const navigation = useNavigation<ServiceDetailNavigationProp>();
  const { serviceId } = route.params;
  const userType = useAppSelector((s) => s.auth.userType);
  const currentGarageCode = useAppSelector(selectGarageCode);
  const currentGarageName = useAppSelector(selectGarageName);
  const isDealer = (userType === "dealer" || userType === "garage_manager" || userType === "garage_admin");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch service details from API (rely on global refetch config)
  const serviceQuery = useGetServiceByIdQuery({ id: serviceId, garageCode: currentGarageCode }, { skip: isDealer });

  const service = serviceQuery.data?.data;

  const [imageRetry, setImageRetry] = useState(0);
  const imageUrl = service?.image_url ? service.image_url : PLACEHOLDER_IMAGE;

  const handleImageError = useCallback(() => {
    setImageRetry((prev) => prev + 1);
  }, []);

  // Force a second image reload shortly after first mount to avoid initial render/timing issues
  useReactEffect(() => {
    const t = setTimeout(() => setImageRetry((prev) => prev + 1), 50);
    return () => clearTimeout(t);
  }, [serviceId]);

  useReactEffect(() => {
    if (isDealer) {
      // Dealer không được phép đặt lịch dịch vụ.
      navigation.replace("Category");
    }
  }, [isDealer, navigation]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (!serviceQuery.refetch) return;

    setRefreshing(true);
    try {
      await serviceQuery.refetch();
      setImageRetry((prev) => prev + 1);
    } catch (error) {
      console.error("Error refreshing service:", error);
    } finally {
      setRefreshing(false);
    }
  }, [serviceQuery]);

  if (isDealer) {
    return null;
  }

  return (
    <Screen headerTitle="Chi tiết dịch vụ" showBackButton safeAreaTopColor={Colors.primary} statusBarStyle="light-content">
      <QueryWrapper
        query={serviceQuery}
        errorMessage="Lỗi tải chi tiết dịch vụ"
        checkEmpty={(data: any) => !data?.data}
        emptyMessage="Không tìm thấy dịch vụ"
        emptyIcon="construct-outline"
        loadingComponent={
          <View style={[styles.body, { justifyContent: "center", alignItems: "center", flex: 1 }]}>
            <ScreenLoader />
          </View>
        }
        children={(response: any) => {
          const serviceDetail = response?.data;
          if (!serviceDetail) return null;

          return (
            <View style={styles.container}>
              <ScrollView
                style={styles.whiteSection}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
              >
                <View style={styles.body}>
                  {/* Image */}
                  <View style={styles.imageContainer}>
                    <TouchableOpacity style={styles.imageCarousel} onPress={() => setSelectedImage(imageUrl)} activeOpacity={0.9}>
                      <Image
                        key={`${imageUrl}::${imageRetry}`}
                        source={{ uri: imageUrl }}
                        style={styles.serviceImage}
                        resizeMode="contain"
                        onError={handleImageError}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Service Info */}
                  <View style={styles.infoSection}>
                    <Text style={styles.serviceName}>{serviceDetail.name}</Text>
                    {!isDealer && <GarageBadge garageName={currentGarageName} />}

                    {/* Service Description */}
                    {serviceDetail.description && (
                      <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>Mô tả dịch vụ</Text>
                        <Text style={styles.contentText}>{serviceDetail.description}</Text>
                      </View>
                    )}

                    {/* Service Metadata */}
                    <View style={styles.metadataSection}>
                      {serviceDetail.estimated_time && (
                        <View style={styles.metadataRow}>
                          <Ionicons name="time-outline" size={20} color={Colors.text.secondary} />
                          <Text style={styles.metadataText}>
                            Thời gian ước tính: {formatSecondsToDaysHours(Number(serviceDetail.estimated_time))}
                          </Text>
                        </View>
                      )}

                      {serviceDetail.warranty_period && (
                        <View style={styles.metadataRow}>
                          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.text.secondary} />
                          <Text style={styles.metadataText}>Thời gian bảo hành: {secondsToMonths(serviceDetail.warranty_period)} tháng</Text>
                        </View>
                      )}

                      {imageUrl === PLACEHOLDER_IMAGE && (
                        <View style={styles.noImageNotice}>
                          <Ionicons name="information-circle-outline" size={20} color={Colors.status.warning} />
                          <Text style={styles.noImageText}>Dịch vụ chưa có hình ảnh</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Nút Đặt lịch dịch vụ - Cố định ở đáy */}
              <View style={styles.actionSectionFixed}>
                <ConfirmButton
                  title="Đặt lịch dịch vụ"
                  onPress={() => {
                    navigation.navigate("Booking", { serviceId: Number(serviceDetail.id) });
                  }}
                  buttonColor={Colors.primary}
                  textColor={Colors.text.inverted}
                />
              </View>
            </View>
          );
        }}
      />

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-outline" size={30} color={Colors.background.light} />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />}
        </View>
      </Modal>
    </Screen>
  );
};

export default ServiceDetailScreen;

