// components/TextInput/SelectInput.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

interface Option {
  id: number;
  name: string;
}

interface SelectInputProps {
  value?: string;
  placeholder?: string;
  label?: string;
  icon?: string;
  options: Option[];
  onSelect: (option: Option) => void;
  disabled?: boolean;
  style?: any;
}

const SelectInput: React.FC<SelectInputProps> = ({
  value = "",
  placeholder = "Chọn",
  label,
  icon = "chevron-down-outline",
  options,
  onSelect,
  disabled = false,
  style,
}) => {
  const [showModal, setShowModal] = useState(false);
  const selectedOption = options.find(opt => opt.name === value);

  const renderOption = ({ item }: { item: Option }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        selectedOption?.id === item.id && styles.selectedOption
      ]}
      onPress={() => {
        onSelect(item);
        setShowModal(false);
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.optionName}>{item.name}</Text>
      <Text style={styles.optionId}>ID: {item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={12} color={Colors.text.placeholder} />
          </View>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          disabled && styles.disabled
        ]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.inputText,
          { color: value ? Colors.text.primary : Colors.text.placeholder }
        ]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={16} color={Colors.text.placeholder} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderOption}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.light,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 2,
    borderRadius: 4,
    maxWidth: 200,
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 1 },
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.background.light,
  },
  disabled: {
    opacity: 0.6,
  },
  inputText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: Colors.background.light,
    borderRadius: 8,
    padding: 20,
    width: "80%",
    maxHeight: "60%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[300],
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedOption: {
    backgroundColor: Colors.primary[50],
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
  },
  optionName: {
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
  },
  optionId: {
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
});

export default SelectInput;