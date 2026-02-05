 import { useState, useEffect, useCallback } from 'react';
 import {
   isNotificationSupported,
   getNotificationPermission,
   requestNotificationPermission,
   registerServiceWorker,
   getNotificationSettings,
   saveNotificationSettings,
   NotificationSettings
 } from '@/lib/notificationService';
 import {
   startScheduler,
   stopScheduler,
   testCheckInNotification as testCheckIn,
   testDisciplineNotification as testDiscipline
 } from '@/lib/notificationScheduler';
 
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
         
         // Try to register service worker (may fail in some environments, that's OK)
         const registration = await registerServiceWorker();
         setSwRegistration(registration);
         
         // If notifications were previously enabled, restart the in-app scheduler
         const storedSettings = getNotificationSettings();
         if (storedSettings.enabled && Notification.permission === 'granted') {
           startScheduler();
           console.log('[NOTIFICATIONS] Auto-started scheduler from saved settings');
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
 
   // Enable notifications (request permission + start in-app scheduler)
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
     
     // Try to register service worker (optional, scheduler works without it)
     let registration = swRegistration;
     if (!registration) {
       registration = await registerServiceWorker();
       setSwRegistration(registration);
     }
     
     // Start the in-app scheduler (primary mechanism - doesn't require SW)
     startScheduler();
     console.log('[NOTIFICATIONS] Scheduler started');
     
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
     stopScheduler();
     console.log('[NOTIFICATIONS] Scheduler stopped');
     
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
     await testCheckIn(hours);
   }, [isSupported, permission]);
 
   // Test discipline notification
   const testDisciplineNotification = useCallback(async () => {
     if (!isSupported || permission !== 'granted') return;
     await testDiscipline();
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
