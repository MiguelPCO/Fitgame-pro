import { logger } from './logger';

export interface ReminderSettings {
  enabled: boolean;
  hour: number;   // 0-23
  minute: number; // 0-59
}

const REMINDER_KEY = 'fitgame_reminder';
const LAST_NOTIFIED_KEY = 'fitgame_last_notified';

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    return raw ? JSON.parse(raw) : { enabled: false, hour: 19, minute: 0 };
  } catch {
    return { enabled: false, hour: 19, minute: 0 };
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch (err) {
    logger.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Checks reminder conditions and fires a notification if they are all met:
 *  - Reminders enabled by user
 *  - Permission granted
 *  - Past the configured reminder time
 *  - User hasn't worked out today
 *  - Notification hasn't been sent yet today
 *
 * Sends via the SW (works when tab is minimised) or falls back to the
 * Notification API directly (only works while the page is open).
 *
 * Called on app mount and on each `visibilitychange` event.
 */
export function checkAndSendReminder(hasWorkedOutToday: boolean): void {
  const settings = getReminderSettings();
  if (!settings.enabled) return;
  if (getNotificationPermission() !== 'granted') return;
  if (hasWorkedOutToday) return;

  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(settings.hour, settings.minute, 0, 0);
  if (now < reminderTime) return;

  const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY);
  const today = now.toDateString();
  if (lastNotified === today) return;

  localStorage.setItem(LAST_NOTIFIED_KEY, today);

  const payload = {
    type: 'SHOW_REMINDER',
    title: 'FitGame Pro \ud83d\udcaa',
    body: '\u00a1Es hora de entrenar! Tu sesi\u00f3n de hoy te espera.',
  };

  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage(payload);
  } else {
    // Fallback: direct Notification API (visible only while tab is open)
    try {
      new Notification(payload.title, {
        body: payload.body,
        icon: '/pwa-192x192.png',
      });
    } catch (err) {
      logger.error('Error showing fallback notification:', err);
    }
  }
}
