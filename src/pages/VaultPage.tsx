import { useState } from 'react';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import { VAULT_REWARDS, getPhaseOrder, getRewardsByPhase, VaultReward } from '@/lib/vaultRewards';
import { useVaultAssets } from '@/hooks/useVaultAssets';
import { PhaseGroup } from '@/components/vault/PhaseGroup';
import { ProofUploadModal } from '@/components/vault/ProofUploadModal';
import { LegacyLock } from '@/components/LegacyLock';

export default function VaultPage() {
  const { assets, isLoading, submitProof, claimReward, getAssetState } = useVaultAssets();
  const [selectedReward, setSelectedReward] = useState<VaultReward | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAssetClick = (reward: VaultReward) => {
    setSelectedReward(reward);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReward(null);
  };

  // Calculate vault stats
  const totalRewards = VAULT_REWARDS.length;
  const unlockedCount = VAULT_REWARDS.filter(r => getAssetState(r.id).isUnlocked).length;
  const proofsPending = VAULT_REWARDS.filter(r => {
    const state = getAssetState(r.id);
    return state.proofUploaded && !state.isUnlocked;
  }).length;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 pt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            ASSET VAULT
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your rewards. Locked until earned.
          </p>
        </div>

        {/* Vault Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="execution-card p-4 rounded text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-locked-foreground" />
            </div>
            <p className="font-mono text-xl text-foreground">{totalRewards - unlockedCount}</p>
            <span className="data-label">Locked</span>
          </div>
          <div className="execution-card p-4 rounded text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Unlock className="w-4 h-4 text-success" />
            </div>
            <p className="font-mono text-xl text-success">{unlockedCount}</p>
            <span className="data-label">Unlocked</span>
          </div>
          <div className="execution-card p-4 rounded text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-warning/50 animate-pulse" />
            </div>
            <p className="font-mono text-xl text-warning">{proofsPending}</p>
            <span className="data-label">Pending</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Phase Groups */}
        {!isLoading && getPhaseOrder().map(phase => (
          <PhaseGroup
            key={phase}
            phase={phase}
            rewards={getRewardsByPhase(phase)}
            getAssetState={getAssetState}
            onAssetClick={handleAssetClick}
          />
        ))}

        {/* Legacy Lock Section */}
        <div className="mt-12">
          <LegacyLock />
        </div>
      </div>

      {/* Proof Upload Modal */}
      <ProofUploadModal
        reward={selectedReward}
        state={selectedReward ? getAssetState(selectedReward.id) : null}
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmitProof={submitProof}
        onClaimReward={claimReward}
      />
    </div>
  );
}
