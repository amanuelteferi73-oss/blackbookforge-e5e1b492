// Daily Check-In Sections Configuration
// This is the IMMUTABLE truth structure - DO NOT MODIFY QUESTION WORDING OR POINTS

import { DISCIPLINE_RULES_SECTION } from './disciplineRules';

// Multi-pillar system: users can select 1-2 pillars per day
export type PillarType = 'school' | 'startup' | 'cash' | 'floor';
export type FocusPillar = 'startup' | 'cash' | 'school' | null; // Legacy support

export interface CheckInQuestion {
  id: string;
  text: string;
  points: number;
}

export interface CheckInSection {
  id: string;
  title: string;
  maxPoints: number;
  questions: CheckInQuestion[];
  isCritical?: boolean;
  isConditional?: boolean;
  scoringLogic?: 'standard' | 'percentage-tier';
  // Pillar visibility control
  pillarRequired?: PillarType; // Only visible when this pillar is selected
}

// Dynamic floor action interface
export interface FloorActionQuestion {
  id: string;
  text: string;
  points: number;
}

// FIXED SECTIONS - Always visible (A, B)
// CORE SECTIONS - Always visible (E, F, G, H, I)
// PILLAR-CONDITIONAL - C (cash), D (startup), S (school), FL (floor - dynamic)

export const CHECK_IN_SECTIONS: CheckInSection[] = [
  // === FIXED SECTIONS (Always visible) ===
  {
    id: 'A',
    title: 'Morning Start & Integrity',
    maxPoints: 10,
    questions: [
      { id: 'A1', text: 'Did you get out of bed immediately at your planned wake-up time?', points: 4 },
      { id: 'A2', text: 'Did you touch the future?', points: 3 },
      { id: 'A3', text: 'Did you start your first task without touching your phone(unless recording progress) or social media?', points: 3 },
    ],
  },
  {
    id: 'B',
    title: 'Physical & Energy Discipline',
    maxPoints: 10,
    questions: [
      { id: 'B1', text: 'Did you complete your planned workout?', points: 4 },
      { id: 'B2', text: 'Did you stay upright during work blocks?', points: 3 },
      { id: 'B3', text: 'Did you hydrate sufficiently?', points: 3 },
    ],
  },

  // === CORE SECTIONS (Always visible) ===
  {
    id: 'E',
    title: 'Speed & Fear Check',
    maxPoints: 10,
    questions: [
      { id: 'E1', text: 'Did something before feeling ready?', points: 5 },
      { id: 'E2', text: 'Avoided perfection loops?', points: 5 },
    ],
  },
  {
    id: 'F',
    title: 'Discipline Locks',
    maxPoints: 14,
    isCritical: true,
    questions: [
      { id: 'F1', text: 'Fully complied with all binary discipline rules?', points: 8 },
      { id: 'F2', text: 'Shut down temptations immediately?', points: 6 },
    ],
  },
  {
    id: 'G',
    title: 'Time & Deep Work Truth',
    maxPoints: 10,
    questions: [
      { id: 'G1', text: 'Completed two uninterrupted deep work blocks?', points: 5 },
      { id: 'G2', text: 'Knew exactly what tomorrow requires?', points: 5 },
    ],
  },
  {
    id: 'H',
    title: 'Daily Notebook Check',
    maxPoints: 20,
    isConditional: true,
    scoringLogic: 'percentage-tier',
    questions: [
      { id: 'H1', text: 'Wrote full daily plan?', points: 4 },
      { id: 'H2', text: 'Completed all tasks?', points: 4 },
      { id: 'H3', text: 'Finished at least 75%?', points: 4 },
      { id: 'H4', text: 'Followed task order?', points: 4 },
      { id: 'H5', text: 'Logged honestly?', points: 4 },
    ],
  },

  // === PILLAR-CONDITIONAL SECTIONS ===
  {
    id: 'C',
    title: 'Cash Engine Actions',
    maxPoints: 20,
    pillarRequired: 'cash',
    questions: [
      { id: 'C1', text: 'Outward-facing cash action performed?', points: 5 },
      { id: 'C2', text: 'At least one risky/rejection-possible action?', points: 5 },
      { id: 'C3', text: 'Follow-up with a real person?', points: 5 },
      { id: 'C4', text: 'Shipped or showed before perfecting?', points: 5 },
    ],
  },
  {
    id: 'D',
    title: 'Startup / Identity Engine',
    maxPoints: 15,
    pillarRequired: 'startup',
    questions: [
      { id: 'D1', text: 'Exposed startup/project to a real person?', points: 5 },
      { id: 'D2', text: 'Asked for feedback (not validation)?', points: 5 },
      { id: 'D3', text: 'Logged a signal (interest / confusion / rejection / silence)?', points: 5 },
    ],
  },
  {
    id: 'S',
    title: 'School / Academic Execution',
    maxPoints: 15,
    pillarRequired: 'school',
    questions: [
      { id: 'S1', text: 'Attended required classes or sessions?', points: 4 },
      { id: 'S2', text: 'Completed required academic work?', points: 4 },
      { id: 'S3', text: 'Studied or read with intent (not passive)?', points: 4 },
      { id: 'S4', text: 'Avoided distractions during school blocks?', points: 3 },
    ],
  },

  // === CLOSING SECTION (Always visible) ===
  {
    id: 'I',
    title: 'Closing Honesty',
    maxPoints: 5,
    questions: [
      { id: 'I1', text: 'If today repeated for 30 days, would your situation change materially?', points: 5 },
    ],
  },

  // === DISCIPLINE RULES SECTION (Always visible) ===
  DISCIPLINE_RULES_SECTION,
];
// Get sections visible for selected pillars (multi-pillar support)
export function getVisibleSectionsMulti(selectedPillars: PillarType[]): CheckInSection[] {
  return CHECK_IN_SECTIONS.filter(section => {
    // No pillar required = always visible
    if (!section.pillarRequired) return true;
    // Floor is handled separately (dynamic)
    if (section.pillarRequired === 'floor') return false;
    // Show if pillar is in selected array
    return selectedPillars.includes(section.pillarRequired);
  });
}

// Legacy: Get sections visible for a single pillar
export function getVisibleSections(pillar: FocusPillar): CheckInSection[] {
  return CHECK_IN_SECTIONS.filter(section => {
    if (!section.pillarRequired) return true;
    if (!pillar) return false;
    return section.pillarRequired === pillar;
  });
}

// Calculate total possible points for selected pillars (excluding floor - added dynamically)
export function getTotalPossiblePointsMulti(selectedPillars: PillarType[], floorPoints: number = 0): number {
  const staticPoints = getVisibleSectionsMulti(selectedPillars).reduce((sum, section) => sum + section.maxPoints, 0);
  return staticPoints + (selectedPillars.includes('floor') ? floorPoints : 0);
}

// Legacy: Calculate total possible points for a single pillar
export function getTotalPossiblePoints(pillar: FocusPillar): number {
  return getVisibleSections(pillar).reduce((sum, section) => sum + section.maxPoints, 0);
}

// Legacy: Total points when all sections visible (for compatibility)
export const TOTAL_POSSIBLE_POINTS = CHECK_IN_SECTIONS.reduce(
  (sum, section) => sum + section.maxPoints,
  0
);

// Section H percentage tier scoring
export function calculateSectionHScore(completedCount: number, totalQuestions: number): number {
  const percentage = (completedCount / totalQuestions) * 100;
  
  if (percentage === 100) return 20;
  if (percentage >= 75) return 15;
  if (percentage >= 50) return 10;
  return 0;
}

// Calculate score from answers
export interface QuestionAnswer {
  questionId: string;
  value: boolean;
}

export interface CheckInResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  disciplineBreach: boolean;
  failedItems: {
    section: string;
    questionId: string;
    questionText: string;
    pointsLost: number;
    severity: 'standard' | 'critical';
  }[];
  sectionScores: {
    sectionId: string;
    title: string;
    earned: number;
    max: number;
  }[];
}

// Multi-pillar score calculation with floor actions
export function calculateCheckInScoreMulti(
  answers: QuestionAnswer[], 
  selectedPillars: PillarType[],
  floorActions: FloorActionQuestion[] = []
): CheckInResult {
  const answerMap = new Map(answers.map(a => [a.questionId, a.value]));
  const failedItems: CheckInResult['failedItems'] = [];
  const sectionScores: CheckInResult['sectionScores'] = [];
  let totalScore = 0;
  let disciplineBreach = false;

  // Get static sections
  const visibleSections = getVisibleSectionsMulti(selectedPillars);
  
  // Calculate floor points
  const floorTotalPoints = floorActions.reduce((sum, a) => sum + a.points, 0);
  const maxPossiblePoints = getTotalPossiblePointsMulti(selectedPillars, floorTotalPoints);

  // Calculate static sections
  for (const section of visibleSections) {
    let sectionEarned = 0;

    if (section.scoringLogic === 'percentage-tier') {
      const completedCount = section.questions.filter(q => answerMap.get(q.id) === true).length;
      sectionEarned = calculateSectionHScore(completedCount, section.questions.length);
      
      for (const question of section.questions) {
        if (answerMap.get(question.id) !== true) {
          failedItems.push({
            section: section.id,
            questionId: question.id,
            questionText: question.text,
            pointsLost: question.points,
            severity: 'standard',
          });
        }
      }
    } else {
      for (const question of section.questions) {
        const answered = answerMap.get(question.id);
        
        // Special handling for Section I (Closing Honesty)
        if (section.id === 'I') {
          if (answered === false) {
            sectionEarned += question.points;
          } else if (answered === true) {
            failedItems.push({
              section: section.id,
              questionId: question.id,
              questionText: question.text,
              pointsLost: question.points,
              severity: 'standard',
            });
          }
        } else {
          if (answered === true) {
            sectionEarned += question.points;
          } else {
            failedItems.push({
              section: section.id,
              questionId: question.id,
              questionText: question.text,
              pointsLost: question.points,
              severity: section.isCritical ? 'critical' : 'standard',
            });
            
            if (section.isCritical && answered === false) {
              disciplineBreach = true;
            }
          }
        }
      }
    }

    sectionScores.push({
      sectionId: section.id,
      title: section.title,
      earned: sectionEarned,
      max: section.maxPoints,
    });

    totalScore += sectionEarned;
  }

  // Calculate floor section if selected
  if (selectedPillars.includes('floor') && floorActions.length > 0) {
    let floorEarned = 0;
    
    for (const action of floorActions) {
      const answered = answerMap.get(action.id);
      if (answered === true) {
        floorEarned += action.points;
      } else {
        failedItems.push({
          section: 'FL',
          questionId: action.id,
          questionText: action.text,
          pointsLost: action.points,
          severity: 'standard',
        });
      }
    }

    sectionScores.push({
      sectionId: 'FL',
      title: 'The Floor Actions',
      earned: floorEarned,
      max: floorTotalPoints,
    });

    totalScore += floorEarned;
  }

  return {
    totalScore: Math.round(totalScore),
    maxScore: maxPossiblePoints,
    percentage: maxPossiblePoints > 0 ? Math.round((totalScore / maxPossiblePoints) * 100) : 0,
    disciplineBreach,
    failedItems,
    sectionScores,
  };
}

// Legacy: Calculate score for single pillar
export function calculateCheckInScore(answers: QuestionAnswer[], pillar: FocusPillar = null): CheckInResult {
  const selectedPillars: PillarType[] = pillar ? [pillar] : [];
  return calculateCheckInScoreMulti(answers, selectedPillars);
}

// Focus Pillar options for UI (legacy)
export const FOCUS_PILLAR_OPTIONS = [
  { value: 'startup' as const, label: 'Startup / Product Building', description: 'Building, shipping, iterating' },
  { value: 'cash' as const, label: 'Cash Flow / Client Acquisition', description: 'Revenue, sales, outreach' },
  { value: 'school' as const, label: 'School / Academic Progress', description: 'Classes, study, assignments' },
];
