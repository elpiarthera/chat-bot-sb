import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string into a human-readable format
 * @param dateString The date string to format
 * @param includeTime Whether to include the time in the formatted date
 * @returns The formatted date string
 */
export function formatDate(dateString: string, includeTime: boolean = true): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // For recent dates (within the last 7 days), show relative time
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // For older dates, show the actual date
    return includeTime 
      ? format(date, 'MMM d, yyyy h:mm a')
      : format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}