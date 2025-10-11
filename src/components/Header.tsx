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
          <Ionicons name="chevron-back-outline" size={32} color={Colors.text.inverted} />
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
    marginTop: '6%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: Colors.background.red,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: Colors.text.inverted,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: 8,
  },
  spacer: {
    width: 32,
  },
});

export default Header;