import { FloorWeek } from '@/hooks/useFloor';
import { Target, Layers, CheckCircle, FileText } from 'lucide-react';

// Week titles for display
const WEEK_TITLES: Record<number, string> = {
  1: 'FOUNDATION & PROOF OF MOTION',
  2: 'PRESSURE, CLARITY & COMMITMENT',
  3: 'DEEP BUILD & SYSTEM CONSTRUCTION',
  4: 'PUBLIC EXISTENCE & FIRST REALITY CONTACT',
  5: 'MARKETING BLITZ & OUTREACH DOMINATION',
  6: 'DUAL-TRACK EXECUTION',
  7: 'INVESTOR OUTREACH & FIRST REVENUE'
};

// Week summaries (displayed at bottom)
const WEEK_SUMMARIES: Record<number, string> = {
  2: "You stopped fantasizing and started deciding.\nYou felt pressure and didn't escape.\nThe startup now exists on paper, not just in your head.\nCash activity continued without hijacking focus.\n\nThis week separates dreamers from builders.",
  3: "You did not chase validation.\nYou did not rush exposure.\nYou built something wide, real, and heavy.\nYou preserved credits intelligently.",
  4: "You made something public without waiting for perfection.\nYou allowed reality to touch your work.\nYou returned to cash flow without abandoning the build.\nYou crossed the point of no return.\n\nThis is where builders separate permanently.",
  5: "You flooded the market with your presence.\nYou broke the fear of volume.\nYou learned that outreach is a numbers game.\nYou built a machine that works without you.\n\nThis week separates talkers from doers.",
  6: "You proved you can run two engines.\nNeither collapsed under the weight.\nYou balanced survival with ambition.\nYou maintained momentum across tracks.\n\nThis is where operators emerge.",
  7: "You transformed action into outcomes.\nYou made your first real money.\nYou opened doors to investors.\nYou became a seller, not just a builder.\n\nThis is where revenue unlocks everything."
};

interface WeekOverviewProps {
  week: FloorWeek;
}

export function WeekOverview({ week }: WeekOverviewProps) {
  const title = WEEK_TITLES[week.week_number] || `WEEK ${week.week_number}`;
  const summary = WEEK_SUMMARIES[week.week_number];

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold tracking-tight">
        Week {week.week_number} — {title}
      </h3>
      
      {/* Objective */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Target className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-mono">Objective</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {week.objective}
        </p>
      </div>

      {/* Focus Split */}
      {week.focus_split && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Primary Focus Split</span>
          </div>
          <p className="text-sm text-foreground whitespace-pre-line font-mono">
            {week.focus_split}
          </p>
        </div>
      )}

      {/* Success Condition */}
      {week.success_condition && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Success Condition</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {week.success_condition}
          </p>
        </div>
      )}

      {/* Week Summary (for weeks that have it) */}
      {summary && (
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Week Summary</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line italic">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
