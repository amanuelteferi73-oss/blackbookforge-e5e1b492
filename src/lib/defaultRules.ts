// Default rules configuration for new users
// These rules have balanced weights that sum to a reasonable total

import { supabase } from '@/integrations/supabase/client';

export interface DefaultRule {
  title: string;
  description: string;
  weight: number; // 1-10
  sort_order: number;
}

// Default rules - the discipline system
// Weights are balanced: higher weight = more important
// Total weight: 56 (will be normalized to 100% at calculation)
export const DEFAULT_RULES: DefaultRule[] = [
  { 
    title: 'Wake Up Before 5 AM', 
    description: 'Did you wake up before 5 AM?', 
    weight: 8, 
    sort_order: 0 
  },
  { 
    title: 'Complete Workout', 
    description: 'Did you complete your workout?', 
    weight: 9, 
    sort_order: 1 
  },
  { 
    title: 'Study/Work 8+ Hours', 
    description: 'Did you study or work for 8+ hours?', 
    weight: 10, 
    sort_order: 2 
  },
  { 
    title: 'No Junk Food', 
    description: 'Did you avoid junk food?', 
    weight: 6, 
    sort_order: 3 
  },
  { 
    title: 'No Social Media Waste', 
    description: 'Did you avoid wasting time on social media?', 
    weight: 7, 
    sort_order: 4 
  },
  { 
    title: 'Drink 3L Water', 
    description: 'Did you drink at least 3 liters of water?', 
    weight: 5, 
    sort_order: 5 
  },
  { 
    title: 'Sleep Before 10 PM', 
    description: 'Did you sleep before 10 PM yesterday?', 
    weight: 7, 
    sort_order: 6 
  },
  { 
    title: 'Journal Entry', 
    description: 'Did you write in your journal?', 
    weight: 4, 
    sort_order: 7 
  },
];

/**
 * Check if user has any rules configured
 */
export async function userHasRules(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('daily_rules')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('[DefaultRules] Error checking rules:', error);
    return false;
  }

  return (count ?? 0) > 0;
}

/**
 * Seed default rules for a new user
 */
export async function seedDefaultRules(userId: string): Promise<boolean> {
  console.log('[DefaultRules] Seeding rules for user:', userId);

  // Check if user already has rules
  const hasRules = await userHasRules(userId);
  if (hasRules) {
    console.log('[DefaultRules] User already has rules, skipping seed');
    return true;
  }

  // Insert default rules
  const rulesToInsert = DEFAULT_RULES.map(rule => ({
    user_id: userId,
    title: rule.title,
    description: rule.description,
    weight: rule.weight,
    sort_order: rule.sort_order,
    is_active: true,
  }));

  const { error } = await supabase
    .from('daily_rules')
    .insert(rulesToInsert);

  if (error) {
    console.error('[DefaultRules] Error seeding rules:', error);
    return false;
  }

  console.log('[DefaultRules] Successfully seeded', DEFAULT_RULES.length, 'rules');
  return true;
}

/**
 * Calculate weight distribution info
 */
export function getWeightDistribution(rules: { weight: number }[]): {
  totalWeight: number;
  maxPossible: number;
  distribution: { weight: number; percentage: number }[];
} {
  const totalWeight = rules.reduce((sum, r) => sum + r.weight, 0);
  
  return {
    totalWeight,
    maxPossible: 100, // Score is always normalized to 100
    distribution: rules.map(r => ({
      weight: r.weight,
      percentage: totalWeight > 0 ? (r.weight / totalWeight) * 100 : 0,
    })),
  };
}
