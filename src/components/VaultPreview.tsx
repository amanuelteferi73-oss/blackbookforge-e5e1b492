import { Lock, Unlock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VAULT_REWARDS } from '@/lib/vaultRewards';
import { useVaultAssets } from '@/hooks/useVaultAssets';

export function VaultPreview() {
  const { getAssetState, isLoading } = useVaultAssets();
  
  // Get first 10 rewards (Ignition phase)
  const previewRewards = VAULT_REWARDS.slice(0, 10);
  
  const unlockedCount = previewRewards.filter(r => getAssetState(r.id).isUnlocked).length;

  return (
    <section className="py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          VAULT STATUS
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Locked rewards. Earn access through execution.
        </p>
      </div>

      <div className="execution-card p-4 sm:p-6 rounded">
        {/* Stats Summary */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ignition Phase</span>
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              1–10
            </span>
          </div>
          <div className="text-sm font-mono">
            <span className="text-primary">{unlockedCount}</span>
            <span className="text-muted-foreground">/10 unlocked</span>
          </div>
        </div>

        {/* Rewards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {previewRewards.map((reward) => {
              const state = getAssetState(reward.id);
              return (
                <div
                  key={reward.id}
                  className={`
                    aspect-square rounded flex flex-col items-center justify-center p-1 transition-colors
                    ${state.isUnlocked 
                      ? 'bg-primary/20 border border-primary/40' 
                      : 'bg-muted/50 border border-border'
                    }
                  `}
                  title={reward.title}
                >
                  {state.isUnlocked ? (
                    <Unlock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  ) : (
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  )}
                  <span className={`
                    text-[10px] sm:text-xs font-mono mt-0.5
                    ${state.isUnlocked ? 'text-primary' : 'text-muted-foreground'}
                  `}>
                    {reward.id}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Link to Full Vault */}
        <Link
          to="/vault"
          className="mt-4 flex items-center justify-center gap-2 p-3 rounded border border-border bg-muted/30 hover:bg-muted/50 transition-colors group"
        >
          <span className="text-sm text-foreground font-medium">
            View Full Vault
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>
    </section>
  );
}
