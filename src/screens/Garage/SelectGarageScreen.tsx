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
    handleResolve,
    handleConfirm,
    handleSelectSavedGarage,
  } = useSelectGarageScreen();

  return (
    <Screen headerTitle="Chọn gara" showBackButton statusBarStyle="light-content">
      <FormContainer keyboardAvoiding withScroll paddingCustom={{ horizontal: 'xl', top: 'lg', bottom: 'xl' }} keyboardVerticalOffset={30} dismissKeyboardOnPress>
        <Text style={styles.title}>Chọn gara</Text>
        <Text style={styles.subtitle}>{canChangeGarage ? 'Nhập mã gara để liên kết tài khoản với gara của bạn. Sau khi xác nhận, bạn có thể bắt đầu sử dụng các dịch vụ.' : 'Tài khoản này đã được gắn cố định với một gara.'}</Text>

        {savedGarages.length > 0 && (
          <View style={styles.savedGaragesSection}>
            <Text style={styles.savedGaragesTitle}>Gara đã lưu</Text>
            <View style={styles.savedGaragesList}>
              {savedGarages.map((garage: any) => {
                const isActive = garage.garageCode === activeGarageCode;
                return (
                  <TouchableOpacity key={garage.garageCode} style={[styles.savedGarageCard, isActive && styles.savedGarageCardActive]} onPress={() => handleSelectSavedGarage(garage)} activeOpacity={0.85}>
                    <View style={styles.savedGarageHeader}>
                      <View style={styles.savedGarageIcon}>
                        {garage.avatar_url || garage.avatarUrl ? (
                          <Image source={{ uri: garage.avatar_url || garage.avatarUrl }} style={styles.savedGarageAvatar} resizeMode="contain" />
                        ) : (
                          <Ionicons name={isActive ? 'business' : 'business-outline'} size={18} color={isActive ? Colors.background.light : Colors.primary} />
                        )}
                      </View>
                      <View style={styles.savedGarageContent}>
                        <Text style={[styles.savedGarageName, isActive && styles.savedGarageNameActive]} numberOfLines={1}>{garage.garageName || garage.garageCode}</Text>
                        <Text style={[styles.savedGarageCode, isActive && styles.savedGarageCodeActive]}>Mã gara: {garage.garageCode}</Text>
                      </View>
                      {isActive && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Đang dùng</Text></View>}
                    </View>
                    {!!garage.address && <Text style={[styles.savedGarageAddress, isActive && styles.savedGarageAddressActive]} numberOfLines={2}>{garage.address}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.introCard}>
          <View style={styles.introIcon}><Ionicons name="business-outline" size={24} color={Colors.primary} /></View>
          <View style={styles.introContent}>
            <Text style={styles.introTitle}>Nhập mã gara để bắt đầu</Text>
            <Text style={styles.introDescription}>Chỉ cần nhập mã gara được cung cấp bởi gara để liên kết tài khoản.</Text>
          </View>
        </View>

        <View style={styles.inputCard}>
          <TextInputComponent value={garageCode} onChangeText={(value) => { const normalizedValue = value.toUpperCase(); setGarageCode(normalizedValue); if (resolvedGarage?.garageCode?.trim().toUpperCase() !== normalizedValue.trim()) setResolvedGarage(null); }} placeholder="Nhập mã gara" autoCapitalize="characters" editable={canChangeGarage} />

          {hasResolvedGarage && resolvedGarage ? (
            <View style={styles.garagePreview}>
              <View style={styles.garagePreviewHeader}>
                <View style={styles.savedGarageIcon}>
                  {resolvedGarage.avatarUrl ? <Image source={{ uri: resolvedGarage.avatarUrl }} style={styles.savedGarageAvatar} resizeMode="contain" /> : <Ionicons name="business-outline" size={18} color={Colors.primary} />}
                </View>
                <Text style={styles.garagePreviewTitle}>{resolvedGarage.garageName}</Text>
              </View>
              <Text style={styles.garagePreviewMeta}>Mã gara: {resolvedGarage.garageCode}</Text>
              {!!resolvedGarage.address && <Text style={styles.garagePreviewMeta}>{resolvedGarage.address}</Text>}
            </View>
          ) : (
            <View style={styles.helperBox}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.text.secondary} />
              <Text style={styles.helperText}>Bạn có thể lấy mã gara từ QR, deep link hoặc nhân viên gara cung cấp.</Text>
            </View>
          )}
        </View>

        {canChangeGarage && <Button title="Xác nhận mã gara" onPress={handleResolve} loading={isFetching} disabled={isFetching} variant="secondary" textColor={Colors.background.light} fullWidth />}

        <View style={styles.bottomActions}>
          <Button title={confirmButtonTitle} onPress={handleConfirm} disabled={!hasResolvedGarage || false} variant="primary" fullWidth />
        </View>
      </FormContainer>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 22, color: Colors.text.secondary, marginBottom: 20 },
  savedGaragesSection: { marginBottom: 16, gap: 10 },
  savedGaragesTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, letterSpacing: 0.2 },
  inputCard: { padding: 16, borderRadius: 20, backgroundColor: Colors.surface.elevated, marginBottom: 16 },
  introCard: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 18, backgroundColor: Colors.surface.elevated, marginBottom: 16 },
  introIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primarySoft },
  introContent: { flex: 1, gap: 4 },
  introTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  introDescription: { fontSize: 13, lineHeight: 20, color: Colors.text.secondary },
  savedGarageCard: { padding: 14, borderRadius: 18, backgroundColor: Colors.surface.elevated, borderWidth: 1, borderColor: Colors.neutral[200], gap: 8 },
  savedGarageCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  savedGarageHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  savedGarageIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  savedGarageAvatar: { width: '100%', height: '100%' },
  savedGarageContent: { flex: 1, gap: 2 },
  savedGarageName: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  savedGarageNameActive: { color: Colors.background.light },
  savedGarageCode: { fontSize: 12, color: Colors.primaryLight },
  savedGarageCodeActive: { color: Colors.background.light, opacity: 0.9 },
  savedGarageAddress: { fontSize: 13, lineHeight: 20, color: Colors.text.secondary },
  savedGarageAddressActive: { color: Colors.background.light, opacity: 0.92 },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: Colors.alpha.white20 },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.background.light },
  helperBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingTop: 4 },
  helperText: { flex: 1, fontSize: 13, lineHeight: 20, color: Colors.text.secondary },
  garagePreview: { padding: 14, borderRadius: 16, backgroundColor: Colors.neutral[50] },
  garagePreviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  garagePreviewTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  garagePreviewMeta: { fontSize: 13, lineHeight: 20, color: Colors.text.secondary },
  bottomActions: { marginTop: 8 },
  savedGaragesList: { gap: 10 },
});

export default SelectGarageScreen;
