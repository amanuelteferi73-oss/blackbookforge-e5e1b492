import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getTodayKey } from '@/lib/timeEngine';
import { 
  CHECK_IN_SECTIONS, 
  getVisibleSectionsMulti,
  getTotalPossiblePointsMulti,
  calculateCheckInScoreMulti,
  QuestionAnswer,
  CheckInResult,
  PillarType,
  FOCUS_PILLAR_OPTIONS,
} from '@/lib/checkInSections';
import { useTodayFloorActions } from '@/hooks/useTodayFloorActions';
import { PUNISHMENT_THRESHOLD } from '@/lib/punishments';
import { CheckInSection } from './CheckInSection';
import { PillarMultiSelector } from './PillarMultiSelector';
import { FloorPillarSection } from './FloorPillarSection';
import { PunishmentFlow } from '@/components/punishment/PunishmentFlow';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Lock, CheckCircle2, AlertTriangle, XCircle, Briefcase, Rocket, GraduationCap, Layers } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PILLAR_ICONS = {
  startup: Rocket,
  cash: Briefcase,
  school: GraduationCap,
  floor: Layers,
};

export function EnforcementCheckIn() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Map<string, boolean>>(new Map());
  const [selectedPillars, setSelectedPillars] = useState<PillarType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingCheckIn, setExistingCheckIn] = useState<any>(null);
  const [failedItems, setFailedItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showPunishmentFlow, setShowPunishmentFlow] = useState(false);
  const [punishmentData, setPunishmentData] = useState<{
    checkInId: string;
    score: number;
    failedQuestions: string[];
    date: string;
  } | null>(null);

  // Get today's floor actions
  const floorData = useTodayFloorActions();

  // Get visible sections based on selected pillars
  const visibleSections = useMemo(() => getVisibleSectionsMulti(selectedPillars), [selectedPillars]);

  // Calculate floor points
  const floorTotalPoints = useMemo(() => 
    floorData.actions.reduce((sum, a) => sum + a.points, 0),
    [floorData.actions]
  );

  // Get all questions count for visible sections + floor actions
  const totalQuestions = useMemo(() => {
    const staticCount = visibleSections.reduce((sum, s) => sum + s.questions.length, 0);
    const floorCount = selectedPillars.includes('floor') ? floorData.actions.length : 0;
    return staticCount + floorCount;
  }, [visibleSections, selectedPillars, floorData.actions]);

  // Calculate current progress (only count answers for visible sections + floor)
  const answeredCount = useMemo(() => {
    const visibleQuestionIds = new Set(
      visibleSections.flatMap(s => s.questions.map(q => q.id))
    );
    // Add floor action IDs if floor is selected
    if (selectedPillars.includes('floor')) {
      floorData.actions.forEach(a => visibleQuestionIds.add(a.id));
    }
    return Array.from(answers.keys()).filter(id => visibleQuestionIds.has(id)).length;
  }, [answers, visibleSections, selectedPillars, floorData.actions]);

  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Calculate preview score
  const previewResult = useMemo<CheckInResult>(() => {
    const answerArray: QuestionAnswer[] = Array.from(answers.entries()).map(
      ([questionId, value]) => ({ questionId, value })
    );
    return calculateCheckInScoreMulti(
      answerArray, 
      selectedPillars,
      selectedPillars.includes('floor') ? floorData.actions : []
    );
  }, [answers, selectedPillars, floorData.actions]);

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
        // Parse selected_pillars from jsonb
        const savedPillars = checkIn.selected_pillars as PillarType[] | null;
        if (Array.isArray(savedPillars)) {
          setSelectedPillars(savedPillars);
        } else if (checkIn.focus_pillar) {
          // Legacy: convert single focus_pillar to array
          setSelectedPillars([checkIn.focus_pillar as PillarType]);
        }
        
        // Load failed items
        const { data: items } = await supabase
          .from('failed_items')
          .select('*')
          .eq('daily_checkin_id', checkIn.id);
        
        setFailedItems(items || []);
        
        // Check if punishment flow should be shown
        if (checkIn.total_score <= PUNISHMENT_THRESHOLD) {
          const { data: punishment } = await supabase
            .from('punishments')
            .select('*')
            .eq('daily_checkin_id', checkIn.id)
            .maybeSingle();
          
          if (!punishment || !punishment.is_resolved) {
            setPunishmentData({
              checkInId: checkIn.id,
              score: checkIn.total_score,
              failedQuestions: (items || []).map((i: any) => i.question_text),
              date: todayKey,
            });
            setShowPunishmentFlow(true);
          }
        }
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

  // Toggle pillar selection
  const handlePillarToggle = (pillar: PillarType) => {
    setSelectedPillars(prev => {
      if (prev.includes(pillar)) {
        return prev.filter(p => p !== pillar);
      } else if (prev.length < 2) {
        return [...prev, pillar];
      }
      return prev;
    });
  };

  // Check if form is complete (at least 1 pillar + all visible questions answered)
  const isFormComplete = selectedPillars.length >= 1 && answeredCount >= totalQuestions;

  // Submit check-in
  const handleSubmit = async () => {
    if (!userId) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return;
    }

    if (selectedPillars.length === 0) {
      toast({ 
        title: 'Select Focus Pillars', 
        description: 'Choose at least 1 pillar for today.',
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
      const result = calculateCheckInScoreMulti(
        answerArray, 
        selectedPillars,
        selectedPillars.includes('floor') ? floorData.actions : []
      );

      // Create the check-in record with selected_pillars
      const { data: checkIn, error: checkInError } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: userId,
          date: todayKey,
          total_score: result.percentage,
          discipline_breach: result.disciplineBreach,
          submitted_at: new Date().toISOString(),
          is_missed: false,
          focus_pillar: selectedPillars[0] || null, // Legacy: store first pillar
          selected_pillars: selectedPillars, // New: store all pillars
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

      // Check if punishment flow should trigger
      if (result.percentage <= PUNISHMENT_THRESHOLD) {
        toast({ 
          title: 'Check-in submitted', 
          description: `Score: ${result.percentage}% — Punishment required.`,
          variant: 'destructive'
        });
        
        setPunishmentData({
          checkInId: checkIn.id,
          score: result.percentage,
          failedQuestions: result.failedItems.map(item => item.questionText),
          date: todayKey,
        });
        setShowPunishmentFlow(true);
      } else {
        toast({ 
          title: 'Check-in submitted', 
          description: `Score: ${result.percentage}%` 
        });
      }

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

  // Punishment flow - takes over the entire view
  if (showPunishmentFlow && punishmentData && userId) {
    return (
      <PunishmentFlow
        checkInId={punishmentData.checkInId}
        score={punishmentData.score}
        failedQuestions={punishmentData.failedQuestions}
        date={punishmentData.date}
        userId={userId}
      />
    );
  }

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
    const displayPillars = Array.isArray(existingCheckIn.selected_pillars) 
      ? existingCheckIn.selected_pillars as PillarType[]
      : existingCheckIn.focus_pillar 
        ? [existingCheckIn.focus_pillar as PillarType]
        : [];

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

        {/* Pillars Display */}
        {displayPillars.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {displayPillars.map(pillar => {
              const PillarIcon = PILLAR_ICONS[pillar];
              return (
                <div 
                  key={pillar}
                  className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/30"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <PillarIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-medium capitalize">{pillar}</span>
                </div>
              );
            })}
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
          One day, one fight • Select your pillars, answer honestly
        </p>
      </div>

      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 -mx-4 px-4 border-b">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>
            {selectedPillars.length > 0 
              ? `${answeredCount} / ${totalQuestions} answered` 
              : 'Select pillars first'}
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

      {/* Multi-Pillar Selector */}
      <PillarMultiSelector
        selectedPillars={selectedPillars}
        onToggle={handlePillarToggle}
        isLocked={false}
        floorDayInfo={{
          dayNumber: floorData.dayNumber,
          dayTitle: floorData.dayTitle,
          hasActions: floorData.actions.length > 0,
        }}
        maxPillars={2}
      />

      {/* Pillar-Conditional Sections (C, D, S) */}
      {selectedPillars.length > 0 && (
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

      {/* Floor Pillar Section (Dynamic) */}
      {selectedPillars.includes('floor') && (
        <FloorPillarSection
          dayNumber={floorData.dayNumber}
          dayTitle={floorData.dayTitle}
          intent={floorData.intent}
          actions={floorData.actions}
          answers={answers}
          onToggle={handleToggle}
          isLocked={false}
          isLoading={floorData.isLoading}
        />
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
          {selectedPillars.length > 0 && (
            <span className="text-primary">
              {selectedPillars.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' + ')}
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
        ) : selectedPillars.length === 0 ? (
          'Select at least 1 Pillar'
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
