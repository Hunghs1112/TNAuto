import React from 'react';
import { View, ActivityIndicator, Modal, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface LoadingProps {
  visible: boolean;
  text?: string;
}

export default function Loading({ visible, text = 'Đang tải...' }: LoadingProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.alpha.black60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.background.light,
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
