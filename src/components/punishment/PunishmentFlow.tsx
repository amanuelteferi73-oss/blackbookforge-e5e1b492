import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PunishmentWheel } from './PunishmentWheel';
import { PunishmentDisplay } from './PunishmentDisplay';
import { PunishmentProof } from './PunishmentProof';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface PunishmentFlowProps {
  checkInId: string;
  score: number;
  failedQuestions: string[];
  date: string;
  userId: string;
}

type FlowPhase = 'spinning' | 'display' | 'proof' | 'complete';

export function PunishmentFlow({
  checkInId,
  score,
  failedQuestions,
  date,
  userId
}: PunishmentFlowProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<FlowPhase>('spinning');
  const [isSpinning, setIsSpinning] = useState(false);
  const [punishment, setPunishment] = useState<{ index: number; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPunishment, setExistingPunishment] = useState<any>(null);

  // Check for existing punishment on mount
  useEffect(() => {
    const checkExisting = async () => {
      const { data } = await supabase
        .from('punishments')
        .select('*')
        .eq('daily_checkin_id', checkInId)
        .maybeSingle();

      if (data) {
        setExistingPunishment(data);
        setPunishment({ index: data.punishment_index, text: data.punishment_text });
        
        if (data.proof_submitted_at) {
          setPhase('complete');
        } else {
          setPhase('proof');
        }
      }
    };

    checkExisting();
  }, [checkInId]);

  const handlePunishmentSelected = async (index: number, text: string) => {
    setPunishment({ index, text });

    // Save punishment to database immediately
    const { error } = await supabase.from('punishments').insert({
      user_id: userId,
      daily_checkin_id: checkInId,
      date: date,
      score: score,
      punishment_index: index,
      punishment_text: text,
      failed_questions: failedQuestions
    });

    if (error) {
      console.error('Failed to save punishment:', error);
    }

    // Short delay then show display
    setTimeout(() => {
      setPhase('display');
    }, 1500);
  };

  const handleContinueToProof = () => {
    setPhase('proof');
  };

  const handleSubmitProof = async (feeling: string, commitment: string) => {
    setIsSubmitting(true);

    const { error } = await supabase
      .from('punishments')
      .update({
        proof_feeling: feeling,
        proof_commitment: commitment,
        proof_submitted_at: new Date().toISOString(),
        is_resolved: true
      })
      .eq('daily_checkin_id', checkInId);

    if (error) {
      console.error('Failed to submit proof:', error);
      setIsSubmitting(false);
      return;
    }

    setPhase('complete');
    setIsSubmitting(false);
  };

  const handleFinish = () => {
    navigate('/');
  };

  const formattedDate = format(new Date(date), 'MMMM d, yyyy');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-6">
        {phase === 'spinning' && !existingPunishment && (
          <PunishmentWheel
            onPunishmentSelected={handlePunishmentSelected}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
          />
        )}

        {phase === 'display' && punishment && (
          <div className="space-y-6">
            <PunishmentDisplay
              punishment={punishment.text}
              score={score}
              failedQuestions={failedQuestions}
              date={formattedDate}
            />
            <Button
              onClick={handleContinueToProof}
              variant="outline"
              className="w-full"
            >
              I Understand — Continue to Proof
            </Button>
          </div>
        )}

        {phase === 'proof' && punishment && (
          <PunishmentProof
            punishment={punishment.text}
            onSubmitProof={handleSubmitProof}
            isSubmitting={isSubmitting}
          />
        )}

        {phase === 'complete' && (
          <div className="text-center space-y-6 py-8">
            <div className="space-y-2">
              <p className="text-4xl">🔴</p>
              <h3 className="font-mono font-bold text-lg uppercase tracking-wide">
                Punishment Recorded
              </h3>
              <p className="text-sm text-muted-foreground">
                This day is now marked in your history.
              </p>
            </div>

            {existingPunishment?.proof_feeling && (
              <div className="text-left space-y-4 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase mb-1">
                    Your Response:
                  </p>
                  <p className="text-sm italic text-foreground/80">
                    "{existingPunishment.proof_feeling}"
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase mb-1">
                    Commitment:
                  </p>
                  <p className="text-sm">
                    {existingPunishment.proof_commitment === 'yes' 
                      ? '✓ Committed to not repeating'
                      : '✗ Likely to repeat'
                    }
                  </p>
                </div>
              </div>
            )}

            <Button onClick={handleFinish} className="w-full">
              Return Home
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
