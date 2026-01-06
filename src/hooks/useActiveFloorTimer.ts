import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActiveFloorTimer {
  id: string;
  day_id: string;
  started_at: string;
  ends_at: string;
  is_active: boolean;
  day_number: number;
  day_title: string;
}

export function useActiveFloorTimer() {
  const [activeTimer, setActiveTimer] = useState<ActiveFloorTimer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveTimer = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch all active timers that haven't expired
      const now = new Date().toISOString();
      const { data: timerData } = await supabase
        .from('floor_timers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('ends_at', now)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!timerData) {
        setActiveTimer(null);
        setIsLoading(false);
        return;
      }

      // Fetch the day info for this timer
      const { data: dayData } = await supabase
        .from('floor_days')
        .select('day_number, title')
        .eq('id', timerData.day_id)
        .maybeSingle();

      if (dayData) {
        setActiveTimer({
          id: timerData.id,
          day_id: timerData.day_id,
          started_at: timerData.started_at,
          ends_at: timerData.ends_at,
          is_active: timerData.is_active,
          day_number: dayData.day_number,
          day_title: dayData.title,
        });
      }

      setIsLoading(false);
    };

    fetchActiveTimer();

    // Subscribe to changes on floor_timers
    const channel = supabase
      .channel('dashboard-floor-timer')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'floor_timers',
        },
        () => {
          fetchActiveTimer();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { activeTimer, isLoading };
}
