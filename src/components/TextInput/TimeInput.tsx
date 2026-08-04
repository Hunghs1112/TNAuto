import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import DatePicker from 'react-native-date-picker';
import TextInputComponent from "./TextInput";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

interface TimeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label: string;
  style?: any;
  disabled?: boolean;
  fullWidth?: boolean;
}

const HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  style,
  disabled = false,
  fullWidth = false,
}) => {
  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(false);

  const formatTime = (dateObj: Date): string => {
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const mm = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const parseTimeValue = (input: string): Date | null => {
    const trimmed = input.trim();
    if (!HHMM_REGEX.test(trimmed)) return null;
    const [hh, mm] = trimmed.split(':').map(Number);
    const parsed = new Date();
    parsed.setHours(hh, mm, 0, 0);
    return parsed;
  };

  const handleTimePress = () => {
    if (disabled) return;
    const parsedValue = parseTimeValue(value);
    if (parsedValue) {
      setTime(parsedValue);
    }
    setOpen(true);
  };

  const handleConfirm = (selectedDate: Date) => {
    setTime(selectedDate);
    onChangeText(formatTime(selectedDate));
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <View style={[fullWidth ? styles.containerFullWidth : styles.container, style]}>
        <View style={styles.timeFieldContent}>
          <View style={styles.timeLabelContainer}>
            <Text style={styles.timeLabel}>{label}</Text>
          </View>
          <View style={styles.timeInputContainer}>
            <Pressable
              style={styles.timePressable}
              onPress={handleTimePress}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <View pointerEvents="none">
                <TextInputComponent
                  value={value}
                  onChangeText={onChangeText}
                  placeholder={placeholder}
                  placeholderTextColor={Colors.text.placeholder}
                  textColor={disabled ? Colors.text.secondary : Colors.text.primary}
                  borderColor={disabled ? Colors.neutral[200] : Colors.neutral[300]}
                  editable={false}
                  iconRight={
                    <View style={styles.timeIconPressable}>
                      <Ionicons
                        name={disabled ? "lock-closed-outline" : "time-outline"}
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

      <DatePicker
        modal
        open={open}
        date={time}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Chọn giờ"
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
  timeFieldContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingVertical: 2,
  },
  timeLabelContainer: {
    width: 60,
    justifyContent: "center",
    paddingLeft: 4,
  },
  timeLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.placeholder,
    backgroundColor: Colors.background.light,
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  timeInputContainer: {
    flex: 1,
    marginLeft: 2,
  },
  timePressable: {
    flex: 1,
  },
  timeIconPressable: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TimeInput;
