/**
 * Utility functions for formatting numbers and values throughout the application
 */

/**
 * Format a number with commas for thousands separators
 * @param value Number or string to format
 * @returns Formatted string with commas (e.g. 1,000,000)
 */
export function formatNumberWithCommas(value: number | string): string {
  if (typeof value === 'string') {
    // Remove existing commas
    value = value.replace(/,/g, '');
    
    // If it's not a valid number, return empty string
    if (value === '' || isNaN(parseFloat(value))) return '';
    
    // Convert to number
    value = parseFloat(value);
  }
  
  // Format with commas
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Parse a string value that may contain commas into a number
 * @param value String value with potential commas
 * @returns Parsed number or undefined if invalid
 */
export function parseFormattedNumber(value: string): number | undefined {
  if (!value) return undefined;
  
  // Remove commas
  const cleanValue = value.replace(/,/g, '');
  
  // Check if it's a valid number
  if (isNaN(parseFloat(cleanValue))) return undefined;
  
  return parseFloat(cleanValue);
}

/**
 * Format a value as currency (USD)
 * @param value Number to format
 * @returns Formatted string with $ prefix and commas (e.g. $1,000,000)
 */
export function formatCurrency(value: number | string): string {
  // Get the base formatted value
  const formatted = formatNumberWithCommas(value);
  
  // If empty, return empty
  if (!formatted) return '';
  
  // Add dollar sign
  return `$${formatted}`;
}

/**
 * Format a number as a percentage
 * @param value Number to format
 * @returns Formatted string with % suffix (e.g. 75%)
 */
export function formatPercentage(value: number | string): string {
  if (typeof value === 'string') {
    value = value.replace(/,|%/g, '');
    if (value === '' || isNaN(parseFloat(value))) return '';
    value = parseFloat(value);
  }
  
  return `${value}%`;
}