import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import TextInputComponent from "./TextInput";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

interface DateInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label: string;
  onDatePress?: () => void;
  style?: any;
  dateFormat?: string; // 'DD/MM/YYYY' | 'MM/DD/YYYY'
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  onDatePress,
  style,
  dateFormat = 'DD/MM/YYYY',
}) => {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [showText, setShowText] = useState(false);

  const formatDate = (dateObj: Date): string => {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    if (dateFormat === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    } else {
      return `${month}/${day}/${year}`;
    }
  };

  const handleDatePress = () => {
    setOpen(true);
    if (onDatePress) {
      onDatePress();
    }
  };

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    const formattedDate = formatDate(selectedDate);
    onChangeText(formattedDate);
    setShowText(true);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <View style={[styles.container, style]}>
        <View style={styles.dateFieldContent}>
          <View style={styles.dateLabelContainer}>
            <Text style={styles.dateLabel}>{label}</Text>
          </View>
          <View style={styles.dateInputContainer}>
            <Pressable 
              style={styles.datePressable} 
              onPress={handleDatePress}
            >
              <TextInputComponent
                value={showText ? value : placeholder}
                onChangeText={onChangeText}
                placeholder={showText ? "" : placeholder}
                placeholderTextColor={Colors.text.placeholder}
                textColor={showText ? Colors.text.primary : Colors.text.placeholder}
                borderColor={Colors.neutral[300]}
                
              
                iconRight={
                  <Pressable
                    onPress={handleDatePress}
                    style={styles.dateIconPressable}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Chọn ngày"
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={Colors.background.red}
                    />
                  </Pressable>
                }
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        minimumDate={new Date()}
        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
        title="Chọn ngày"
        confirmText="Xác nhận"
        cancelText="Hủy"
        theme="light"
        locale={Platform.OS === 'ios' ? 'vi' : 'vi-VN'}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "50%",
    paddingHorizontal: 2,
  },
  dateFieldContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingVertical: 4,
  },
  dateLabelContainer: {
    width: 60,
    justifyContent: "center",
    paddingLeft: 4,
  },
  dateLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.placeholder,
    backgroundColor: Colors.background.light,
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  dateInputContainer: {
    flex: 1,
    marginLeft: 2,
  },
  datePressable: {
    flex: 1,
  },
  dateIconPressable: {
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DateInput;