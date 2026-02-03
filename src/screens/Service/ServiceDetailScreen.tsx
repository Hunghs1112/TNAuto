// src/screens/Service/ServiceDetailScreen.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  Dimensions,
  TouchableOpacity,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl
} from "react-native";
import { Screen } from "../../components/layout";
import { Colors } from "../../constants/colors";
import { useRoute, RouteProp, useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useGetServiceByIdQuery, serviceApi } from "../../services/serviceApi";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { styles } from "./styles";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import ConfirmButton from "../../components/ConfirmButton";
import { formatSecondsToDaysHours, secondsToMonths } from "../../utils/dateHelpers";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";

type ServiceDetailRouteProp = RouteProp<AppStackParamList, 'ServiceDetail'>;
type ServiceDetailNavigationProp = NativeStackNavigationProp<AppStackParamList, 'ServiceDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Placeholder image URL
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image';

const ServiceDetailScreen = () => {
  const route = useRoute<ServiceDetailRouteProp>();
  const navigation = useNavigation<ServiceDetailNavigationProp>();
  const dispatch = useAppDispatch();
  const { serviceId } = route.params;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch service details from API with refetch on mount
  const serviceQuery = useGetServiceByIdQuery(serviceId, {
    refetchOnMountOrArgChange: true, // Always refetch when component mounts
  });
  
  const service = serviceQuery.data?.data;
  
  // Prepare image with cache busting timestamp
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const imageUrl = service?.image_url 
    ? `${service.image_url}${service.image_url.includes('?') ? '&' : '?'}_t=${imageTimestamp}`
    : PLACEHOLDER_IMAGE;

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Invalidate cache and refetch when screen is focused
      dispatch(serviceApi.util.invalidateTags([{ type: 'Service', id: serviceId.toString() }, 'Service']));
      serviceQuery.refetch();
      // Update image timestamp to force reload
      setImageTimestamp(Date.now());
    }, [serviceId, dispatch, serviceQuery])
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate service tags to clear cache first
      dispatch(serviceApi.util.invalidateTags([{ type: 'Service', id: serviceId.toString() }, 'Service']));
      // Wait a bit for cache invalidation to take effect
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
      // Refetch service data
      await serviceQuery.refetch();
      // Update image timestamp to force reload after refetch completes
      setImageTimestamp(Date.now());
    } catch (error) {
      console.error('Error refreshing service:', error);
    } finally {
      // Ensure refreshing is set to false
      setTimeout(() => setRefreshing(false), 100);
    }
  }, [serviceQuery, dispatch, serviceId]);

  return (
    <Screen
      headerTitle="Chi tiết dịch vụ"
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      
      <QueryWrapper
        query={serviceQuery}
        errorMessage="Lỗi tải chi tiết dịch vụ"
        checkEmpty={(data: any) => !data?.data}
        emptyMessage="Không tìm thấy dịch vụ"
        emptyIcon="construct-outline"
        loadingComponent={
          <View style={[styles.body, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
            <ScreenLoader />
          </View>
        }
      >
        {(response: any) => {
          const service = response?.data;
          if (!service) return null;
          
          return (
            <View style={styles.container}>
              <ScrollView 
                style={styles.whiteSection} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
              >
                <View style={styles.body}>
                  {/* Image */}
                  <View style={styles.imageContainer}>
                    <TouchableOpacity
                      style={styles.imageCarousel}
                      onPress={() => setSelectedImage(imageUrl)}
                      activeOpacity={0.9}
                    >
                      <Image 
                        source={{ uri: imageUrl }}
                        style={styles.serviceImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Service Info */}
                  <View style={styles.infoSection}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    
                    {/* Service Description */}
                    {service.description && (
                      <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>Mô tả dịch vụ</Text>
                        <Text style={styles.contentText}>{service.description}</Text>
                      </View>
                    )}

                    {/* Service Metadata */}
                    <View style={styles.metadataSection}>
                      {service.estimated_time && (
                        <View style={styles.metadataRow}>
                          <Ionicons name="time-outline" size={20} color={Colors.text.secondary} />
                          <Text style={styles.metadataText}>
                            Thời gian ước tính: {formatSecondsToDaysHours(Number(service.estimated_time))}
                          </Text>
                        </View>
                      )}
                      
                      {service.warranty_period && (
                        <View style={styles.metadataRow}>
                          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.text.secondary} />
                          <Text style={styles.metadataText}>
                            Thời gian bảo hành: {secondsToMonths(service.warranty_period)} tháng
                          </Text>
                        </View>
                      )}
                      
                      {imageUrl === PLACEHOLDER_IMAGE && (
                        <View style={styles.noImageNotice}>
                          <Ionicons name="information-circle-outline" size={20} color={Colors.status.warning} />
                          <Text style={styles.noImageText}>
                            Dịch vụ chưa có hình ảnh
                          </Text>
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
                    navigation.navigate('BookingTab' as never, { serviceId: Number(service.id) } as never);
                  }}
                  buttonColor={Colors.primary}
                  textColor={Colors.text.inverted}
                />
              </View>
            </View>
          );
        }}
      </QueryWrapper>

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close-outline" size={30} color={Colors.background.light} />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </Screen>
  );
};

export default ServiceDetailScreen;

