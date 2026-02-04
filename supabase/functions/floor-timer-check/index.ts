import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header to identify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get system time to calculate current day number
    const { data: systemTime } = await supabase
      .from('system_time')
      .select('system_start_date')
      .single();

    if (!systemTime) {
      return new Response(
        JSON.stringify({ error: 'System time not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startDate = new Date(systemTime.system_start_date);
    const now = new Date();
    
    // Calculate current day number (1-indexed) based on system_start_date from DB
    const diffMs = now.getTime() - startDate.getTime();
    const daysSinceStart = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
    
    // Calculate which week we're in (1-indexed) and the absolute day number
    // Week 1 = days 1-7, Week 2 = days 8-14, etc.
    const currentWeekNumber = Math.ceil(daysSinceStart / 7);
    // The absolute day number in the floor system (e.g., Week 5 Day 4 = day 32)
    const currentDayNumber = (currentWeekNumber - 1) * 7 + ((daysSinceStart - 1) % 7) + 1;
    
    console.log(`[FLOOR-TIMER] Day since start: ${daysSinceStart}, Week: ${currentWeekNumber}, Floor Day: ${currentDayNumber}`);

    // Find the floor_day for today
    const { data: floorDay } = await supabase
      .from('floor_days')
      .select('id, day_number, week_id, floor_weeks!inner(user_id)')
      .eq('day_number', currentDayNumber)
      .eq('floor_weeks.user_id', user.id)
      .maybeSingle();

    if (!floorDay) {
      return new Response(
        JSON.stringify({ 
          message: 'No floor day found for current day',
          currentDayNumber,
          timerCreated: false 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if timer already exists for this day
    const { data: existingTimer } = await supabase
      .from('floor_timers')
      .select('*')
      .eq('user_id', user.id)
      .eq('day_id', floorDay.id)
      .maybeSingle();

    if (existingTimer) {
      // Check if timer is expired but still marked active - update it
      const timerEnd = new Date(existingTimer.ends_at);
      const timerExpired = now > timerEnd;
      
      if (existingTimer.is_active && timerExpired && !existingTimer.stopped_at) {
        // Timer expired - mark as inactive
        await supabase
          .from('floor_timers')
          .update({ is_active: false })
          .eq('id', existingTimer.id);
      }
      
      // Timer already exists - return it
      return new Response(
        JSON.stringify({ 
          message: 'Timer already exists',
          timer: { ...existingTimer, is_active: !timerExpired && existingTimer.is_active },
          timerCreated: false 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create auto-started timer for today
    // Timer starts at midnight of current day (UTC) and ends at 23:59:59
    const todayMidnight = new Date(now);
    todayMidnight.setUTCHours(0, 0, 0, 0);
    
    const todayEnd = new Date(now);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const { data: newTimer, error: timerError } = await supabase
      .from('floor_timers')
      .upsert({
        user_id: user.id,
        day_id: floorDay.id,
        started_at: todayMidnight.toISOString(),
        ends_at: todayEnd.toISOString(),
        is_active: true,
        auto_started: true,
      }, {
        onConflict: 'user_id,day_id',
        ignoreDuplicates: true,
      })
      .select()
      .single();

    if (timerError) {
      console.error('Timer creation error:', timerError);
      return new Response(
        JSON.stringify({ error: 'Failed to create timer', details: timerError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for expired timer from yesterday and apply penalties
    const yesterdayDayNumber = currentDayNumber - 1;
    if (yesterdayDayNumber >= 1) {
      const { data: yesterdayFloorDay } = await supabase
        .from('floor_days')
        .select('id, floor_weeks!inner(user_id)')
        .eq('day_number', yesterdayDayNumber)
        .eq('floor_weeks.user_id', user.id)
        .maybeSingle();

      if (yesterdayFloorDay) {
        // Check if yesterday's timer expired without check-in
        const { data: yesterdayTimer } = await supabase
          .from('floor_timers')
          .select('*')
          .eq('user_id', user.id)
          .eq('day_id', yesterdayFloorDay.id)
          .maybeSingle();

        if (yesterdayTimer && !yesterdayTimer.stopped_at) {
          const timerEnd = new Date(yesterdayTimer.ends_at);
          if (now > timerEnd) {
            // Timer expired - check if check-in was submitted
            const yesterdayDate = new Date(startDate);
            yesterdayDate.setDate(startDate.getDate() + yesterdayDayNumber - 1);
            const yesterdayKey = yesterdayDate.toISOString().split('T')[0];

            const { data: existingCheckIn } = await supabase
              .from('daily_checkins')
              .select('id')
              .eq('user_id', user.id)
              .eq('date', yesterdayKey)
              .maybeSingle();

            if (!existingCheckIn) {
              // No check-in submitted and timer expired - create missed check-in with 0 score
              const { data: missedCheckIn, error: missedError } = await supabase
                .from('daily_checkins')
                .insert({
                  user_id: user.id,
                  date: yesterdayKey,
                  total_score: 0,
                  discipline_breach: true,
                  is_missed: true,
                  submitted_at: now.toISOString(),
                })
                .select()
                .single();

              if (!missedError && missedCheckIn) {
                // Create automatic punishment record
                await supabase
                  .from('punishments')
                  .insert({
                    user_id: user.id,
                    daily_checkin_id: missedCheckIn.id,
                    date: yesterdayKey,
                    score: 0,
                    punishment_index: Math.floor(Math.random() * 20), // Random punishment
                    punishment_text: 'Timer expired without check-in completion',
                    failed_questions: ['Timer expired - automatic failure'],
                  });

                console.log(`Created missed check-in for day ${yesterdayDayNumber}`);
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Timer auto-started',
        timer: newTimer,
        currentDayNumber,
        timerCreated: true 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Floor timer check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
