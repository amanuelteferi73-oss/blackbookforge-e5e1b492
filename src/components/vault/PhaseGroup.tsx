import { VaultReward, PHASE_LABELS, PHASE_RANGES } from '@/lib/vaultRewards';
import { VaultAssetState } from '@/hooks/useVaultAssets';
import { AssetCard } from './AssetCard';

interface PhaseGroupProps {
  phase: VaultReward['phase'];
  rewards: VaultReward[];
  getAssetState: (rewardId: number) => VaultAssetState;
  onAssetClick: (reward: VaultReward) => void;
}

export function PhaseGroup({ phase, rewards, getAssetState, onAssetClick }: PhaseGroupProps) {
  if (rewards.length === 0) return null;

  const unlockedCount = rewards.filter(r => getAssetState(r.id).isUnlocked).length;
  const totalCount = rewards.length;

  return (
    <section className="mb-10">
      {/* Phase Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border" />
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            {PHASE_LABELS[phase]}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rewards {PHASE_RANGES[phase]} • {unlockedCount}/{totalCount} unlocked
          </p>
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Asset Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map(reward => (
          <AssetCard
            key={reward.id}
            reward={reward}
            state={getAssetState(reward.id)}
            onClick={() => onAssetClick(reward)}
          />
        ))}
      </div>
    </section>
  );
}
