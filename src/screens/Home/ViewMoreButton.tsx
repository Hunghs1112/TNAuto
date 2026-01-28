// src/screens/Home/ViewMoreButton.tsx
import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { spacing } from '../../design-system/spacing';
import { borderRadius } from '../../design-system/borders';
import { getShadowStyle } from '../../design-system/shadows';
import LinearGradient from 'react-native-linear-gradient';
import { selectPlatform } from '../../utils/platform';
import { textStyles } from '../../design-system/typography';

interface ViewMoreButtonProps {
  onPress: () => void;
  title?: string;
}

const ViewMoreButton: React.FC<ViewMoreButtonProps> = ({
  onPress,
  title = 'Xem tất cả',
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <LinearGradient
        colors={Colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.text}>{title}</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.background.light}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
    marginTop: spacing.md,
    marginBottom: selectPlatform(spacing['2xl'], spacing.xl),
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...getShadowStyle('md'),
  },
  gradient: {
    width: '100%',
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: selectPlatform(14, 13),
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    width: '100%',
    minHeight: 48,
  },
  text: {
    color: Colors.background.light,
    ...textStyles.button,
  },
});

export default React.memo(ViewMoreButton);


