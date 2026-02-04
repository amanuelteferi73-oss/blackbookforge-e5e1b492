// TIME ENGINE - BACKEND-AUTHORITATIVE SYSTEM
// Fixed timeline: January 1, 2026 - January 1, 2027
// Time never pauses. Time never lies. Backend is law.

import { supabase } from '@/integrations/supabase/client';

// Canonical definitions (must match backend edge function: system-time)
// System started January 1, 2026 at 00:00:00 UTC
// Feb 4 = Day 35 (Jan has 31 days + 4 days in Feb = 35)
export const START_DATE = new Date('2026-01-01T00:00:00.000Z');
export const END_DATE = new Date('2027-01-01T00:00:00.000Z');
export const TOTAL_DURATION_MS = END_DATE.getTime() - START_DATE.getTime();
export const TOTAL_DAYS = 365;

export interface Duration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export interface TimeState {
  now: Date;
  serverTimeMs: number;
  elapsed: Duration;
  remaining: Duration;
  percentComplete: number;
  dayNumber: number;
  totalDays: number;
  currentDateKey: string;
  isBeforeStart: boolean;
  isAfterEnd: boolean;
  isActive: boolean;
  lastSyncAt: number;
  driftMs: number;
}

export interface ServerTimeResponse {
  serverTime: string;
  serverTimeMs: number;
  systemStart: string;
  systemStartMs: number;
  systemEnd: string;
  systemEndMs: number;
  elapsed: {
    ms: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
  };
  remaining: {
    ms: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
  };
  dayNumber: number;
  totalDays: number;
  percentComplete: number;
  currentDateKey: string;
  isBeforeStart: boolean;
  isAfterEnd: boolean;
  isActive: boolean;
}

// Time sync state
let lastServerSync: ServerTimeResponse | null = null;
let lastSyncTimestamp = 0;
let syncInProgress = false;

// Drift threshold - resync if client drifts more than 5 seconds
const DRIFT_THRESHOLD_MS = 5000;
// Resync interval - fetch server time every 60 seconds
const RESYNC_INTERVAL_MS = 60000;

/**
 * Fetch canonical time from backend
 */
export async function fetchServerTime(): Promise<ServerTimeResponse | null> {
  if (syncInProgress) return lastServerSync;
  
  syncInProgress = true;
  try {
    const { data, error } = await supabase.functions.invoke('system-time');
    
    if (error) {
      console.error('[TIME-ENGINE] Server sync failed:', error);
      syncInProgress = false;
      return null;
    }
    
    lastServerSync = data as ServerTimeResponse;
    lastSyncTimestamp = Date.now();
    
    console.log(`[TIME-ENGINE] Synced with server: Day ${lastServerSync.dayNumber}/${lastServerSync.totalDays}`);
    syncInProgress = false;
    return lastServerSync;
  } catch (err) {
    console.error('[TIME-ENGINE] Server sync error:', err);
    syncInProgress = false;
    return null;
  }
}

/**
 * Calculate time state using server reference + client interpolation
 */
export function getTimeState(forceClientOnly = false): TimeState {
  const clientNow = Date.now();
  
  // If we have a recent server sync, interpolate from it
  if (lastServerSync && lastSyncTimestamp > 0 && !forceClientOnly) {
    const timeSinceSync = clientNow - lastSyncTimestamp;
    const interpolatedServerMs = lastServerSync.serverTimeMs + timeSinceSync;
    const driftMs = clientNow - interpolatedServerMs;
    
    return computeTimeState(interpolatedServerMs, lastSyncTimestamp, Math.abs(driftMs));
  }
  
  // Fallback to client time (only used before first sync)
  return computeTimeState(clientNow, 0, 0);
}

/**
 * Core computation of time state from a reference timestamp
 */
function computeTimeState(nowMs: number, lastSyncAt: number, driftMs: number): TimeState {
  const startMs = START_DATE.getTime();
  const endMs = END_DATE.getTime();
  
  const isBeforeStart = nowMs < startMs;
  const isAfterEnd = nowMs > endMs;
  const isActive = !isBeforeStart && !isAfterEnd;
  
  const elapsedMs = Math.max(0, Math.min(nowMs - startMs, TOTAL_DURATION_MS));
  
  // Remaining = Total Duration - Elapsed (not now to end!)
  const remainingMs = Math.max(0, Math.min(TOTAL_DURATION_MS - elapsedMs, TOTAL_DURATION_MS));
  
  const percentComplete = Math.min(100, Math.max(0, (elapsedMs / TOTAL_DURATION_MS) * 100));
  
  // Day number: 0 if before start, 1-365 during period, 365 if after end
  let dayNumber: number;
  if (isBeforeStart) {
    dayNumber = 0;
  } else if (isAfterEnd) {
    dayNumber = TOTAL_DAYS;
  } else {
    dayNumber = Math.floor(elapsedMs / (1000 * 60 * 60 * 24)) + 1;
  }
  
  // Current date key in UTC
  const now = new Date(nowMs);
  const currentDateKey = now.toISOString().split('T')[0];
  
  return {
    now,
    serverTimeMs: nowMs,
    elapsed: msToDuration(elapsedMs),
    remaining: msToDuration(remainingMs),
    percentComplete,
    dayNumber,
    totalDays: TOTAL_DAYS,
    currentDateKey,
    isBeforeStart,
    isAfterEnd,
    isActive,
    lastSyncAt,
    driftMs,
  };
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

/**
 * Check if we need to resync with server
 */
export function needsResync(): boolean {
  if (!lastSyncTimestamp) return true;
  
  const timeSinceSync = Date.now() - lastSyncTimestamp;
  
  // Resync if too much time has passed
  if (timeSinceSync > RESYNC_INTERVAL_MS) return true;
  
  // Resync if drift exceeds threshold
  const state = getTimeState();
  if (state.driftMs > DRIFT_THRESHOLD_MS) return true;
  
  return false;
}

/**
 * Get the last successful server sync data
 */
export function getLastSync(): ServerTimeResponse | null {
  return lastServerSync;
}

/**
 * Check if we have ever synced with server
 */
export function hasSynced(): boolean {
  return lastServerSync !== null;
}

/**
 * Format duration for display
 */
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

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get today's date key (YYYY-MM-DD) using server-synced time
 */
export function getTodayKey(): string {
  const state = getTimeState();
  return state.currentDateKey;
}
