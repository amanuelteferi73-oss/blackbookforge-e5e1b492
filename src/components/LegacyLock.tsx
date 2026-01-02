import { useTimeEngine } from '@/hooks/useTimeEngine';
import { END_DATE, formatDuration } from '@/lib/timeEngine';
import { Lock, Unlock } from 'lucide-react';

export function LegacyLock() {
  const time = useTimeEngine(1000);
  const isUnlocked = time.isAfterEnd;

  return (
    <section className="py-8">
      <div className="execution-card p-8 rounded border-2 border-dashed border-locked/50">
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            isUnlocked ? 'bg-success/20' : 'bg-locked/20'
          }`}>
            {isUnlocked ? (
              <Unlock className="w-10 h-10 text-success" />
            ) : (
              <Lock className="w-10 h-10 text-locked-foreground" />
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            LEGACY VAULT
          </h3>
          
          {isUnlocked ? (
            <p className="text-success">
              The year is complete. Access granted.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground text-sm mb-4">
                Completely inaccessible until February 1, 2027
              </p>
              <div className="font-mono text-lg text-locked-foreground">
                {formatDuration(time.remaining)} remaining
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
