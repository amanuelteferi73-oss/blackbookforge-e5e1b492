// DATA STORE - Local storage persistence layer
// For now using localStorage, will migrate to backend when connected

import { getTodayKey } from './timeEngine';

// Types
export interface DailyCheckIn {
  date: string; // ISO date string YYYY-MM-DD
  submittedAt: string; // ISO datetime
  rules: RuleCheckResult[];
  score: number;
  failureNote?: string;
}

export interface RuleCheckResult {
  ruleId: string;
  completed: boolean;
  value?: number; // For numeric rules
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'numeric';
  weight: number; // 1-10, used for scoring
  target?: number; // For numeric rules
}

export interface VaultAsset {
  id: string;
  type: 'image' | 'audio' | 'message';
  category: 'future' | 'dream' | 'reward' | 'legacy';
  name: string;
  url?: string;
  content?: string;
  unlockCondition: UnlockCondition;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface UnlockCondition {
  type: 'score' | 'streak' | 'date' | 'manual';
  scoreThreshold?: number; // Minimum average score
  streakDays?: number; // Required consecutive days
  unlockDate?: string; // ISO date for time-based unlock
}

export interface UserState {
  initialized: boolean;
  initDate: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  missedDays: number;
}

// Default rules - the discipline system
export const DEFAULT_RULES: Rule[] = [
  { id: 'wakeup', name: 'Wake Up Before 5 AM', description: 'Did you wake up before 5 AM?', type: 'boolean', weight: 8 },
  { id: 'workout', name: 'Complete Workout', description: 'Did you complete your workout?', type: 'boolean', weight: 9 },
  { id: 'study', name: 'Study/Work 8+ Hours', description: 'Did you study or work for 8+ hours?', type: 'boolean', weight: 10 },
  { id: 'nojunk', name: 'No Junk Food', description: 'Did you avoid junk food?', type: 'boolean', weight: 6 },
  { id: 'nodistractions', name: 'No Social Media Waste', description: 'Did you avoid wasting time on social media?', type: 'boolean', weight: 7 },
  { id: 'water', name: 'Drink 3L Water', description: 'Did you drink at least 3 liters of water?', type: 'boolean', weight: 5 },
  { id: 'sleep', name: 'Sleep Before 10 PM', description: 'Did you sleep before 10 PM yesterday?', type: 'boolean', weight: 7 },
  { id: 'journal', name: 'Journal Entry', description: 'Did you write in your journal?', type: 'boolean', weight: 4 },
];

// Storage keys
const KEYS = {
  USER_STATE: 'exec_os_user_state',
  CHECK_INS: 'exec_os_check_ins',
  RULES: 'exec_os_rules',
  VAULT: 'exec_os_vault',
  PAST_SELF: 'exec_os_past_self',
};

// User State
export function getUserState(): UserState | null {
  const data = localStorage.getItem(KEYS.USER_STATE);
  return data ? JSON.parse(data) : null;
}

export function initializeUser(): UserState {
  const state: UserState = {
    initialized: true,
    initDate: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    missedDays: 0,
  };
  localStorage.setItem(KEYS.USER_STATE, JSON.stringify(state));
  return state;
}

export function updateUserState(updates: Partial<UserState>): void {
  const current = getUserState();
  if (current) {
    localStorage.setItem(KEYS.USER_STATE, JSON.stringify({ ...current, ...updates }));
  }
}

// Check-ins
export function getCheckIns(): Record<string, DailyCheckIn> {
  const data = localStorage.getItem(KEYS.CHECK_INS);
  return data ? JSON.parse(data) : {};
}

export function getCheckIn(date: string): DailyCheckIn | null {
  const checkIns = getCheckIns();
  return checkIns[date] || null;
}

export function getTodayCheckIn(): DailyCheckIn | null {
  return getCheckIn(getTodayKey());
}

export function hasCheckedInToday(): boolean {
  return getTodayCheckIn() !== null;
}

export function saveCheckIn(checkIn: DailyCheckIn): void {
  const checkIns = getCheckIns();
  checkIns[checkIn.date] = checkIn;
  localStorage.setItem(KEYS.CHECK_INS, JSON.stringify(checkIns));
  
  // Update user state
  const state = getUserState();
  if (state) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    const hadYesterdayCheckIn = !!checkIns[yesterdayKey];
    
    const newStreak = hadYesterdayCheckIn ? state.currentStreak + 1 : 1;
    updateUserState({
      currentStreak: newStreak,
      longestStreak: Math.max(state.longestStreak, newStreak),
      totalCheckIns: state.totalCheckIns + 1,
    });
  }
}

// Score calculation
export function calculateScore(rules: RuleCheckResult[], ruleDefinitions: Rule[]): number {
  let totalWeight = 0;
  let earnedWeight = 0;
  
  for (const result of rules) {
    const rule = ruleDefinitions.find(r => r.id === result.ruleId);
    if (rule) {
      totalWeight += rule.weight;
      if (result.completed) {
        earnedWeight += rule.weight;
      }
    }
  }
  
  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

// Rules
export function getRules(): Rule[] {
  const data = localStorage.getItem(KEYS.RULES);
  return data ? JSON.parse(data) : DEFAULT_RULES;
}

export function saveRules(rules: Rule[]): void {
  localStorage.setItem(KEYS.RULES, JSON.stringify(rules));
}

// Vault
export function getVaultAssets(): VaultAsset[] {
  const data = localStorage.getItem(KEYS.VAULT);
  return data ? JSON.parse(data) : [];
}

export function saveVaultAsset(asset: VaultAsset): void {
  const assets = getVaultAssets();
  const existingIndex = assets.findIndex(a => a.id === asset.id);
  if (existingIndex >= 0) {
    assets[existingIndex] = asset;
  } else {
    assets.push(asset);
  }
  localStorage.setItem(KEYS.VAULT, JSON.stringify(assets));
}

// Stats
export function getAverageScore(days: number = 7): number {
  const checkIns = getCheckIns();
  const dates = Object.keys(checkIns).sort().slice(-days);
  if (dates.length === 0) return 0;
  
  const total = dates.reduce((sum, date) => sum + checkIns[date].score, 0);
  return Math.round(total / dates.length);
}

export function getScoreHistory(days: number = 30): { date: string; score: number }[] {
  const checkIns = getCheckIns();
  return Object.entries(checkIns)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-days)
    .map(([date, checkIn]) => ({ date, score: checkIn.score }));
}
