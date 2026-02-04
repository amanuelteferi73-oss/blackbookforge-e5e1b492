

# Push Notifications Implementation Plan

## Overview

This plan adds a complete notification system to FORGE that works on your Samsung A11 device. The system provides two distinct notification types:

1. **Check-In Deadline Reminders** - Critical alerts at 3 hours, 2 hours, and 1 hour before your daily timer expires (before midnight UTC)
2. **Hourly Discipline Rule Reminders** - Motivational notifications every hour featuring one of your 37 rules

---

## How It Will Work

### Notification Permission Flow
1. A new "Notifications" section appears on the Dashboard
2. Tapping "Enable Notifications" requests browser permission
3. Once granted, notifications are automatically scheduled
4. Status shows whether notifications are active or disabled

### Check-In Reminders
- **3 hours before midnight** (9:00 PM UTC): "Check-In Deadline in 3 hours"
- **2 hours before midnight** (10:00 PM UTC): "Check-In Deadline in 2 hours"
- **1 hour before midnight** (11:00 PM UTC): "URGENT: 1 hour remaining!"

Visual style: Red/amber urgent alerts with the FORGE icon

### Discipline Rule Reminders
- Sent every hour on the hour
- Randomly picks one of the 37 rules
- Clean, motivational design with your personal branding

---

## Technical Implementation

### 1. Install PWA Plugin

Add `vite-plugin-pwa` to enable service worker and PWA manifest:

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FORGE',
        short_name: 'FORGE',
        description: 'Private execution system for discipline',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          { src: '/favicon.png', sizes: '192x192', type: 'image/png' },
          { src: '/apple-touch-icon.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // Service worker configuration
      }
    })
  ]
})
```

### 2. Create Custom Service Worker

```
public/sw.js
```

The service worker handles:
- Background notification scheduling
- Periodic sync for hourly reminders
- Push event listeners
- Notification click handling (opens app)

### 3. Create Notification Manager Hook

```
src/hooks/useNotifications.ts
```

Provides:
- `requestPermission()` - Ask for notification access
- `isSupported` - Check if device supports notifications
- `isEnabled` - Current permission status
- `scheduleCheckInReminders()` - Set up deadline alerts
- `scheduleHourlyDiscipline()` - Set up rule reminders

### 4. Create Notification Settings Component

```
src/components/NotificationSettings.tsx
```

Dashboard widget showing:
- Enable/Disable toggle
- Permission status
- Last notification sent
- Manual test button

### 5. Create Notification Service

```
src/lib/notificationService.ts
```

Core functions:
- `showNotification(title, options)` - Display a notification
- `getRandomDisciplineRule()` - Pick a rule for hourly reminder
- `getTimeUntilDeadline()` - Calculate hours until midnight

### 6. Create Edge Function for Push Subscriptions

```
supabase/functions/push-subscribe/index.ts
```

Stores push subscription endpoints in the database for potential server-triggered notifications in the future.

### 7. Database Table for Push Subscriptions

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `public/sw.js` | Custom service worker for scheduling notifications |
| `src/hooks/useNotifications.ts` | React hook for notification management |
| `src/lib/notificationService.ts` | Core notification logic and scheduling |
| `src/components/NotificationSettings.tsx` | UI for enabling/managing notifications |
| `supabase/functions/push-subscribe/index.ts` | Store push subscription data |

## Files to Modify

| File | Changes |
|------|---------|
| `vite.config.ts` | Add vite-plugin-pwa configuration |
| `index.html` | Add manifest link |
| `src/main.tsx` | Register service worker |
| `src/pages/Index.tsx` | Add NotificationSettings component |
| `package.json` | Add vite-plugin-pwa dependency |

---

## Notification Designs

### Check-In Deadline Reminder
```text
+------------------------------------------+
| 🔴 FORGE                                 |
|------------------------------------------|
| ⏰ CHECK-IN DEADLINE                     |
|                                          |
| You have 2 HOURS remaining.              |
| Complete your check-in now or face       |
| automatic failure.                       |
|                                          |
| [Tap to open FORGE]                      |
+------------------------------------------+
```

### Hourly Discipline Rule
```text
+------------------------------------------+
| 🔥 FORGE                                 |
|------------------------------------------|
| RULE #21                                 |
|                                          |
| Speeeeeeeeeeeeeed - we are robot ok,     |
| not human anymore                        |
|                                          |
| Remember who you are becoming.           |
+------------------------------------------+
```

---

## Installation Flow for Samsung A11

1. Open FORGE in Chrome browser
2. Tap the notification toggle on the Dashboard
3. Chrome prompts "Allow notifications from this site?"
4. Tap "Allow"
5. Notifications are now active

For best experience, also install FORGE as a PWA:
1. Open Chrome menu (3 dots)
2. Tap "Add to Home screen"
3. FORGE appears as an app icon

---

## Summary

This implementation adds a complete notification system that:

- Works on Android Chrome (Samsung A11 compatible)
- Requires no external push notification service
- Uses the Web Notifications API and Service Workers
- Sends check-in reminders at 3h, 2h, and 1h before midnight
- Sends hourly discipline rule reminders
- Has clean, branded notification designs
- Stores subscription data for future server-push capabilities

The system is entirely client-side for the hourly reminders (service worker scheduling) and check-in deadline alerts, ensuring notifications work even when the app tab is closed.

