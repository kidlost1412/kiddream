/**
 * Date utility functions to handle timezone-safe date operations
 * Fixes the common issue where YYYY-MM-DD strings are parsed as UTC
 * but displayed in local timezone, causing date shifts
 */

/**
 * Parse a YYYY-MM-DD date string in local timezone
 * This prevents the timezone shift bug where dates jump to adjacent days
 *
 * @example
 * parseLocalDate('2025-10-30') // Returns Date object for Oct 30 in local timezone
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format Date object to YYYY-MM-DD string in local timezone
 *
 * @example
 * formatLocalDate(new Date(2025, 9, 30)) // Returns '2025-10-30'
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format Date to localized string
 *
 * @example
 * formatLocalizedDate('2025-10-30', 'vi-VN')
 * // Returns "Thứ Bảy, 30 tháng 10, 2025"
 */
export function formatLocalizedDate(
  dateString: string,
  locale: string = 'vi-VN',
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(locale, options);
}

/**
 * Check if two date strings represent the same day
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Check if date string is today
 */
export function isToday(dateString: string): boolean {
  const today = formatLocalDate(new Date());
  return dateString === today;
}

/**
 * Get date N days from given date
 */
export function addDays(dateString: string, days: number): string {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

/**
 * Parse time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to HH:MM string
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Get current date as YYYY-MM-DD string
 */
export function getToday(): string {
  return formatLocalDate(new Date());
}

/**
 * Get day name for date string
 */
export function getDayName(dateString: string, locale: string = 'vi-VN'): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(locale, { weekday: 'short' });
}

/**
 * Get day of month number
 */
export function getDayNumber(dateString: string): number {
  const date = parseLocalDate(dateString);
  return date.getDate();
}
