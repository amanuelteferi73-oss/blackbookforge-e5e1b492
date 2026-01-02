/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CANONICAL TIME DEFINITIONS - IMMUTABLE
const SYSTEM_START = new Date('2026-02-01T00:00:00.000Z');
const SYSTEM_END = new Date('2027-02-01T00:00:00.000Z');
const TOTAL_DURATION_MS = SYSTEM_END.getTime() - SYSTEM_START.getTime();
const TOTAL_DAYS = 365;

interface SystemTimeResponse {
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

function msToDurationBreakdown(ms: number) {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  return {
    ms: Math.abs(ms),
    seconds: totalSeconds % 60,
    minutes: totalMinutes % 60,
    hours: totalHours % 24,
    days,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // CANONICAL SERVER TIME - This is the source of truth
    const now = new Date();
    const nowMs = now.getTime();
    const startMs = SYSTEM_START.getTime();
    const endMs = SYSTEM_END.getTime();

    const isBeforeStart = nowMs < startMs;
    const isAfterEnd = nowMs > endMs;
    const isActive = !isBeforeStart && !isAfterEnd;

    // Calculate elapsed (clamped to 0 - total duration)
    const elapsedMs = Math.max(0, Math.min(nowMs - startMs, TOTAL_DURATION_MS));
    
    // Calculate remaining - MUST be relative to elapsed, not current time!
    // Remaining = Total Duration - Elapsed (clamped to 0 - total duration)
    const remainingMs = Math.max(0, Math.min(TOTAL_DURATION_MS - elapsedMs, TOTAL_DURATION_MS));

    // Percentage complete (0-100)
    const percentComplete = Math.min(100, Math.max(0, (elapsedMs / TOTAL_DURATION_MS) * 100));

    // Current day number (1-365, but 0 if before start)
    let dayNumber: number;
    if (isBeforeStart) {
      dayNumber = 0; // Not started yet
    } else if (isAfterEnd) {
      dayNumber = TOTAL_DAYS; // Completed
    } else {
      dayNumber = Math.floor(elapsedMs / (1000 * 60 * 60 * 24)) + 1;
    }

    // Current date key for daily operations (YYYY-MM-DD in UTC)
    const currentDateKey = now.toISOString().split('T')[0];

    const response: SystemTimeResponse = {
      serverTime: now.toISOString(),
      serverTimeMs: nowMs,
      systemStart: SYSTEM_START.toISOString(),
      systemStartMs: startMs,
      systemEnd: SYSTEM_END.toISOString(),
      systemEndMs: endMs,
      elapsed: msToDurationBreakdown(elapsedMs),
      remaining: msToDurationBreakdown(remainingMs),
      dayNumber,
      totalDays: TOTAL_DAYS,
      percentComplete,
      currentDateKey,
      isBeforeStart,
      isAfterEnd,
      isActive,
    };

    console.log(`[SYSTEM-TIME] Request served at ${now.toISOString()} | Day ${dayNumber}/${TOTAL_DAYS} | ${percentComplete.toFixed(4)}%`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[SYSTEM-TIME] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
