/**
 * Utility function for conditionally joining class names.
 * Supports nested arrays: cn('base', condition && ['a', 'b'])
 */
type ClassValue = string | undefined | false | null | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  return (classes as unknown[]).flat(Infinity).filter(Boolean).join(' ');
}

/**
 * Format seconds into a time string (MM:SS or H:MM:SS)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hours = Math.floor(mins / 60);

  if (hours > 0) {
    return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
