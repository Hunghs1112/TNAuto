// src/screens/ProductDetail/ProductDetailScreen.tsx
import React, { useState, useMemo, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  Dimensions,
  TouchableOpacity,
  Modal,
  RefreshControl
} from "react-native";
import { Screen } from "../../components/layout";
import { Colors } from "../../constants/colors";
import ConfirmButton from "../../components/ConfirmButton";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useGetCategoriesQuery } from "../../services/categoryApi";
import { useGetProductByIdQuery, useGetProductImagesQuery, productApi } from "../../services/productApi";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { styles } from "./styles";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import ProductVideo from '../../components/ProductVideo/ProductVideo';
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";

type ProductDetailRouteProp = RouteProp<AppStackParamList, 'ProductDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.8;

// Placeholder image URL
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image';

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const dispatch = useAppDispatch();
  const { productId } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  
  // Fetch product details from API with refetch on mount
  const productQuery = useGetProductByIdQuery(productId, {
    refetchOnMountOrArgChange: true,
  });
  const productImagesQuery = useGetProductImagesQuery(productId, {
    refetchOnMountOrArgChange: true,
  });
  
  // Fetch categories to get category name
  const { data: categories = [] } = useGetCategoriesQuery();
  
  const product = productQuery.data;
  
  // Find category name by ID
  const categoryName = product?.category_id
    ? categories.find(cat => cat.id === product.category_id)?.name
    : undefined;

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Invalidate cache and refetch when screen is focused
      dispatch(productApi.util.invalidateTags([{ type: 'Product', id: productId.toString() }, 'Product', 'ProductImage']));
      productQuery.refetch();
      productImagesQuery.refetch();
      // Update image timestamp to force reload
      setImageTimestamp(Date.now());
    }, [productId, dispatch, productQuery, productImagesQuery])
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate product tags to clear cache first
      dispatch(productApi.util.invalidateTags([{ type: 'Product', id: productId.toString() }, 'Product', 'ProductImage']));
      // Wait a bit for cache invalidation to take effect
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
      // Refetch product data
      const [productResult, imagesResult] = await Promise.all([
        productQuery.refetch(),
        productImagesQuery.refetch(),
      ]);
      // Update image timestamp to force reload after refetch completes
      setImageTimestamp(Date.now());
    } catch (error) {
      console.error('Error refreshing product:', error);
    } finally {
      // Ensure refreshing is set to false
      setTimeout(() => setRefreshing(false), 100);
    }
  }, [productQuery, productImagesQuery, dispatch, productId]);

  // Prepare images array with cache busting - prioritize product images query, then product.images, then primary_image
  const images = useMemo(() => {
    let imageUrls: string[] = [];
    
    if (productImagesQuery.data && productImagesQuery.data.length > 0) {
      imageUrls = productImagesQuery.data.map(img => img.image_url);
    } else if (product?.images && product.images.length > 0) {
      imageUrls = product.images.map(img => img.image_url);
    } else if (product?.primary_image) {
      imageUrls = [product.primary_image];
    } else {
      return [PLACEHOLDER_IMAGE];
    }
    
    // Add cache busting timestamp to all image URLs
    return imageUrls.map(url => 
      url === PLACEHOLDER_IMAGE 
        ? url 
        : `${url}${url.includes('?') ? '&' : '?'}_t=${imageTimestamp}`
    );
  }, [productImagesQuery.data, product?.images, product?.primary_image, imageTimestamp]);

  const handleImageChange = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <Screen
      headerTitle="Chi tiết sản phẩm"
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      
      <QueryWrapper
        query={productQuery}
        errorMessage="Lỗi tải chi tiết sản phẩm"
        checkEmpty={() => !product}
        emptyMessage="Không tìm thấy sản phẩm"
        emptyIcon="cube-outline"
        loadingComponent={
          <View style={[styles.body, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
            <ScreenLoader />
          </View>
        }
      >
        {() => {
          if (!product) return null;
          
          return (
            <ScrollView 
              style={styles.whiteSection} 
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
            >
              <View style={styles.body}>
                {/* Image Carousel */}
                <TouchableOpacity 
                  style={styles.imageCarousel}
                  onPress={() => setSelectedImage(images[currentImageIndex])}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: images[currentImageIndex] }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  
                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <TouchableOpacity 
                        style={[styles.imageNav, styles.imageNavLeft]}
                        onPress={() => handleImageChange('left')}
                      >
                        <Ionicons name="chevron-back" size={24} color={Colors.background.light} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.imageNav, styles.imageNavRight]}
                        onPress={() => handleImageChange('right')}
                      >
                        <Ionicons name="chevron-forward" size={24} color={Colors.background.light} />
                      </TouchableOpacity>
                      
                      {/* Image Indicators */}
                      <View style={styles.imageIndicators}>
                        {images.map((_, index) => (
                          <View
                            key={index}
                            style={[
                              styles.indicator,
                              index === currentImageIndex && styles.indicatorActive
                            ]}
                          />
                        ))}
                      </View>
                    </>
                  )}
                </TouchableOpacity>

                {/* Product Info */}
                <View style={styles.infoSection}>
                  <Text style={styles.productName}>{product.name}</Text>

                  {/* Product Video */}
                  {product.video_url && (
                    <View style={styles.videoSection}>
                      <Text style={styles.sectionTitle}>Video sản phẩm</Text>
                      <ProductVideo videoUrl={product.video_url} />
                    </View>
                  )}

                  {/* Product Description */}
                  {product.description && (
                    <View style={styles.descriptionSection}>
                      <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                      <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>
                  )}

                  {/* Image Gallery Thumbnails */}
                  {images.length > 1 && (
                    <View style={styles.thumbnailSection}>
                      <Text style={styles.sectionTitle}>Hình ảnh ({images.length})</Text>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.thumbnailScroll}
                      >
                        {images.map((imageUrl, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              setCurrentImageIndex(index);
                              setSelectedImage(imageUrl);
                            }}
                            style={[
                              styles.thumbnail,
                              index === currentImageIndex && styles.thumbnailActive
                            ]}
                          >
                            <Image 
                              source={{ uri: imageUrl }}
                              style={styles.thumbnailImage}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Product Metadata */}
                  <View style={styles.metadataSection}>
                    <View style={styles.metadataRow}>
                      <Ionicons name="cube-outline" size={20} color={Colors.text.secondary} />
                      <Text style={styles.metadataText}>
                        Mã sản phẩm: #{product.id}
                      </Text>
                    </View>
                    
                    {categoryName && (
                      <View style={styles.metadataRow}>
                        <Ionicons name="grid-outline" size={20} color={Colors.text.secondary} />
                        <Text style={styles.metadataText}>
                          Danh mục: {categoryName}
                        </Text>
                      </View>
                    )}
                    
                    {images.length === 1 && images[0] === PLACEHOLDER_IMAGE && (
                      <View style={styles.noImageNotice}>
                        <Ionicons name="information-circle-outline" size={20} color={Colors.status.warning} />
                        <Text style={styles.noImageText}>
                          Sản phẩm chưa có hình ảnh
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Contact Button */}
                  <View style={styles.actionSection}>
                    <ConfirmButton
                      title="Liên hệ để đặt hàng"
                      onPress={() => {
                        // TODO: Implement contact functionality
                      }}
                      buttonColor={Colors.primary}
                      textColor={Colors.text.inverted}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
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

export default ProductDetailScreen;

