export const WEEK_4_DATA = {
  weekNumber: 4,
  objective: "Make the startup publicly real — accessible on the internet, functional end-to-end, and capable of being used by real humans — without chasing traffic, attention, or validation yet. This week is about existence, not growth.",
  focusSplit: "Startup (PRIMARY): Go-live preparation → deployment → real-world functionality | Local Business (SECONDARY): Resume active pitching for cash flow discipline",
  successCondition: "By the end of this week: The product is live on the internet | Real people can use it (even if they don't yet) | No critical failures exist | You have returned to cash-flow activity without losing startup focus",
  days: [
    {
      dayNumber: 22,
      title: "GO-LIVE REQUIREMENTS & FAILURE AUDIT",
      intent: "Identifying everything that would break if someone used this tomorrow.",
      actions: [
        "Define 'live' clearly: Hosting, Domain or access point, Data persistence, Auth (if applicable)",
        "List every possible failure: Broken flows, Missing states, Dead ends",
        "Rank failures by: Public-breaking, Annoying, Cosmetic"
      ],
      rules: "No fixing yet. Only identification.",
      unlockText: "#23 — REALITY CHECK PASSED"
    },
    {
      dayNumber: 23,
      title: "DEPLOYMENT & PUBLIC ACCESS DAY",
      intent: "Crossing the line from private to public.",
      actions: [
        "Deploy the product live: Hosting configured, Environment stable, Build reachable via URL",
        "Verify: A stranger could open it, Core flow works end-to-end",
        "Fix only deployment-blocking issues"
      ],
      rules: "Once it's live, it exists forever.",
      unlockText: "#24 — IT EXISTS OUTSIDE YOU"
    },
    {
      dayNumber: 24,
      title: "LIVE FUNCTIONALITY & BREAK FIXING",
      intent: "Making the live version usable, not embarrassing.",
      actions: [
        "Use the product exactly like a user would",
        "Identify: Confusion points, Breaks, Data errors",
        "Fix only: Issues that prevent use, Issues that damage trust"
      ],
      rules: "No new features allowed.",
      unlockText: "#25 — PUBLICLY STABLE"
    },
    {
      dayNumber: 25,
      title: "FIRST REAL HUMAN CONTACT (SOFT)",
      intent: "Letting reality touch the product.",
      actions: [
        "Show the live product to: One real person, No selling, No explaining unless asked",
        "Observe: Where they hesitate, What they misunderstand",
        "Write notes only"
      ],
      rules: "You are not defending the product today.",
      unlockText: "#26 — REALITY SPOKE"
    },
    {
      dayNumber: 26,
      title: "CASH FLOW RE-ENGAGEMENT DAY",
      intent: "Proving you can hold two systems without collapse.",
      actions: [
        "Go out and pitch local businesses again",
        "Focus on: Presence, Confidence, Clarity",
        "Startup work today is limited to notes only"
      ],
      rules: "Builders do not abandon cash discipline.",
      unlockText: "Progress toward #05 — DISCIPLINE IS BINARY"
    },
    {
      dayNumber: 27,
      title: "LIVE PRODUCT HARDENING",
      intent: "Strengthening what already exists.",
      actions: [
        "Improve: Reliability, Edge-case handling, Error states",
        "Do NOT add: Features, Visual polish, 'Nice-to-haves'"
      ],
      rules: "This is reinforcement, not expansion.",
      unlockText: "#27 — SURVIVES CONTACT"
    },
    {
      dayNumber: 28,
      title: "WEEK 4 CLOSE: PUBLIC COMMITMENT",
      intent: "Acknowledging that you crossed a line.",
      actions: [
        "Audit: Is the product live? Can real people use it? Did you avoid hiding?",
        "Write one paragraph: 'This product now exists independently of my motivation.'",
        "No planning Week 5 in detail yet"
      ],
      rules: null,
      unlockText: "#28 — PUBLIC BUILDER"
    }
  ]
};
