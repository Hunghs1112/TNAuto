// components/TextInput/SelectInput.tsx
import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput, Image, ActivityIndicator, Dimensions } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { borderRadius, borderPresets } from "../../design-system/borders";
import { getShadowStyle } from "../../design-system/shadows";
import { textStyles } from "../../design-system/typography";
import { useGetServiceCategoriesQuery, useGetServiceCategoryByIdQuery, ServiceCategory, Service } from "../../services/serviceCategoryApi";
import { formatSecondsToDaysHours } from "../../utils/dateHelpers";
import { API_BASE_URL } from "../../constants/config";

interface Option {
  id: number;
  name: string;
  estimated_time?: number; // giây
  description?: string;
  image_url?: string | null;
}

interface SelectInputProps {
  value?: string;
  placeholder?: string;
  label?: string;
  icon?: string;
  options: Option[];
  onSelect: (option: Option) => void;
  disabled?: boolean;
  style?: any;
  useCategories?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  value = "",
  placeholder = "Chọn",
  label,
  icon = "chevron-down-outline",
  options,
  onSelect,
  disabled = false,
  style,
  useCategories = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'services'>('categories');
  const selectedOption = options.find(opt => opt.name === value);

  // Fetch service categories
  const { data: categories, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useGetServiceCategoriesQuery(undefined, {
    skip: !showModal || !useCategories,
  });

  // Fetch services for selected category
  const { data: categoryDetail, isLoading: servicesLoading, error: servicesError } = useGetServiceCategoryByIdQuery(selectedCategoryId!, {
    skip: !selectedCategoryId || !useCategories || viewMode !== 'services',
  });

  // Determine if we should use categories mode
  const shouldUseCategories = useCategories && categories && Array.isArray(categories) && categories.length > 0 && !categoriesError;
  
  // Filter categories
  const filteredCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) {
      return [];
    }
    if (!searchQuery.trim()) {
      return categories;
    }
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered;
  }, [categories, searchQuery]);

  // Filter services
  const filteredServices = useMemo(() => {
    if (!categoryDetail?.services) return [];
    if (!searchQuery.trim()) return categoryDetail.services;
    return categoryDetail.services.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoryDetail, searchQuery]);

  // Filter options (fallback)
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter(option =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategoryId(category.id);
    setViewMode('services');
    setSearchQuery("");
  };

  const handleServiceSelect = (service: Service) => {
    onSelect({
      id: service.id,
      name: service.name,
      estimated_time: service.estimated_time,
      description: service.description || undefined,
      image_url: service.image_url || undefined,
    });
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSearchQuery("");
    setSelectedCategoryId(null);
    setViewMode('categories');
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategoryId(null);
    setSearchQuery("");
  };

  // Render Category Card
  const renderCategory = ({ item }: { item: ServiceCategory }) => {
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategorySelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryContent}>
          {item.image_url ? (
            <Image 
              source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${API_BASE_URL}${item.image_url}` }}
              style={styles.categoryImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.categoryImagePlaceholder}>
              <Ionicons name="grid-outline" size={32} color={Colors.primary} />
            </View>
          )}
          <View style={styles.categoryTextContainer}>
            <Text style={styles.categoryName}>{item.name}</Text>
            {item.service_count !== undefined && (
              <Text style={styles.categoryServiceCount}>
                {item.service_count} dịch vụ
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.text.secondary} />
        </View>
      </TouchableOpacity>
    );
  };

  // Render Service Card
  const renderService = ({ item }: { item: Service }) => {
    const isSelected = selectedOption?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.serviceCard, isSelected && styles.selectedCard]}
        onPress={() => handleServiceSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.serviceContent}>
          {item.image_url ? (
            <Image 
              source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${API_BASE_URL}${item.image_url}` }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.serviceImagePlaceholder}>
              <Ionicons name="construct-outline" size={32} color={Colors.primary} />
            </View>
          )}
          <View style={styles.serviceTextContainer}>
            <Text style={[styles.serviceName, isSelected && styles.selectedServiceName]}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={styles.serviceDescription} numberOfLines={3}>
                {item.description}
              </Text>
            )}
            {item.estimated_time && (
              <View style={styles.estimatedTimeRow}>
                <Ionicons name="time-outline" size={16} color={Colors.primary} />
                <Text style={styles.estimatedTimeText}>
                  {formatSecondsToDaysHours(item.estimated_time)}
                </Text>
              </View>
            )}
          </View>
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render Option Card (fallback)
  const renderOption = ({ item }: { item: Option }) => {
    const isSelected = selectedOption?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.serviceCard, isSelected && styles.selectedCard]}
        onPress={() => {
          onSelect(item);
          handleCloseModal();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.serviceContent}>
          {item.image_url ? (
            <Image 
              source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${API_BASE_URL}${item.image_url}` }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.serviceImagePlaceholder}>
              <Ionicons name="construct-outline" size={32} color={Colors.primary} />
            </View>
          )}
          <View style={styles.serviceTextContainer}>
            <Text style={[styles.serviceName, isSelected && styles.selectedServiceName]}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={styles.serviceDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            {item.estimated_time && (
              <View style={styles.estimatedTimeRow}>
                <Ionicons name="time-outline" size={14} color={Colors.primary} />
                <Text style={styles.estimatedTimeText}>
                  {formatSecondsToDaysHours(item.estimated_time)}
                </Text>
              </View>
            )}
          </View>
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={12} color={Colors.text.placeholder} />
          </View>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.inputContainer, disabled && styles.disabled]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.inputText,
          { color: value ? Colors.text.primary : Colors.text.placeholder }
        ]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={16} color={Colors.text.placeholder} />
      </TouchableOpacity>

      <Modal 
        visible={showModal} 
        animationType="slide" 
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalWrapper}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <View style={styles.modalContent}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBarRow}>
                {shouldUseCategories && viewMode === 'services' && (
                  <TouchableOpacity onPress={handleBackToCategories} style={styles.backButtonSimple}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                  </TouchableOpacity>
                )}
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search-outline" size={20} color={Colors.text.placeholder} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={shouldUseCategories 
                      ? (viewMode === 'categories' ? "Tìm kiếm danh mục..." : "Tìm kiếm dịch vụ...")
                      : "Tìm kiếm xe..."}
                    placeholderTextColor={Colors.text.placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                      <Ionicons name="close-circle" size={20} color={Colors.text.placeholder} />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity 
                  onPress={handleCloseModal}
                  style={styles.closeButtonSimple}
                >
                  <Ionicons name="close" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content List */}
            <View style={styles.listWrapper}>
              {shouldUseCategories ? (
                viewMode === 'categories' ? (
                  categoriesLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                      <Text style={styles.loadingText}>Đang tải danh mục...</Text>
                    </View>
                  ) : categoriesError ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="alert-circle-outline" size={48} color={Colors.status.error} />
                      <Text style={styles.emptyText}>Lỗi tải danh mục</Text>
                      <TouchableOpacity 
                        onPress={() => refetchCategories()} 
                        style={styles.retryButton}
                      >
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                      </TouchableOpacity>
                    </View>
                  ) : filteredCategories.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="grid-outline" size={48} color={Colors.text.placeholder} />
                      <Text style={styles.emptyText}>Không tìm thấy danh mục</Text>
                      <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredCategories}
                      keyExtractor={(item) => `category-${item.id}`}
                      renderItem={renderCategory}
                      style={styles.list}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator={true}
                      removeClippedSubviews={false}
                      initialNumToRender={15}
                      windowSize={10}
                      maxToRenderPerBatch={10}
                      updateCellsBatchingPeriod={50}
                      nestedScrollEnabled={true}
                    />
                  )
                ) : (
                  servicesLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                      <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
                    </View>
                  ) : servicesError ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="alert-circle-outline" size={48} color={Colors.status.error} />
                      <Text style={styles.emptyText}>Lỗi tải dịch vụ</Text>
                      <TouchableOpacity 
                        onPress={handleBackToCategories} 
                        style={styles.retryButton}
                      >
                        <Text style={styles.retryButtonText}>Quay lại</Text>
                      </TouchableOpacity>
                    </View>
                  ) : filteredServices.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="construct-outline" size={48} color={Colors.text.placeholder} />
                      <Text style={styles.emptyText}>Không tìm thấy dịch vụ</Text>
                      <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredServices}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={renderService}
                      style={styles.list}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator={true}
                    />
                  )
                )
              ) : (
                filteredOptions.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="construct-outline" size={48} color={Colors.text.placeholder} />
                    <Text style={styles.emptyText}>Không tìm thấy dịch vụ</Text>
                    <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredOptions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOption}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={true}
                  />
                )
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 2,
    marginBottom: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    maxWidth: 200,
    ...getShadowStyle('sm'),
  },
  iconContainer: {
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.xs / 2,
  },
  label: {
    ...textStyles.caption,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.placeholder,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: borderPresets.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: Colors.background.light,
  },
  disabled: {
    opacity: 0.6,
  },
  inputText: {
    flex: 1,
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.medium,
  },
  // Modal Styles
  modalWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    width: "100%",
    height: Dimensions.get('window').height * 0.9,
    maxHeight: Dimensions.get('window').height * 0.9,
    ...getShadowStyle('lg'),
    flexDirection: "column",
    overflow: "hidden",
  },
  modalHeader: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexShrink: 0,
  },
  modalHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexShrink: 0,
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButtonSimple: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
  },
  closeButtonSimple: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    ...textStyles.body,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.primary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  // List Wrapper
  listWrapper: {
    flex: 1,
    width: "100%",
  },
  // List Styles
  list: {
    flex: 1,
    width: "100%",
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    ...textStyles.body,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...textStyles.bodyLarge,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...textStyles.body,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.semibold,
    color: Colors.background.light,
  },
  // Category Card Styles
  categoryCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...getShadowStyle('sm'),
    width: "100%",
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    width: "100%",
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    backgroundColor: Colors.neutral[100],
  },
  categoryImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    backgroundColor: Colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    ...textStyles.bodyLarge,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  categoryServiceCount: {
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  // Service Card Styles
  serviceCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...getShadowStyle('sm'),
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primarySoft,
    ...getShadowStyle('md'),
  },
  serviceContent: {
    flexDirection: "row",
    padding: spacing.md,
    alignItems: "center",
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    backgroundColor: Colors.neutral[100],
  },
  serviceImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    backgroundColor: Colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  serviceName: {
    ...textStyles.bodyLarge,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  selectedServiceName: {
    color: Colors.primary,
  },
  serviceDescription: {
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
    marginTop: spacing.xs / 2,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  estimatedTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  estimatedTimeText: {
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
    fontSize: 13,
  },
  checkmarkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
});

export default SelectInput;
