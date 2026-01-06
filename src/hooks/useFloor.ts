import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WEEK_1_DATA } from '@/lib/floorWeek1Data';

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
}

export function useFloor() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<FloorWeek[]>([]);
  const [timers, setTimers] = useState<Record<string, FloorTimer>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Week 1 data for user if not exists
  const initializeWeek1 = async () => {
    if (!user) return;

    // Check if week 1 exists
    const { data: existingWeek } = await supabase
      .from('floor_weeks')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_number', 1)
      .single();

    if (existingWeek) return;

    // Create week 1
    const { data: newWeek, error: weekError } = await supabase
      .from('floor_weeks')
      .insert({
        user_id: user.id,
        week_number: WEEK_1_DATA.weekNumber,
        objective: WEEK_1_DATA.objective,
        focus_split: WEEK_1_DATA.focusSplit,
        success_condition: WEEK_1_DATA.successCondition
      })
      .select()
      .single();

    if (weekError || !newWeek) {
      console.error('Failed to create week 1:', weekError);
      return;
    }

    // Create all days for week 1
    const daysToInsert = WEEK_1_DATA.days.map(day => ({
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
      console.error('Failed to create days:', daysError);
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

  // Start timer for a day
  const startDayTimer = async (dayId: string) => {
    if (!user) return;

    const now = new Date();
    const endsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { data, error } = await supabase
      .from('floor_timers')
      .upsert({
        user_id: user.id,
        day_id: dayId,
        started_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
        is_active: true
      }, {
        onConflict: 'user_id,day_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to start timer:', error);
      return;
    }

    setTimers(prev => ({
      ...prev,
      [dayId]: data as FloorTimer
    }));
  };

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      await initializeWeek1();
      await fetchFloorData();
    };
    init();
  }, [user]);

  return {
    weeks,
    timers,
    isLoading,
    startDayTimer,
    refetch: fetchFloorData
  };
}
