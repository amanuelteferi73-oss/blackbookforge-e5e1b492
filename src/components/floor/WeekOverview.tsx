import { FloorWeek } from '@/hooks/useFloor';
import { Target, Layers, CheckCircle } from 'lucide-react';

interface WeekOverviewProps {
  week: FloorWeek;
}

export function WeekOverview({ week }: WeekOverviewProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold tracking-tight">
        Week {week.week_number} — FOUNDATION & PROOF OF MOTION
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
          <p className="text-sm text-foreground leading-relaxed">
            {week.success_condition}
          </p>
        </div>
      )}
    </div>
  );
}
