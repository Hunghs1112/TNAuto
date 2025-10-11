// src/utils/validation.ts - Validation utilities for form inputs

/**
 * Validates Vietnamese phone number format
 * Format: ^0[1-9]\d{8,9}$ (10-11 digits, starts with 0, second digit 1-9)
 * 
 * Valid examples:
 * - 0909123456 ✅
 * - 0912345678 ✅
 * - 0888358555 ✅
 * 
 * Invalid examples:
 * - 123456789 ❌ (doesn't start with 0)
 * - 0000000000 ❌ (second digit must be 1-9)
 * - 09091234 ❌ (too short)
 */
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Số điện thoại không được để trống' };
  }

  // Remove all spaces and special characters except numbers
  const cleanPhone = phone.replace(/\s/g, '');

  // Check if contains only numbers
  if (!/^\d+$/.test(cleanPhone)) {
    return { isValid: false, error: 'Số điện thoại chỉ được chứa chữ số' };
  }

  // Check Vietnamese phone format: ^0[1-9]\d{8,9}$
  const phoneRegex = /^0[1-9]\d{8,9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    if (!cleanPhone.startsWith('0')) {
      return { isValid: false, error: 'Số điện thoại phải bắt đầu bằng số 0' };
    }
    if (cleanPhone.length < 10) {
      return { isValid: false, error: 'Số điện thoại phải có ít nhất 10 số' };
    }
    if (cleanPhone.length > 11) {
      return { isValid: false, error: 'Số điện thoại không được quá 11 số' };
    }
    if (cleanPhone[1] === '0') {
      return { isValid: false, error: 'Số điện thoại không hợp lệ (chữ số thứ 2 phải từ 1-9)' };
    }
    return { isValid: false, error: 'Số điện thoại không đúng định dạng' };
  }

  return { isValid: true };
};

/**
 * Validates Vietnamese license plate format
 * Format: ^[0-9]{2}[A-Z]{1,2}-[0-9]{3,5}$ 
 * 
 * Valid examples:
 * - 29A-12345 ✅
 * - 51B-54321 ✅
 * - 30AA-123 ✅
 * 
 * Invalid examples:
 * - 29A12345 ❌ (missing hyphen)
 * - 29a-12345 ❌ (lowercase letter)
 * - 291A-12345 ❌ (3 digits at start)
 */
export const validateLicensePlate = (licensePlate: string): { isValid: boolean; error?: string } => {
  // License plate is optional, so empty is valid
  if (!licensePlate || licensePlate.trim() === '') {
    return { isValid: true };
  }

  // Remove all spaces
  const cleanPlate = licensePlate.replace(/\s/g, '').toUpperCase();

  // Check Vietnamese license plate format: ^[0-9]{2}[A-Z]{1,2}-[0-9]{3,5}$
  const plateRegex = /^[0-9]{2}[A-Z]{1,2}-[0-9]{3,5}$/;
  if (!plateRegex.test(cleanPlate)) {
    if (!/^[0-9]{2}/.test(cleanPlate)) {
      return { isValid: false, error: 'Biển số xe phải bắt đầu bằng 2 chữ số (VD: 29A-12345)' };
    }
    if (!cleanPlate.includes('-')) {
      return { isValid: false, error: 'Biển số xe phải có dấu gạch ngang (VD: 29A-12345)' };
    }
    if (!/[A-Z]{1,2}/.test(cleanPlate.substring(2, 5))) {
      return { isValid: false, error: 'Biển số xe phải có 1-2 chữ cái in hoa sau 2 chữ số (VD: 29A-12345)' };
    }
    return { isValid: false, error: 'Biển số xe không đúng định dạng (VD: 29A-12345)' };
  }

  return { isValid: true };
};

/**
 * Validates name field
 */
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Họ và tên không được để trống' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Họ và tên phải có ít nhất 2 ký tự' };
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: 'Họ và tên không được quá 100 ký tự' };
  }

  return { isValid: true };
};

/**
 * Format phone number for display (add spaces for readability)
 * Example: "0909123456" -> "0909 123 456"
 */
export const formatPhoneDisplay = (phone: string): string => {
  const cleanPhone = phone.replace(/\s/g, '');
  if (cleanPhone.length === 10) {
    return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
  }
  if (cleanPhone.length === 11) {
    return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
  }
  return phone;
};

/**
 * Clean phone number (remove all spaces)
 * Example: "0909 123 456" -> "0909123456"
 */
export const cleanPhone = (phone: string): string => {
  return phone.replace(/\s/g, '');
};

/**
 * Format and clean license plate
 * Example: "29a 12345" -> "29A-12345"
 */
export const formatLicensePlate = (plate: string): string => {
  return plate.replace(/\s/g, '').toUpperCase();
};

