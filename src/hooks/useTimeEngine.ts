import { useState, useEffect } from 'react';
import { getTimeState, TimeState } from '@/lib/timeEngine';

export function useTimeEngine(updateIntervalMs: number = 1000): TimeState {
  const [timeState, setTimeState] = useState<TimeState>(() => getTimeState());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeState(getTimeState());
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [updateIntervalMs]);

  return timeState;
}
