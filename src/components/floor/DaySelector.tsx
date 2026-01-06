import { FloorDay, FloorTimer } from '@/hooks/useFloor';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2 } from 'lucide-react';

interface DaySelectorProps {
  days: FloorDay[];
  timers: Record<string, FloorTimer>;
  selectedDay: number | null;
  onSelectDay: (dayNumber: number) => void;
}

export function DaySelector({ days, timers, selectedDay, onSelectDay }: DaySelectorProps) {
  const getDayStatus = (day: FloorDay) => {
    const timer = timers[day.id];
    if (!timer) return 'pending';
    
    const now = new Date();
    const endsAt = new Date(timer.ends_at);
    
    if (timer.is_active && now < endsAt) return 'active';
    if (now >= endsAt) return 'completed';
    return 'pending';
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
        Select Day
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const status = getDayStatus(day);
          
          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.day_number)}
              className={cn(
                "relative p-3 rounded-lg border transition-all duration-200",
                "font-mono text-center",
                "hover:border-primary/50",
                selectedDay === day.day_number
                  ? "bg-primary/10 border-primary"
                  : "bg-card border-border hover:bg-muted/50"
              )}
            >
              <div className="text-lg font-bold">{day.day_number}</div>
              <div className="text-[10px] text-muted-foreground mt-1 truncate">
                {day.title.split(' ')[0]}
              </div>
              
              {/* Status indicator */}
              {status === 'active' && (
                <Clock className="absolute top-1 right-1 w-3 h-3 text-amber-500" />
              )}
              {status === 'completed' && (
                <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-green-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
