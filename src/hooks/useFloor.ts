import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WEEK_1_DATA } from '@/lib/floorWeek1Data';
import { WEEK_2_DATA } from '@/lib/floorWeek2Data';
import { WEEK_3_DATA } from '@/lib/floorWeek3Data';
import { WEEK_4_DATA } from '@/lib/floorWeek4Data';
import { WEEK_5_DATA } from '@/lib/floorWeek5Data';
import { WEEK_6_DATA } from '@/lib/floorWeek6Data';
import { WEEK_7_DATA } from '@/lib/floorWeek7Data';

export interface FloorDay {
  id: string;
  week_id: string;
  day_number: number;
  title: string;
  intent: string;
  actions: string[];
  rules: string | null;
  unlock_text: string | null;
}

export interface FloorWeek {
  id: string;
  user_id: string;
  week_number: number;
  objective: string;
  focus_split: string | null;
  success_condition: string | null;
  days?: FloorDay[];
}

export interface FloorTimer {
  id: string;
  user_id: string;
  day_id: string;
  started_at: string;
  ends_at: string;
  is_active: boolean;
  stopped_at: string | null;
  auto_started: boolean;
}

// All week data for initialization
const ALL_WEEKS = [WEEK_1_DATA, WEEK_2_DATA, WEEK_3_DATA, WEEK_4_DATA, WEEK_5_DATA, WEEK_6_DATA, WEEK_7_DATA];

export function useFloor() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<FloorWeek[]>([]);
  const [timers, setTimers] = useState<Record<string, FloorTimer>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize all weeks data for user if not exists
  const initializeWeeks = async () => {
    if (!user) return;

    for (const weekData of ALL_WEEKS) {
      // Check if this week exists
      const { data: existingWeek } = await supabase
        .from('floor_weeks')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_number', weekData.weekNumber)
        .single();

      if (existingWeek) continue;

      // Create the week
      const { data: newWeek, error: weekError } = await supabase
        .from('floor_weeks')
        .insert({
          user_id: user.id,
          week_number: weekData.weekNumber,
          objective: weekData.objective,
          focus_split: weekData.focusSplit,
          success_condition: weekData.successCondition
        })
        .select()
        .single();

      if (weekError || !newWeek) {
        console.error(`Failed to create week ${weekData.weekNumber}:`, weekError);
        continue;
      }

      // Create all days for this week
      const daysToInsert = weekData.days.map(day => ({
        week_id: newWeek.id,
        day_number: day.dayNumber,
        title: day.title,
        intent: day.intent,
        actions: day.actions,
        rules: day.rules,
        unlock_text: day.unlockText
      }));

      const { error: daysError } = await supabase
        .from('floor_days')
        .insert(daysToInsert);

      if (daysError) {
        console.error(`Failed to create days for week ${weekData.weekNumber}:`, daysError);
      }
    }
  };

  // Fetch all weeks and days
  const fetchFloorData = async () => {
    if (!user) return;

    setIsLoading(true);

    // Fetch weeks
    const { data: weeksData, error: weeksError } = await supabase
      .from('floor_weeks')
      .select('*')
      .eq('user_id', user.id)
      .order('week_number');

    if (weeksError) {
      console.error('Failed to fetch weeks:', weeksError);
      setIsLoading(false);
      return;
    }

    // Fetch days for all weeks
    const weekIds = weeksData.map(w => w.id);
    const { data: daysData, error: daysError } = await supabase
      .from('floor_days')
      .select('*')
      .in('week_id', weekIds)
      .order('day_number');

    if (daysError) {
      console.error('Failed to fetch days:', daysError);
    }

    // Fetch all timers
    const { data: timersData } = await supabase
      .from('floor_timers')
      .select('*')
      .eq('user_id', user.id);

    // Map timers by day_id
    const timerMap: Record<string, FloorTimer> = {};
    timersData?.forEach(timer => {
      timerMap[timer.day_id] = timer as FloorTimer;
    });
    setTimers(timerMap);

    // Combine weeks with their days
    const weeksWithDays = weeksData.map(week => ({
      ...week,
      days: (daysData || [])
        .filter(d => d.week_id === week.id)
        .map(d => ({
          ...d,
          actions: Array.isArray(d.actions) ? d.actions : []
        })) as FloorDay[]
    })) as FloorWeek[];

    setWeeks(weeksWithDays);
    setIsLoading(false);
  };

  // Check and initialize today's timer via edge function
  const checkAndInitializeDayTimer = useCallback(async () => {
    if (!user) return null;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (!token) return null;

      const response = await supabase.functions.invoke('floor-timer-check', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.error) {
        console.error('Timer check error:', response.error);
        return null;
      }

      // Refresh timer data after check
      const { data: timersData } = await supabase
        .from('floor_timers')
        .select('*')
        .eq('user_id', user.id);

      const timerMap: Record<string, FloorTimer> = {};
      timersData?.forEach(timer => {
        timerMap[timer.day_id] = timer as FloorTimer;
      });
      setTimers(timerMap);

      return response.data;
    } catch (error) {
      console.error('Failed to check timer:', error);
      return null;
    }
  }, [user]);

  // Stop timer (mark as completed)
  const stopDayTimer = async (dayId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('floor_timers')
      .update({ 
        stopped_at: new Date().toISOString(),
        is_active: false 
      })
      .eq('user_id', user.id)
      .eq('day_id', dayId);

    if (error) {
      console.error('Failed to stop timer:', error);
      return;
    }

    // Update local state
    setTimers(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        stopped_at: new Date().toISOString(),
        is_active: false,
      }
    }));
  };

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      await initializeWeeks();
      await fetchFloorData();
      // Check and initialize today's timer
      await checkAndInitializeDayTimer();
    };
    init();
  }, [user]);

  return {
    weeks,
    timers,
    isLoading,
    checkAndInitializeDayTimer,
    stopDayTimer,
    refetch: fetchFloorData
  };
}
