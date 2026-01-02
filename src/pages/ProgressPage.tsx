import { useTimeEngine } from '@/hooks/useTimeEngine';
import { useScoreHistory, useScoringEngine } from '@/hooks/useScoringEngine';
import { TrendingUp, TrendingDown, Minus, Flame, Target, Calendar, Loader2 } from 'lucide-react';

export default function ProgressPage() {
  const time = useTimeEngine(60000); // Update every minute
  const { currentStreak, totalCheckIns, isLoading: statsLoading } = useScoringEngine();
  const { history: scoreHistory, isLoading: historyLoading } = useScoreHistory(30);

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
            <div className="space-y-2">
              {scoreHistory.slice().reverse().map(({ date, score, is_missed }) => (
                <div key={date} className="flex items-center gap-4">
                  <span className="font-mono text-xs text-muted-foreground w-24">
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
              ))}
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
