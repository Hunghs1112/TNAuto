// src/screens/Home/ViewMoreButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';

interface ViewMoreButtonProps {
  onPress: () => void;
  title?: string;
}

const ViewMoreButton: React.FC<ViewMoreButtonProps> = ({ 
  onPress, 
  title = 'Xem tất cả' 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{title}</Text>
        <Ionicons 
          name="arrow-forward" 
          size={20} 
          color={Colors.background.light} 
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 16,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  text: {
    color: Colors.background.light,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
  },
});

export default React.memo(ViewMoreButton);

