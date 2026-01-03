import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Lock } from 'lucide-react';

interface PunishmentProofProps {
  punishment: string;
  onSubmitProof: (feeling: string, commitment: string) => Promise<void>;
  isSubmitting: boolean;
}

export function PunishmentProof({ 
  punishment, 
  onSubmitProof,
  isSubmitting 
}: PunishmentProofProps) {
  const [feeling, setFeeling] = useState('');
  const [commitment, setCommitment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    
    if (!feeling.trim()) {
      setError('You must describe how this punishment felt.');
      return;
    }
    
    if (!commitment) {
      setError('You must select your commitment level.');
      return;
    }
    
    await onSubmitProof(feeling.trim(), commitment);
  };

  const canSubmit = feeling.trim().length > 0 && commitment !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="font-mono font-bold text-lg uppercase tracking-wide">
          Punishment Proof Required
        </h3>
        <p className="text-sm text-muted-foreground">
          Submit proof of execution. This can only be done once.
        </p>
      </div>

      {/* Punishment reminder */}
      <Card className="border-destructive/50 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">{punishment}</p>
        </div>
      </Card>

      {/* Question 1: How did it feel? */}
      <div className="space-y-3">
        <Label className="font-mono text-sm uppercase tracking-wide">
          How did this punishment feel?
        </Label>
        <p className="text-xs text-muted-foreground">
          Be honest. Shame, resistance, frustration, clarity — describe your experience.
        </p>
        <Textarea
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          placeholder="Describe how executing this punishment felt..."
          className="min-h-[120px] resize-none"
          disabled={isSubmitting}
        />
      </div>

      {/* Question 2: Commitment */}
      <div className="space-y-3">
        <Label className="font-mono text-sm uppercase tracking-wide">
          Are you committing to not repeating this mistake?
        </Label>
        <RadioGroup 
          value={commitment} 
          onValueChange={setCommitment}
          disabled={isSubmitting}
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="yes" id="commit-yes" />
            <Label htmlFor="commit-yes" className="cursor-pointer flex-1">
              Yes, committed
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="no" id="commit-no" />
            <Label htmlFor="commit-no" className="cursor-pointer flex-1">
              No, likely to repeat
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full"
        variant="destructive"
      >
        {isSubmitting ? (
          'Submitting Proof...'
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Submit Proof (Cannot Be Edited)
          </>
        )}
      </Button>

      {/* Warning */}
      <p className="text-xs text-muted-foreground text-center">
        Proof submission is final. If you do not submit proof, this day remains UNRESOLVED forever.
      </p>
    </div>
  );
}
