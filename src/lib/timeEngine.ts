// TIME ENGINE - CORE SYSTEM
// Fixed timeline: February 1, 2026 - February 1, 2027
// Time never pauses. Time never lies.

export const START_DATE = new Date('2026-02-01T00:00:00');
export const END_DATE = new Date('2027-02-01T00:00:00');
export const TOTAL_DURATION_MS = END_DATE.getTime() - START_DATE.getTime();

export interface TimeState {
  now: Date;
  elapsed: Duration;
  remaining: Duration;
  percentComplete: number;
  dayNumber: number;
  totalDays: number;
  isBeforeStart: boolean;
  isAfterEnd: boolean;
  isActive: boolean;
}

export interface Duration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function msToDuration(ms: number): Duration {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  return {
    days,
    hours: totalHours % 24,
    minutes: totalMinutes % 60,
    seconds: totalSeconds % 60,
    totalMs: Math.abs(ms),
  };
}

export function getTimeState(now: Date = new Date()): TimeState {
  const nowMs = now.getTime();
  const startMs = START_DATE.getTime();
  const endMs = END_DATE.getTime();

  const isBeforeStart = nowMs < startMs;
  const isAfterEnd = nowMs > endMs;
  const isActive = !isBeforeStart && !isAfterEnd;

  const elapsedMs = Math.max(0, Math.min(nowMs - startMs, TOTAL_DURATION_MS));
  const remainingMs = Math.max(0, endMs - nowMs);

  const percentComplete = Math.min(100, Math.max(0, (elapsedMs / TOTAL_DURATION_MS) * 100));
  
  const dayNumber = Math.floor(elapsedMs / (1000 * 60 * 60 * 24)) + 1;
  const totalDays = Math.ceil(TOTAL_DURATION_MS / (1000 * 60 * 60 * 24));

  return {
    now,
    elapsed: msToDuration(elapsedMs),
    remaining: msToDuration(remainingMs),
    percentComplete,
    dayNumber: Math.min(dayNumber, totalDays),
    totalDays,
    isBeforeStart,
    isAfterEnd,
    isActive,
  };
}

export function formatDuration(d: Duration, includeSeconds = true): string {
  const parts = [
    `${d.days}d`,
    `${d.hours.toString().padStart(2, '0')}h`,
    `${d.minutes.toString().padStart(2, '0')}m`,
  ];
  
  if (includeSeconds) {
    parts.push(`${d.seconds.toString().padStart(2, '0')}s`);
  }
  
  return parts.join(' ');
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTodayKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}
