import { useEffect, useState } from 'react';
import { formatDate, getTodayKey } from '@/lib/timeEngine';
import { getUserState, getTodayCheckIn, getAverageScore, initializeUser } from '@/lib/dataStore';
import { CheckCircle2, XCircle, Flame, Calendar, TrendingUp } from 'lucide-react';

export function StatusPanel() {
  const [userState, setUserState] = useState(getUserState());
  const [todayCheckIn, setTodayCheckIn] = useState(getTodayCheckIn());
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    // Initialize if needed
    if (!userState) {
      const newState = initializeUser();
      setUserState(newState);
    }
    
    setTodayCheckIn(getTodayCheckIn());
    setAvgScore(getAverageScore(7));
  }, []);

  const today = new Date();
  const hasCheckedIn = !!todayCheckIn;

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
            {hasCheckedIn ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="data-label">Check-in</span>
          </div>
          <p className={`font-mono text-sm ${hasCheckedIn ? 'text-success' : 'text-destructive'}`}>
            {hasCheckedIn ? 'COMPLETED' : 'PENDING'}
          </p>
        </div>

        {/* Current Streak */}
        <div className="execution-card p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-warning" />
            <span className="data-label">Streak</span>
          </div>
          <p className="font-mono text-sm text-foreground">
            {userState?.currentStreak || 0} days
          </p>
        </div>

        {/* 7-Day Average */}
        <div className="execution-card p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="data-label">7-Day Avg</span>
          </div>
          <p className="font-mono text-sm text-foreground">
            {avgScore}/100
          </p>
        </div>
      </div>

      {/* Today's Score (if checked in) */}
      {todayCheckIn && (
        <div className="mt-4 execution-card p-4 rounded">
          <div className="flex items-center justify-between">
            <span className="data-label">Today's Score</span>
            <span className={`font-mono text-2xl font-bold ${
              todayCheckIn.score >= 80 ? 'text-success' :
              todayCheckIn.score >= 50 ? 'text-warning' : 'text-destructive'
            }`}>
              {todayCheckIn.score}/100
            </span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                todayCheckIn.score >= 80 ? 'bg-success' :
                todayCheckIn.score >= 50 ? 'bg-warning' : 'bg-destructive'
              }`}
              style={{ width: `${todayCheckIn.score}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
