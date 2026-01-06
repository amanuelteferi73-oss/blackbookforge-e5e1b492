// IMMUTABLE PUNISHMENT LIST - DO NOT MODIFY
export const PUNISHMENTS: string[] = [
  // CATEGORY A — SOCIAL ACCOUNTABILITY
  "Call someone you have avoided and keep the conversation for at least 3 minutes.",
  "Send a message saying: \"I messed up today and didn't execute.\" No explanation.",
  "Ask someone you respect for advice you already know you should've followed.",
  "Follow up with someone who ignored you—politely.",
  "Admit a small failure to a real person, face-to-face or voice.",
  "Ask a basic question in public that makes you feel stupid asking.",
  "Explain your project to someone who clearly doesn't care.",
  "Thank someone you've secretly felt inferior to.",
  "Ask for feedback knowing it may be negative.",
  "Publicly acknowledge (one sentence) that you failed a daily commitment.",
  
  // CATEGORY B — TIME-WASTING WITH AWARENESS
  "Sit at your desk for 60 minutes doing nothing except staring forward.",
  "Read a book you actively dislike for 3 uninterrupted hours, then execute the missed task.",
  "Rewrite your entire daily plan by hand, slowly, with no music.",
  "Rewatch a long, boring tutorial on something you already know—no skipping.",
  "Stay in a workspace for 2 hours after work ends, doing only low-level admin.",
  "Reorganize something already organized, perfectly.",
  "Manually rewrite your rules and violations list.",
  "Sit in a public place alone for 45 minutes with no phone.",
  "Do a task in the slowest reasonable way possible.",
  "Redo a finished task you know didn't need redoing.",
  
  // CATEGORY C — PHYSICAL DISCOMFORT
  "Work for 2 hours with no chair (standing or floor).",
  "Sit on the floor during an entire work session.",
  "Stay inside a gym for 1 hour without working out, then leave.",
  "Wake up early and immediately start the hardest task—no warm-up.",
  "Walk a long, inefficient route to a destination on purpose.",
  "Hold uncomfortable posture (safe) while working for a session.",
  "Do a slow, controlled workout session when motivation is zero.",
  "Stand in one place for 15 minutes doing nothing.",
  "Carry a light backpack while walking longer than needed.",
  "Cold shower immediately after waking (short, controlled).",
  
  // CATEGORY D — IDENTITY & PRIDE DAMAGE
  "Kill an idea or feature you were emotionally attached to.",
  "Publish or send something imperfect that you wanted to polish.",
  "Cancel a reward you were excited about.",
  "Reset your progress streak publicly to yourself.",
  "Write a one-page explanation of why you failed—no excuses.",
  "Read your own failure log from the beginning, slowly.",
  "Recommit to your rules in writing and sign again.",
  "Rebuild tomorrow's plan under stricter limits.",
  "Lose all rewards access for the next 7 days.",
  "Perform outreach using your worst-performing pitch.",
  
  // CATEGORY E — "I NEVER WANT TO DO THIS AGAIN"
  "Do the missed task twice: once badly, once properly.",
  "Sit with someone encouraging you to relax—and refuse.",
  "Spend an entire execution block without music, breaks, or comfort.",
  "Ask for help when you'd rather stay silent.",
  "Admit \"I failed my own system today\" out loud.",
  "Work from a place you feel visibly uncomfortable being productive in.",
  "Write a letter to your future self describing today's failure.",
  "Re-expose yourself to the exact rule you violated and explain it in writing.",
  "Continue working for 30 minutes after you want to stop.",
  "End the day knowing the punishment cost more comfort than the task would have."
];

// Select a random punishment - true randomness, no weighting
export function selectRandomPunishment(): { index: number; text: string } {
  const index = Math.floor(Math.random() * PUNISHMENTS.length);
  return {
    index,
    text: PUNISHMENTS[index]
  };
}

// Punishment threshold - triggers when score <= this value
export const PUNISHMENT_THRESHOLD = 85;

// Reward threshold - triggers when score >= this value
export const REWARD_THRESHOLD = 86;
