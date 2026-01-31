import { FloorDay, FloorTimer } from '@/hooks/useFloor';
import { DayTimer } from './DayTimer';
import { AlertTriangle, Unlock, ListChecks, Shield } from 'lucide-react';

interface DayDetailPanelProps {
  day: FloorDay;
  timer: FloorTimer | undefined;
  isCurrentDay: boolean;
}

export function DayDetailPanel({ day, timer, isCurrentDay }: DayDetailPanelProps) {
  return (
    <div className="space-y-6">
      {/* Day Header */}
      <div className="border-b border-border pb-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">
          Day {day.day_number}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{day.title}</h2>
      </div>

      {/* Timer Section */}
      <DayTimer timer={timer} isCurrentDay={isCurrentDay} />

      {/* Intent */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-mono">What This Day Is Actually About</span>
        </div>
        <p className="text-foreground leading-relaxed">
          {day.intent}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ListChecks className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-mono">Actions (Expanded)</span>
        </div>
        <div className="space-y-3">
          {day.actions.map((action, index) => (
            <div 
              key={index} 
              className="bg-muted/30 border border-border rounded-lg p-4"
            >
              <div className="flex gap-3">
                <span className="text-muted-foreground font-mono text-sm shrink-0">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <p className="text-foreground whitespace-pre-line">{action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      {day.rules && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Rules / Constraints</span>
          </div>
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-foreground font-medium">{day.rules}</p>
          </div>
        </div>
      )}

      {/* Unlock Condition */}
      {day.unlock_text && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Unlock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Unlock on Completion</span>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="text-foreground whitespace-pre-line font-mono text-sm">
              {day.unlock_text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
