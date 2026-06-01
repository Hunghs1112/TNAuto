import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';
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
  disabled?: boolean; // Disable date picker
  fullWidth?: boolean; // Full width instead of 50%
  minimumDate?: Date;
  maximumDate?: Date;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  onDatePress,
  style,
  dateFormat = 'DD/MM/YYYY',
  disabled = false,
  fullWidth = false,
  minimumDate,
  maximumDate,
}) => {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

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

  const parseDateValue = (input: string): Date | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-').map(Number);
      const parsed = new Date(year, month - 1, day);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const slashMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
    if (slashMatch) {
      const [, dd, mm, yyyy] = slashMatch;
      const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const handleDatePress = () => {
    if (disabled) return;
    const parsedValue = parseDateValue(value);
    if (parsedValue) {
      setDate(parsedValue);
    }
    setOpen(true);
    if (onDatePress) {
      onDatePress();
    }
  };

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    const formattedDate = formatDate(selectedDate);
    onChangeText(formattedDate);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <View style={[fullWidth ? styles.containerFullWidth : styles.container, style]}>
        <View style={styles.dateFieldContent}>
          <View style={styles.dateLabelContainer}>
            <Text style={styles.dateLabel}>{label}</Text>
          </View>
          <View style={styles.dateInputContainer}>
            <Pressable
              style={styles.datePressable}
              onPress={handleDatePress}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <View pointerEvents="none">
                <TextInputComponent
                  value={value}
                  onChangeText={onChangeText}
                  placeholder={placeholder}
                  placeholderTextColor={disabled ? Colors.text.placeholder : Colors.text.placeholder}
                  textColor={disabled ? Colors.text.secondary : Colors.text.primary}
                  borderColor={disabled ? Colors.neutral[200] : Colors.neutral[300]}
                  editable={false}
                  iconRight={
                    <View style={styles.dateIconPressable}>
                      <Ionicons
                        name={disabled ? "lock-closed-outline" : "calendar-outline"}
                        size={18}
                        color={disabled ? Colors.text.placeholder : Colors.background.red}
                      />
                    </View>
                  }
                />
              </View>
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
        minimumDate={minimumDate}
        maximumDate={maximumDate}
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
  containerFullWidth: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  dateFieldContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingVertical: 2,
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
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DateInput;
