import { useTimeEngine } from '@/hooks/useTimeEngine';
import { formatDuration, formatDate, START_DATE, END_DATE, hasSynced } from '@/lib/timeEngine';

// Target: $1,000,000 over 365 days
const TARGET_AMOUNT = 1_000_000;

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  } else if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

export function TimeDisplay() {
  const time = useTimeEngine(1000);
  const synced = hasSynced();

  // Visual urgency states (only apply when system is active)
  const isUrgent = time.isActive && time.remaining.days < 30;
  const isCritical = time.isActive && time.remaining.days < 7;
  
  // Display day number: show 0 as "—" if before start
  const displayDayNumber = time.isBeforeStart ? '—' : time.dayNumber;

  // Money progress calculation
  const dailyTarget = TARGET_AMOUNT / time.totalDays;
  const expectedAmount = time.isBeforeStart ? 0 : Math.min(dailyTarget * time.dayNumber, TARGET_AMOUNT);
  const moneyPercent = (expectedAmount / TARGET_AMOUNT) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        {/* Mobile Layout: Stacked */}
        <div className="flex flex-col py-3 md:hidden">
          {/* Row 1: Time Elapsed & Time Remaining */}
          <div className="flex justify-between items-start mb-3">
            {/* Left: Elapsed (Count-Up) */}
            <div className="flex flex-col items-start">
              <span className="data-label text-[10px] uppercase tracking-wider text-muted-foreground">
                Time Elapsed
              </span>
              <span className="font-mono text-sm text-primary tabular-nums">
                {formatDuration(time.elapsed)}
              </span>
            </div>

            {/* Right: Remaining (Countdown) */}
            <div className="flex flex-col items-end">
              <span className="data-label text-[10px] uppercase tracking-wider text-muted-foreground">
                Time Remaining
              </span>
              <span 
                className={`font-mono text-sm tabular-nums ${
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

          {/* Row 2: Day Progress */}
          <div className="flex flex-col w-full mb-3">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="data-label text-[10px] uppercase tracking-wider text-muted-foreground">
                {time.isBeforeStart ? 'Not Started' : `Day ${displayDayNumber}/${time.totalDays}`}
              </span>
              <span className="font-mono text-xs text-foreground tabular-nums">
                {time.percentComplete.toFixed(2)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
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
              <span className="text-[8px] text-muted-foreground font-mono">
                {formatDate(START_DATE)}
              </span>
              <span className="text-[8px] text-muted-foreground font-mono">
                {formatDate(END_DATE)}
              </span>
            </div>
          </div>

          {/* Row 3: Money Progress */}
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="data-label text-[10px] uppercase tracking-wider text-muted-foreground">
                {time.isBeforeStart ? 'Target' : `Day ${displayDayNumber} Target`}
              </span>
              <span className="font-mono text-xs text-success tabular-nums">
                {formatMoney(expectedAmount)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-1000 bg-gradient-to-r from-success/50 via-success to-success"
                style={{ width: `${moneyPercent}%` }}
              />
            </div>
            <div className="flex justify-between w-full mt-1">
              <span className="text-[8px] text-muted-foreground font-mono">$0</span>
              <span className="text-[8px] text-success font-mono">$1,000,000</span>
            </div>
          </div>
        </div>

        {/* Desktop Layout: Side by Side */}
        <div className="hidden md:flex items-center justify-between py-4">
          {/* Left: Elapsed (Count-Up) */}
          <div className="flex flex-col items-start min-w-0">
            <span className="data-label text-xs uppercase tracking-wider text-muted-foreground">
              Time Elapsed
            </span>
            <span className="font-mono text-lg text-primary tabular-nums">
              {formatDuration(time.elapsed)}
            </span>
          </div>

          {/* Center: Progress Bars */}
          <div className="flex flex-col items-center flex-1 max-w-lg mx-8 gap-3">
            {/* Day Progress */}
            <div className="w-full">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="data-label text-xs uppercase tracking-wider text-muted-foreground">
                  {time.isBeforeStart ? 'Not Started' : `Day ${displayDayNumber}/${time.totalDays}`}
                </span>
                <span className="font-mono text-sm text-foreground tabular-nums">
                  {time.percentComplete.toFixed(2)}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
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
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatDate(START_DATE)}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatDate(END_DATE)}
                </span>
              </div>
            </div>

            {/* Money Progress */}
            <div className="w-full">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="data-label text-xs uppercase tracking-wider text-muted-foreground">
                  {time.isBeforeStart ? 'Target' : `Day ${displayDayNumber} Target`}
                </span>
                <span className="font-mono text-sm text-success tabular-nums">
                  {formatMoney(expectedAmount)}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 bg-gradient-to-r from-success/50 via-success to-success"
                  style={{ width: `${moneyPercent}%` }}
                />
              </div>
              <div className="flex justify-between w-full mt-1">
                <span className="text-[10px] text-muted-foreground font-mono">$0</span>
                <span className="text-[10px] text-success font-mono">$1,000,000</span>
              </div>
            </div>
          </div>

          {/* Right: Remaining (Countdown) */}
          <div className="flex flex-col items-end min-w-0">
            <span className="data-label text-xs uppercase tracking-wider text-muted-foreground">
              Time Remaining
            </span>
            <span 
              className={`font-mono text-lg tabular-nums ${
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
