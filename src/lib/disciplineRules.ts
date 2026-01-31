// 37 Personal Discipline Rules
// Used in CoreStatement dropdown and daily check-in Section R

export interface DisciplineRule {
  id: number;
  title: string;
  shortTitle?: string; // For compact display
}

export const DISCIPLINE_RULES: DisciplineRule[] = [
  { id: 1, title: "Pick the hardest build, learn and do" },
  { id: 2, title: "Feel the pain all the way - this is what can make you who you wanna be" },
  { id: 3, title: "I don't see the reason you are f*cking giving up, there is no option" },
  { id: 4, title: "We can have it all - pick them wisely and show me just doing it" },
  { id: 5, title: "This time crushing it not small task" },
  { id: 6, title: "Order is our schema - ain't we got it after 6 we are still here not there" },
  { id: 7, title: "You need consistence ain't fuel" },
  { id: 8, title: "Everything is gonna be your fault - not even a single complain of country or situation" },
  { id: 9, title: "Private success lead to victory not vice versa" },
  { id: 10, title: "This is just start not the end" },
  { id: 11, title: "World won't go anywhere unless we stayed tune - so do it, don't wanna see you sleeping" },
  { id: 12, title: "Follow one niche this time - I don't see any reason it is gonna fail" },
  { id: 13, title: "Have a fuel you can put on fire which is the agent we are building" },
  { id: 14, title: "Don't spend your time with taker not giver" },
  { id: 15, title: "For the responsibility problem we are gonna blame anyone" },
  { id: 16, title: "Don't be a f*cking prisoner to any of them - enjoy doing them" },
  { id: 17, title: "Don't compare yourself with others - you do it with yourself" },
  { id: 18, title: "Always we are positive even in ocean" },
  { id: 19, title: "Protect your mind not only growing it" },
  { id: 20, title: "Control what you can if what you can't" },
  { id: 21, title: "Speeeeeeeeeeeeeed - we are robot ok, not human anymore" },
  { id: 22, title: "Ignore what others think about you" },
  { id: 23, title: "We are always ambitious to listen that car sound, to live there, to make them shout their mouth" },
  { id: 24, title: "Prioritize your health" },
  { id: 25, title: "Keep your promise to be Elon Musk and Masayoshi Son" },
  { id: 26, title: "Thanks to our situation - not enjoyment for us yet even if we are young" },
  { id: 27, title: "Fail is a f*cking master - you will call it soon a legendary" },
  { id: 28, title: "Winners don't quit, quitters never win" },
  { id: 29, title: "We are not rich yet - don't give even a single penny" },
  { id: 30, title: "Don't f*cking fear money - cause if it can make you broke it can make you rich too" },
  { id: 31, title: "One victory covers all the failure" },
  { id: 32, title: "Money is the tool not the goal" },
  { id: 33, title: "Your network is your networth" },
  { id: 34, title: "If dad ain't drop it so who can you call yourself?" },
  { id: 35, title: "Build the system then you will see how it matter" },
  { id: 36, title: "Next stop will be on billions not even millions" },
  { id: 37, title: "Luck is when preparation meets opportunity so don't wait for it - show me who you are" },
];

// Convert to check-in questions format
// Total 14 points distributed across 37 rules (approximately 0.38 each, rounded)
export function getDisciplineRulesAsQuestions() {
  return DISCIPLINE_RULES.map((rule, index) => ({
    id: `R${rule.id}`,
    text: rule.title,
    // Distribute 14 points: first 14 rules get 1 point each, rest get 0
    // OR we can give fractional: each rule ~0.38 points but round total to 14
    points: index < 14 ? 1 : 0, // First 14 rules = 1 point each = 14 points total
  }));
}

// For check-in section
export const DISCIPLINE_RULES_SECTION = {
  id: 'R',
  title: 'Daily Discipline Rules',
  maxPoints: 14,
  isCritical: true,
  questions: getDisciplineRulesAsQuestions(),
};
