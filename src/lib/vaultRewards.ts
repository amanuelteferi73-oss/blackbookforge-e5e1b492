// VAULT REWARDS DATA - VERBATIM FROM SPECIFICATION
// DO NOT EDIT ANY TEXT, LINKS, OR TIMING

export interface VaultReward {
  id: number;
  title: string;
  unlockRule: string;
  when: string;
  rewardTitle: string;
  rewardLink?: string;
  rewardText?: string;
  enjoymentTime: string;
  phase: 'ignition' | 'pressure-signal' | 'proof-escalation' | 'consolidation-signal';
}

export const PHASE_LABELS = {
  'ignition': 'Ignition',
  'pressure-signal': 'Pressure & Signal',
  'proof-escalation': 'Proof & Escalation',
  'consolidation-signal': 'Consolidation & Signal',
} as const;

export const PHASE_RANGES = {
  'ignition': '1–10',
  'pressure-signal': '11–25',
  'proof-escalation': '26–45',
  'consolidation-signal': '46–50',
} as const;

export const VAULT_REWARDS: VaultReward[] = [
  // ========== IGNITION (Weeks 1–2) - Rewards 1-10 ==========
  {
    id: 1,
    title: 'BUILD BEGINS',
    unlockRule: 'Yesterday was GREEN (all planned tasks executed)',
    when: 'Any day in Week 1',
    rewardTitle: 'Paul Graham — Maker\'s Schedule',
    rewardLink: 'https://paulgraham.com/makersschedule.html',
    enjoymentTime: '20 minutes',
    phase: 'ignition',
  },
  {
    id: 2,
    title: 'FIRST NO DOES NOT KILL YOU',
    unlockRule: 'Sent 5 cold messages to local businesses',
    when: 'Week 1',
    rewardTitle: 'Naval Ravikant — How to Get Rich (thread)',
    rewardLink: 'https://nav.al/rich',
    enjoymentTime: '25 minutes',
    phase: 'ignition',
  },
  {
    id: 3,
    title: 'SILENCE IS NORMAL',
    unlockRule: '24 hours passed with no replies, and you still executed next task',
    when: 'Week 1',
    rewardTitle: 'Cal Newport — Deep Work Summary',
    rewardLink: 'https://calnewport.com/deep-work-rules-for-focused-success-in-a-distracted-world/',
    enjoymentTime: '30 minutes',
    phase: 'ignition',
  },
  {
    id: 4,
    title: 'UGLY BUT REAL',
    unlockRule: 'Shipped any live page (even ugly)',
    when: 'Week 1–2',
    rewardTitle: 'First SpaceX Falcon 1 failure story',
    rewardLink: 'https://en.wikipedia.org/wiki/Falcon_1',
    enjoymentTime: '30 minutes',
    phase: 'ignition',
  },
  {
    id: 5,
    title: 'DISCIPLINE IS BINARY',
    unlockRule: '3 consecutive days, discipline score = 100',
    when: 'Week 1–2',
    rewardTitle: 'James Clear — Discipline Article',
    rewardLink: 'https://jamesclear.com/discipline',
    enjoymentTime: '30 minutes',
    phase: 'ignition',
  },
  {
    id: 6,
    title: 'FIRST REAL PITCH',
    unlockRule: 'Delivered 1 pitch (DM, call, or walk-in)',
    when: 'Week 1–2',
    rewardTitle: 'Watch one MrBeast video of your choice',
    rewardLink: 'https://www.youtube.com/@MrBeast',
    enjoymentTime: '30 minutes',
    phase: 'ignition',
  },
  {
    id: 7,
    title: 'CONSISTENCY > TALENT',
    unlockRule: 'Executed the same task 3 days in a row',
    when: 'Week 2',
    rewardTitle: 'Wikipedia — Compound Effect',
    rewardLink: 'https://en.wikipedia.org/wiki/Compound_interest',
    enjoymentTime: '25 minutes',
    phase: 'ignition',
  },
  {
    id: 8,
    title: 'FIRST FOLLOW-UP',
    unlockRule: 'Followed up with 3 businesses',
    when: 'Week 2',
    rewardTitle: 'Watch one YouTube interview (founder of your choice)',
    rewardLink: 'https://www.youtube.com/watch?v=G5e5dXfR9Yk',
    enjoymentTime: '35 minutes',
    phase: 'ignition',
  },
  {
    id: 9,
    title: 'NO HIDING',
    unlockRule: 'Publicly expose your service (post, bio, or message)',
    when: 'Week 2',
    rewardTitle: 'Airbnb origin story',
    rewardLink: 'https://en.wikipedia.org/wiki/Airbnb#History',
    enjoymentTime: '30 minutes',
    phase: 'ignition',
  },
  {
    id: 10,
    title: 'WEEK ONE SURVIVED',
    unlockRule: 'Week ended GREEN',
    when: 'End of Week 1',
    rewardTitle: 'Watch any Formula 1 race highlights',
    rewardLink: 'https://www.youtube.com/@Formula1',
    enjoymentTime: '45 minutes',
    phase: 'ignition',
  },

  // ========== PRESSURE & SIGNAL (Weeks 3–6) - Rewards 11-25 ==========
  // Placeholder structure - add exact content when provided
  
  // ========== PROOF & ESCALATION (Weeks 7–12) - Rewards 26-45 ==========
  // Placeholder structure - add exact content when provided
  
  // ========== CONSOLIDATION & SIGNAL (Weeks 13+) - Rewards 46-50 ==========
  // Placeholder structure - add exact content when provided
];

export function getRewardsByPhase(phase: VaultReward['phase']): VaultReward[] {
  return VAULT_REWARDS.filter(r => r.phase === phase);
}

export function getPhaseOrder(): VaultReward['phase'][] {
  return ['ignition', 'pressure-signal', 'proof-escalation', 'consolidation-signal'];
}
