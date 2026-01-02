import { useState, useEffect, useMemo } from 'react';
import { useScoringEngine } from '@/hooks/useScoringEngine';
import { RuleEvaluation } from '@/lib/scoringEngine';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Lock, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  onComplete?: () => void;
}

export function DailyCheckIn({ onComplete }: Props) {
  const {
    rules,
    isLoading,
    error,
    todayCheckIn,
    hasCheckedInToday,
    calculatePreviewScore,
    submitDailyCheckIn,
  } = useScoringEngine();

  const [evaluations, setEvaluations] = useState<Record<string, boolean>>({});
  const [failureNote, setFailureNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize evaluations when rules load
  useEffect(() => {
    if (rules.length > 0 && Object.keys(evaluations).length === 0) {
      const initial: Record<string, boolean> = {};
      rules.forEach(r => {
        initial[r.id] = false;
      });
      setEvaluations(initial);
    }
  }, [rules, evaluations]);

  // Convert evaluations to RuleEvaluation format
  const ruleEvaluations: RuleEvaluation[] = useMemo(() => {
    return rules.map(rule => ({
      rule_id: rule.id,
      value: evaluations[rule.id] ?? false,
    }));
  }, [rules, evaluations]);

  // Calculate preview score
  const previewScore = useMemo(() => {
    return calculatePreviewScore(ruleEvaluations);
  }, [ruleEvaluations, calculatePreviewScore]);

  const handleToggle = (ruleId: string) => {
    if (hasCheckedInToday) return;
    setEvaluations(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  const handleSubmit = async () => {
    if (hasCheckedInToday || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const hasFailures = ruleEvaluations.some(e => !e.value);
    const result = await submitDailyCheckIn(
      ruleEvaluations,
      hasFailures ? failureNote : undefined
    );

    setIsSubmitting(false);

    if (result.success) {
      onComplete?.();
    } else {
      setSubmitError(result.error || 'Failed to submit check-in');
    }
  };

  const completedCount = Object.values(evaluations).filter(Boolean).length;
  const hasFailures = completedCount < rules.length;

  // Loading state
  if (isLoading) {
    return (
      <section className="py-6">
        <div className="execution-card p-6 rounded flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading rules...</span>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-6">
        <div className="execution-card p-6 rounded border-destructive/50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Error Loading Rules</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No rules state
  if (rules.length === 0) {
    return (
      <section className="py-6">
        <div className="execution-card p-6 rounded">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">No Rules Configured</h3>
              <p className="text-sm text-muted-foreground">
                You need to set up your daily rules before you can check in.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Already checked in
  if (hasCheckedInToday && todayCheckIn) {
    return (
      <section className="py-6">
        <div className="execution-card p-6 rounded border-success/50">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Check-In Complete</h3>
              <p className="text-sm text-muted-foreground">
                Submitted at {new Date(todayCheckIn.submitted_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded">
            <span className="data-label">Final Score</span>
            <span className={`font-mono text-3xl font-bold ${
              todayCheckIn.total_score >= 80 ? 'text-success' :
              todayCheckIn.total_score >= 50 ? 'text-warning' : 'text-destructive'
            }`}>
              {todayCheckIn.total_score}
            </span>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              This check-in is now immutable and cannot be edited.
            </span>
          </div>
        </div>
      </section>
    );
  }

  // Check-in form
  return (
    <section className="py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          DAILY EXECUTION
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          One submission per day. Once submitted, it cannot be changed.
        </p>
      </div>

      <div className="execution-card p-6 rounded">
        {/* Rules Checklist */}
        <div className="space-y-3 mb-6">
          {rules.map((rule) => {
            const breakdown = previewScore.breakdown.find(b => b.rule_id === rule.id);
            return (
              <label
                key={rule.id}
                className={`flex items-start gap-3 p-3 rounded cursor-pointer transition-colors ${
                  evaluations[rule.id] 
                    ? 'bg-success/10 border border-success/30' 
                    : 'bg-muted/30 border border-transparent hover:border-border'
                }`}
                onClick={() => handleToggle(rule.id)}
              >
                <Checkbox
                  checked={evaluations[rule.id] || false}
                  onCheckedChange={() => handleToggle(rule.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${evaluations[rule.id] ? 'text-success' : 'text-foreground'}`}>
                      {rule.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        ×{rule.weight}
                      </span>
                      {breakdown && (
                        <span className="font-mono text-xs text-muted-foreground">
                          (+{breakdown.score_contribution.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rule.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {completedCount}/{rules.length} rules completed
          </span>
          <span className={`font-mono text-lg font-bold ${
            previewScore.total_score >= 80 ? 'text-success' :
            previewScore.total_score >= 50 ? 'text-warning' : 'text-destructive'
          }`}>
            {previewScore.total_score}/100
          </span>
        </div>

        {/* Failure Note */}
        {hasFailures && (
          <div className="mb-6">
            <label className="data-label block mb-2">
              Failure Note (Optional)
            </label>
            <Textarea
              value={failureNote}
              onChange={(e) => setFailureNote(e.target.value)}
              placeholder="Why did you fail these rules today?"
              className="bg-muted border-border text-foreground resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Submit Error */}
        {submitError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded">
            <p className="text-sm text-destructive">{submitError}</p>
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Check-In (Irreversible)'
          )}
        </Button>
      </div>
    </section>
  );
}
