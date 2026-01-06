import { FloorWeek } from '@/hooks/useFloor';
import { cn } from '@/lib/utils';

// Week titles for display
const WEEK_TITLES: Record<number, string> = {
  1: 'Foundation & Proof of Motion',
  2: 'Pressure, Clarity & Commitment',
  3: 'Deep Build & System Construction',
  4: 'Public Existence & First Reality Contact'
};

interface WeekSelectorProps {
  weeks: FloorWeek[];
  selectedWeek: number | null;
  onSelectWeek: (weekNumber: number) => void;
}

export function WeekSelector({ weeks, selectedWeek, onSelectWeek }: WeekSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
        Select Week
      </h2>
      <div className="flex flex-wrap gap-3">
        {weeks.map((week) => (
          <button
            key={week.id}
            onClick={() => onSelectWeek(week.week_number)}
            className={cn(
              "px-6 py-4 rounded-lg border transition-all duration-200 text-left",
              "font-mono text-sm",
              "hover:border-primary/50",
              selectedWeek === week.week_number
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card border-border text-foreground hover:bg-muted/50"
            )}
          >
            <div className="font-medium">Week {week.week_number}</div>
            <div className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              {WEEK_TITLES[week.week_number] || `Week ${week.week_number}`}
            </div>
          </button>
        ))}
        
        {/* Placeholder for future weeks */}
        {[5].filter(n => !weeks.find(w => w.week_number === n)).map((weekNum) => (
          <div
            key={`placeholder-${weekNum}`}
            className="px-6 py-4 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground/50 font-mono text-sm cursor-not-allowed"
          >
            <div>Week {weekNum}</div>
            <div className="text-xs mt-1">Coming soon</div>
          </div>
        ))}
      </div>
    </div>
  );
}
