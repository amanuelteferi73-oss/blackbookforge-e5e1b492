import { useTimeEngine } from '@/hooks/useTimeEngine';
import { formatDuration, formatDate, START_DATE, END_DATE } from '@/lib/timeEngine';

export function TimeDisplay() {
  const time = useTimeEngine(1000);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Left: Elapsed */}
          <div className="flex flex-col items-start">
            <span className="data-label">Time Elapsed</span>
            <span className="font-mono text-lg text-primary">
              {formatDuration(time.elapsed)}
            </span>
          </div>

          {/* Center: Progress */}
          <div className="flex flex-col items-center flex-1 max-w-md mx-8">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="data-label">Day {time.dayNumber}/{time.totalDays}</span>
              <span className="font-mono text-sm text-foreground">
                {time.percentComplete.toFixed(2)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-destructive via-warning to-success transition-all duration-1000"
                style={{ width: `${time.percentComplete}%` }}
              />
            </div>
            <div className="flex justify-between w-full mt-1">
              <span className="text-[10px] text-muted-foreground font-mono">
                {formatDate(START_DATE)}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {formatDate(END_DATE)}
              </span>
            </div>
          </div>

          {/* Right: Remaining */}
          <div className="flex flex-col items-end">
            <span className="data-label">Time Remaining</span>
            <span className={`font-mono text-lg ${time.remaining.days < 30 ? 'text-destructive timer-glow' : 'text-foreground'}`}>
              {formatDuration(time.remaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
