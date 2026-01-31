import { useState, useEffect } from 'react';
import { useFloor } from '@/hooks/useFloor';
import { useTimeEngine } from '@/hooks/useTimeEngine';
import { WeekSelector } from '@/components/floor/WeekSelector';
import { DaySelector } from '@/components/floor/DaySelector';
import { DayDetailPanel } from '@/components/floor/DayDetailPanel';
import { WeekOverview } from '@/components/floor/WeekOverview';
import { Loader2 } from 'lucide-react';

export default function FloorPage() {
  const { weeks, timers, isLoading, checkAndInitializeDayTimer } = useFloor();
  const timeState = useTimeEngine(60000);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(1);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  const selectedWeek = weeks.find(w => w.week_number === selectedWeekNumber);
  const selectedDay = selectedWeek?.days?.find(d => d.day_number === selectedDayNumber);

  // Auto-initialize timer on page load
  useEffect(() => {
    checkAndInitializeDayTimer();
  }, [checkAndInitializeDayTimer]);

  // Check if selected day is current day
  const isCurrentDay = selectedDay?.day_number === timeState.dayNumber;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-0 pt-40 md:pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 pt-40 md:pt-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">The Floor</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Master execution plan. Motion = proof. Silence = normal. Boredom = success.
          </p>
        </div>

        {/* Week Selector */}
        <div className="mb-6">
          <WeekSelector 
            weeks={weeks} 
            selectedWeek={selectedWeekNumber} 
            onSelectWeek={setSelectedWeekNumber} 
          />
        </div>

        {/* Week Overview + Day Content */}
        {selectedWeek && (
          <div className="space-y-6">
            {/* Week Overview */}
            <WeekOverview week={selectedWeek} />

            {/* Day Selector */}
            {selectedWeek.days && selectedWeek.days.length > 0 && (
              <DaySelector 
                days={selectedWeek.days} 
                timers={timers}
                selectedDay={selectedDayNumber} 
                onSelectDay={setSelectedDayNumber} 
              />
            )}

            {/* Day Detail Panel */}
            {selectedDay && (
              <div className="bg-card border border-border rounded-lg p-6">
                <DayDetailPanel 
                  day={selectedDay} 
                  timer={timers[selectedDay.id]}
                  isCurrentDay={isCurrentDay}
                />
              </div>
            )}

            {/* Prompt to select a day */}
            {!selectedDay && selectedWeek.days && selectedWeek.days.length > 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-mono text-sm">Select a day to view execution details</p>
              </div>
            )}
          </div>
        )}

        {/* No weeks available */}
        {weeks.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No floor data available. Refresh to initialize.</p>
          </div>
        )}

        {/* Floor Philosophy Footer */}
        <div className="mt-12 border-t border-border pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Rule 1</div>
              <div className="text-sm font-medium">The Floor does not motivate</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Rule 2</div>
              <div className="text-sm font-medium">The Floor does not celebrate</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Rule 3</div>
              <div className="text-sm font-medium">The Floor records reality</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
