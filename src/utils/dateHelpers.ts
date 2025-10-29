// src/utils/dateHelpers.ts
// Date helper functions for consistent date formatting

/**
 * Get current date in dd/mm/yyyy format
 */
export const getCurrentDate = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Get date after specified number of days in dd/mm/yyyy format
 */
export const getDateAfterDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Convert dd/mm/yyyy to yyyy-mm-dd format for API
 */
export const formatDateForAPI = (dateStr: string): string => {
  if (!dateStr || dateStr === '11/11/1111') {
    return new Date().toISOString().split('T')[0];
  }
  const [d, m, y] = dateStr.split('/').map(Number);
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

/**
 * Check if date string is valid
 */
export const isValidDate = (dateStr: string): boolean => {
  if (!dateStr || dateStr === '11/11/1111') return false;
  const [d, m, y] = dateStr.split('/').map(Number);
  if (!d || !m || !y) return false;
  const date = new Date(y, m - 1, d);
  return date.getDate() === d && date.getMonth() === m - 1 && date.getFullYear() === y;
};

