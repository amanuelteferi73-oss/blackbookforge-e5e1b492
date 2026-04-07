// FORGE Service Worker v3 - Full Offline Support
const CACHE_NAME = 'forge-v3';
const RUNTIME_CACHE = 'forge-runtime-v3';

// App shell - these get precached on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.webmanifest',
];

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
  { id: 38, title: "3 weeks off means 3x harder now - you owe yourself those days back" },
  { id: 39, title: "Every hour you're not building, someone else is taking YOUR customers" },
  { id: 40, title: "Revenue is the only validation that matters - users paying = you winning" },
  { id: 41, title: "Stop thinking and start shipping - imperfect action beats perfect planning" },
  { id: 42, title: "Your startup dies when YOU stop - it has no other heartbeat" },
  { id: 43, title: "The market doesn't care about your feelings - it rewards execution" },
  { id: 44, title: "You are 1 sale away from proving everything - go get that 1 sale" },
  { id: 45, title: "Outreach is oxygen - 0 emails sent = 0 customers = death" },
  { id: 46, title: "Every 'no' is data, every silence is a chance to follow up harder" },
  { id: 47, title: "If Masayoshi Son could lose $70 billion and come back, you can survive this" },
  { id: 48, title: "Your product solves a real problem - remind yourself WHY you built it" },
  { id: 49, title: "Entrepreneurship is not a mood - it's a system you run daily regardless" },
  { id: 50, title: "You vanished for 3 weeks and the world kept spinning - now spin faster than it" },
  { id: 51, title: "A billion-dollar company starts with a $1 sale - go make that dollar" },
  { id: 52, title: "Comfort is the enemy - the moment you feel comfortable you're falling behind" },
  { id: 53, title: "Your competitors shipped 3 features while you were 'figuring things out'" },
  { id: 54, title: "The gym builds the body that carries a billion-dollar mind - never skip it" },
  { id: 55, title: "You promised yourself THIS would be different - prove it with action not words" },
  { id: 56, title: "Send 100 cold emails today or admit you don't want it bad enough" },
  { id: 57, title: "The comeback is always stronger than the setback - but ONLY if you start NOW" },
  { id: 58, title: "Nobody is coming to save your startup - you are the cavalry" },
  { id: 59, title: "Your 365-day clock is ticking - day wasted = opportunity murdered" },
  { id: 60, title: "Build like you're running out of time because YOU ARE" },
];

function getRandomRule() {
  return DISCIPLINE_RULES[Math.floor(Math.random() * DISCIPLINE_RULES.length)];
}

function getMillisUntilNextHour() {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return nextHour.getTime() - now.getTime();
}

function getHoursUntilMidnightUTC() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);
}

async function showCheckInReminder(hoursLeft) {
  if (!self.registration || Notification.permission !== 'granted') return;
  const isUrgent = hoursLeft <= 1;
  return self.registration.showNotification(
    isUrgent ? '🔴 URGENT: CHECK-IN DEADLINE' : '⏰ CHECK-IN REMINDER',
    {
      body: isUrgent 
        ? `Only ${hoursLeft} HOUR remaining! Complete your check-in NOW or face automatic failure.`
        : `You have ${hoursLeft} HOURS remaining. Complete your check-in before midnight.`,
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: 'checkin-reminder',
      renotify: true,
      requireInteraction: isUrgent,
      vibrate: isUrgent ? [200, 100, 200, 100, 200] : [200, 100, 200],
      data: { type: 'checkin', url: '/check-in' }
    }
  );
}

async function showDisciplineReminder() {
  if (!self.registration || Notification.permission !== 'granted') return;
  const rule = getRandomRule();
  return self.registration.showNotification(`🔥 RULE #${rule.id}`, {
    body: `${rule.title}\n\nRemember who you are becoming.`,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'discipline-reminder',
    renotify: true,
    silent: false,
    vibrate: [100, 50, 100],
    data: { type: 'discipline', ruleId: rule.id, url: '/' }
  });
}

async function checkAndNotify() {
  const hoursLeft = getHoursUntilMidnightUTC();
  if (hoursLeft <= 3 && hoursLeft > 2.9) await showCheckInReminder(3);
  else if (hoursLeft <= 2 && hoursLeft > 1.9) await showCheckInReminder(2);
  else if (hoursLeft <= 1 && hoursLeft > 0.9) await showCheckInReminder(1);
}

// === INSTALL: Precache app shell + skip waiting ===
self.addEventListener('install', (event) => {
  console.log('[SW] Installing FORGE Service Worker v3 - Full Offline');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('[SW] Some precache assets failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// === ACTIVATE: Clean old caches + claim clients ===
self.addEventListener('activate', (event) => {
  console.log('[SW] FORGE Service Worker v3 activated');
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// === FETCH: Aggressive offline strategy ===
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET
  if (event.request.method !== 'GET') return;
  // Skip cross-origin API calls (Supabase REST/Auth)
  if (url.origin !== self.location.origin) return;
  // Skip auth routes
  if (url.pathname.startsWith('/~oauth')) return;

  // NAVIGATION: Network-first, fallback to cached /index.html (SPA)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful navigation responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('/', clone));
          return response;
        })
        .catch(() => {
          // Offline → serve cached index.html for ANY route (SPA)
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // STATIC ASSETS (JS/CSS/fonts/images): Cache-first, then network
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2?|ico|webmanifest)$/) || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) {
          // Return cache immediately, revalidate in background
          fetch(event.request).then(response => {
            if (response.ok) {
              caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, response));
            }
          }).catch(() => {});
          return cached;
        }
        // Not cached → fetch and cache
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          // Return empty response for missing assets when offline
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
    );
    return;
  }
});

// === NOTIFICATION HANDLERS ===
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
    })
  );
});

// Handle push events from server
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      event.waitUntil(self.registration.showNotification(data.title || 'FORGE', {
        body: data.body || '',
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: data.type === 'checkin' ? 'checkin-reminder' : 'discipline-reminder',
        renotify: true,
        requireInteraction: data.type === 'checkin',
        vibrate: data.type === 'checkin' ? [200, 100, 200, 100, 200] : [100, 50, 100],
        data: { type: data.type, url: data.url || '/' }
      }));
    } catch (e) {
      event.waitUntil(self.registration.showNotification('FORGE', {
        body: 'You have a new reminder.', icon: '/favicon.png', badge: '/favicon.png'
      }));
    }
  }
});

// Periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'forge-hourly-discipline') event.waitUntil(showDisciplineReminder());
  else if (event.tag === 'forge-checkin-check') event.waitUntil(checkAndNotify());
});

// Messages from main app
self.addEventListener('message', (event) => {
  if (event.data.type === 'TEST_CHECKIN') event.waitUntil(showCheckInReminder(event.data.hours || 2));
  else if (event.data.type === 'TEST_DISCIPLINE') event.waitUntil(showDisciplineReminder());
  else if (event.data.type === 'SCHEDULE_NOTIFICATIONS') scheduleNotifications();
  else if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Fallback scheduling for notifications
let hourlyInterval = null;
let checkInInterval = null;

function scheduleNotifications() {
  if (hourlyInterval) clearInterval(hourlyInterval);
  if (checkInInterval) clearInterval(checkInInterval);
  
  const msUntilNextHour = getMillisUntilNextHour();
  setTimeout(() => {
    showDisciplineReminder();
    hourlyInterval = setInterval(() => showDisciplineReminder(), 60 * 60 * 1000);
  }, msUntilNextHour);
  
  checkInInterval = setInterval(() => checkAndNotify(), 5 * 60 * 1000);
  checkAndNotify();
  
  console.log('[SW] Notifications scheduled. Next hourly in', Math.round(msUntilNextHour / 60000), 'min');
}
