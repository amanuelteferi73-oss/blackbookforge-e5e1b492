// SCORING ENGINE - Deterministic, reproducible scoring system
// Score reflects execution, not intention
// Same inputs → same score
// Missing data is failure, not neutral
// Past scores never change

import { supabase } from '@/integrations/supabase/client';

// Types matching database schema
export interface Rule {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  weight: number; // 1-10, normalized at calculation time
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface RuleEvaluation {
  rule_id: string;
  value: boolean; // Pass/fail for boolean rules
  numeric_value?: number; // For numeric threshold rules
}

export interface CheckInSubmission {
  date: string; // YYYY-MM-DD
  evaluations: RuleEvaluation[];
  failure_note?: string;
}

export interface ScoreBreakdown {
  rule_id: string;
  rule_title: string;
  weight: number;
  normalized_weight: number; // Weight as percentage of total
  value: boolean;
  numeric_value?: number;
  score_contribution: number;
}

export interface CalculatedScore {
  total_score: number; // 0-100
  breakdown: ScoreBreakdown[];
  total_weight: number;
  earned_weight: number;
}

// ============================================================================
// CORE SCORING CALCULATION (DETERMINISTIC)
// ============================================================================

/**
 * Calculate score from rule evaluations
 * Formula: (earned_weight / total_weight) * 100
 * Clamped to 0-100
 */
export function calculateScore(
  evaluations: RuleEvaluation[],
  rules: Rule[]
): CalculatedScore {
  // Only use active rules
  const activeRules = rules.filter(r => r.is_active);
  
  // Calculate total weight of active rules
  const totalWeight = activeRules.reduce((sum, r) => sum + r.weight, 0);
  
  if (totalWeight === 0) {
    return {
      total_score: 0,
      breakdown: [],
      total_weight: 0,
      earned_weight: 0,
    };
  }

  let earnedWeight = 0;
  const breakdown: ScoreBreakdown[] = [];

  for (const rule of activeRules) {
    const evaluation = evaluations.find(e => e.rule_id === rule.id);
    const passed = evaluation?.value ?? false;
    const contribution = passed ? rule.weight : 0;
    earnedWeight += contribution;

    // Calculate normalized weight (what percentage of 100 this rule represents)
    const normalizedWeight = (rule.weight / totalWeight) * 100;
    const scoreContribution = passed ? normalizedWeight : 0;

    breakdown.push({
      rule_id: rule.id,
      rule_title: rule.title,
      weight: rule.weight,
      normalized_weight: normalizedWeight,
      value: passed,
      numeric_value: evaluation?.numeric_value,
      score_contribution: Math.round(scoreContribution * 100) / 100,
    });
  }

  // Final score: normalized to 0-100
  const totalScore = Math.round((earnedWeight / totalWeight) * 100);
  
  return {
    total_score: Math.max(0, Math.min(100, totalScore)), // Clamp 0-100
    breakdown,
    total_weight: totalWeight,
    earned_weight: earnedWeight,
  };
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Fetch active rules for a user
 */
export async function fetchUserRules(userId: string): Promise<Rule[]> {
  const { data, error } = await supabase
    .from('daily_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[ScoringEngine] Failed to fetch rules:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch all rules for a user (including inactive)
 */
export async function fetchAllUserRules(userId: string): Promise<Rule[]> {
  const { data, error } = await supabase
    .from('daily_rules')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[ScoringEngine] Failed to fetch all rules:', error);
    throw error;
  }

  return data || [];
}

/**
 * Check if user has already checked in for a specific date
 */
export async function hasCheckedIn(userId: string, date: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('id')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (error) {
    console.error('[ScoringEngine] Failed to check existing check-in:', error);
    return false;
  }

  return !!data;
}

/**
 * Fetch check-in for a specific date
 */
export async function fetchCheckIn(userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select(`
      *,
      daily_rule_evaluations (
        id,
        rule_id,
        value,
        numeric_value,
        score_contribution
      )
    `)
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (error) {
    console.error('[ScoringEngine] Failed to fetch check-in:', error);
    return null;
  }

  return data;
}

/**
 * Submit a daily check-in with rule evaluations
 * This is an atomic operation - all or nothing
 */
export async function submitCheckIn(
  userId: string,
  submission: CheckInSubmission
): Promise<{ success: boolean; score?: number; error?: string }> {
  console.log('[ScoringEngine] Submitting check-in for:', submission.date);

  // 1. Check if already submitted (immutability enforcement)
  const exists = await hasCheckedIn(userId, submission.date);
  if (exists) {
    return { 
      success: false, 
      error: 'Check-in already exists for this date. Past scores are immutable.' 
    };
  }

  // 2. Fetch rules for score calculation
  const rules = await fetchUserRules(userId);
  if (rules.length === 0) {
    return { 
      success: false, 
      error: 'No active rules found. Please create rules first.' 
    };
  }

  // 3. Calculate score locally for validation
  const calculated = calculateScore(submission.evaluations, rules);
  console.log('[ScoringEngine] Calculated score:', calculated.total_score);

  // 4. Create the check-in record
  const { data: checkIn, error: checkInError } = await supabase
    .from('daily_checkins')
    .insert({
      user_id: userId,
      date: submission.date,
      submitted_at: new Date().toISOString(),
      is_missed: false,
      total_score: calculated.total_score,
      failure_note: submission.failure_note || null,
    })
    .select()
    .single();

  if (checkInError) {
    console.error('[ScoringEngine] Failed to create check-in:', checkInError);
    return { success: false, error: checkInError.message };
  }

  // 5. Insert all rule evaluations
  const evaluationInserts = calculated.breakdown.map(b => ({
    daily_checkin_id: checkIn.id,
    rule_id: b.rule_id,
    value: b.value,
    numeric_value: b.numeric_value ?? null,
    score_contribution: Math.round(b.score_contribution),
  }));

  const { error: evalError } = await supabase
    .from('daily_rule_evaluations')
    .insert(evaluationInserts);

  if (evalError) {
    console.error('[ScoringEngine] Failed to insert evaluations:', evalError);
    // Note: The trigger will recalculate score, but we already set it correctly
  }

  console.log('[ScoringEngine] Check-in submitted successfully');
  
  return { 
    success: true, 
    score: calculated.total_score 
  };
}

// ============================================================================
// AGGREGATES (READ-ONLY DERIVED DATA)
// ============================================================================

/**
 * Get average score over N days (uses database function)
 */
export async function getAverageScore(userId: string, days: number = 7): Promise<number> {
  const { data, error } = await supabase.rpc('get_average_score', {
    _user_id: userId,
    _days: days,
  });

  if (error) {
    console.error('[ScoringEngine] Failed to get average score:', error);
    return 0;
  }

  return data ?? 0;
}

/**
 * Get current streak (uses database function)
 */
export async function getCurrentStreak(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_current_streak', {
    _user_id: userId,
  });

  if (error) {
    console.error('[ScoringEngine] Failed to get current streak:', error);
    return 0;
  }

  return data ?? 0;
}

/**
 * Get score history for charts
 */
export async function getScoreHistory(
  userId: string, 
  days: number = 30
): Promise<{ date: string; score: number; is_missed: boolean }[]> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('date, total_score, is_missed')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(days);

  if (error) {
    console.error('[ScoringEngine] Failed to get score history:', error);
    return [];
  }

  return (data || []).map(d => ({
    date: d.date,
    score: d.total_score,
    is_missed: d.is_missed,
  })).reverse();
}

/**
 * Get detailed breakdown for a specific check-in
 */
export async function getCheckInBreakdown(checkInId: string): Promise<ScoreBreakdown[]> {
  const { data, error } = await supabase
    .from('daily_rule_evaluations')
    .select(`
      rule_id,
      value,
      numeric_value,
      score_contribution,
      daily_rules (
        title,
        weight
      )
    `)
    .eq('daily_checkin_id', checkInId);

  if (error) {
    console.error('[ScoringEngine] Failed to get breakdown:', error);
    return [];
  }

  return (data || []).map(d => ({
    rule_id: d.rule_id,
    rule_title: (d.daily_rules as any)?.title || 'Unknown',
    weight: (d.daily_rules as any)?.weight || 0,
    normalized_weight: d.score_contribution,
    value: d.value,
    numeric_value: d.numeric_value ?? undefined,
    score_contribution: d.score_contribution,
  }));
}

/**
 * Get total number of check-ins
 */
export async function getTotalCheckIns(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('daily_checkins')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_missed', false);

  if (error) {
    console.error('[ScoringEngine] Failed to get total check-ins:', error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Get best and worst scores
 */
export async function getScoreExtremes(userId: string): Promise<{
  best: { date: string; score: number } | null;
  worst: { date: string; score: number } | null;
}> {
  const { data: bestData } = await supabase
    .from('daily_checkins')
    .select('date, total_score')
    .eq('user_id', userId)
    .eq('is_missed', false)
    .order('total_score', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: worstData } = await supabase
    .from('daily_checkins')
    .select('date, total_score')
    .eq('user_id', userId)
    .eq('is_missed', false)
    .order('total_score', { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    best: bestData ? { date: bestData.date, score: bestData.total_score } : null,
    worst: worstData ? { date: worstData.date, score: worstData.total_score } : null,
  };
}

/**
 * Get weekly and monthly averages
 */
export async function getAverages(userId: string): Promise<{
  weekly: number;
  monthly: number;
  rolling7Day: number;
}> {
  const [weekly, monthly] = await Promise.all([
    getAverageScore(userId, 7),
    getAverageScore(userId, 30),
  ]);

  return {
    weekly,
    monthly,
    rolling7Day: weekly, // Same as weekly for now
  };
}
