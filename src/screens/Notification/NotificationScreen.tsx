// src/screens/Notification/NotificationScreen.tsx
import React, { useEffect } from "react";
import { View, FlatList, StatusBar, ActivityIndicator, Text, RefreshControl } from "react-native";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/types";
import { useGetNotificationsQuery } from "../../services/notificationApi";
import { setNotifications } from "../../redux/slices/notificationSlice";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors } from "../../constants/colors";
import Header from "../../components/Header";
import Item from "../../components/Item";
import { styles } from "./styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const NotificationScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const userType = useAppSelector((state: RootState) => state.auth.userType || 'customer');
  const userId = useAppSelector((state: RootState) => state.auth.userId || '');
  const recipientId = userId;
  const recipientType = userType;

  console.log('NotificationScreen debug - userType:', userType, 'userId:', userId, 'recipientType:', recipientType); // Debug

  const { data: notifications, isLoading, error, refetch } = useGetNotificationsQuery(
    { recipient_id: recipientId, recipient_type: recipientType },
    { skip: !recipientId }
  );

  console.log('NotificationScreen debug - notifications:', notifications, 'isLoading:', isLoading, 'error:', error); // Debug

  // Sync to slice on mount/refetch
  useEffect(() => {
    if (notifications) {
      dispatch(setNotifications(notifications));
      console.log('NotificationScreen: Synced notifications to slice'); // Debug
    }
  }, [notifications, dispatch]);

  const handlePress = (message: string) => {
    console.log('NotificationScreen: Notification pressed, message:', message); // Debug
    
    // Parse order_id from message like "Đơn hàng #X ..."
    const orderMatch = message.match(/#(\d+)/);
    if (orderMatch) {
      const orderId = orderMatch[1];
      console.log('NotificationScreen: Extracted orderId:', orderId, 'navigating...'); // Debug
      
      // Navigate to order detail based on user type
      if (userType === 'customer') {
        navigation.navigate('OrderDetail', { id: orderId });
      } else {
        navigation.navigate('EmployeeOrderDetail', { id: orderId });
      }
    } else {
      console.log('NotificationScreen: No order_id found in message, staying on notification screen'); // Debug
    }
  };

  // Show loading only on initial load (no data yet)
  if (isLoading && !notifications) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.header}>
          <Header title="Thông báo" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error only if no data available
  if (error && !notifications) {
    console.log('NotificationScreen: Showing error, error:', error); // Debug
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.header}>
          <Header title="Thông báo" />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi tải thông báo</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if we have data
  if (!notifications || notifications.length === 0) {
    console.log('NotificationScreen: No notifications available'); // Debug
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.header}>
          <Header title="Thông báo" />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('NotificationScreen: Rendering list with', notifications.length, 'notifications'); // Debug

  const renderItem = ({ item }: { item: { id: string; message: string; read: boolean; created_at?: string; } }) => {
    let displayMessage = item.message.replace(/ bởi \d+/, ''); // Remove " bởi 1" or similar
    const title = displayMessage.split(':')[0].trim() || 'Thông báo mới';
    const time = item.created_at ? new Date(item.created_at).toLocaleString('vi-VN', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : 'Vừa xong';
    
    return (
      <Item
        title={title}
        description={`${displayMessage.replace(title + ':', '').trim()} • ${time}`}
        imageUri={undefined}
        onPress={() => handlePress(displayMessage)}
        isPressable={true}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      <View style={styles.header}>
        <Header title="Thông báo" />
      </View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;