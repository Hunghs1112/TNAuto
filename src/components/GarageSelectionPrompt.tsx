import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { Colors } from '../constants/colors';
import { Typography } from '../constants/typo';
import { spacing } from '../design-system/spacing';
import { Button } from './ui/Button';

interface GarageSelectionPromptProps {
  title?: string;
  description?: string;
  onPress: () => void;
}

const GarageSelectionPrompt: React.FC<GarageSelectionPromptProps> = ({
  title = 'Chưa chọn gara',
  description = 'Hãy chọn gara để xem đúng danh mục, sản phẩm và dịch vụ của gara đó.',
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="business-outline" size={26} color={Colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Button
        title="Chọn gara"
        onPress={onPress}
        variant="primary"
        fullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: Colors.surface.muted,
    gap: spacing.md,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.text.primary,
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
  },
  description: {
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
});

export default React.memo(GarageSelectionPrompt);
