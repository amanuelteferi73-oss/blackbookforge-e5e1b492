 // In-App Notification Scheduler for FORGE
 // Primary scheduling mechanism that works without service worker
 
 import { DISCIPLINE_RULES } from './disciplineRules';
 
 // State
 let hourlyInterval: number | null = null;
 let checkInInterval: number | null = null;
 let isSchedulerRunning = false;
 
 // Get random discipline rule
 function getRandomRule() {
   const index = Math.floor(Math.random() * DISCIPLINE_RULES.length);
   return DISCIPLINE_RULES[index];
 }
 
 // Calculate milliseconds until next hour
 function getMillisUntilNextHour(): number {
   const now = new Date();
   const nextHour = new Date(now);
   nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
   return nextHour.getTime() - now.getTime();
 }
 
 // Calculate hours until midnight UTC
 function getHoursUntilMidnightUTC(): number {
   const now = new Date();
   const midnight = new Date(now);
   midnight.setUTCHours(24, 0, 0, 0);
   return (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);
 }
 
 // Show a notification using the Notification API directly
 async function showNotification(title: string, options: NotificationOptions): Promise<void> {
   if (Notification.permission !== 'granted') {
     console.log('[SCHEDULER] Cannot show notification - permission not granted');
     return;
   }
 
   try {
     // Try service worker first if available
     if ('serviceWorker' in navigator) {
       const registration = await navigator.serviceWorker.getRegistration();
       if (registration) {
         await registration.showNotification(title, options);
         console.log('[SCHEDULER] Notification shown via service worker');
         return;
       }
     }
     
     // Fallback to direct Notification API
     new Notification(title, options);
     console.log('[SCHEDULER] Notification shown via Notification API');
   } catch (error) {
     console.error('[SCHEDULER] Error showing notification:', error);
     // Last resort fallback
     try {
       new Notification(title, options);
     } catch (e) {
       console.error('[SCHEDULER] Fallback notification also failed:', e);
     }
   }
 }
 
 // Extended notification options (some properties aren't in TS types but are supported)
 interface ExtendedNotificationOptions extends NotificationOptions {
   renotify?: boolean;
   vibrate?: number[];
 }
 
 // Show check-in deadline notification
 async function showCheckInReminder(hoursLeft: number): Promise<void> {
   const isUrgent = hoursLeft <= 1;
   const title = isUrgent ? '🔴 URGENT: CHECK-IN DEADLINE' : '⏰ CHECK-IN REMINDER';
   const body = isUrgent 
     ? `Only ${Math.round(hoursLeft)} HOUR remaining! Complete your check-in NOW or face automatic failure.`
     : `You have ${Math.round(hoursLeft)} HOURS remaining. Complete your check-in before midnight.`;
   
   const options: ExtendedNotificationOptions = {
     body,
     icon: '/favicon.png',
     badge: '/favicon.png',
     tag: 'checkin-reminder',
     renotify: true,
     requireInteraction: isUrgent,
     vibrate: isUrgent ? [200, 100, 200, 100, 200] : [200, 100, 200],
   };
   
   await showNotification(title, options as NotificationOptions);
 }
 
 // Show discipline rule notification
 async function showDisciplineReminder(): Promise<void> {
   const rule = getRandomRule();
   
   const options: ExtendedNotificationOptions = {
     body: `${rule.title}\n\nRemember who you are becoming.`,
     icon: '/favicon.png',
     badge: '/favicon.png',
     tag: 'discipline-reminder',
     renotify: true,
     silent: false,
     vibrate: [100, 50, 100],
   };
   
   await showNotification(`🔥 RULE #${rule.id}`, options as NotificationOptions);
 }
 
 // Track last notification times to prevent duplicates
 let lastCheckInHour: number | null = null;
 let lastDisciplineHour: number | null = null;
 
 // Check and send check-in reminders
 async function checkAndNotifyCheckIn(): Promise<void> {
   const hoursLeft = getHoursUntilMidnightUTC();
   const currentHour = Math.floor(hoursLeft);
   
   // Only notify at 3h, 2h, 1h marks (and prevent duplicate for same hour)
   if ((currentHour === 3 || currentHour === 2 || currentHour === 1) && lastCheckInHour !== currentHour) {
     console.log(`[SCHEDULER] Check-in reminder: ${currentHour} hours left`);
     await showCheckInReminder(hoursLeft);
     lastCheckInHour = currentHour;
   }
 }
 
 // Start the notification scheduler
 export function startScheduler(): void {
   if (isSchedulerRunning) {
     console.log('[SCHEDULER] Already running');
     return;
   }
 
   if (Notification.permission !== 'granted') {
     console.log('[SCHEDULER] Cannot start - notification permission not granted');
     return;
   }
 
   console.log('[SCHEDULER] Starting notification scheduler');
   isSchedulerRunning = true;
 
   // Clear any existing intervals
   if (hourlyInterval) clearInterval(hourlyInterval);
   if (checkInInterval) clearInterval(checkInInterval);
 
   // Schedule hourly discipline reminders
   const msUntilNextHour = getMillisUntilNextHour();
   console.log(`[SCHEDULER] Next discipline reminder in ${Math.round(msUntilNextHour / 60000)} minutes`);
   
   // First reminder at the next hour
   setTimeout(() => {
     const currentHour = new Date().getHours();
     if (lastDisciplineHour !== currentHour) {
       showDisciplineReminder();
       lastDisciplineHour = currentHour;
     }
     
     // Then every hour after that
     hourlyInterval = window.setInterval(() => {
       const hour = new Date().getHours();
       if (lastDisciplineHour !== hour) {
         showDisciplineReminder();
         lastDisciplineHour = hour;
       }
     }, 60 * 60 * 1000); // Every hour
   }, msUntilNextHour);
 
   // Check for check-in reminders every minute
   checkInInterval = window.setInterval(() => {
     checkAndNotifyCheckIn();
   }, 60 * 1000); // Every minute
 
   // Also check immediately
   checkAndNotifyCheckIn();
   
   // Listen for visibility changes to ensure scheduler stays active
   document.addEventListener('visibilitychange', handleVisibilityChange);
   
   console.log('[SCHEDULER] Notification scheduler started successfully');
 }
 
 // Handle visibility changes
 function handleVisibilityChange(): void {
   if (document.visibilityState === 'visible' && isSchedulerRunning) {
     console.log('[SCHEDULER] Tab visible - checking notifications');
     checkAndNotifyCheckIn();
   }
 }
 
 // Stop the scheduler
 export function stopScheduler(): void {
   console.log('[SCHEDULER] Stopping notification scheduler');
   
   if (hourlyInterval) {
     clearInterval(hourlyInterval);
     hourlyInterval = null;
   }
   if (checkInInterval) {
     clearInterval(checkInInterval);
     checkInInterval = null;
   }
   
   document.removeEventListener('visibilitychange', handleVisibilityChange);
   isSchedulerRunning = false;
   lastCheckInHour = null;
   lastDisciplineHour = null;
 }
 
 // Check if scheduler is running
 export function isSchedulerActive(): boolean {
   return isSchedulerRunning;
 }
 
 // Manually trigger notifications for testing
 export async function testCheckInNotification(hoursLeft: number = 2): Promise<void> {
   await showCheckInReminder(hoursLeft);
 }
 
 export async function testDisciplineNotification(): Promise<void> {
   await showDisciplineReminder();
 }