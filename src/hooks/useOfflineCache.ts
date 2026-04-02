// Offline cache layer - caches critical data in localStorage for offline access
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEYS = {
  FLOOR_WEEKS: 'forge_offline_floor_weeks',
  FLOOR_DAYS: 'forge_offline_floor_days',
  CHECKINS: 'forge_offline_checkins',
  RULES: 'forge_offline_discipline_rules',
  TIME_STATE: 'forge_offline_time_state',
  LAST_SYNC: 'forge_offline_last_sync',
};

export function getOfflineFloorData() {
  try {
    const weeks = localStorage.getItem(CACHE_KEYS.FLOOR_WEEKS);
    const days = localStorage.getItem(CACHE_KEYS.FLOOR_DAYS);
    return {
      weeks: weeks ? JSON.parse(weeks) : [],
      days: days ? JSON.parse(days) : [],
    };
  } catch { return { weeks: [], days: [] }; }
}

export function getOfflineCheckIns() {
  try {
    const data = localStorage.getItem(CACHE_KEYS.CHECKINS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function getOfflineTimeState() {
  try {
    const data = localStorage.getItem(CACHE_KEYS.TIME_STATE);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function cacheTimeState(state: any) {
  try {
    localStorage.setItem(CACHE_KEYS.TIME_STATE, JSON.stringify(state));
  } catch {}
}

export function useOfflineCache(userId: string | null) {
  const syncFloorData = useCallback(async () => {
    if (!userId) return;
    try {
      const { data: weeks } = await supabase
        .from('floor_weeks')
        .select('*')
        .eq('user_id', userId)
        .order('week_number');

      if (weeks) {
        localStorage.setItem(CACHE_KEYS.FLOOR_WEEKS, JSON.stringify(weeks));
        const weekIds = weeks.map(w => w.id);
        if (weekIds.length > 0) {
          const { data: days } = await supabase
            .from('floor_days')
            .select('*')
            .in('week_id', weekIds)
            .order('day_number');
          if (days) localStorage.setItem(CACHE_KEYS.FLOOR_DAYS, JSON.stringify(days));
        }
      }
    } catch (e) { console.warn('[OFFLINE] Floor sync failed:', e); }
  }, [userId]);

  const syncCheckIns = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);
      if (data) localStorage.setItem(CACHE_KEYS.CHECKINS, JSON.stringify(data));
    } catch (e) { console.warn('[OFFLINE] Check-in sync failed:', e); }
  }, [userId]);

  const syncAll = useCallback(async () => {
    await Promise.all([syncFloorData(), syncCheckIns()]);
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    console.log('[OFFLINE] Cache synced');
  }, [syncFloorData, syncCheckIns]);

  // Auto-sync when online
  useEffect(() => {
    if (!userId) return;
    
    // Sync on mount
    syncAll();

    // Sync when coming back online
    const handleOnline = () => syncAll();
    window.addEventListener('online', handleOnline);
    
    // Sync every 5 minutes
    const interval = setInterval(syncAll, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, [userId, syncAll]);

  return { syncAll };
}
