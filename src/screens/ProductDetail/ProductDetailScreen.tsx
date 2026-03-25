// src/screens/ProductDetail/ProductDetailScreen.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import ConfirmButton from "../../components/ConfirmButton";
import { useRoute, RouteProp } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useGetCategoriesQuery } from "../../services/categoryApi";
import { useGetProductByIdQuery, useGetProductImagesQuery } from "../../services/productApi";
import { useGetDealerProductByIdQuery, useGetDealerProductImagesQuery } from "../../services/dealerProductApi";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { styles } from "./styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import ProductVideo from "../../components/ProductVideo/ProductVideo";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { getCatalogProductImageUrls } from "../../utils/catalog";

type ProductDetailRouteProp = RouteProp<AppStackParamList, "ProductDetail">;

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x400/cccccc/666666?text=No+Image";

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;
  const userType = useAppSelector((state) => state.auth.userType);
  const isDealer = userType === "dealer";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null as string | null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageRetry, setImageRetry] = useState(0);

  const productQuery = useGetProductByIdQuery(productId, { skip: isDealer });
  const productImagesQuery = useGetProductImagesQuery(productId, { skip: isDealer });
  const dealerProductQuery = useGetDealerProductByIdQuery(productId, { skip: !isDealer });
  const dealerProductImagesQuery = useGetDealerProductImagesQuery(productId, { skip: !isDealer });
  const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip: isDealer });

  const activeProductQuery = isDealer ? dealerProductQuery : productQuery;
  const activeProductImagesQuery = isDealer ? dealerProductImagesQuery : productImagesQuery;
  const product: any = activeProductQuery.data;

  const categoryName = isDealer
    ? product?.category_name || undefined
    : product?.category_id
      ? categories.find((cat) => cat.id === product.category_id)?.name
      : undefined;

  const handleImageError = useCallback(() => {
    setImageRetry((prev) => prev + 1);
  }, []);

  const handleRefresh = useCallback(async () => {
    const refetchFns = [activeProductQuery.refetch, activeProductImagesQuery.refetch].filter(
      (refetch) => typeof refetch === "function",
    ) as Array<() => Promise<any>>;

    if (refetchFns.length === 0) {
      return;
    }

    setRefreshing(true);
    try {
      await Promise.all(refetchFns.map((refetch) => refetch()));
      setImageRetry((prev) => prev + 1);
    } catch (error) {
      console.error("Error refreshing product:", error);
    } finally {
      setRefreshing(false);
    }
  }, [activeProductImagesQuery.refetch, activeProductQuery.refetch]);

  const images = useMemo(() => {
    const imageUrls = getCatalogProductImageUrls(product, activeProductImagesQuery.data as any);
    return imageUrls.length > 0 ? imageUrls : [PLACEHOLDER_IMAGE];
  }, [activeProductImagesQuery.data, product]);

  useEffect(() => {
    if (currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [currentImageIndex, images.length]);

  const handleImageChange = (direction: "left" | "right") => {
    if (direction === "left") {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <Screen headerTitle="Chi tiết sản phẩm" showBackButton safeAreaTopColor={Colors.primary} statusBarStyle="light-content">
      <QueryWrapper
        query={activeProductQuery as any}
        errorMessage="Lỗi tải chi tiết sản phẩm"
        checkEmpty={() => !product}
        emptyMessage="Không tìm thấy sản phẩm"
        emptyIcon="cube-outline"
        loadingComponent={
          <View style={[styles.body, { justifyContent: "center", alignItems: "center", flex: 1 }]}>
            <ScreenLoader />
          </View>
        }
        children={() => {
          if (!product) return null;

          return (
            <ScrollView
              style={styles.whiteSection}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
              <View style={styles.body}>
                <TouchableOpacity
                  style={styles.imageCarousel}
                  onPress={() => setSelectedImage(images[currentImageIndex])}
                  activeOpacity={0.9}
                >
                  <Image
                    key={`${images[currentImageIndex]}::${imageRetry}`}
                    source={{ uri: images[currentImageIndex] }}
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={handleImageError}
                  />

                  {images.length > 1 && (
                    <>
                      <TouchableOpacity style={[styles.imageNav, styles.imageNavLeft]} onPress={() => handleImageChange("left")}>
                        <Ionicons name="chevron-back" size={24} color={Colors.background.light} />
                      </TouchableOpacity>

                      <TouchableOpacity style={[styles.imageNav, styles.imageNavRight]} onPress={() => handleImageChange("right")}>
                        <Ionicons name="chevron-forward" size={24} color={Colors.background.light} />
                      </TouchableOpacity>

                      <View style={styles.imageIndicators}>
                        {images.map((_, index) => (
                          <View key={index} style={[styles.indicator, index === currentImageIndex && styles.indicatorActive]} />
                        ))}
                      </View>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.infoSection}>
                  <Text style={styles.productName}>{product.name}</Text>

                  {images.length > 1 && (
                    <View style={styles.thumbnailSection}>
                      <Text style={styles.sectionTitle}>Hình ảnh ({images.length})</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
                        {images.map((imageUrl, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              setCurrentImageIndex(index);
                              setSelectedImage(imageUrl);
                            }}
                            style={[styles.thumbnail, index === currentImageIndex && styles.thumbnailActive]}
                          >
                            <Image
                              key={`${imageUrl}::${imageRetry}`}
                              source={{ uri: imageUrl }}
                              style={styles.thumbnailImage}
                              resizeMode="cover"
                              onError={handleImageError}
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {product.video_url && (
                    <View style={styles.videoSection}>
                      <Text style={styles.sectionTitle}>Video sản phẩm</Text>
                      <ProductVideo videoUrl={product.video_url} />
                    </View>
                  )}

                  {product.description && (
                    <View style={styles.descriptionSection}>
                      <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                      <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>
                  )}

                  <View style={styles.metadataSection}>
                    <View style={styles.metadataRow}>
                      <Ionicons name="cube-outline" size={20} color={Colors.text.secondary} />
                      <Text style={styles.metadataText}>Mã sản phẩm: #{product.id}</Text>
                    </View>

                    {categoryName && (
                      <View style={styles.metadataRow}>
                        <Ionicons name="grid-outline" size={20} color={Colors.text.secondary} />
                        <Text style={styles.metadataText}>Danh mục: {categoryName}</Text>
                      </View>
                    )}

                    {images.length === 1 && images[0] === PLACEHOLDER_IMAGE && (
                      <View style={styles.noImageNotice}>
                        <Ionicons name="information-circle-outline" size={20} color={Colors.status.warning} />
                        <Text style={styles.noImageText}>Sản phẩm chưa có hình ảnh</Text>
                      </View>
                    )}
                  </View>

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
      />

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

export default ProductDetailScreen;
