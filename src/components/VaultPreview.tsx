import { ArrowRight, Lock, LockOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VAULT_REWARDS } from '@/lib/vaultRewards';
import { useVaultAssets } from '@/hooks/useVaultAssets';

function VaultPreviewCard({
  id,
  title,
  isUnlocked,
}: {
  id: number;
  title: string;
  isUnlocked: boolean;
}) {
  const StatusIcon = isUnlocked ? LockOpen : Lock;

  return (
    <div
      className={
        `min-w-[240px] sm:min-w-[260px] snap-start rounded border p-4 ` +
        (isUnlocked
          ? 'border-primary/40 bg-primary/10'
          : 'border-border bg-muted/20')
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground font-mono">REWARD {id}</p>
          <h3 className="text-sm font-semibold text-foreground tracking-tight mt-1 line-clamp-2">
            {title}
          </h3>
        </div>
        <div
          className={
            `shrink-0 w-9 h-9 rounded flex items-center justify-center border ` +
            (isUnlocked
              ? 'border-primary/30 bg-primary/10'
              : 'border-border bg-muted/30')
          }
        >
          <StatusIcon
            className={
              `w-4 h-4 ` + (isUnlocked ? 'text-primary' : 'text-muted-foreground')
            }
          />
        </div>
      </div>

      <div className="mt-3">
        <span
          className={
            `text-[11px] px-2 py-1 rounded border ` +
            (isUnlocked
              ? 'border-primary/30 text-primary'
              : 'border-border text-muted-foreground')
          }
        >
          {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
        </span>
      </div>
    </div>
  );
}

export function VaultPreview() {
  const { getAssetState, isLoading } = useVaultAssets();

  // Dashboard preview = first 10 rewards
  const previewRewards = VAULT_REWARDS.slice(0, 10);
  const unlockedCount = previewRewards.filter(r => getAssetState(r.id).isUnlocked).length;

  return (
    <section className="py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">VAULT STATUS</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Locked rewards. Earn access through execution.
        </p>
      </div>

      <div className="execution-card p-4 sm:p-6 rounded">
        {/* Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ignition Phase</span>
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              1–10
            </span>
          </div>
          <div className="text-sm font-mono">
            <span className="text-primary">{isLoading ? '—' : unlockedCount}</span>
            <span className="text-muted-foreground">/10 unlocked</span>
          </div>
        </div>

        {/* Horizontal preview (mobile-first) */}
        <div className="-mx-4 sm:mx-0">
          <div className="px-4 sm:px-0 flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory">
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[240px] sm:min-w-[260px] h-[110px] rounded border border-border bg-muted animate-pulse snap-start"
                  />
                ))
              : previewRewards.map(reward => (
                  <VaultPreviewCard
                    key={reward.id}
                    id={reward.id}
                    title={reward.title}
                    isUnlocked={getAssetState(reward.id).isUnlocked}
                  />
                ))}
          </div>
        </div>

        {/* Directory to full vault */}
        <Link
          to="/vault"
          className="mt-2 flex items-center justify-center gap-2 p-3 rounded border border-border bg-muted/30 hover:bg-muted/50 transition-colors group"
        >
          <span className="text-sm text-foreground font-medium">Open Asset Vault</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>
    </section>
  );
}
