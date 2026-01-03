import { CheckInSection as SectionType, QuestionAnswer } from '@/lib/checkInSections';
import { Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  section: SectionType;
  answers: Map<string, boolean>;
  onToggle: (questionId: string) => void;
  isLocked: boolean;
}

export function CheckInSection({ section, answers, onToggle, isLocked }: Props) {
  const answeredCount = section.questions.filter(q => answers.has(q.id)).length;
  const completedCount = section.questions.filter(q => answers.get(q.id) === true).length;
  const isComplete = answeredCount === section.questions.length;

  return (
    <div className={cn(
      "border rounded-lg p-4 transition-all",
      isComplete && "border-primary/50 bg-primary/5",
      section.isCritical && "border-destructive/30 bg-destructive/5"
    )}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            Section {section.id}
          </span>
          {section.isCritical && (
            <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Critical
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {completedCount}/{section.questions.length}
          </span>
          {isComplete && (
            <span className="text-xs text-primary font-medium">Complete</span>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>

      {/* Questions */}
      <div className="space-y-3">
        {section.questions.map((question) => {
          const value = answers.get(question.id);
          const hasAnswer = answers.has(question.id);

          // Section I has inverted logic display
          const isClosingHonesty = section.id === 'I';

          return (
            <div
              key={question.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-md transition-all",
                hasAnswer && value === true && !isClosingHonesty && "bg-primary/10",
                hasAnswer && value === false && !isClosingHonesty && "bg-destructive/10",
                hasAnswer && value === false && isClosingHonesty && "bg-primary/10",
                hasAnswer && value === true && isClosingHonesty && "bg-destructive/10",
              )}
            >
              <div className="flex gap-2 shrink-0 mt-0.5">
                <button
                  onClick={() => !isLocked && onToggle(question.id)}
                  disabled={isLocked}
                  className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                    "border-2",
                    isLocked && "opacity-50 cursor-not-allowed",
                    value === true
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  )}
                >
                  {value === true && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    if (!isLocked) {
                      // Set to false explicitly
                      if (value !== false) {
                        onToggle(question.id);
                        if (value === undefined) {
                          onToggle(question.id);
                        }
                      }
                    }
                  }}
                  disabled={isLocked}
                  className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                    "border-2",
                    isLocked && "opacity-50 cursor-not-allowed",
                    value === false
                      ? "bg-destructive border-destructive text-destructive-foreground"
                      : "border-muted-foreground/30 hover:border-destructive/50"
                  )}
                >
                  {value === false && <X className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">
                  {question.text}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isClosingHonesty ? (
                    <>No = +{question.points}pts • Yes = 0pts</>
                  ) : (
                    <>{question.points} pts</>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Progress */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Max points: {section.maxPoints}</span>
          {section.scoringLogic === 'percentage-tier' && (
            <span className="text-amber-500">Tiered scoring</span>
          )}
        </div>
      </div>
    </div>
  );
}
