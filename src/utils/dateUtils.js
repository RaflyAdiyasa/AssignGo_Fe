// src/utils/dateUtils.js

/**
 * Format date to display format (DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format date and time to display format (DD/MM/YYYY HH:mm)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date time string
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date time:', error);
    return '-';
  }
};

/**
 * Format date and time with seconds to display format (DD/MM/YYYY HH:mm:ss)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date time string with seconds
 */
export const formatDateTimeWithSeconds = (date) => {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting date time with seconds:', error);
    return '-';
  }
};

/**
 * Get relative time from now (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - Date to get relative time for
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    
    if (diffInSeconds < 60) {
      return diffInSeconds <= 1 ? 'baru saja' : `${diffInSeconds} detik lalu`;
    } else if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1 menit lalu' : `${diffInMinutes} menit lalu`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 jam lalu' : `${diffInHours} jam lalu`;
    } else if (diffInDays < 7) {
      return diffInDays === 1 ? '1 hari lalu' : `${diffInDays} hari lalu`;
    } else if (diffInWeeks < 4) {
      return diffInWeeks === 1 ? '1 minggu lalu' : `${diffInWeeks} minggu lalu`;
    } else if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 bulan lalu' : `${diffInMonths} bulan lalu`;
    } else {
      return diffInYears === 1 ? '1 tahun lalu' : `${diffInYears} tahun lalu`;
    }
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '-';
  }
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} ISO date string
 */
export const formatDateToISO = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date to ISO:', error);
    return '';
  }
};

/**
 * Format date to database format (YYYY-MM-DD HH:mm:ss)
 * @param {string|Date} date - Date to format
 * @returns {string} Database format date string
 */
export const formatDateForDatabase = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting date for database:', error);
    return '';
  }
};

/**
 * Parse date from various formats
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Try ISO format first
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try DD/MM/YYYY format
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        
        date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // Try DD-MM-YYYY format
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // Check if it's DD-MM-YYYY or YYYY-MM-DD
        const firstPart = parseInt(parts[0], 10);
        const lastPart = parseInt(parts[2], 10);
        
        if (firstPart > 31 || lastPart < 100) {
          // YYYY-MM-DD format
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          
          date = new Date(year, month, day);
        } else {
          // DD-MM-YYYY format
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          
          date = new Date(year, month, day);
        }
        
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Check if a date is valid
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if date is valid
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  try {
    const d = date instanceof Date ? date : new Date(date);
    return !isNaN(d.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Get start of day for a date
 * @param {string|Date} date - Date
 * @returns {Date} Start of day
 */
export const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day for a date
 * @param {string|Date} date - Date
 * @returns {Date} End of day
 */
export const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Add days to a date
 * @param {string|Date} date - Date
 * @param {number} days - Number of days to add
 * @returns {Date} New date with added days
 */
export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Subtract days from a date
 * @param {string|Date} date - Date
 * @param {number} days - Number of days to subtract
 * @returns {Date} New date with subtracted days
 */
export const subtractDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
};

/**
 * Get difference in days between two dates
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} Difference in days
 */
export const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const d = new Date(date);
  
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

/**
 * Check if date is yesterday
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = (date) => {
  const yesterday = subtractDays(new Date(), 1);
  const d = new Date(date);
  
  return d.getDate() === yesterday.getDate() &&
         d.getMonth() === yesterday.getMonth() &&
         d.getFullYear() === yesterday.getFullYear();
};

/**
 * Get month name in Indonesian
 * @param {number} month - Month number (0-11)
 * @returns {string} Month name in Indonesian
 */
export const getMonthName = (month) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return months[month] || '';
};

/**
 * Get day name in Indonesian
 * @param {number} day - Day number (0-6, Sunday = 0)
 * @returns {string} Day name in Indonesian
 */
export const getDayName = (day) => {
  const days = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];
  
  return days[day] || '';
};

/**
 * Format date with Indonesian month and day names
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date with Indonesian names
 */
export const formatDateIndonesian = (date) => {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const dayName = getDayName(d.getDay());
    const day = d.getDate();
    const monthName = getMonthName(d.getMonth());
    const year = d.getFullYear();
    
    return `${dayName}, ${day} ${monthName} ${year}`;
  } catch (error) {
    console.error('Error formatting date in Indonesian:', error);
    return '-';
  }
};

// Export all functions as default object
export default {
  formatDate,
  formatDateTime,
  formatDateTimeWithSeconds,
  getRelativeTime,
  formatDateToISO,
  formatDateForDatabase,
  parseDate,
  isValidDate,
  getStartOfDay,
  getEndOfDay,
  addDays,
  subtractDays,
  getDaysDifference,
  isToday,
  isYesterday,
  getMonthName,
  getDayName,
  formatDateIndonesian
};