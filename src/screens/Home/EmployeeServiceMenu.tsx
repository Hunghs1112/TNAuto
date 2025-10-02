import React from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

interface EmployeeServiceItem {
  id: string;
  serviceName: string;
  customerName: string;
  receiveDate: string;
  scheduleDate: string;
  onPress?: () => void;
}

interface EmployeeServiceMenuProps {
  items: EmployeeServiceItem[];
}

const EmployeeServiceMenu: React.FC<EmployeeServiceMenuProps> = ({ items }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={item.onPress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${item.serviceName} - ${item.customerName}`}
          >
            <View style={styles.content}>
              {/* Phần trên - chiếm nhiều height hơn */}
              <View style={styles.upperSection}>
                <View style={styles.header}>
                  <View style={styles.serviceInfo}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="construct" size={24} color={Colors.text.primary} />
                    </View>
                    <View style={styles.textContainer}>
                      <View style={styles.serviceText}>
                        <Text style={styles.serviceName}>{item.serviceName}</Text>
                        <Text style={styles.customerName}>{item.customerName}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
                </View>
              </View>
              
              <View style={styles.divider} />
              
              {/* Phần dưới - compact hơn */}
              <View style={styles.footer}>
                <View style={styles.dateItem}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.background.yellow} />
                  <Text style={styles.receiveDate}>{item.receiveDate}</Text>
                </View>
                <View style={styles.dateItem}>
                  <Ionicons name="time-outline" size={20} color={Colors.background.indigo} />
                  <Text style={styles.scheduleDate}>{item.scheduleDate}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    minHeight: 180,
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 2, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: "space-between",
  },
  upperSection: {
    flex: 2,
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serviceInfo: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
  },
  serviceText: {
    gap: 6,
  },
  serviceName: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.lg,
    lineHeight: 22,
  },
  customerName: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 4,
    marginVertical: 12,
  },
  footer: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 4,
  },
  dateItem: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    flex: 1,
  },
  receiveDate: {
    color: Colors.background.yellow,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  scheduleDate: {
    color: Colors.background.indigo,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    flex: 1,
  },
});

export default EmployeeServiceMenu;