import { useState, useRef } from 'react';
import { Upload, Check, ExternalLink, X, Loader2 } from 'lucide-react';
import { VaultReward } from '@/lib/vaultRewards';
import { VaultAssetState } from '@/hooks/useVaultAssets';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ProofUploadModalProps {
  reward: VaultReward | null;
  state: VaultAssetState | null;
  open: boolean;
  onClose: () => void;
  onUploadProof: (rewardId: number, file: File) => Promise<boolean>;
  onClaimReward: (rewardId: number) => Promise<boolean>;
}

export function ProofUploadModal({
  reward,
  state,
  open,
  onClose,
  onUploadProof,
  onClaimReward,
}: ProofUploadModalProps) {
  const [proofUploaded, setProofUploaded] = useState(state?.proofUploaded || false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens with new reward
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      // Reset local state after close animation
      setTimeout(() => {
        setProofUploaded(false);
        setUploadedFileName(null);
      }, 200);
    }
  };

  // Sync with state prop when it changes
  if (state?.proofUploaded && !proofUploaded) {
    setProofUploaded(true);
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !reward) return;

    setIsUploading(true);
    const success = await onUploadProof(reward.id, file);
    setIsUploading(false);

    if (success) {
      setProofUploaded(true);
      setUploadedFileName(file.name);
    }
  };

  const handleClaim = async () => {
    if (!reward) return;

    setIsClaiming(true);
    const success = await onClaimReward(reward.id);
    setIsClaiming(false);

    if (success && reward.rewardLink) {
      window.open(reward.rewardLink, '_blank', 'noopener,noreferrer');
      onClose();
    } else if (success) {
      onClose();
    }
  };

  if (!reward) return null;

  const isUnlocked = state?.isUnlocked || false;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">
              #{String(reward.id).padStart(2, '0')}
            </span>
            <span className="text-foreground">{reward.title}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Already Unlocked State */}
        {isUnlocked ? (
          <div className="space-y-4">
            <div className="p-4 bg-success/10 border border-success/30 rounded">
              <div className="flex items-center gap-2 text-success font-medium mb-2">
                <Check className="w-5 h-5" />
                <span>Reward Unlocked</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Unlocked on {state?.unlockedAt ? new Date(state.unlockedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="data-label">Your Reward</span>
              <h3 className="text-lg font-semibold text-foreground">
                {reward.rewardTitle}
              </h3>
              <p className="text-sm text-muted-foreground">
                Enjoyment time: {reward.enjoymentTime}
              </p>
            </div>

            {reward.rewardLink && (
              <Button
                onClick={() => window.open(reward.rewardLink, '_blank', 'noopener,noreferrer')}
                className="w-full bg-success text-success-foreground hover:bg-success/90"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Reward
              </Button>
            )}

            {reward.rewardText && (
              <div className="p-4 bg-muted rounded">
                <p className="text-foreground">{reward.rewardText}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section A: Proof Upload */}
            <div className={cn(
              'p-4 rounded border transition-colors',
              proofUploaded
                ? 'bg-success/10 border-success/30'
                : 'bg-muted border-border'
            )}>
              <div className="flex items-center gap-2 mb-3">
                {proofUploaded ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <Upload className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="font-medium text-foreground">
                  {proofUploaded ? 'Proof Recorded' : 'Upload Proof'}
                </span>
              </div>

              {proofUploaded ? (
                <p className="text-sm text-success">
                  {uploadedFileName || 'Proof uploaded successfully'}
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload proof to mark this as completed.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Select Screenshot
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Section B: Reward Confirmation (shown after proof) */}
            {proofUploaded && (
              <div className="p-4 rounded border border-accent/30 bg-accent/5 animate-in fade-in slide-in-from-bottom-2">
                <span className="data-label block mb-2">Your Reward</span>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {reward.rewardTitle}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enjoyment time: {reward.enjoymentTime}
                </p>

                <Button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      You Earned This
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
