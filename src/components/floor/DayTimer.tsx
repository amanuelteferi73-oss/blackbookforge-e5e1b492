import { useState, useEffect } from 'react';
import { FloorTimer } from '@/hooks/useFloor';
import { Button } from '@/components/ui/button';
import { Play, Clock } from 'lucide-react';

interface DayTimerProps {
  timer: FloorTimer | undefined;
  onStartTimer: () => void;
}

export function DayTimer({ timer, onStartTimer }: DayTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!timer) {
      setTimeRemaining('');
      setIsExpired(false);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const endsAt = new Date(timer.ends_at);
      const diff = endsAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  if (!timer) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-mono">Day Execution Timer</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Start the 24-hour execution window when you're ready to begin this day.
        </p>
        <Button onClick={onStartTimer} className="w-full gap-2">
          <Play className="w-4 h-4" />
          Start Day Execution
        </Button>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 space-y-2 ${isExpired ? 'bg-destructive/10 border-destructive/50' : 'bg-card border-border'}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className={`w-4 h-4 ${isExpired ? 'text-destructive' : 'text-amber-500'}`} />
        <span className="text-xs uppercase tracking-widest font-mono">
          {isExpired ? 'Timer Expired' : 'Time Remaining'}
        </span>
      </div>
      <div className={`font-mono text-3xl font-bold tracking-wider ${isExpired ? 'text-destructive' : 'text-foreground'}`}>
        {timeRemaining}
      </div>
      {!isExpired && (
        <p className="text-xs text-muted-foreground">
          Complete your Check-In before the timer reaches zero.
        </p>
      )}
    </div>
  );
}
