import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getTimeState, 
  fetchServerTime, 
  needsResync, 
  hasSynced,
  TimeState 
} from '@/lib/timeEngine';

// Resync triggers
const RESYNC_INTERVAL_MS = 60000; // Resync every 60 seconds
const VISIBILITY_RESYNC_DELAY_MS = 100; // Small delay after visibility change

export function useTimeEngine(updateIntervalMs: number = 1000): TimeState {
  const [timeState, setTimeState] = useState<TimeState>(() => getTimeState(true));
  const [isInitialized, setIsInitialized] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastDayRef = useRef<number>(0);

  // Server sync function
  const syncWithServer = useCallback(async () => {
    const serverTime = await fetchServerTime();
    if (serverTime) {
      const newState = getTimeState();
      setTimeState(newState);
      
      // Check for day rollover
      if (lastDayRef.current > 0 && newState.dayNumber !== lastDayRef.current) {
        console.log(`[TIME-ENGINE] Day rollover detected: Day ${lastDayRef.current} → Day ${newState.dayNumber}`);
        // Dispatch custom event for day rollover handling
        window.dispatchEvent(new CustomEvent('dayRollover', { 
          detail: { 
            previousDay: lastDayRef.current, 
            currentDay: newState.dayNumber,
            dateKey: newState.currentDateKey
          } 
        }));
      }
      lastDayRef.current = newState.dayNumber;
    }
  }, []);

  // Initial server sync
  useEffect(() => {
    const init = async () => {
      await syncWithServer();
      setIsInitialized(true);
    };
    init();
  }, [syncWithServer]);

  // Client-side tick (1 second updates)
  useEffect(() => {
    if (!isInitialized) return;

    const tick = () => {
      // Check if resync needed
      if (needsResync()) {
        syncWithServer();
      } else {
        // Just update from interpolated state
        setTimeState(getTimeState());
      }
    };

    intervalRef.current = window.setInterval(tick, updateIntervalMs);
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isInitialized, updateIntervalMs, syncWithServer]);

  // Periodic server resync
  useEffect(() => {
    if (!isInitialized) return;

    const resyncInterval = window.setInterval(() => {
      syncWithServer();
    }, RESYNC_INTERVAL_MS);

    return () => window.clearInterval(resyncInterval);
  }, [isInitialized, syncWithServer]);

  // Visibility change handler - resync when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Small delay to ensure browser is fully active
        setTimeout(() => {
          console.log('[TIME-ENGINE] Tab visible - resyncing with server');
          syncWithServer();
        }, VISIBILITY_RESYNC_DELAY_MS);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncWithServer]);

  // Focus handler - resync when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (hasSynced()) {
        console.log('[TIME-ENGINE] Window focused - checking sync');
        if (needsResync()) {
          syncWithServer();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncWithServer]);

  // Online handler - resync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      console.log('[TIME-ENGINE] Network online - resyncing with server');
      syncWithServer();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncWithServer]);

  return timeState;
}
