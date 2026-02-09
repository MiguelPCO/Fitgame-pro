/**
 * Navigation routes for the application
 */
export const ROUTES = {
  DASHBOARD: 'dashboard',
  WORKOUT: 'workout',
  TEMPLATES: 'templates',
  TEMPLATE_EDITOR: 'template-editor',
  EXERCISES: 'exercises',
  PROGRESS: 'progress',
  ONBOARDING: 'onboarding',
  SUMMARY: 'summary',
  SCHEDULE: 'schedule',
  HISTORY: 'history',
  SETTINGS: 'settings',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * XP reward constants
 */
export const XP = {
  PER_SET: 5,
  BONUS_RPE_9_PLUS: 10,
  BONUS_PR: 25,
  BONUS_FULL_COMPLETION: 30,
  REST_DAY: 5,
} as const;

/**
 * LocalStorage keys for persistence
 */
export const STORAGE_KEYS = {
  USER: 'fitgame_user',
  TEMPLATES: 'fitgame_templates',
  ACTIVE_WORKOUT: 'fitgame_activeWorkout',
  HISTORY: 'fitgame_history',
  LAST_SESSION: 'fitgame_lastSession',
  SESSION: 'fitgame_session',
  SCHEDULE: 'fitgame_schedule',
  OFFLINE_QUEUE: 'fitgame_offlineQueue',
} as const;

/**
 * Default rest timer duration in seconds
 */
export const DEFAULT_REST_TIMER = 90;

/**
 * Default set configuration
 */
export const DEFAULT_SET_CONFIG = {
  targetReps: '8-12',
  targetRPE: 8,
  restTimer: 120,
} as const;

/**
 * UI timing constants (milliseconds)
 */
export const UI_TIMING = {
  XP_POPUP_TIMEOUT: 1800,
  MS_PER_MINUTE: 60000,
} as const;

/**
 * Default user fallbacks
 */
export const USER_DEFAULTS = {
  NAME: 'Guest User',
  LEVEL: 1,
  TIER: 'Novice' as const,
} as const;
