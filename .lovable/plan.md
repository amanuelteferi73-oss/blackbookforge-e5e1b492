

# Implementation Plan: Auto-Start Floor Timer + New Discipline Rules

## Overview

This plan covers two major changes:

1. **Auto-Start Floor Timer System**: Convert from manual timer starts to automatic midnight starts. Users must STOP the timer before it expires (24 hours), otherwise they receive 0 score and automatic punishment.

2. **New Discipline Rules in Check-In**: Replace the Dan Martell mantras with 37 new personal rules. These rules become part of the daily check-in under Section F (Discipline Locks), with each rule being a checkable item contributing to the score.

---

## Part 1: Auto-Start Floor Timer System

### Current Behavior
- User manually clicks "Start Day Execution" to begin a 24-hour timer
- Timer counts down to zero
- No automatic consequences when timer expires

### New Behavior
- Timer automatically starts at **midnight UTC** (00:00:00) each day
- Timer runs for 24 hours until 23:59:59
- User's job is to **STOP** the timer by completing their check-in before midnight
- If timer reaches zero without check-in:
  - Score for that day = **0%**
  - Punishment is **automatically triggered**
  - Check-in becomes locked with "Timer Expired" status

### Technical Implementation

#### 1. Backend Edge Function: `floor-timer-check`
Create a new edge function that:
- Runs automatically (can be triggered via cron or on app load)
- For the current day, ensures a timer exists starting at midnight
- Checks for expired timers from previous day and applies penalties

```
supabase/functions/floor-timer-check/index.ts
```

**Logic:**
1. Get current day number from system time
2. Find the floor_day matching that day number for the user
3. Check if timer exists for that day
4. If no timer exists, create one with:
   - `started_at`: Midnight of current day (UTC)
   - `ends_at`: 23:59:59 of current day (UTC)
   - `is_active`: true
5. Check yesterday's timer - if expired and no check-in submitted, create a "missed" check-in with 0 score and trigger punishment

#### 2. Modify `useFloor.ts` Hook
- Remove the manual `startDayTimer` function
- Add `checkAndInitializeDayTimer()` that calls the edge function
- Add `stopDayTimer(dayId)` function for completing the day

#### 3. Modify Timer Database Logic
- Timers will be created automatically at midnight
- Timer can be "stopped" by submitting a valid check-in
- Add a `stopped_at` column to `floor_timers` table (optional enhancement)

#### 4. Modify `DayTimer.tsx` Component
- Remove "Start Day Execution" button
- Show countdown always (timer auto-started)
- Add "Complete Day" button that stops the timer (links to check-in)
- Show expiration warning when time is low

#### 5. Modify Check-In Flow
- When check-in is submitted, mark the floor timer as completed
- If timer already expired, block submission and show "Timer Expired" message

#### 6. Database Changes
Add new column to track timer completion:
```sql
ALTER TABLE floor_timers ADD COLUMN stopped_at TIMESTAMPTZ NULL;
ALTER TABLE floor_timers ADD COLUMN auto_started BOOLEAN DEFAULT true;
```

---

## Part 2: New Discipline Rules in Check-In

### Current Behavior
- Dan Martell's 9 mantras shown in CoreStatement dropdown
- Section F (Discipline Locks) has 2 questions worth 14 points total

### New Behavior
- Replace Dan Martell mantras with 37 personal rules in CoreStatement
- These same 37 rules appear as checkable items in check-in
- Each rule must be checked daily as part of discipline compliance
- Points distributed: 14 points across 37 rules (approximately 0.38 per rule, rounded)

### The 37 Rules (Parsed from user input)

1. Pick the hardest build, learn and do
2. Feel the pain all the way - this is what can make you who you wanna be
3. I don't see the reason you are f*cking giving up, there is no option
4. We can have it all - pick them wisely and show me just doing it
5. This time crushing it not small task
6. Order is our schema - ain't we got it after 6 we are still here not there
7. You need consistence ain't fuel
8. Everything is gonna be your fault - not even a single complain of country or situation
9. Private success lead to victory not vice versa
10. This is just start not the end
11. World won't go anywhere unless we stayed tune - so do it, don't wanna see you sleeping
12. Follow one niche this time - I don't see any reason it is gonna fail
13. Have a fuel you can put on fire which is the agent we are building
14. Don't spend your time with taker not giver
15. For the responsibility problem we are gonna blame anyone
16. Don't be a f*cking prisoner to any of them - enjoy doing them
17. Don't compare yourself with others - you do it with yourself
18. Always we are positive even in ocean
19. Protect your mind not only growing it
20. Control what you can if what you can't
21. Speeeeeeeeeeeeeed - we are robot ok, not human anymore
22. Ignore what others think about you
23. We are always ambitious to listen that car sound, to live there, to make them shout their mouth
24. Prioritize your health
25. Keep your promise to be Elon Musk and Masayoshi Son
26. Thanks to our situation - not enjoyment for us yet even if we are young
27. Fail is a f*cking master - you will call it soon a legendary
28. Winners don't quit, quitters never win
29. We are not rich yet - don't give even a single penny
30. Don't f*cking fear money - cause if it can make you broke it can make you rich too
31. One victory covers all the failure
32. Money is the tool not the goal
33. Your network is your networth
34. If dad ain't drop it so who can you call yourself?
35. Build the system then you will see how it matter
36. Next stop will be on billions not even millions
37. Luck is when preparation meets opportunity so don't wait for it - show me who you are

### Technical Implementation

#### 1. Update `CoreStatement.tsx`
Replace `DAILY_MANTRAS` array with the new 37 rules:
- Each rule has a title (the rule itself)
- Description can be a motivational extension or left minimal

#### 2. Create New Discipline Rules Data File
```
src/lib/disciplineRules.ts
```

Contains the 37 rules as a constant array that can be imported by both CoreStatement and the check-in system.

#### 3. Modify Check-In Section F
Current Section F has 2 questions worth 14 points:
- F1: "Fully complied with all binary discipline rules?" (8 points)
- F2: "Shut down temptations immediately?" (6 points)

**New approach options:**

**Option A: Keep F simple, add new Section R (Rules)**
- Keep Section F as-is (2 questions, 14 points)
- Add new Section R (Discipline Rules) with 37 checkable rules
- Each rule worth a small point value (14 additional points total)

**Option B: Expand Section F with all 37 rules**
- Replace the 2 questions with 37 individual rules
- Distribute 14 points across all 37 rules
- This keeps total max points the same

**Recommended: Option A** - Add a new section specifically for rules to keep scoring clean.

#### 4. Modify `checkInSections.ts`
Add new section with the 37 discipline rules as questions:
```typescript
{
  id: 'R',
  title: 'Daily Discipline Rules',
  maxPoints: 14,
  isCritical: true, // Breaking rules triggers discipline breach
  questions: [
    // 37 rules as questions
  ],
}
```

#### 5. Update EnforcementCheckIn.tsx
- Ensure the new section R is rendered
- Rules appear as checkable items
- All 37 must be checked for full points

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/floor-timer-check/index.ts` | Edge function to auto-start daily timers and check expired timers |
| `src/lib/disciplineRules.ts` | The 37 discipline rules as a constant array |

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useFloor.ts` | Remove manual startDayTimer, add auto-timer initialization |
| `src/components/floor/DayTimer.tsx` | Remove start button, always show countdown, add complete button |
| `src/components/floor/DayDetailPanel.tsx` | Update timer section behavior |
| `src/components/CoreStatement.tsx` | Replace DAILY_MANTRAS with new 37 rules |
| `src/lib/checkInSections.ts` | Add new Section R with 37 discipline rule questions |
| `src/components/enforcement/EnforcementCheckIn.tsx` | Handle new discipline rules section |

## Database Migration

```sql
-- Add columns to track timer completion
ALTER TABLE floor_timers 
ADD COLUMN IF NOT EXISTS stopped_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS auto_started BOOLEAN DEFAULT true;
```

---

## Summary

1. **Auto-Timer**: Timers start automatically at midnight each day. User must complete check-in before midnight or face 0 score + punishment.

2. **37 Discipline Rules**: Your personal rules replace Dan Martell's content in the mantra dropdown AND become checkable items in the daily check-in worth 14 points total.

Both systems are additive and don't break existing functionality.

