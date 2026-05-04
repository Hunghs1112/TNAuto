import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import Screen from '../../components/layout/Screen/Screen';
import { FormContainer } from '../../components/layout/FormContainer';
import TextInputComponent from '../../components/TextInput/TextInput';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { useSelectGarageScreen } from './useSelectGarageScreen';

const SelectGarageScreen = () => {
  const {
    canChangeGarage,
    savedGarages,
    activeGarageCode,
    isFetching,
    garageCode,
    setGarageCode,
    resolvedGarage,
    setResolvedGarage,
    hasResolvedGarage,
    confirmButtonTitle,
    handleSelectSavedGarage,
    handlePrimaryAction,
  } = useSelectGarageScreen();

  return (
    <Screen headerTitle="Chọn gara" showBackButton statusBarStyle="light-content">
      <FormContainer keyboardAvoiding withScroll paddingCustom={{ horizontal: 'xl', top: 'lg', bottom: 'xl' }} keyboardVerticalOffset={30} dismissKeyboardOnPress>
        <Text style={styles.title}>Chọn gara</Text>
        <Text style={styles.subtitle}>{canChangeGarage ? 'Nhập mã gara để liên kết tài khoản với gara của bạn. Sau khi xác nhận, bạn có thể bắt đầu sử dụng các dịch vụ.' : 'Tài khoản này đã được gắn cố định với một gara.'}</Text>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Nhập mã gara</Text>
          <TextInputComponent value={garageCode} onChangeText={(value) => { const normalizedValue = value.toUpperCase(); setGarageCode(normalizedValue); if (resolvedGarage?.garageCode?.trim().toUpperCase() !== normalizedValue.trim()) setResolvedGarage(null); }} placeholder="Nhập mã gara" autoCapitalize="characters" editable={canChangeGarage} />

          {hasResolvedGarage && resolvedGarage ? (
            <View style={styles.garagePreviewCard}>
              <View style={styles.garagePreviewBanner}>
                {resolvedGarage.bannerUrl ? (
                  <Image source={{ uri: resolvedGarage.bannerUrl }} style={styles.garagePreviewBannerImage} resizeMode="cover" />
                ) : (
                  <View style={styles.garagePreviewBannerFallback} />
                )}
              </View>
              <View style={styles.garagePreviewBody}>
                <View style={styles.savedGarageIcon}>
                  {resolvedGarage.avatarUrl ? <Image source={{ uri: resolvedGarage.avatarUrl }} style={styles.savedGarageAvatar} resizeMode="contain" /> : <Ionicons name="business-outline" size={18} color={Colors.primary} />}
                </View>
                <View style={styles.garagePreviewContent}>
                  <Text style={styles.garagePreviewTitle}>{resolvedGarage.garageName}</Text>
                  {!!resolvedGarage.address && <Text style={styles.garagePreviewAddress} numberOfLines={2}>{resolvedGarage.address}</Text>}
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.helperText}>Bạn có thể lấy mã gara từ QR, deep link hoặc nhân viên gara cung cấp.</Text>
          )}

          {canChangeGarage && (
            <Button title={confirmButtonTitle} onPress={handlePrimaryAction} loading={isFetching} disabled={isFetching} variant="secondary" textColor={Colors.background.light} fullWidth />
          )}
        </View>

        {savedGarages.length > 0 && (
          <View style={styles.savedGaragesSection}>
            <Text style={styles.savedGaragesTitle}>Gara đã lưu</Text>
            <View style={styles.savedGaragesList}>
              {savedGarages.map((garage: any) => {
                const isActive = garage.garageCode === activeGarageCode;
                return (
                  <TouchableOpacity key={garage.garageCode} style={[styles.savedGarageCard, isActive && styles.savedGarageCardActive]} onPress={() => handleSelectSavedGarage(garage)} activeOpacity={0.85}>
                    <View style={styles.savedGarageBanner}>
                      {garage.banner_url || garage.bannerUrl ? (
                        <Image source={{ uri: garage.banner_url || garage.bannerUrl }} style={styles.savedGarageBannerImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.savedGarageBannerFallback} />
                      )}
                    </View>
                    <View style={styles.savedGarageBody}>
                      <View style={styles.savedGarageIcon}>
                        {garage.avatar_url || garage.avatarUrl ? (
                          <Image source={{ uri: garage.avatar_url || garage.avatarUrl }} style={styles.savedGarageAvatar} resizeMode="contain" />
                        ) : (
                          <Ionicons name={isActive ? 'business' : 'business-outline'} size={18} color={isActive ? Colors.background.light : Colors.primary} />
                        )}
                      </View>
                      <View style={styles.savedGarageContent}>
                        <Text style={[styles.savedGarageName, isActive && styles.savedGarageNameActive]} numberOfLines={1}>{garage.garageName || garage.garageCode}</Text>
                        {!!garage.address && <Text style={[styles.savedGarageAddress, isActive && styles.savedGarageAddressActive]} numberOfLines={2}>{garage.address}</Text>}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </FormContainer>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 22, color: Colors.text.secondary, marginBottom: 20 },
  savedGaragesSection: { marginBottom: 16, gap: 10 },
  savedGaragesTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, letterSpacing: 0.2, marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, letterSpacing: 0.2, marginBottom: 10 },
  inputSection: { marginBottom: 16 },
  savedGarageCard: { borderRadius: 16, backgroundColor: Colors.surface.elevated, borderWidth: 1, borderColor: Colors.neutral[200], overflow: 'hidden' },
  savedGarageCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  savedGarageBanner: { height: 88, backgroundColor: Colors.neutral[200] },
  savedGarageBannerImage: { width: '100%', height: '100%' },
  savedGarageBannerFallback: { flex: 1, backgroundColor: Colors.primarySoft },
  savedGarageBody: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  savedGarageIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  savedGarageAvatar: { width: '100%', height: '100%' },
  savedGarageContent: { flex: 1 },
  savedGarageName: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  savedGarageNameActive: { color: Colors.background.light },
  savedGarageAddress: { fontSize: 13, lineHeight: 18, color: Colors.text.secondary, marginTop: 2 },
  savedGarageAddressActive: { color: Colors.background.light, opacity: 0.92 },
  helperText: { fontSize: 13, lineHeight: 20, color: Colors.text.secondary, paddingHorizontal: 0 },
  garagePreviewCard: { borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.surface.elevated },
  garagePreviewBanner: { height: 88, backgroundColor: Colors.neutral[200] },
  garagePreviewBannerImage: { width: '100%', height: '100%' },
  garagePreviewBannerFallback: { flex: 1, backgroundColor: Colors.primarySoft },
  garagePreviewBody: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  garagePreviewContent: { flex: 1 },
  garagePreviewTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  garagePreviewAddress: { fontSize: 13, lineHeight: 18, color: Colors.text.secondary, marginTop: 2 },
  savedGaragesList: { gap: 10 },
});

export default SelectGarageScreen;
