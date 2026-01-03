import { AlertTriangle, Skull } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PunishmentDisplayProps {
  punishment: string;
  score: number;
  failedQuestions: string[];
  date: string;
}

export function PunishmentDisplay({ 
  punishment, 
  score, 
  failedQuestions,
  date 
}: PunishmentDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Red flag header */}
      <div className="flex items-center justify-center gap-3 text-destructive">
        <Skull className="w-6 h-6" />
        <span className="font-mono text-sm uppercase tracking-widest">
          🔴 RED DAY — {date}
        </span>
        <Skull className="w-6 h-6" />
      </div>

      {/* Score display */}
      <div className="text-center">
        <p className="text-6xl font-mono font-bold text-destructive">{score}</p>
        <p className="text-sm text-muted-foreground mt-1">Final Score</p>
      </div>

      {/* Punishment card */}
      <Card className="border-destructive border-2 bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
          <div className="space-y-3">
            <h3 className="font-mono font-bold text-destructive uppercase tracking-wide">
              Your Punishment
            </h3>
            <p className="text-foreground leading-relaxed">
              {punishment}
            </p>
          </div>
        </div>
      </Card>

      {/* Failed questions */}
      {failedQuestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-mono text-sm text-muted-foreground uppercase tracking-wide">
            You Failed These Items:
          </h4>
          <ul className="space-y-2">
            {failedQuestions.map((q, i) => (
              <li 
                key={i}
                className="flex items-start gap-2 text-sm text-destructive/80"
              >
                <span className="text-destructive">✗</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Permanent reminder */}
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground text-center font-mono">
          This punishment is now attached to today forever.
        </p>
      </div>
    </div>
  );
}
