import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import Screen from '../../components/layout/Screen/Screen';
import { FormContainer } from '../../components/layout/FormContainer';
import TextInputComponent from '../../components/TextInput/TextInput';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useLazyResolveGarageByCodeQuery } from '../../services/authApi';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import useCustomerGarageSelection from '../../hooks/useCustomerGarageSelection';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const SelectGarageScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const userType = useAppSelector((state) => state.auth.userType);
  const currentGarage = useAppSelector((state) => state.garageContext);
  const { addGarage, activateGarage, currentGarageCode: activeGarageCode, isCustomerAccount } = useCustomerGarageSelection();
  const savedGarages = currentGarage.savedGarages || [];
  const hasActiveGarageContext = Boolean(activeGarageCode && currentGarage.resolved);
  const [garageCode, setGarageCode] = useState(currentGarage.garageCode || '');
  const [resolvedGarage, setResolvedGarage] = useState(
    currentGarage.resolved && currentGarage.garageCode
      ? {
          id: currentGarage.garageId,
          code: currentGarage.garageCode,
          name: currentGarage.garageName,
          address: currentGarage.address,
          avatar_url: currentGarage.avatarUrl,
          status: currentGarage.status,
        }
      : null,
  );
  const [resolveGarageByCode, { isFetching }] = useLazyResolveGarageByCodeQuery();

  const canChangeGarage = !isLoggedIn || userType === 'customer' || userType === null;
  const hasResolvedGarage = useMemo(() => Boolean(resolvedGarage?.code), [resolvedGarage]);
  const normalizedResolvedGarageCode = useMemo(
    () => resolvedGarage?.code?.trim().toUpperCase() || '',
    [resolvedGarage?.code],
  );
  const shouldAddWithoutSwitch = useMemo(
    () => Boolean(
      isCustomerAccount &&
      hasActiveGarageContext &&
      activeGarageCode &&
      normalizedResolvedGarageCode &&
      normalizedResolvedGarageCode !== activeGarageCode,
    ),
    [activeGarageCode, hasActiveGarageContext, isCustomerAccount, normalizedResolvedGarageCode],
  );

  const closeScreen = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  }, [navigation]);

  const handleResolve = async () => {
    if (!garageCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã gara.');
      return;
    }

    console.log('[GarageSelect] resolve start', {
      inputGarageCode: garageCode.trim(),
      activeGarageCode,
      currentResolved: currentGarage.resolved,
    });

    try {
      const garage = await resolveGarageByCode(garageCode.trim()).unwrap();
      console.log('[GarageSelect] resolve success', {
        resolvedGarageCode: garage?.code,
        resolvedGarageName: garage?.name,
        resolvedGarageId: garage?.id,
      });
      setResolvedGarage(garage);
    } catch (error: any) {
      console.log('[GarageSelect] resolve error', {
        inputGarageCode: garageCode.trim(),
        error,
      });
      Alert.alert('Không tìm thấy gara', error?.data?.message || 'Mã gara không hợp lệ hoặc đã ngừng hoạt động.');
    }
  };

  const handleConfirm = async () => {
    if (!resolvedGarage) {
      Alert.alert('Lỗi', 'Vui lòng xác nhận gara trước khi tiếp tục.');
      return;
    }

    console.log('[GarageSelect] confirm start', {
      resolvedGarageCode: resolvedGarage.code,
      activeGarageCode,
      currentResolved: currentGarage.resolved,
      shouldAddWithoutSwitch,
      hasResolvedGarage,
    });

    if (normalizedResolvedGarageCode === activeGarageCode) {
      console.log('[GarageSelect] confirm skip activate (same code)', {
        normalizedResolvedGarageCode,
        activeGarageCode,
        currentResolved: currentGarage.resolved,
      });
      closeScreen();
      return;
    }

    const success = await addGarage(
      {
        id: resolvedGarage.id,
        code: resolvedGarage.code,
        name: resolvedGarage.name,
        address: resolvedGarage.address,
        avatar_url: resolvedGarage.avatar_url,
        status: resolvedGarage.status,
      },
      {
        activate: !shouldAddWithoutSwitch,
        source: 'manual',
      },
    );

    console.log('[GarageSelect] confirm addGarage result', {
      success,
      activate: !shouldAddWithoutSwitch,
      source: 'manual',
      resolvedGarageCode: resolvedGarage.code,
    });

    if (!success) {
      return;
    }

    if (shouldAddWithoutSwitch) {
      Alert.alert(
        'Đã thêm gara',
        'Gara đã được thêm vào danh sách. Khi cần, bạn có thể chọn gara này để sử dụng.',
        [{ text: 'OK', onPress: closeScreen }],
      );
      return;
    }

    closeScreen();
  };

  const handleSelectSavedGarage = useCallback(
    async (garage: SavedGarage) => {
      const success = await activateGarage(
        {
          garageId: garage.garageId,
          garageCode: garage.garageCode,
          garageName: garage.garageName,
          address: garage.address,
          avatarUrl: garage.avatarUrl,
          status: garage.status,
        },
        'saved_list',
      );

      if (success) {
        closeScreen();
      }
    },
    [activateGarage, closeScreen],
  );

  const confirmButtonTitle = useMemo(() => {
    if (!hasResolvedGarage) {
      return 'Tiếp tục';
    }

    if (normalizedResolvedGarageCode === activeGarageCode && hasActiveGarageContext) {
      return 'Đang dùng gara này';
    }

    if (shouldAddWithoutSwitch) {
      return 'Thêm gara này';
    }

    return 'Dùng gara này';
  }, [activeGarageCode, hasActiveGarageContext, hasResolvedGarage, normalizedResolvedGarageCode, shouldAddWithoutSwitch]);

  return (
    <Screen
      headerTitle="Chọn gara"
      showBackButton={navigation.canGoBack()}
      statusBarStyle="light-content"
    >
      <FormContainer
        keyboardAvoiding
        withScroll
        paddingCustom={{ horizontal: 'xl', top: 'lg', bottom: 'xl' }}
        keyboardVerticalOffset={30}
        dismissKeyboardOnPress
      >
        <Text style={styles.title}>Chọn gara</Text>
        <Text style={styles.subtitle}>
          {canChangeGarage
            ? 'Nhập mã gara để liên kết tài khoản với gara của bạn. Sau khi xác nhận, bạn có thể bắt đầu sử dụng các dịch vụ.'
            : 'Tài khoản này đã được gắn cố định với một gara.'}
        </Text>

        {savedGarages.length > 0 && (
          <View style={styles.savedGaragesSection}>
            <Text style={styles.savedGaragesTitle}>Gara đã lưu</Text>
            <View style={styles.savedGaragesList}>
              {savedGarages.map((garage) => {
                const isActive = garage.garageCode === activeGarageCode;

                return (
                  <TouchableOpacity
                    key={garage.garageCode}
                    style={[styles.savedGarageCard, isActive && styles.savedGarageCardActive]}
                    onPress={() => handleSelectSavedGarage(garage)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.savedGarageHeader}>
                      <View style={styles.savedGarageIcon}>
                        <Ionicons
                          name={isActive ? 'business' : 'business-outline'}
                          size={18}
                          color={isActive ? Colors.background.light : Colors.primary}
                        />
                      </View>
                      <View style={styles.savedGarageContent}>
                        <Text style={[styles.savedGarageName, isActive && styles.savedGarageNameActive]} numberOfLines={1}>
                          {garage.garageName || garage.garageCode}
                        </Text>
                        <Text style={[styles.savedGarageCode, isActive && styles.savedGarageCodeActive]}>
                          Mã gara: {garage.garageCode}
                        </Text>
                      </View>
                      {isActive && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Đang dùng</Text>
                        </View>
                      )}
                    </View>
                    {!!garage.address && (
                      <Text style={[styles.savedGarageAddress, isActive && styles.savedGarageAddressActive]} numberOfLines={2}>
                        {garage.address}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="business-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.introContent}>
            <Text style={styles.introTitle}>Nhập mã gara để bắt đầu</Text>
            <Text style={styles.introDescription}>
              Chỉ cần nhập mã gara được cung cấp bởi gara để liên kết tài khoản.
            </Text>
          </View>
        </View>

        <View style={styles.inputCard}>
          <TextInputComponent
            value={garageCode}
            onChangeText={(value) => {
              const normalizedValue = value.toUpperCase();
              setGarageCode(normalizedValue);

              if (resolvedGarage?.code?.trim().toUpperCase() !== normalizedValue.trim()) {
                setResolvedGarage(null);
              }
            }}
            placeholder="Nhập mã gara"
            autoCapitalize="characters"
            editable={canChangeGarage}
          />

          {hasResolvedGarage && resolvedGarage ? (
            <View style={styles.garagePreview}>
              <View style={styles.garagePreviewHeader}>
                <Ionicons name="business-outline" size={18} color={Colors.primary} />
                <Text style={styles.garagePreviewTitle}>{resolvedGarage.name}</Text>
              </View>
              <Text style={styles.garagePreviewMeta}>Mã gara: {resolvedGarage.code}</Text>
              {!!resolvedGarage.address && (
                <Text style={styles.garagePreviewMeta}>{resolvedGarage.address}</Text>
              )}
            </View>
          ) : (
            <View style={styles.helperBox}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.text.secondary} />
              <Text style={styles.helperText}>Bạn có thể lấy mã gara từ QR, deep link hoặc nhân viên gara cung cấp.</Text>
            </View>
          )}
        </View>

        {canChangeGarage && (
          <Button
            title="Xác nhận mã gara"
            onPress={handleResolve}
            loading={isFetching}
            disabled={isFetching}
            variant="secondary"
            textColor={Colors.background.light}
            fullWidth
          />
        )}

        <View style={styles.bottomActions}>
          <Button
            title={confirmButtonTitle}
            onPress={handleConfirm}
            disabled={!hasResolvedGarage || (normalizedResolvedGarageCode === activeGarageCode && hasActiveGarageContext)}
            variant="primary"
            fullWidth
          />
        </View>
      </FormContainer>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  inputCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.surface.elevated,
    marginBottom: 16,
  },
  introCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Colors.surface.elevated,
    marginBottom: 16,
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  introContent: {
    flex: 1,
    gap: 4,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  introDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  savedGarageCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: Colors.surface.elevated,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    gap: 8,
  },
  savedGarageCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  savedGarageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  savedGarageIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedGarageContent: {
    flex: 1,
    gap: 2,
  },
  savedGarageName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  savedGarageNameActive: {
    color: Colors.background.light,
  },
  savedGarageCode: {
    fontSize: 12,
    color: Colors.primaryLight,
  },
  savedGarageCodeActive: {
    color: Colors.background.light,
    opacity: 0.9,
  },
  savedGarageAddress: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  savedGarageAddressActive: {
    color: Colors.background.light,
    opacity: 0.92,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.alpha.white20,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.background.light,
  },
  helperBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 4,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  garagePreview: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.neutral[50],
  },
  garagePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  garagePreviewTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  garagePreviewMeta: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  bottomActions: {
    marginTop: 8,
  },
});

export default SelectGarageScreen;
