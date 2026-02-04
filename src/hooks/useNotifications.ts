import { useState, useEffect, useCallback } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  startNotificationScheduling,
  showCheckInNotification,
  showDisciplineNotification,
  getNotificationSettings,
  saveNotificationSettings,
  NotificationSettings
} from '@/lib/notificationService';

export interface UseNotificationsReturn {
  // State
  isSupported: boolean;
  permission: NotificationPermission;
  isEnabled: boolean;
  isLoading: boolean;
  settings: NotificationSettings;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => void;
  testCheckInNotification: (hours?: number) => Promise<void>;
  testDisciplineNotification: () => Promise<void>;
  updateSettings: (updates: Partial<NotificationSettings>) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const supported = isNotificationSupported();
      setIsSupported(supported);
      
      if (supported) {
        setPermission(getNotificationPermission());
        
        // Register service worker
        const registration = await registerServiceWorker();
        setSwRegistration(registration);
        
        // If notifications were previously enabled, restart scheduling
        const storedSettings = getNotificationSettings();
        if (storedSettings.enabled && Notification.permission === 'granted' && registration) {
          await startNotificationScheduling();
        }
      }
      
      setIsLoading(false);
    };
    
    init();
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    setIsLoading(true);
    const result = await requestNotificationPermission();
    setPermission(result);
    setIsLoading(false);
    
    return result === 'granted';
  }, [isSupported]);

  // Enable notifications (request permission + start scheduling)
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    setIsLoading(true);
    
    // Request permission if needed
    let currentPermission = getNotificationPermission();
    if (currentPermission !== 'granted') {
      currentPermission = await requestNotificationPermission();
      setPermission(currentPermission);
    }
    
    if (currentPermission !== 'granted') {
      setIsLoading(false);
      return false;
    }
    
    // Ensure service worker is registered
    let registration = swRegistration;
    if (!registration) {
      registration = await registerServiceWorker();
      setSwRegistration(registration);
    }
    
    if (!registration) {
      setIsLoading(false);
      return false;
    }
    
    // Start scheduling notifications
    await startNotificationScheduling();
    
    // Update settings
    const newSettings: NotificationSettings = {
      ...settings,
      enabled: true,
      lastScheduledAt: new Date().toISOString()
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    
    setIsLoading(false);
    return true;
  }, [isSupported, swRegistration, settings]);

  // Disable notifications
  const disableNotifications = useCallback(() => {
    const newSettings: NotificationSettings = {
      ...settings,
      enabled: false
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  }, [settings]);

  // Test check-in notification
  const testCheckInNotification = useCallback(async (hours: number = 2) => {
    if (!isSupported || permission !== 'granted') return;
    await showCheckInNotification(hours);
  }, [isSupported, permission]);

  // Test discipline notification
  const testDisciplineNotification = useCallback(async () => {
    if (!isSupported || permission !== 'granted') return;
    await showDisciplineNotification();
  }, [isSupported, permission]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  }, [settings]);

  return {
    isSupported,
    permission,
    isEnabled: settings.enabled && permission === 'granted',
    isLoading,
    settings,
    requestPermission,
    enableNotifications,
    disableNotifications,
    testCheckInNotification,
    testDisciplineNotification,
    updateSettings
  };
}
