import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTimeEngine } from './useTimeEngine';
import { Json } from '@/integrations/supabase/types';

export interface FloorAction {
  id: string;
  text: string;
  points: number;
}

export interface TodayFloorData {
  dayNumber: number;
  dayTitle: string;
  weekNumber: number;
  intent: string;
  actions: FloorAction[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch floor actions for the current day based on the time engine
 */
export function useTodayFloorActions(): TodayFloorData {
  const timeState = useTimeEngine();
  const [data, setData] = useState<Omit<TodayFloorData, 'isLoading' | 'error'>>({
    dayNumber: 0,
    dayTitle: '',
    weekNumber: 0,
    intent: '',
    actions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFloorData = async () => {
      if (timeState.dayNumber <= 0) {
        setIsLoading(false);
        return;
      }

      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Not authenticated');
          setIsLoading(false);
          return;
        }

        // Find the floor day matching current day number
        const { data: dayData, error: dayError } = await supabase
          .from('floor_days')
          .select(`
            id,
            day_number,
            title,
            intent,
            actions,
            week_id,
            floor_weeks!inner (
              week_number,
              user_id
            )
          `)
          .eq('day_number', timeState.dayNumber)
          .eq('floor_weeks.user_id', user.id)
          .maybeSingle();

        if (dayError) {
          console.error('[useTodayFloorActions] Error fetching floor day:', dayError);
          setError('Failed to fetch floor data');
          setIsLoading(false);
          return;
        }

        if (!dayData) {
          // No floor data for this day
          setData({
            dayNumber: timeState.dayNumber,
            dayTitle: '',
            weekNumber: 0,
            intent: '',
            actions: [],
          });
          setIsLoading(false);
          return;
        }

        // Parse actions array and assign points
        const rawActions = dayData.actions as Json;
        const actionsArray: string[] = Array.isArray(rawActions) 
          ? rawActions.filter((a): a is string => typeof a === 'string')
          : [];

        // Distribute 20 points evenly across floor actions
        const totalFloorPoints = 20;
        const pointsPerAction = actionsArray.length > 0 
          ? Math.round(totalFloorPoints / actionsArray.length) 
          : 0;

        const floorActions: FloorAction[] = actionsArray.map((text, index) => ({
          id: `FLOOR_${timeState.dayNumber}_${index}`,
          text,
          points: pointsPerAction,
        }));

        // Access nested data safely
        const floorWeeks = dayData.floor_weeks as { week_number: number; user_id: string } | null;

        setData({
          dayNumber: dayData.day_number,
          dayTitle: dayData.title,
          weekNumber: floorWeeks?.week_number || 0,
          intent: dayData.intent,
          actions: floorActions,
        });
        setError(null);
      } catch (err) {
        console.error('[useTodayFloorActions] Unexpected error:', err);
        setError('Unexpected error fetching floor data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFloorData();
  }, [timeState.dayNumber]);

  return {
    ...data,
    isLoading,
    error,
  };
}
