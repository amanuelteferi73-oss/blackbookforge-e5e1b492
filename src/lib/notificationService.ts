// Notification Service for FORGE
// Handles all notification-related logic

import { DISCIPLINE_RULES } from './disciplineRules';

export interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  serviceWorkerReady: boolean;
}

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Get current notification permission
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Not supported on this device');
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  console.log('[Notifications] Permission result:', permission);
  return permission;
}

// Get a random discipline rule
export function getRandomDisciplineRule() {
  const index = Math.floor(Math.random() * DISCIPLINE_RULES.length);
  return DISCIPLINE_RULES[index];
}

// Calculate hours until midnight UTC
export function getHoursUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);
}

// Show a check-in deadline notification
export async function showCheckInNotification(hoursLeft: number): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  
  if (registration.active) {
    registration.active.postMessage({
      type: 'TEST_CHECKIN',
      hours: hoursLeft
    });
  }
}

// Show a discipline rule notification
export async function showDisciplineNotification(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  
  if (registration.active) {
    registration.active.postMessage({
      type: 'TEST_DISCIPLINE'
    });
  }
}

// Start the notification scheduling in the service worker
export async function startNotificationScheduling(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  
  if (registration.active) {
    registration.active.postMessage({
      type: 'SCHEDULE_NOTIFICATIONS'
    });
    console.log('[Notifications] Scheduling started in service worker');
  }
  
  // Try to register periodic sync (if supported)
  try {
    if ('periodicSync' in registration) {
      // @ts-ignore - periodicSync is not in TS types yet
      await registration.periodicSync.register('forge-hourly-discipline', {
        minInterval: 60 * 60 * 1000 // 1 hour
      });
      // @ts-ignore
      await registration.periodicSync.register('forge-checkin-check', {
        minInterval: 5 * 60 * 1000 // 5 minutes
      });
      console.log('[Notifications] Periodic sync registered');
    }
  } catch (error) {
    console.log('[Notifications] Periodic sync not available, using fallback');
  }
}

// Register the service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service workers not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('[SW] Service worker registered:', registration.scope);
    
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('[SW] Service worker is ready');
    
    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

// Get push subscription for the user
export async function getPushSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('[Push] Error getting subscription:', error);
    return null;
  }
}

// Store notification settings in localStorage
const NOTIFICATION_SETTINGS_KEY = 'forge_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  checkInReminders: boolean;
  disciplineReminders: boolean;
  lastScheduledAt: string | null;
}

export function getNotificationSettings(): NotificationSettings {
  const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to default
    }
  }
  return {
    enabled: false,
    checkInReminders: true,
    disciplineReminders: true,
    lastScheduledAt: null
  };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
}
