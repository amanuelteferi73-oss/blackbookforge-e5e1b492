// Daily Check-In Sections Configuration
// This is the IMMUTABLE truth structure - DO NOT MODIFY

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
}

export const CHECK_IN_SECTIONS: CheckInSection[] = [
  {
    id: 'A',
    title: 'Morning Start & Integrity',
    maxPoints: 10,
    questions: [
      { id: 'A1', text: 'Did you get out of bed immediately at your planned wake-up time?', points: 4 },
      { id: 'A2', text: 'Did you expose yourself to light within 30 minutes of waking?', points: 3 },
      { id: 'A3', text: 'Did you start your first task without touching your phone or social media?', points: 3 },
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
  {
    id: 'C',
    title: 'Cash Engine Actions',
    maxPoints: 20,
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
    questions: [
      { id: 'D1', text: 'Exposed startup/project to a real person?', points: 5 },
      { id: 'D2', text: 'Asked for feedback (not validation)?', points: 5 },
      { id: 'D3', text: 'Logged a signal (interest / confusion / rejection / silence)?', points: 5 },
    ],
  },
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
    maxPoints: 15,
    isCritical: true,
    questions: [
      { id: 'F1', text: 'Fully complied with all binary discipline rules?', points: 7.5 },
      { id: 'F2', text: 'Shut down temptations immediately?', points: 7.5 },
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
  {
    id: 'I',
    title: 'Closing Honesty',
    maxPoints: 5,
    questions: [
      { id: 'I1', text: 'If today repeated for 30 days, would your situation change materially?', points: 5 },
    ],
  },
];

// Calculate total possible points
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

export function calculateCheckInScore(answers: QuestionAnswer[]): CheckInResult {
  const answerMap = new Map(answers.map(a => [a.questionId, a.value]));
  const failedItems: CheckInResult['failedItems'] = [];
  const sectionScores: CheckInResult['sectionScores'] = [];
  let totalScore = 0;
  let disciplineBreach = false;

  for (const section of CHECK_IN_SECTIONS) {
    let sectionEarned = 0;

    if (section.scoringLogic === 'percentage-tier') {
      // Section H special logic
      const completedCount = section.questions.filter(q => answerMap.get(q.id) === true).length;
      sectionEarned = calculateSectionHScore(completedCount, section.questions.length);
      
      // Track failed items for Section H
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
      // Standard scoring
      for (const question of section.questions) {
        const answered = answerMap.get(question.id);
        
        // Special handling for Section I (Closing Honesty)
        // "No" = 5 pts, "Yes" = 0 pts
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
          // Normal questions: Yes = points, No = 0
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
            
            // Check for discipline breach
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

  return {
    totalScore: Math.round(totalScore),
    maxScore: TOTAL_POSSIBLE_POINTS,
    percentage: Math.round((totalScore / TOTAL_POSSIBLE_POINTS) * 100),
    disciplineBreach,
    failedItems,
    sectionScores,
  };
}
