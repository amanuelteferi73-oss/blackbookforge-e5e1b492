// Notification Service for FORGE
// Handles all notification-related logic

import { DISCIPLINE_RULES } from './disciplineRules';
import { supabase } from '@/integrations/supabase/client';

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
    await navigator.serviceWorker.ready;
    console.log('[SW] Service worker is ready');
    
    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

// Convert base64url string to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Get VAPID public key from server
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-notifications?action=vapid-public-key`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    if (!response.ok) {
      console.error('[Push] Failed to get VAPID key, status:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('[Push] Got VAPID public key');
    return data.publicKey || null;
  } catch (error) {
    console.error('[Push] Failed to get VAPID key:', error);
    return null;
  }
}

// Subscribe to web push notifications
export async function subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    // Check if already subscribed
    const reg = registration as any;
    const existingSub = await reg.pushManager.getSubscription();
    if (existingSub) {
      console.log('[Push] Already subscribed, syncing to server');
      await syncSubscriptionToServer(existingSub);
      return existingSub;
    }

    // Get VAPID public key
    const vapidPublicKey = await getVapidPublicKey();
    if (!vapidPublicKey) {
      console.error('[Push] No VAPID public key available');
      return null;
    }

    // Subscribe
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('[Push] Subscribed to push notifications');

    // Store subscription on server
    await syncSubscriptionToServer(subscription);

    return subscription;
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return null;
  }
}

// Sync push subscription to server
async function syncSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('[Push] No session, cannot sync subscription');
      return;
    }

    const subJson = subscription.toJSON();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/push-subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'subscribe',
        subscription: {
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        },
      }),
    });

    const result = await response.json();
    console.log('[Push] Subscription synced to server:', result);
  } catch (error) {
    console.error('[Push] Failed to sync subscription:', error);
  }
}

// Unsubscribe from web push
export async function unsubscribeFromPush(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;

    const subscription = await (registration as any).pushManager.getSubscription();
    if (!subscription) return;

    const { data: { session } } = await supabase.auth.getSession();
    
    // Remove from server
    if (session) {
      const subJson = subscription.toJSON();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/push-subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'unsubscribe',
          subscription: { endpoint: subJson.endpoint },
        }),
      });
      await response.json();
    }

    // Unsubscribe locally
    await subscription.unsubscribe();
    console.log('[Push] Unsubscribed from push notifications');
  } catch (error) {
    console.error('[Push] Failed to unsubscribe:', error);
  }
}

// Get push subscription for the user
export async function getPushSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await (registration as any).pushManager.getSubscription();
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
