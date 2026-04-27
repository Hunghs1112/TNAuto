import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLazyResolveGarageByCodeQuery } from '../../services/authApi';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import useCustomerGarageSelection from '../../hooks/useCustomerGarageSelection';
import { AppStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export type GarageItem = {
  garageId: string;
  garageCode: string;
  garageName: string;
  address?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  status?: string | null;
};

const getGarageAvatarUri = (garage: { avatar_url?: string | null; avatarUrl?: string | null }) =>
  garage.avatar_url || garage.avatarUrl || null;
const getGarageBannerUri = (garage: { banner_url?: string | null; bannerUrl?: string | null }) =>
  garage.banner_url || garage.bannerUrl || null;

export const useSelectGarageScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const userType = useAppSelector((state) => state.auth.userType);
  const currentGarage = useAppSelector((state) => state.garageContext);
  const { addGarage, activateGarage, currentGarageCode: activeGarageCode, isCustomerAccount } = useCustomerGarageSelection();
  const savedGarages = currentGarage.savedGarages || [];
  const hasActiveGarageContext = Boolean(activeGarageCode && currentGarage.resolved);
  const [garageCode, setGarageCode] = useState(currentGarage.garageCode || '');
  const [resolvedGarage, setResolvedGarage] = useState<GarageItem | null>(
    currentGarage.resolved && currentGarage.garageCode
      ? {
          garageId: currentGarage.garageId,
          garageCode: currentGarage.garageCode,
          garageName: currentGarage.garageName,
          address: currentGarage.address,
          avatarUrl: getGarageAvatarUri(currentGarage),
          bannerUrl: getGarageBannerUri(currentGarage),
          status: currentGarage.status,
        }
      : null,
  );
  const [resolveGarageByCode, { isFetching }] = useLazyResolveGarageByCodeQuery();

  const canChangeGarage = !isLoggedIn || userType === 'customer' || userType === null;
  const hasResolvedGarage = useMemo(() => Boolean(resolvedGarage?.garageCode), [resolvedGarage]);
  const normalizedResolvedGarageCode = useMemo(() => resolvedGarage?.garageCode?.trim().toUpperCase() || '', [resolvedGarage?.garageCode]);
  const shouldAddWithoutSwitch = useMemo(
    () => Boolean(isCustomerAccount && hasActiveGarageContext && activeGarageCode && normalizedResolvedGarageCode && normalizedResolvedGarageCode !== activeGarageCode),
    [activeGarageCode, hasActiveGarageContext, isCustomerAccount, normalizedResolvedGarageCode],
  );

  const closeScreen = useCallback(() => {
    if (navigation.canGoBack()) return navigation.goBack();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
  }, [navigation]);

  const handleResolve = async () => {
    if (!garageCode.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập mã gara.');
    try {
      const garage = await resolveGarageByCode(garageCode.trim()).unwrap();
      setResolvedGarage({
        garageId: garage.id,
        garageCode: garage.code,
        garageName: garage.name,
        address: garage.address,
        avatarUrl: getGarageAvatarUri(garage),
        bannerUrl: getGarageBannerUri(garage),
        status: garage.status,
      });
    } catch (error: any) {
      Alert.alert('Không tìm thấy gara', error?.data?.message || 'Mã gara không hợp lệ hoặc đã ngừng hoạt động.');
    }
  };

  const handleConfirm = async () => {
    if (!resolvedGarage) return Alert.alert('Lỗi', 'Vui lòng xác nhận gara trước khi tiếp tục.');
    if (normalizedResolvedGarageCode === activeGarageCode) return closeScreen();

    const success = await addGarage(
      {
        id: resolvedGarage.garageId,
        code: resolvedGarage.garageCode,
        name: resolvedGarage.garageName,
        address: resolvedGarage.address,
        avatar_url: resolvedGarage.avatarUrl,
        banner_url: resolvedGarage.bannerUrl,
        status: resolvedGarage.status,
      },
      { activate: !shouldAddWithoutSwitch, source: 'manual' },
    );

    if (!success) return;
    if (shouldAddWithoutSwitch) {
      Alert.alert('Đã thêm gara', 'Gara đã được thêm vào danh sách. Khi cần, bạn có thể chọn gara này để sử dụng.', [{ text: 'OK', onPress: closeScreen }]);
      return;
    }

    closeScreen();
  };

  const handleSelectSavedGarage = useCallback(
    async (garage: any) => {
      const success = await activateGarage(
        {
          garageId: garage.garageId,
          garageCode: garage.garageCode,
          garageName: garage.garageName,
          address: garage.address,
          avatarUrl: getGarageAvatarUri(garage),
          bannerUrl: getGarageBannerUri(garage),
          status: garage.status,
        },
        'saved_list',
      );
      if (success) closeScreen();
    },
    [activateGarage, closeScreen],
  );

  const confirmButtonTitle = useMemo(() => {
    if (!hasResolvedGarage) return 'Tiếp tục';
    if (normalizedResolvedGarageCode === activeGarageCode && hasActiveGarageContext) return 'Đang dùng gara này';
    if (shouldAddWithoutSwitch) return 'Thêm gara này';
    return 'Dùng gara này';
  }, [activeGarageCode, hasActiveGarageContext, hasResolvedGarage, normalizedResolvedGarageCode, shouldAddWithoutSwitch]);

  return { canChangeGarage, savedGarages, activeGarageCode, isFetching, garageCode, setGarageCode, resolvedGarage, setResolvedGarage, hasResolvedGarage, confirmButtonTitle, handleResolve, handleConfirm, handleSelectSavedGarage, normalizedResolvedGarageCode, hasActiveGarageContext };
};
