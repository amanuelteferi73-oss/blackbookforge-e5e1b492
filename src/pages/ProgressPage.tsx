import { useState } from 'react';
import { useTimeEngine } from '@/hooks/useTimeEngine';
import { useScoreHistory, useScoringEngine } from '@/hooks/useScoringEngine';
import { getFailedItemsForDate, getPunishmentForDate } from '@/lib/scoringEngine';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Minus, Flame, Target, Calendar, Loader2, ChevronDown, ChevronRight, XCircle, Gavel, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FailedItem {
  section: string;
  question_text: string;
  severity: string;
  points_lost: number;
}

interface PunishmentInfo {
  punishment_text: string;
  is_resolved: boolean;
  proof_feeling: string | null;
}

export default function ProgressPage() {
  const time = useTimeEngine(60000);
  const { currentStreak, totalCheckIns, isLoading: statsLoading } = useScoringEngine();
  const { history: scoreHistory, isLoading: historyLoading } = useScoreHistory(30);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [failedItems, setFailedItems] = useState<FailedItem[]>([]);
  const [punishment, setPunishment] = useState<PunishmentInfo | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);

  const isLoading = statsLoading || historyLoading;

  const averageScore = scoreHistory.length > 0
    ? Math.round(scoreHistory.reduce((sum, s) => sum + s.score, 0) / scoreHistory.length)
    : 0;

  const trend = scoreHistory.length >= 2
    ? scoreHistory[scoreHistory.length - 1].score - scoreHistory[scoreHistory.length - 2].score
    : 0;

  const completionRate = time.dayNumber > 0
    ? Math.round((totalCheckIns / time.dayNumber) * 100)
    : 0;

  const handleDayClick = async (date: string, score: number, is_missed: boolean) => {
    // Don't expand if perfect score or missed
    if (score === 100 || is_missed) return;

    if (expandedDate === date) {
      setExpandedDate(null);
      setFailedItems([]);
      setPunishment(null);
      return;
    }

    setExpandedDate(date);
    setLoadingItems(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [items, punishmentData] = await Promise.all([
          getFailedItemsForDate(user.id, date),
          getPunishmentForDate(user.id, date)
        ]);
        setFailedItems(items);
        setPunishment(punishmentData);
      }
    } catch (error) {
      console.error('Failed to load failed items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              PROGRESS ENGINE
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Loading your execution history...
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            PROGRESS ENGINE
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your execution history. The numbers don't lie.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Average Score */}
          <div className="execution-card p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-accent" />
              <span className="data-label">Avg Score</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-mono text-3xl font-bold text-foreground">
                {averageScore}
              </span>
              <span className="text-muted-foreground mb-1">/100</span>
            </div>
          </div>

          {/* Trend */}
          <div className="execution-card p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-destructive" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="data-label">Trend</span>
            </div>
            <span className={`font-mono text-3xl font-bold ${
              trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-foreground'
            }`}>
              {trend > 0 ? '+' : ''}{trend}
            </span>
          </div>

          {/* Current Streak */}
          <div className="execution-card p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-warning" />
              <span className="data-label">Streak</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-mono text-3xl font-bold text-foreground">
                {currentStreak}
              </span>
              <span className="text-muted-foreground mb-1">days</span>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="execution-card p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="data-label">Completion</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-mono text-3xl font-bold text-foreground">
                {completionRate}
              </span>
              <span className="text-muted-foreground mb-1">%</span>
            </div>
          </div>
        </div>

        {/* Score History */}
        <div className="execution-card p-6 rounded">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
            Score History (Last 30 Days)
          </h3>
          
          {scoreHistory.length > 0 ? (
            <div className="space-y-1">
              {scoreHistory.slice().reverse().map(({ date, score, is_missed }) => {
                const isClickable = score < 100 && !is_missed;
                const isExpanded = expandedDate === date;
                
                return (
                  <div key={date}>
                    <div 
                      className={cn(
                        "flex items-center gap-4 p-2 -mx-2 rounded transition-colors",
                        isClickable && "cursor-pointer hover:bg-muted/50",
                        isExpanded && "bg-muted/50"
                      )}
                      onClick={() => isClickable && handleDayClick(date, score, is_missed)}
                    >
                      {/* Expand indicator */}
                      <div className="w-4 flex-shrink-0">
                        {isClickable && (
                          isExpanded 
                            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      <span className="font-mono text-xs text-muted-foreground w-20">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            is_missed ? 'bg-muted-foreground/30' :
                            score >= 80 ? 'bg-success' :
                            score >= 50 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          style={{ width: is_missed ? '100%' : `${score}%` }}
                        />
                      </div>
                      <span className={`font-mono text-sm w-12 text-right ${
                        is_missed ? 'text-muted-foreground' :
                        score >= 80 ? 'text-success' :
                        score >= 50 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {is_missed ? 'MISS' : score}
                      </span>
                    </div>
                    
                    {/* Expanded failed items */}
                    {isExpanded && (
                      <div className="ml-6 pl-4 border-l-2 border-muted mt-2 mb-4 space-y-2">
                        {loadingItems ? (
                          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading failures...
                          </div>
                        ) : failedItems.length > 0 ? (
                          <>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <XCircle className="w-3 h-3" />
                              {failedItems.length} failed item{failedItems.length !== 1 ? 's' : ''}
                            </div>
                            {failedItems.map((item, idx) => (
                              <div 
                                key={idx}
                                className={cn(
                                  "p-2 rounded text-sm",
                                  item.severity === 'critical' 
                                    ? "bg-destructive/10 border border-destructive/20"
                                    : "bg-muted/50"
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <span className="text-xs font-mono text-muted-foreground">
                                      {item.section}
                                    </span>
                                    <p className="text-sm mt-0.5">{item.question_text}</p>
                                  </div>
                                  <span className="text-destructive text-xs font-medium shrink-0">
                                    -{item.points_lost}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground py-2">
                            No failure details recorded
                          </p>
                        )}

                        {/* Punishment History */}
                        {punishment && (
                          <div className="mt-3 pt-3 border-t border-muted">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Gavel className="w-3 h-3" />
                              Punishment Assigned
                            </div>
                            <div className={cn(
                              "p-3 rounded text-sm",
                              punishment.is_resolved 
                                ? "bg-primary/10 border border-primary/20"
                                : "bg-warning/10 border border-warning/20"
                            )}>
                              <p className="text-sm">{punishment.punishment_text}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                {punishment.is_resolved ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-primary" />
                                    <span className="text-primary">Resolved</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                                    <span className="text-warning">Pending</span>
                                  </>
                                )}
                              </div>
                              {punishment.proof_feeling && (
                                <p className="text-xs text-muted-foreground mt-2 italic">
                                  "{punishment.proof_feeling}"
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No check-ins yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your first daily check-in to see your progress
              </p>
            </div>
          )}
        </div>

        {/* Streak Info */}
        {currentStreak > 0 && (
          <div className="mt-6 execution-card p-4 rounded border-warning/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-warning" />
                <span className="text-sm text-foreground">Current Streak</span>
              </div>
              <span className="font-mono text-lg font-bold text-warning">
                {currentStreak} days
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}