import { useState, useEffect } from 'react';
import { getRules, saveCheckIn, calculateScore, getTodayCheckIn, Rule, RuleCheckResult, DailyCheckIn as DailyCheckInType } from '@/lib/dataStore';
import { getTodayKey } from '@/lib/timeEngine';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Lock } from 'lucide-react';

interface Props {
  onComplete?: () => void;
}

export function DailyCheckIn({ onComplete }: Props) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [failureNote, setFailureNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingCheckIn, setExistingCheckIn] = useState<DailyCheckInType | null>(null);

  useEffect(() => {
    const loadedRules = getRules();
    setRules(loadedRules);
    
    const existing = getTodayCheckIn();
    if (existing) {
      setExistingCheckIn(existing);
      setIsSubmitted(true);
      // Populate results from existing check-in
      const existingResults: Record<string, boolean> = {};
      existing.rules.forEach(r => {
        existingResults[r.ruleId] = r.completed;
      });
      setResults(existingResults);
    } else {
      // Initialize all as false
      const initial: Record<string, boolean> = {};
      loadedRules.forEach(r => {
        initial[r.id] = false;
      });
      setResults(initial);
    }
  }, []);

  const handleToggle = (ruleId: string) => {
    if (isSubmitted) return;
    setResults(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    const ruleResults: RuleCheckResult[] = rules.map(rule => ({
      ruleId: rule.id,
      completed: results[rule.id] || false,
    }));

    const score = calculateScore(ruleResults, rules);
    const hasFailures = ruleResults.some(r => !r.completed);

    const checkIn: DailyCheckInType = {
      date: getTodayKey(),
      submittedAt: new Date().toISOString(),
      rules: ruleResults,
      score,
      failureNote: hasFailures ? failureNote : undefined,
    };

    saveCheckIn(checkIn);
    setIsSubmitted(true);
    setExistingCheckIn(checkIn);
    onComplete?.();
  };

  const completedCount = Object.values(results).filter(Boolean).length;
  const allCompleted = completedCount === rules.length;
  const someFailures = !allCompleted && Object.values(results).some(v => !v);

  if (isSubmitted && existingCheckIn) {
    return (
      <section className="py-6">
        <div className="execution-card p-6 rounded border-success/50">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Check-In Complete</h3>
              <p className="text-sm text-muted-foreground">
                Submitted at {new Date(existingCheckIn.submittedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded">
            <span className="data-label">Final Score</span>
            <span className={`font-mono text-3xl font-bold ${
              existingCheckIn.score >= 80 ? 'text-success' :
              existingCheckIn.score >= 50 ? 'text-warning' : 'text-destructive'
            }`}>
              {existingCheckIn.score}
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
          {rules.map((rule) => (
            <label
              key={rule.id}
              className={`flex items-start gap-3 p-3 rounded cursor-pointer transition-colors ${
                results[rule.id] 
                  ? 'bg-success/10 border border-success/30' 
                  : 'bg-muted/30 border border-transparent hover:border-border'
              }`}
              onClick={() => handleToggle(rule.id)}
            >
              <Checkbox
                checked={results[rule.id] || false}
                onCheckedChange={() => handleToggle(rule.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${results[rule.id] ? 'text-success' : 'text-foreground'}`}>
                    {rule.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    ×{rule.weight}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {rule.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {completedCount}/{rules.length} rules completed
          </span>
          <span className="font-mono text-lg">
            {calculateScore(
              rules.map(r => ({ ruleId: r.id, completed: results[r.id] || false })),
              rules
            )}/100
          </span>
        </div>

        {/* Failure Note */}
        {someFailures && (
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

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          Submit Check-In (Irreversible)
        </Button>
      </div>
    </section>
  );
}
