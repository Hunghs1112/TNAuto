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

/**
 * Format seconds to days and hours
 * @param seconds - Number of seconds
 * @returns Formatted string like "2 ngày 5 giờ" or "3 giờ" or "30 phút"
 */
export const formatSecondsToDaysHours = (seconds: number | string | undefined): string => {
  if (!seconds) return 'Chưa xác định';
  
  const totalSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
  if (isNaN(totalSeconds) || totalSeconds < 0) return 'Chưa xác định';
  
  const days = Math.floor(totalSeconds / 86400); // 86400 seconds = 1 day
  const hours = Math.floor((totalSeconds % 86400) / 3600); // 3600 seconds = 1 hour
  const minutes = Math.floor((totalSeconds % 3600) / 60); // 60 seconds = 1 minute
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} ngày`);
  }
  
  if (hours > 0) {
    parts.push(`${hours} giờ`);
  }
  
  // Only show minutes if there are no days and hours, or if it's less than 1 hour
  if (minutes > 0 && days === 0 && hours === 0) {
    parts.push(`${minutes} phút`);
  }
  
  return parts.length > 0 ? parts.join(' ') : 'Chưa xác định';
};

/**
 * Convert seconds to months (for warranty_period)
 * @param seconds - Number of seconds
 * @returns Number of months (rounded)
 */
export const secondsToMonths = (seconds: number): number => {
  const secondsPerMonth = 30 * 24 * 3600; // 2,592,000 seconds = 1 month (30 days)
  return Math.round(seconds / secondsPerMonth);
};

const TIME_BACKEND_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

/**
 * Format an HH:mm or HH:mm:ss time string for display.
 * Returns null when the value is missing or malformed so the UI can decide
 * whether to show the date only, the time only, or hide the field entirely.
 */
export const formatTimeForDisplay = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!TIME_BACKEND_REGEX.test(trimmed)) return null;
  return trimmed.slice(0, 5); // HH:mm
};

/**
 * Convert user's HH:mm input to backend HH:mm:ss, or null when empty.
 * Throws on invalid input so callers can surface validation errors.
 */
export const formatTimeForAPI = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) {
    throw new Error('invalid_time');
  }
  return `${trimmed}:00`;
};

/**
 * Validate HH:mm input. Empty string is considered valid (treated as null).
 */
export const isValidTime = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed);
};

/**
 * Combine a date (dd/mm/yyyy or yyyy-mm-dd) and an HH:mm:ss time for
 * display. Returns null-like value ('') when either part is missing so
 * the UI can render a single coherent string.
 */
export const formatDateTimeForDisplay = (
  date?: string | null,
  time?: string | null,
): string => {
  const formattedDate = (() => {
    if (!date) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [y, m, d] = date.split('-');
      return `${d}/${m}/${y}`;
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    const dd = String(parsed.getDate()).padStart(2, '0');
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  })();

  const formattedTime = formatTimeForDisplay(time);

  if (formattedDate && formattedTime) return `${formattedDate} ${formattedTime}`;
  if (formattedDate) return formattedDate;
  if (formattedTime) return formattedTime;
  return '';
};

/**
 * Calculate receive date from delivery date and estimated time
 * @param deliveryDateStr - Delivery date in dd/mm/yyyy format
 * @param estimatedTimeSeconds - Estimated time in seconds (from database)
 * @returns Receive date in dd/mm/yyyy format
 */
export const calculateReceiveDate = (deliveryDateStr: string, estimatedTimeSeconds: number | undefined): string => {
  if (!deliveryDateStr || !estimatedTimeSeconds || estimatedTimeSeconds <= 0) {
    return getDateAfterDays(7); // Default to 7 days if invalid
  }

  // Parse delivery date
  const [d, m, y] = deliveryDateStr.split('/').map(Number);
  if (!d || !m || !y) {
    return getDateAfterDays(7);
  }

  // Create date object
  const deliveryDate = new Date(y, m - 1, d);
  
  // Convert seconds to days and hours
  // 86400 seconds = 1 day (24 hours * 60 minutes * 60 seconds)
  const totalSeconds = estimatedTimeSeconds;
  const days = Math.floor(totalSeconds / 86400);
  const remainingSeconds = totalSeconds % 86400;
  const hours = Math.floor(remainingSeconds / 3600);
  
  // Calculate days to add:
  // - If there are full days, add those days
  // - If there are remaining hours (even 1 hour), add 1 more day
  // - If less than 1 day total, add 1 day minimum
  let daysToAdd = days;
  if (hours > 0 || days === 0) {
    daysToAdd += 1; // Add 1 more day if there are remaining hours or if less than 1 day
  }
  
  // Ensure at least 1 day
  daysToAdd = Math.max(1, daysToAdd);
  
  // Add days to delivery date
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  
  // Format result
  const day = String(deliveryDate.getDate()).padStart(2, '0');
  const month = String(deliveryDate.getMonth() + 1).padStart(2, '0');
  const year = deliveryDate.getFullYear();
  
  return `${day}/${month}/${year}`;
};

