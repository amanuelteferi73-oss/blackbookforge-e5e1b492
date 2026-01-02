// Hook for the scoring engine - connects React components to the scoring system
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTodayKey } from '@/lib/timeEngine';
import {
  Rule,
  RuleEvaluation,
  CalculatedScore,
  calculateScore,
  fetchUserRules,
  fetchCheckIn,
  submitCheckIn,
  getAverageScore,
  getCurrentStreak,
  getScoreHistory,
  getTotalCheckIns,
  getScoreExtremes,
} from '@/lib/scoringEngine';

export interface UseScoringEngineResult {
  // State
  rules: Rule[];
  isLoading: boolean;
  error: string | null;
  todayCheckIn: any | null;
  hasCheckedInToday: boolean;
  
  // Scoring
  calculatePreviewScore: (evaluations: RuleEvaluation[]) => CalculatedScore;
  submitDailyCheckIn: (evaluations: RuleEvaluation[], failureNote?: string) => Promise<{ success: boolean; score?: number; error?: string }>;
  
  // Stats
  currentStreak: number;
  averageScore: number;
  totalCheckIns: number;
  
  // Refresh
  refresh: () => Promise<void>;
}

export function useScoringEngine(): UseScoringEngineResult {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<any | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when user is available
  const loadData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const todayKey = getTodayKey();
      
      // Fetch all data in parallel
      const [
        fetchedRules,
        checkIn,
        streak,
        avg,
        total,
      ] = await Promise.all([
        fetchUserRules(userId),
        fetchCheckIn(userId, todayKey),
        getCurrentStreak(userId),
        getAverageScore(userId, 7),
        getTotalCheckIns(userId),
      ]);

      setRules(fetchedRules);
      setTodayCheckIn(checkIn);
      setCurrentStreak(streak);
      setAverageScore(avg);
      setTotalCheckIns(total);
    } catch (err) {
      console.error('[useScoringEngine] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scoring data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for day rollover to refresh
  useEffect(() => {
    const handleDayRollover = () => {
      console.log('[useScoringEngine] Day rollover detected, refreshing...');
      loadData();
    };

    window.addEventListener('dayRollover', handleDayRollover);
    return () => window.removeEventListener('dayRollover', handleDayRollover);
  }, [loadData]);

  // Calculate preview score (for real-time UI updates)
  const calculatePreviewScore = useCallback((evaluations: RuleEvaluation[]): CalculatedScore => {
    return calculateScore(evaluations, rules);
  }, [rules]);

  // Submit daily check-in
  const submitDailyCheckIn = useCallback(async (
    evaluations: RuleEvaluation[],
    failureNote?: string
  ): Promise<{ success: boolean; score?: number; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const todayKey = getTodayKey();
    const result = await submitCheckIn(userId, {
      date: todayKey,
      evaluations,
      failure_note: failureNote,
    });

    if (result.success) {
      // Refresh data after successful submission
      await loadData();
    }

    return result;
  }, [userId, loadData]);

  return {
    rules,
    isLoading,
    error,
    todayCheckIn,
    hasCheckedInToday: !!todayCheckIn,
    calculatePreviewScore,
    submitDailyCheckIn,
    currentStreak,
    averageScore,
    totalCheckIns,
    refresh: loadData,
  };
}

// Hook for score history (for charts)
export function useScoreHistory(days: number = 30) {
  const [history, setHistory] = useState<{ date: string; score: number; is_missed: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const data = await getScoreHistory(userId, days);
      setHistory(data);
      setIsLoading(false);
    };

    load();
  }, [userId, days]);

  return { history, isLoading };
}

// Hook for score extremes
export function useScoreExtremes() {
  const [extremes, setExtremes] = useState<{
    best: { date: string; score: number } | null;
    worst: { date: string; score: number } | null;
  }>({ best: null, worst: null });
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const data = await getScoreExtremes(userId);
      setExtremes(data);
      setIsLoading(false);
    };

    load();
  }, [userId]);

  return { ...extremes, isLoading };
}
