// src/components/GenericListScreen/GenericListScreen.tsx
// Generic reusable component for list screens to reduce code duplication
import React from 'react';
import { View, Text, StatusBar, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import Header from './Header';
import Item from './Item';
import { sharedStyles } from '../styles/sharedStyles';
import { useAutoRefresh } from '../redux/hooks/useAutoRefresh';

export interface ListItem {
  id: number | string;
  title: string;
  description: string;
  onPress: () => void;
}

interface GenericListScreenProps {
  title: string;
  data?: any;
  isLoading: boolean;
  error: any;
  emptyIcon?: string;
  emptyMessage?: string;
  mapDataToItems: (data: any) => ListItem[];
  enableRefresh?: boolean;
}

const GenericListScreen: React.FC<GenericListScreenProps> = ({
  title,
  data,
  isLoading,
  error,
  emptyIcon = 'list-outline',
  emptyMessage = 'Chưa có dữ liệu',
  mapDataToItems,
  enableRefresh = true,
}) => {
  const { refreshing, onRefresh } = useAutoRefresh();

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={sharedStyles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={sharedStyles.redSection}>
          <Header title={title} />
        </View>
        <View style={[sharedStyles.whiteSection, sharedStyles.centeredContent]}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={sharedStyles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={sharedStyles.redSection}>
          <Header title={title} />
        </View>
        <View style={sharedStyles.whiteSection}>
          <View style={sharedStyles.body}>
            <View style={sharedStyles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={Colors.text.secondary} />
              <Text style={sharedStyles.errorText}>Lỗi tải dữ liệu</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Map data to list items
  const items = data ? mapDataToItems(data) : [];

  // Empty state
  if (items.length === 0) {
    return (
      <SafeAreaView style={sharedStyles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={sharedStyles.redSection}>
          <Header title={title} />
        </View>
        <View style={sharedStyles.whiteSection}>
          <View style={sharedStyles.body}>
            <View style={sharedStyles.emptyContainer}>
              <Ionicons name={emptyIcon} size={48} color={Colors.text.secondary} />
              <Text style={sharedStyles.emptyText}>{emptyMessage}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // List state
  return (
    <SafeAreaView style={sharedStyles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <View style={sharedStyles.redSection}>
        <Header title={title} />
      </View>
      
      <View style={sharedStyles.whiteSection}>
        <View style={sharedStyles.body}>
          <View style={sharedStyles.form}>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Item
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  onPress={item.onPress}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              showsVerticalScrollIndicator={false}
              style={sharedStyles.listContainer}
              refreshControl={
                enableRefresh ? (
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                ) : undefined
              }
            />
          </View>
          
          <View style={sharedStyles.bar}>
            <View style={sharedStyles.barInner} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GenericListScreen;

