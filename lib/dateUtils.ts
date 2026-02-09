import { UI_TIMING } from './constants';

export function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
}

export function isPastDay(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

export function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / UI_TIMING.MS_PER_MINUTE);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ayer';
  return `hace ${days}d`;
}

export function formatDuration(startTime?: number, endTime?: number): string {
  if (!startTime || !endTime) return '--';
  const minutes = Math.round((endTime - startTime) / UI_TIMING.MS_PER_MINUTE);
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

export function formatDateEs(dateStr?: string, startTime?: number): string {
  const ts = dateStr ? new Date(dateStr) : startTime ? new Date(startTime) : null;
  if (!ts) return '--';
  return ts.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
