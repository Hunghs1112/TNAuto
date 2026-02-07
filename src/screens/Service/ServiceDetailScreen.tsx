// src/screens/Service/ServiceDetailScreen.tsx
import React, { useState, useRef, useCallback, useEffect as useReactEffect } from "react";
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
  
  // Fetch service details from API (rely on global refetch config)
  const serviceQuery = useGetServiceByIdQuery(serviceId);
  
  const service = serviceQuery.data?.data;
  
  // Prepare image with cache busting timestamp
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [imageRetry, setImageRetry] = useState(0);
  const imageUrl = service?.image_url 
    ? `${service.image_url}${service.image_url.includes('?') ? '&' : '?'}_t=${imageTimestamp}`
    : PLACEHOLDER_IMAGE;

  // When screen comes into focus, only update image timestamp to avoid extra refetch
  useFocusEffect(
    useCallback(() => {
      setImageTimestamp(Date.now());
    }, [])
  );

  // Force a second image reload shortly after first mount to avoid initial render/cache timing issues
  useReactEffect(() => {
    const t = setTimeout(() => setImageTimestamp(Date.now()), 50);
    return () => clearTimeout(t);
  }, [serviceId]);

  const handleImageError = useCallback(() => {
    setImageRetry(prev => prev + 1);
    setImageTimestamp(Date.now());
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (!serviceQuery.refetch) return;

    setRefreshing(true);
    try {
      await serviceQuery.refetch();
      setImageTimestamp(Date.now());
    } catch (error) {
      console.error('Error refreshing service:', error);
    } finally {
      setRefreshing(false);
    }
  }, [serviceQuery]);

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
                    navigation.navigate('Booking' as never, { serviceId: Number(service.id) } as never);
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

