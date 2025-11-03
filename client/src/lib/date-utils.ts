/**
 * Safe date parsing and formatting utilities
 * Prevents "Invalid Date" errors by handling null/undefined values
 */

/**
 * Safely parse a date value to a Date object or null
 * @param value - Any value that might be a date (string, Date, null, undefined)
 * @returns Date object if valid, null otherwise
 */
export function parseSafeDate(value: any): Date | null {
  if (!value) return null;

  try {
    const date = new Date(value);
    // Check if the date is valid
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn('Failed to parse date:', value, error);
    return null;
  }
}

/**
 * Safely format a date value to a localized date string
 * @param value - Any value that might be a date
 * @param fallback - Fallback string to return if date is invalid (default: "-")
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string or fallback
 */
export function formatSafeDate(
  value: any,
  fallback: string = "-",
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseSafeDate(value);
  if (!date) return fallback;

  try {
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.warn('Failed to format date:', value, error);
    return fallback;
  }
}

/**
 * Safely format a date value to a localized date-time string
 * @param value - Any value that might be a date
 * @param fallback - Fallback string to return if date is invalid (default: "-")
 * @returns Formatted date-time string or fallback
 */
export function formatSafeDateTime(
  value: any,
  fallback: string = "-"
): string {
  const date = parseSafeDate(value);
  if (!date) return fallback;

  try {
    return date.toLocaleString();
  } catch (error) {
    console.warn('Failed to format date-time:', value, error);
    return fallback;
  }
}

/**
 * Safely format a date value to ISO string
 * @param value - Any value that might be a date
 * @param fallback - Fallback string to return if date is invalid (default: "")
 * @returns ISO date string or fallback
 */
export function formatSafeISO(
  value: any,
  fallback: string = ""
): string {
  const date = parseSafeDate(value);
  if (!date) return fallback;

  try {
    return date.toISOString();
  } catch (error) {
    console.warn('Failed to format ISO date:', value, error);
    return fallback;
  }
}

/**
 * Check if a value is a valid date
 * @param value - Any value to check
 * @returns True if value is a valid date
 */
export function isValidDate(value: any): boolean {
  return parseSafeDate(value) !== null;
}
