import { formatDate } from '@/lib/timeEngine';
import { useScoringEngine } from '@/hooks/useScoringEngine';
import { CheckCircle2, XCircle, Flame, Calendar, TrendingUp, Loader2 } from 'lucide-react';

export function StatusPanel() {
  const {
    isLoading,
    todayCheckIn,
    hasCheckedInToday,
    currentStreak,
    averageScore,
  } = useScoringEngine();

  const today = new Date();

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="execution-card p-4 rounded animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-5 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Date */}
        <div className="execution-card p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="data-label">Today</span>
          </div>
          <p className="font-mono text-sm text-foreground">
            {formatDate(today)}
          </p>
        </div>

        {/* Check-in Status */}
        <div className="execution-card p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            {hasCheckedInToday ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="data-label">Check-in</span>
          </div>
          <p className={`font-mono text-sm ${hasCheckedInToday ? 'text-success' : 'text-destructive'}`}>
            {hasCheckedInToday ? 'COMPLETED' : 'PENDING'}
          </p>
        </div>

        {/* Current Streak */}
        <div className="execution-card p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-warning" />
            <span className="data-label">Streak</span>
          </div>
          <p className="font-mono text-sm text-foreground">
            {currentStreak} days
          </p>
        </div>

        {/* 7-Day Average */}
        <div className="execution-card p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="data-label">7-Day Avg</span>
          </div>
          <p className="font-mono text-sm text-foreground">
            {averageScore}/100
          </p>
        </div>
      </div>

      {/* Today's Score (if checked in) */}
      {todayCheckIn && (
        <div className="mt-4 execution-card p-4 rounded">
          <div className="flex items-center justify-between">
            <span className="data-label">Today's Score</span>
            <span className={`font-mono text-2xl font-bold ${
              todayCheckIn.total_score >= 80 ? 'text-success' :
              todayCheckIn.total_score >= 50 ? 'text-warning' : 'text-destructive'
            }`}>
              {todayCheckIn.total_score}/100
            </span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                todayCheckIn.total_score >= 80 ? 'bg-success' :
                todayCheckIn.total_score >= 50 ? 'bg-warning' : 'bg-destructive'
              }`}
              style={{ width: `${todayCheckIn.total_score}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
