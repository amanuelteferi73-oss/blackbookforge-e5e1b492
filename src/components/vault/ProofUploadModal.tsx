import { useState } from 'react';
import { Check, ExternalLink, Loader2, PenLine } from 'lucide-react';
import { VaultReward } from '@/lib/vaultRewards';
import { VaultAssetState } from '@/hooks/useVaultAssets';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  onSubmitProof: (rewardId: number, anchorText: string, reflectionText: string) => Promise<boolean>;
  onClaimReward: (rewardId: number) => Promise<boolean>;
}

export function ProofUploadModal({
  reward,
  state,
  open,
  onClose,
  onSubmitProof,
  onClaimReward,
}: ProofUploadModalProps) {
  const [step, setStep] = useState<'proof' | 'confirm'>('proof');
  const [anchorText, setAnchorText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Reset state when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setTimeout(() => {
        setStep('proof');
        setAnchorText('');
        setReflectionText('');
      }, 200);
    }
  };

  const handleContinue = () => {
    setStep('confirm');
  };

  const handleCancel = () => {
    setStep('proof');
  };

  const handleConfirmUnlock = async () => {
    if (!reward) return;

    setIsSubmitting(true);
    const proofSuccess = await onSubmitProof(reward.id, anchorText, reflectionText);
    
    if (proofSuccess) {
      setIsClaiming(true);
      const claimSuccess = await onClaimReward(reward.id);
      setIsClaiming(false);
      
      if (claimSuccess && reward.rewardLink) {
        window.open(reward.rewardLink, '_blank', 'noopener,noreferrer');
      }
      onClose();
    }
    setIsSubmitting(false);
  };

  if (!reward) return null;

  const isUnlocked = state?.isUnlocked || false;
  const canContinue = anchorText.trim().length > 0 && reflectionText.trim().length > 0;

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

            {/* Show saved proof text if exists */}
            {(state?.proofText || state?.proofReflection) && (
              <div className="p-4 bg-muted/50 rounded border border-border space-y-3">
                <span className="data-label text-xs">Your Proof (Permanent)</span>
                {state.proofText && (
                  <p className="text-sm text-muted-foreground italic">"{state.proofText}"</p>
                )}
                {state.proofReflection && (
                  <p className="text-sm text-foreground">{state.proofReflection}</p>
                )}
              </div>
            )}

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
        ) : step === 'proof' ? (
          /* Step 1: Text-Based Proof */
          <div className="space-y-6">
            <div className="p-4 rounded border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <PenLine className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Proof by Text</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This is personal. Be honest. This will be saved forever.
              </p>
            </div>

            {/* Question Block 1: Anchoring */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Yesterday was green.
              </label>
              <Textarea
                value={anchorText}
                onChange={(e) => setAnchorText(e.target.value)}
                placeholder="Yes / No / Neutral — or your own words..."
                className="min-h-[60px] bg-background border-border resize-none text-sm"
              />
            </div>

            {/* Question Block 2: Reflection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                What made this day different?
              </label>
              <Textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Take your time. Write what feels true..."
                className="min-h-[100px] bg-background border-border resize-none text-sm"
              />
            </div>

            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        ) : (
          /* Step 2: Confirmation */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 rounded border border-warning/30 bg-warning/5">
              <p className="text-sm text-foreground leading-relaxed">
                Once you unlock this vault, this proof will be saved permanently.
                <br />
                <span className="text-muted-foreground">You won't be able to edit or redo it.</span>
              </p>
            </div>

            {/* Preview of what was written */}
            <div className="p-4 bg-muted/30 rounded border border-border space-y-3">
              <span className="data-label text-xs">Your Proof</span>
              <p className="text-sm text-muted-foreground italic">"{anchorText}"</p>
              <p className="text-sm text-foreground">{reflectionText}</p>
            </div>

            {/* Reward Preview */}
            <div className="p-4 rounded border border-accent/30 bg-accent/5">
              <span className="data-label block mb-2">Your Reward</span>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {reward.rewardTitle}
              </h3>
              <p className="text-sm text-muted-foreground">
                Enjoyment time: {reward.enjoymentTime}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting || isClaiming}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUnlock}
                disabled={isSubmitting || isClaiming}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isSubmitting || isClaiming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm & Unlock
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}