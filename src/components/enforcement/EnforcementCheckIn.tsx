import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getTodayKey } from '@/lib/timeEngine';
import { 
  CHECK_IN_SECTIONS, 
  getVisibleSections,
  getTotalPossiblePoints,
  calculateCheckInScore,
  QuestionAnswer,
  CheckInResult,
  FocusPillar,
  FOCUS_PILLAR_OPTIONS,
} from '@/lib/checkInSections';
import { CheckInSection } from './CheckInSection';
import { FocusPillarSelector } from './FocusPillarSelector';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Lock, CheckCircle2, AlertTriangle, XCircle, Briefcase, Rocket, GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PILLAR_ICONS = {
  startup: Rocket,
  cash: Briefcase,
  school: GraduationCap,
};

export function EnforcementCheckIn() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Map<string, boolean>>(new Map());
  const [focusPillar, setFocusPillar] = useState<FocusPillar>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingCheckIn, setExistingCheckIn] = useState<any>(null);
  const [failedItems, setFailedItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Get visible sections based on pillar
  const visibleSections = useMemo(() => getVisibleSections(focusPillar), [focusPillar]);

  // Get all questions count for visible sections
  const totalQuestions = useMemo(() => 
    visibleSections.reduce((sum, s) => sum + s.questions.length, 0),
    [visibleSections]
  );

  // Calculate current progress (only count answers for visible sections)
  const answeredCount = useMemo(() => {
    const visibleQuestionIds = new Set(
      visibleSections.flatMap(s => s.questions.map(q => q.id))
    );
    return Array.from(answers.keys()).filter(id => visibleQuestionIds.has(id)).length;
  }, [answers, visibleSections]);

  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Calculate preview score
  const previewResult = useMemo<CheckInResult>(() => {
    const answerArray: QuestionAnswer[] = Array.from(answers.entries()).map(
      ([questionId, value]) => ({ questionId, value })
    );
    return calculateCheckInScore(answerArray, focusPillar);
  }, [answers, focusPillar]);

  // Load user and existing check-in
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      const todayKey = getTodayKey();
      
      // Check for existing check-in
      const { data: checkIn } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayKey)
        .maybeSingle();

      if (checkIn) {
        setExistingCheckIn(checkIn);
        setFocusPillar(checkIn.focus_pillar as FocusPillar);
        
        // Load failed items
        const { data: items } = await supabase
          .from('failed_items')
          .select('*')
          .eq('daily_checkin_id', checkIn.id);
        
        setFailedItems(items || []);
      }

      setIsLoading(false);
    };

    load();
  }, []);

  // Toggle answer
  const handleToggle = (questionId: string) => {
    setAnswers(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(questionId);
      
      if (current === undefined) {
        newMap.set(questionId, true);
      } else if (current === true) {
        newMap.set(questionId, false);
      } else {
        newMap.delete(questionId);
      }
      
      return newMap;
    });
  };

  // Check if form is complete (pillar selected + all visible questions answered)
  const isFormComplete = focusPillar !== null && answeredCount >= totalQuestions;

  // Submit check-in
  const handleSubmit = async () => {
    if (!userId) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return;
    }

    if (!focusPillar) {
      toast({ 
        title: 'Select Focus Pillar', 
        description: 'Choose your primary focus for today.',
        variant: 'destructive' 
      });
      return;
    }

    if (answeredCount < totalQuestions) {
      toast({ 
        title: 'Incomplete', 
        description: `Answer all ${totalQuestions} questions before submitting.`,
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const todayKey = getTodayKey();
      const answerArray: QuestionAnswer[] = Array.from(answers.entries()).map(
        ([questionId, value]) => ({ questionId, value })
      );
      const result = calculateCheckInScore(answerArray, focusPillar);

      // Create the check-in record with focus_pillar
      const { data: checkIn, error: checkInError } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: userId,
          date: todayKey,
          total_score: result.percentage,
          discipline_breach: result.disciplineBreach,
          submitted_at: new Date().toISOString(),
          is_missed: false,
          focus_pillar: focusPillar,
        })
        .select()
        .single();

      if (checkInError) throw checkInError;

      // Insert failed items
      if (result.failedItems.length > 0) {
        const { error: failedError } = await supabase
          .from('failed_items')
          .insert(
            result.failedItems.map(item => ({
              daily_checkin_id: checkIn.id,
              section: item.section,
              question_text: item.questionText,
              severity: item.severity,
              points_lost: item.pointsLost,
            }))
          );

        if (failedError) throw failedError;
      }

      toast({ 
        title: 'Check-in submitted', 
        description: `Score: ${result.percentage}%` 
      });

      setExistingCheckIn(checkIn);
      setFailedItems(result.failedItems.map(item => ({
        section: item.section,
        question_text: item.questionText,
        severity: item.severity,
        points_lost: item.pointsLost,
      })));

    } catch (error: any) {
      console.error('Submit error:', error);
      toast({ 
        title: 'Submission failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already submitted - show read-only view
  if (existingCheckIn) {
    const pillarOption = FOCUS_PILLAR_OPTIONS.find(p => p.value === existingCheckIn.focus_pillar);
    const PillarIcon = existingCheckIn.focus_pillar ? PILLAR_ICONS[existingCheckIn.focus_pillar as keyof typeof PILLAR_ICONS] : null;

    return (
      <div className="space-y-6">
        {/* Locked Header */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Check-in Locked</p>
            <p className="text-sm text-muted-foreground">
              Submitted {new Date(existingCheckIn.submitted_at).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Pillar Display */}
        {pillarOption && PillarIcon && (
          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <PillarIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Focus Pillar</p>
              <p className="font-medium">{pillarOption.label}</p>
            </div>
          </div>
        )}

        {/* Score Display */}
        <div className={cn(
          "p-6 rounded-lg border text-center",
          existingCheckIn.total_score >= 80 && "bg-primary/10 border-primary/30",
          existingCheckIn.total_score >= 50 && existingCheckIn.total_score < 80 && "bg-amber-500/10 border-amber-500/30",
          existingCheckIn.total_score < 50 && "bg-destructive/10 border-destructive/30"
        )}>
          <p className="text-6xl font-bold mb-2">{existingCheckIn.total_score}%</p>
          <p className="text-muted-foreground">Final Score</p>
          
          {existingCheckIn.discipline_breach && (
            <div className="mt-4 flex items-center justify-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Discipline Breach Flagged</span>
            </div>
          )}
        </div>

        {/* Failed Items */}
        {failedItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Failed Items ({failedItems.length})
            </h3>
            <div className="space-y-2">
              {failedItems.map((item, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "p-3 rounded-md border text-sm",
                    item.severity === 'critical' 
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        Section {item.section}
                      </span>
                      <p className="mt-1">{item.question_text}</p>
                    </div>
                    <span className="text-destructive text-xs font-medium shrink-0">
                      -{item.points_lost}pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/')}
        >
          Return Home
        </Button>
      </div>
    );
  }

  // Active check-in form
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Daily Check-In</h1>
        <p className="text-sm text-muted-foreground">
          One day, one fight • Select your focus, answer honestly
        </p>
      </div>

      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 -mx-4 px-4 border-b">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>
            {focusPillar ? `${answeredCount} / ${totalQuestions} answered` : 'Select focus pillar first'}
          </span>
          <span className={cn(
            "font-bold",
            previewResult.percentage >= 80 && "text-primary",
            previewResult.percentage >= 50 && previewResult.percentage < 80 && "text-amber-500",
            previewResult.percentage < 50 && "text-destructive"
          )}>
            {previewResult.percentage}%
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Fixed Sections A & B */}
      <div className="space-y-6">
        {visibleSections.filter(s => ['A', 'B'].includes(s.id)).map((section) => (
          <CheckInSection
            key={section.id}
            section={section}
            answers={answers}
            onToggle={handleToggle}
            isLocked={false}
          />
        ))}
      </div>

      {/* Core Sections E, F, G, H */}
      <div className="space-y-6">
        {visibleSections.filter(s => ['E', 'F', 'G', 'H'].includes(s.id)).map((section) => (
          <CheckInSection
            key={section.id}
            section={section}
            answers={answers}
            onToggle={handleToggle}
            isLocked={false}
          />
        ))}
      </div>

      {/* Focus Pillar Selector (Section X) */}
      <FocusPillarSelector
        value={focusPillar}
        onChange={setFocusPillar}
        isLocked={false}
      />

      {/* Pillar-Conditional Section (C, D, or S) */}
      {focusPillar && (
        <div className="space-y-6">
          {visibleSections.filter(s => ['C', 'D', 'S'].includes(s.id)).map((section) => (
            <CheckInSection
              key={section.id}
              section={section}
              answers={answers}
              onToggle={handleToggle}
              isLocked={false}
            />
          ))}
        </div>
      )}

      {/* Closing Section I */}
      <div className="space-y-6">
        {visibleSections.filter(s => s.id === 'I').map((section) => (
          <CheckInSection
            key={section.id}
            section={section}
            answers={answers}
            onToggle={handleToggle}
            isLocked={false}
          />
        ))}
      </div>

      {/* Preview Score */}
      <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Preview Score</span>
          <span className="text-2xl font-bold">{previewResult.percentage}%</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Points: {previewResult.totalScore} / {previewResult.maxScore}</span>
          {focusPillar && (
            <span className="text-primary">
              {FOCUS_PILLAR_OPTIONS.find(p => p.value === focusPillar)?.label}
            </span>
          )}
        </div>
        
        {previewResult.disciplineBreach && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Discipline breach will be flagged</span>
          </div>
        )}

        {previewResult.failedItems.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {previewResult.failedItems.length} failed items will be recorded
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !isFormComplete}
        className="w-full h-12 text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : !focusPillar ? (
          'Select Focus Pillar First'
        ) : answeredCount < totalQuestions ? (
          `Answer ${totalQuestions - answeredCount} more questions`
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Submit Check-In (Permanent)
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Once submitted, this record is locked forever. No edits. No retries.
      </p>
    </div>
  );
}
