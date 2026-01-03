import { Lock, Unlock, Clock, ExternalLink } from 'lucide-react';
import { VaultReward } from '@/lib/vaultRewards';
import { VaultAssetState } from '@/hooks/useVaultAssets';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  reward: VaultReward;
  state: VaultAssetState;
  onClick: () => void;
}

export function AssetCard({ reward, state, onClick }: AssetCardProps) {
  const isUnlocked = state.isUnlocked;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-5 rounded border transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
        isUnlocked
          ? 'bg-success/10 border-success/40 hover:border-success/60'
          : 'bg-card border-border hover:border-locked-foreground/50'
      )}
    >
      {/* Header with ID and Lock Status */}
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-xs text-muted-foreground">
          #{String(reward.id).padStart(2, '0')}
        </span>
        <div className={cn(
          'flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
          isUnlocked
            ? 'bg-success/20 text-success'
            : 'bg-locked/30 text-locked-foreground'
        )}>
          {isUnlocked ? (
            <>
              <Unlock className="w-3 h-3" />
              <span>UNLOCKED</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>LOCKED</span>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-bold text-lg tracking-tight mb-3',
        isUnlocked ? 'text-success' : 'text-foreground'
      )}>
        {reward.title}
      </h3>

      {/* Unlock Rule */}
      <div className="mb-3">
        <span className="data-label block mb-1">Unlock Rule</span>
        <p className={cn(
          'text-sm leading-relaxed',
          isUnlocked ? 'text-muted-foreground' : 'text-foreground/80'
        )}>
          {reward.unlockRule}
        </p>
      </div>

      {/* When */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>{reward.when}</span>
      </div>

      {/* Unlocked: Show reward info */}
      {isUnlocked && (
        <div className="mt-4 pt-4 border-t border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="data-label block mb-0.5">Reward</span>
              <p className="text-sm text-success font-medium">{reward.rewardTitle}</p>
            </div>
            {reward.rewardLink && (
              <ExternalLink className="w-4 h-4 text-success/60" />
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Enjoy for {reward.enjoymentTime}
          </div>
        </div>
      )}

      {/* Locked: Visual indicator */}
      {!isUnlocked && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-locked-foreground">
            <div className="w-2 h-2 rounded-full bg-locked-foreground/50 animate-pulse" />
            <span>Awaiting proof</span>
          </div>
        </div>
      )}
    </button>
  );
}
