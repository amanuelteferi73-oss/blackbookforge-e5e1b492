import { FloorAction } from '@/hooks/useTodayFloorActions';
import { cn } from '@/lib/utils';
import { Check, X, Layers, Loader2 } from 'lucide-react';

interface Props {
  dayNumber: number;
  dayTitle: string;
  intent: string;
  actions: FloorAction[];
  answers: Map<string, boolean>;
  onToggle: (questionId: string) => void;
  isLocked: boolean;
  isLoading?: boolean;
}

export function FloorPillarSection({
  dayNumber,
  dayTitle,
  intent,
  actions,
  answers,
  onToggle,
  isLocked,
  isLoading,
}: Props) {
  // Calculate section stats
  const totalPoints = actions.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = actions.reduce((sum, a) => {
    const answer = answers.get(a.id);
    return sum + (answer === true ? a.points : 0);
  }, 0);
  const answeredCount = actions.filter(a => answers.has(a.id)).length;

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading Floor actions...</span>
        </div>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Layers className="h-5 w-5" />
          <span className="text-sm">No Floor actions for Day {dayNumber}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">Section FL</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {earnedPoints}/{totalPoints} pts
          </span>
        </div>
        <h3 className="font-semibold text-foreground mt-1">
          The Floor — Day {dayNumber}
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">{dayTitle}</p>
        {intent && (
          <p className="text-xs text-muted-foreground/80 mt-2 italic">
            Intent: {intent}
          </p>
        )}
      </div>

      {/* Actions as Questions */}
      <div className="divide-y">
        {actions.map((action) => {
          const answer = answers.get(action.id);
          const hasAnswer = answer !== undefined;

          return (
            <div
              key={action.id}
              className={cn(
                "p-4 transition-colors",
                answer === true && "bg-primary/5",
                answer === false && "bg-destructive/5"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Toggle Buttons */}
                <div className="flex gap-1 shrink-0 mt-0.5">
                  <button
                    onClick={() => !isLocked && onToggle(action.id)}
                    disabled={isLocked}
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                      answer === true 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80",
                      isLocked && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => !isLocked && onToggle(action.id)}
                    disabled={isLocked}
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                      answer === false 
                        ? "bg-destructive text-destructive-foreground" 
                        : "bg-muted hover:bg-muted/80",
                      isLocked && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Action Text */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm",
                    hasAnswer ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {action.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{action.points} pts
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 bg-muted/20 border-t text-xs text-muted-foreground">
        <span>{answeredCount}/{actions.length} actions answered</span>
      </div>
    </div>
  );
}
