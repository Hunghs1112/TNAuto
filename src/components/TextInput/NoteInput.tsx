// components/TextInput/NoteInput.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import TextInputComponent from "./TextInput";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

interface NoteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

const NoteInput: React.FC<NoteInputProps> = ({
  value,
  onChangeText,
  placeholder,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text-outline" size={12} color={Colors.text.placeholder} />
        </View>
        <Text style={styles.label}>Ghi chú</Text>
      </View>
      <View style={styles.inputWrapper}>
        <TextInputComponent
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.placeholder}
          textColor={Colors.text.primary}
          borderColor={Colors.neutral[300]}
          multiline={true}
          numberOfLines={4}
          style={styles.noteInput}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.light,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 2, // Giữ 2px giữa label và input
    borderRadius: 4,
    maxWidth: 200,
    shadowColor: Colors.neutral[300],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  iconContainer: {
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 2,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 11,
    lineHeight: 14,
    color: Colors.text.placeholder,
    flex: 1,
  },
  inputWrapper: {
    width: "100%",
  },
  noteInput: {
    height: 80,
    textAlignVertical: "top",
  },
});

export default NoteInput;