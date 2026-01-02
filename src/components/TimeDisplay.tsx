import { useTimeEngine } from '@/hooks/useTimeEngine';
import { formatDuration, formatDate, START_DATE, END_DATE, hasSynced } from '@/lib/timeEngine';

export function TimeDisplay() {
  const time = useTimeEngine(1000);
  const synced = hasSynced();

  // Visual urgency states (only apply when system is active)
  const isUrgent = time.isActive && time.remaining.days < 30;
  const isCritical = time.isActive && time.remaining.days < 7;
  
  // Display day number: show 0 as "—" if before start
  const displayDayNumber = time.isBeforeStart ? '—' : time.dayNumber;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Left: Elapsed (Count-Up) */}
          <div className="flex flex-col items-start min-w-0">
            <span className="data-label text-xs uppercase tracking-wider text-muted-foreground">
              Time Elapsed
            </span>
            <span className="font-mono text-base sm:text-lg text-primary tabular-nums">
              {formatDuration(time.elapsed)}
            </span>
          </div>

          {/* Center: Progress */}
          <div className="flex flex-col items-center flex-1 max-w-xs sm:max-w-md mx-4 sm:mx-8">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="data-label text-xs uppercase tracking-wider text-muted-foreground">
                {time.isBeforeStart ? 'Not Started' : `Day ${displayDayNumber}/${time.totalDays}`}
              </span>
              <span className="font-mono text-xs sm:text-sm text-foreground tabular-nums">
                {time.percentComplete.toFixed(2)}%
              </span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  isCritical 
                    ? 'bg-destructive' 
                    : isUrgent 
                      ? 'bg-gradient-to-r from-destructive via-warning to-warning'
                      : 'bg-gradient-to-r from-destructive via-warning to-success'
                }`}
                style={{ width: `${time.percentComplete}%` }}
              />
            </div>
            <div className="flex justify-between w-full mt-1">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono">
                {formatDate(START_DATE)}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono">
                {formatDate(END_DATE)}
              </span>
            </div>
          </div>

          {/* Right: Remaining (Countdown) */}
          <div className="flex flex-col items-end min-w-0">
            <span className="data-label text-xs uppercase tracking-wider text-muted-foreground">
              Time Remaining
            </span>
            <span 
              className={`font-mono text-base sm:text-lg tabular-nums ${
                isCritical 
                  ? 'text-destructive animate-pulse' 
                  : isUrgent 
                    ? 'text-destructive' 
                    : 'text-foreground'
              }`}
            >
              {formatDuration(time.remaining)}
            </span>
          </div>
        </div>

        {/* Sync indicator - subtle */}
        {!synced && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <span className="text-[10px] text-muted-foreground/50 font-mono">
              syncing...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
