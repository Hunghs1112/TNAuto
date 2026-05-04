import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLazyResolveGarageByCodeQuery } from '../../services/authApi';
import { useAppDispatch } from '../../redux/hooks/useAppDispatch';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import useCustomerGarageSelection from '../../hooks/useCustomerGarageSelection';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { saveAndSetActiveGarage, upsertSavedGarage } from '../../redux/slices/garageContextSlice';

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
  const dispatch = useAppDispatch();
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
  const lastRefreshedGarageCodeRef = useRef<string>('');

  const syncGarageToRedux = useCallback(
    (nextGarage: GarageItem) => {
      dispatch(
        saveAndSetActiveGarage({
          ...nextGarage,
          resolved: true,
        }),
      );
      dispatch(
        upsertSavedGarage({
          ...nextGarage,
          resolved: true,
        }),
      );
    },
    [dispatch],
  );

  const refreshGaragePreview = useCallback(
    async (garageCodeToResolve?: string | null) => {
      const normalizedGarageCode = (garageCodeToResolve || garageCode || currentGarage.garageCode || '').trim().toUpperCase();

      if (!normalizedGarageCode) {
        setResolvedGarage(null);
        return null;
      }

      if (lastRefreshedGarageCodeRef.current === normalizedGarageCode) {
        return resolvedGarage;
      }

      try {
        const garage = await resolveGarageByCode(normalizedGarageCode, true).unwrap();
        const nextGarage = {
          garageId: String(garage.id),
          garageCode: garage.code,
          garageName: garage.name,
          address: garage.address,
          avatarUrl: getGarageAvatarUri(garage),
          bannerUrl: getGarageBannerUri(garage),
          status: garage.status,
        };
        lastRefreshedGarageCodeRef.current = normalizedGarageCode;
        setResolvedGarage(nextGarage);
        syncGarageToRedux(nextGarage);
        return nextGarage;
      } catch {
        if (resolvedGarage?.garageCode) {
          return resolvedGarage;
        }
        setResolvedGarage(null);
        return null;
      }
    },
    [currentGarage.garageCode, garageCode, resolveGarageByCode, resolvedGarage, syncGarageToRedux],
  );

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
      await refreshGaragePreview(garageCode.trim());
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
      const refreshedGarage = await refreshGaragePreview(garage.garageCode);
      const success = await activateGarage(
        {
          garageId: refreshedGarage?.garageId || garage.garageId,
          garageCode: refreshedGarage?.garageCode || garage.garageCode,
          garageName: refreshedGarage?.garageName || garage.garageName,
          address: refreshedGarage?.address || garage.address,
          avatarUrl: refreshedGarage?.avatarUrl || getGarageAvatarUri(garage),
          bannerUrl: refreshedGarage?.bannerUrl || getGarageBannerUri(garage),
          status: refreshedGarage?.status || garage.status,
        },
        'saved_list',
      );
      if (success) closeScreen();
    },
    [activateGarage, closeScreen, refreshGaragePreview],
  );

  const confirmButtonTitle = useMemo(() => {
    if (!hasResolvedGarage) return 'Xác nhận mã gara';
    if (normalizedResolvedGarageCode === activeGarageCode && hasActiveGarageContext) return 'Đang dùng gara này';
    if (shouldAddWithoutSwitch) return 'Thêm và sử dụng';
    return 'Xác nhận và sử dụng';
  }, [activeGarageCode, hasActiveGarageContext, hasResolvedGarage, normalizedResolvedGarageCode, shouldAddWithoutSwitch]);

  const handlePrimaryAction = useCallback(async () => {
    if (!hasResolvedGarage) {
      await handleResolve();
      return;
    }

    if (normalizedResolvedGarageCode === activeGarageCode && hasActiveGarageContext) {
      closeScreen();
      return;
    }

    await handleConfirm();
  }, [activeGarageCode, closeScreen, hasActiveGarageContext, handleConfirm, handleResolve, hasResolvedGarage, normalizedResolvedGarageCode]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const codeToLoad = (currentGarage.garageCode || garageCode || '').trim().toUpperCase();
      if (!codeToLoad) {
        return () => {
          isActive = false;
        };
      }

      if (lastRefreshedGarageCodeRef.current !== codeToLoad) {
        Promise.resolve(refreshGaragePreview(codeToLoad)).catch(() => {
          if (isActive) {
            // ignore background/foreground race conditions
          }
        });
      }

      return () => {
        isActive = false;
      };
    }, [currentGarage.garageCode, garageCode, refreshGaragePreview]),
  );

  useEffect(() => {
    if (currentGarage.garageCode) {
      setGarageCode(currentGarage.garageCode.toUpperCase());
    }
  }, [currentGarage.garageCode]);

  return { canChangeGarage, savedGarages, activeGarageCode, isFetching, garageCode, setGarageCode, resolvedGarage, setResolvedGarage, hasResolvedGarage, confirmButtonTitle, handleResolve, handleConfirm, handleSelectSavedGarage, handlePrimaryAction, normalizedResolvedGarageCode, hasActiveGarageContext };
};
