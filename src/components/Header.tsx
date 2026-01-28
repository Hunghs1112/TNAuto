import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { spacing } from "../design-system/spacing";
import { getShadowStyle } from "../design-system/shadows";
import { borderRadius } from "../design-system/borders";
import { textStyles } from "../design-system/typography";

type HeaderProps = {
  title?: string;
  hideBackButton?: boolean; // Optional prop to force hide back button
};

const Header = ({ title = "Đăng nhập", hideBackButton = false }: HeaderProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleBackPress = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      // Fallback: try to navigate to Home if goBack fails
      try {
        navigation.navigate('Home' as never);
      } catch (fallbackError) {
        // Silent fail
      }
    }
  }, [navigation]);

  const canGoBack = useMemo(() => navigation.canGoBack(), [navigation]);
  const showBackButton = useMemo(() => !hideBackButton && canGoBack, [hideBackButton, canGoBack]);

  return (
    <LinearGradient
      colors={[...Colors.gradients.primary, Colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back-outline" size={28} color={Colors.background.light} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    width: "100%",
    position: 'relative',
    zIndex: 1000,
    elevation: 10, // For Android
    ...getShadowStyle('sm'),
  },
  container: {
    width: "100%",
    minHeight: 56,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    color: Colors.background.light,
    ...textStyles.h3,
    marginLeft: spacing.md,
  },
  spacer: {
    width: 40,
  },
});

Header.displayName = 'Header';

export default React.memo(Header);