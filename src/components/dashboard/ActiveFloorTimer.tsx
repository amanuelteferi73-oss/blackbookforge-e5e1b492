import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useActiveFloorTimer } from '@/hooks/useActiveFloorTimer';
import { Link } from 'react-router-dom';

export function ActiveFloorTimer() {
  const { activeTimer, isLoading } = useActiveFloorTimer();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!activeTimer) {
      setTimeRemaining('');
      setIsExpired(false);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const endsAt = new Date(activeTimer.ends_at);
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
  }, [activeTimer]);

  // Don't render anything if loading, no timer, or expired
  if (isLoading || !activeTimer || isExpired) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 mt-6">
      <Link to="/floor" className="block">
        <div className="bg-card border border-amber-500/30 rounded-lg p-4 hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                  Day {activeTimer.day_number} Execution Timer
                </p>
                <p className="text-sm text-foreground/80 mt-0.5">
                  {activeTimer.day_title}
                </p>
              </div>
            </div>
            <div className="font-mono text-2xl md:text-3xl font-bold tracking-wider text-foreground">
              {timeRemaining}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
