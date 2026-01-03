// IMMUTABLE PUNISHMENT LIST - DO NOT MODIFY
export const PUNISHMENTS: string[] = [
  // TIER 6 — TEDIOUS & HUMBLING
  "Read a book you actively dislike for 4 continuous hours, then still complete the missed task.",
  "Sit inside a gym for 60 minutes without working out, phone off, then leave.",
  "Rewrite your entire daily plan by hand using your non-dominant hand.",
  "Watch a full beginner tutorial on something you already know—no skipping.",
  "Stay fully dressed in outdoor clothes inside your room for 3 hours while working.",
  "Eat a deliberately boring meal in silence, slowly, no distractions.",
  "Reorganize files/folders you already organized—perfectly.",
  "Walk a long, inefficient route to a place you could reach easily.",
  "Read your rules out loud, slowly, standing.",
  "Spend 45 minutes doing only one micro-task with extreme slowness.",
  
  // TIER 7 — SOCIAL & EGO FRICTION
  "Call someone you have avoided and keep the conversation polite and short.",
  "Ask someone for advice you already know the answer to.",
  "Send a respectful follow-up message you've been procrastinating.",
  "Publicly acknowledge a small mistake without justification.",
  "Ask a simple question in a group where you usually stay silent.",
  "Compliment someone genuinely when it feels slightly awkward.",
  "Walk into a shop, ask one question, thank them, and leave.",
  "Explain your project briefly to someone uninterested.",
  "Admit \"I messed up my plan today\" to one real person.",
  "Sit in a public place alone for 30 minutes with no phone.",
  
  // TIER 8 — COMFORT & IDENTITY VIOLATION
  "Work for 2 hours with no chair (standing or floor only).",
  "Remove music entirely for 72 hours.",
  "Use only black-and-white phone mode for 5 days.",
  "Wear intentionally plain clothing for a full day.",
  "Wake up early and do your hardest task before speaking to anyone.",
  "No sugar or flavored drinks for 72 hours.",
  "Use the slowest reasonable method to complete a task.",
  "Sit with boredom intentionally for 20 minutes—no stimuli.",
  "Eat the same basic food for two consecutive meals.",
  "Disable all notifications except calls for 48 hours.",
  
  // TIER 9 — PHYSICAL DISCOMFORT (SAFE, CONTROLLED)
  "Midday walk/run for 15–20 minutes max, hydrated, sun exposure allowed but no pushing pace.",
  "Cold water face immersion for 30 seconds, twice.",
  "Extra mobility/stretch session when you don't feel like moving.",
  "Carry a backpack with light weight on a long walk.",
  "Wake up early and sit outside quietly while the day starts.",
  "Hold a wall-sit for cumulative 5 minutes (with breaks).",
  "Take a cold shower immediately after waking (short duration).",
  "Do a slow, controlled bodyweight circuit—no intensity rush.",
  "Walk instead of using transport when possible that day.",
  "Stand still outside for 10 minutes, observing discomfort.",
  
  // TIER 10 — SYSTEM SHOCK / UNFORGETTABLE
  "Complete the missed task twice—once badly, once properly.",
  "Write a one-page letter to your future self describing this failure.",
  "Re-read your entire yearly plan without skipping a line.",
  "Lose all optional comfort for the rest of the day.",
  "Restart the day's execution block from zero—no credit kept.",
  "Perform one visible action immediately, regardless of readiness.",
  "Cancel one planned leisure activity without replacement.",
  "Rebuild tomorrow's plan with stricter constraints than before.",
  "Do outreach until you feel resistance—and continue 5 more minutes.",
  "Sit alone and manually log every past RED day you remember."
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
