import { useTimeEngine } from '@/hooks/useTimeEngine';
import { formatDuration } from '@/lib/timeEngine';
import { Lock, Unlock, Play } from 'lucide-react';

// Legacy content - unlocks January 1, 2027
const LEGACY_VIDEO_URL = 'https://youtu.be/e_O3I-ynUUE';

export function LegacyLock() {
  const time = useTimeEngine(1000);
  const isUnlocked = time.isAfterEnd;

  return (
    <section className="py-8">
      <div className={`execution-card p-8 rounded border-2 border-dashed ${
        isUnlocked ? 'border-success/50' : 'border-locked/50'
      }`}>
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
            <div className="space-y-4">
              <p className="text-success">
                The year is complete. Access granted.
              </p>
              
              {/* Unlocked Video Content */}
              <a
                href={LEGACY_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-success/10 hover:bg-success/20 border border-success/30 rounded transition-colors"
              >
                <Play className="w-5 h-5 text-success" />
                <span className="text-success font-medium">Watch Legacy Message</span>
              </a>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-sm mb-4">
                Completely inaccessible until January 1, 2027
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
