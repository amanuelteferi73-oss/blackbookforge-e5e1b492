// FORGE Service Worker - Handles background notifications
const CACHE_NAME = 'forge-v1';

// Discipline rules for hourly reminders
const DISCIPLINE_RULES = [
  { id: 1, title: "Pick the hardest build, learn and do" },
  { id: 2, title: "Feel the pain all the way - this is what can make you who you wanna be" },
  { id: 3, title: "I don't see the reason you are f*cking giving up, there is no option" },
  { id: 4, title: "We can have it all - pick them wisely and show me just doing it" },
  { id: 5, title: "This time crushing it not small task" },
  { id: 6, title: "Order is our schema - ain't we got it after 6 we are still here not there" },
  { id: 7, title: "You need consistence ain't fuel" },
  { id: 8, title: "Everything is gonna be your fault - not even a single complain of country or situation" },
  { id: 9, title: "Private success lead to victory not vice versa" },
  { id: 10, title: "This is just start not the end" },
  { id: 11, title: "World won't go anywhere unless we stayed tune - so do it, don't wanna see you sleeping" },
  { id: 12, title: "Follow one niche this time - I don't see any reason it is gonna fail" },
  { id: 13, title: "Have a fuel you can put on fire which is the agent we are building" },
  { id: 14, title: "Don't spend your time with taker not giver" },
  { id: 15, title: "For the responsibility problem we are gonna blame anyone" },
  { id: 16, title: "Don't be a f*cking prisoner to any of them - enjoy doing them" },
  { id: 17, title: "Don't compare yourself with others - you do it with yourself" },
  { id: 18, title: "Always we are positive even in ocean" },
  { id: 19, title: "Protect your mind not only growing it" },
  { id: 20, title: "Control what you can if what you can't" },
  { id: 21, title: "Speeeeeeeeeeeeeed - we are robot ok, not human anymore" },
  { id: 22, title: "Ignore what others think about you" },
  { id: 23, title: "We are always ambitious to listen that car sound, to live there, to make them shout their mouth" },
  { id: 24, title: "Prioritize your health" },
  { id: 25, title: "Keep your promise to be Elon Musk and Masayoshi Son" },
  { id: 26, title: "Thanks to our situation - not enjoyment for us yet even if we are young" },
  { id: 27, title: "Fail is a f*cking master - you will call it soon a legendary" },
  { id: 28, title: "Winners don't quit, quitters never win" },
  { id: 29, title: "We are not rich yet - don't give even a single penny" },
  { id: 30, title: "Don't f*cking fear money - cause if it can make you broke it can make you rich too" },
  { id: 31, title: "One victory covers all the failure" },
  { id: 32, title: "Money is the tool not the goal" },
  { id: 33, title: "Your network is your networth" },
  { id: 34, title: "If dad ain't drop it so who can you call yourself?" },
  { id: 35, title: "Build the system then you will see how it matter" },
  { id: 36, title: "Next stop will be on billions not even millions" },
  { id: 37, title: "Luck is when preparation meets opportunity so don't wait for it - show me who you are" },
];

// Get random discipline rule
function getRandomRule() {
  const index = Math.floor(Math.random() * DISCIPLINE_RULES.length);
  return DISCIPLINE_RULES[index];
}

// Calculate time until next hour
function getMillisUntilNextHour() {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return nextHour.getTime() - now.getTime();
}

// Calculate hours until midnight UTC
function getHoursUntilMidnightUTC() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);
}

// Show check-in deadline notification (only if permission granted)
async function showCheckInReminder(hoursLeft) {
  // Check permission first
  if (!self.registration || Notification.permission !== 'granted') {
    console.log('[SW] Cannot show notification - permission not granted');
    return;
  }
  
  const isUrgent = hoursLeft <= 1;
  const title = isUrgent ? '🔴 URGENT: CHECK-IN DEADLINE' : '⏰ CHECK-IN REMINDER';
  const body = isUrgent 
    ? `Only ${hoursLeft} HOUR remaining! Complete your check-in NOW or face automatic failure.`
    : `You have ${hoursLeft} HOURS remaining. Complete your check-in before midnight.`;
  
  return self.registration.showNotification(title, {
    body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'checkin-reminder',
    renotify: true,
    requireInteraction: isUrgent,
    vibrate: isUrgent ? [200, 100, 200, 100, 200] : [200, 100, 200],
    data: {
      type: 'checkin',
      url: '/check-in'
    }
  });
}

// Show discipline rule notification (only if permission granted)
async function showDisciplineReminder() {
  // Check permission first
  if (!self.registration || Notification.permission !== 'granted') {
    console.log('[SW] Cannot show notification - permission not granted');
    return;
  }
  
  const rule = getRandomRule();
  
  return self.registration.showNotification(`🔥 RULE #${rule.id}`, {
    body: `${rule.title}\n\nRemember who you are becoming.`,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'discipline-reminder',
    renotify: true,
    silent: false,
    vibrate: [100, 50, 100],
    data: {
      type: 'discipline',
      ruleId: rule.id,
      url: '/'
    }
  });
}

// Check and schedule notifications
async function checkAndNotify() {
  const hoursLeft = getHoursUntilMidnightUTC();
  
  // Check-in reminders at 3h, 2h, 1h before midnight
  if (hoursLeft <= 3 && hoursLeft > 2.9) {
    await showCheckInReminder(3);
  } else if (hoursLeft <= 2 && hoursLeft > 1.9) {
    await showCheckInReminder(2);
  } else if (hoursLeft <= 1 && hoursLeft > 0.9) {
    await showCheckInReminder(1);
  }
}

// Service Worker Install
self.addEventListener('install', (event) => {
  console.log('[SW] Installing FORGE Service Worker');
  self.skipWaiting();
});

// Service Worker Activate
self.addEventListener('activate', (event) => {
  console.log('[SW] FORGE Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push events (for future server-push capability)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  if (event.data) {
    const data = event.data.json();
    
    if (data.type === 'checkin') {
      event.waitUntil(showCheckInReminder(data.hoursLeft || 1));
    } else if (data.type === 'discipline') {
      event.waitUntil(showDisciplineReminder());
    }
  }
});

// Handle periodic sync for background notifications
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'forge-hourly-discipline') {
    event.waitUntil(showDisciplineReminder());
  } else if (event.tag === 'forge-checkin-check') {
    event.waitUntil(checkAndNotify());
  }
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'TEST_CHECKIN') {
    event.waitUntil(showCheckInReminder(event.data.hours || 2));
  } else if (event.data.type === 'TEST_DISCIPLINE') {
    event.waitUntil(showDisciplineReminder());
  } else if (event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    // Start the notification scheduling
    scheduleNotifications();
  }
});

// Schedule notifications using setTimeout (fallback for devices without periodic sync)
let hourlyInterval = null;
let checkInInterval = null;

function scheduleNotifications() {
  // Clear existing intervals
  if (hourlyInterval) clearInterval(hourlyInterval);
  if (checkInInterval) clearInterval(checkInInterval);
  
  // Schedule hourly discipline reminders
  const msUntilNextHour = getMillisUntilNextHour();
  
  setTimeout(() => {
    showDisciplineReminder();
    // Then every hour after that
    hourlyInterval = setInterval(() => {
      showDisciplineReminder();
    }, 60 * 60 * 1000);
  }, msUntilNextHour);
  
  // Check for check-in reminders every 5 minutes
  checkInInterval = setInterval(() => {
    checkAndNotify();
  }, 5 * 60 * 1000);
  
  // Also check immediately
  checkAndNotify();
  
  console.log('[SW] Notifications scheduled. Next hourly reminder in', Math.round(msUntilNextHour / 60000), 'minutes');
}
