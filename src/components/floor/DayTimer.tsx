import { useState, useEffect } from 'react';
import { FloorTimer } from '@/hooks/useFloor';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DayTimerProps {
  timer: FloorTimer | undefined;
  isCurrentDay: boolean;
}

export function DayTimer({ timer, isCurrentDay }: DayTimerProps) {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isStopped, setIsStopped] = useState(false);

  useEffect(() => {
    if (!timer) {
      setTimeRemaining('');
      setIsExpired(false);
      setIsStopped(false);
      return;
    }

    // Check if timer was stopped (check-in completed)
    if (timer.stopped_at) {
      setIsStopped(true);
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

  // Timer completed (check-in done)
  if (isStopped) {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-mono">Day Completed</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Check-in submitted. Timer stopped successfully.
        </p>
      </div>
    );
  }

  // No timer yet (day not reached or not initialized)
  if (!timer) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-mono">Day Timer</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {isCurrentDay 
            ? 'Timer will auto-start at midnight. Complete your check-in before it expires.'
            : 'Timer not available for this day.'}
        </p>
      </div>
    );
  }

  // Timer expired
  if (isExpired) {
    return (
      <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-destructive">
          <Clock className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-mono">Timer Expired</span>
        </div>
        <div className="font-mono text-3xl font-bold tracking-wider text-destructive">
          00:00:00
        </div>
        <p className="text-sm text-destructive/80">
          You failed to complete your check-in. Score: 0%. Punishment applied.
        </p>
      </div>
    );
  }

  // Active timer - countdown
  const isLowTime = timeRemaining && parseInt(timeRemaining.split(':')[0]) < 2; // Less than 2 hours

  return (
    <div className={`border rounded-lg p-4 space-y-3 ${isLowTime ? 'bg-amber-500/10 border-amber-500/50' : 'bg-card border-border'}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className={`w-4 h-4 ${isLowTime ? 'text-amber-500' : 'text-amber-500'}`} />
        <span className="text-xs uppercase tracking-widest font-mono">
          Time Remaining
        </span>
      </div>
      <div className={`font-mono text-3xl font-bold tracking-wider ${isLowTime ? 'text-amber-500' : 'text-foreground'}`}>
        {timeRemaining}
      </div>
      <p className="text-xs text-muted-foreground">
        Complete your Check-In before the timer reaches zero.
      </p>
      {isCurrentDay && (
        <Button 
          onClick={() => navigate('/check-in')} 
          className="w-full gap-2"
          variant={isLowTime ? 'destructive' : 'default'}
        >
          <CheckCircle className="w-4 h-4" />
          Complete Day (Go to Check-In)
        </Button>
      )}
    </div>
  );
}
