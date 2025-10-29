import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type HeaderProps = {
  title?: string;
  hideBackButton?: boolean; // Optional prop to force hide back button
};

const Header = ({ title = "Đăng nhập", hideBackButton = false }: HeaderProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleBackPress = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        console.log('Header: Cannot go back, no previous screen in stack');
      }
    } catch (error) {
      console.error('Header: Error during navigation.goBack():', error);
      // Fallback: try to navigate to Home if goBack fails
      try {
        navigation.navigate('Home' as never);
      } catch (fallbackError) {
        console.error('Header: Fallback navigation to Home also failed:', fallbackError);
      }
    }
  };

  return (
    <View style={styles.container}>
      {!hideBackButton && navigation.canGoBack() && (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back-outline" size={28} color={Colors.background.light} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 56,
    paddingHorizontal: 16,
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    color: Colors.background.light,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: 12,
  },
  spacer: {
    width: 40,
  },
});

export default Header;