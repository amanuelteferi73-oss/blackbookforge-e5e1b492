import { FocusPillar, FOCUS_PILLAR_OPTIONS } from '@/lib/checkInSections';
import { cn } from '@/lib/utils';
import { Briefcase, Rocket, GraduationCap, Check } from 'lucide-react';

interface Props {
  value: FocusPillar;
  onChange: (pillar: FocusPillar) => void;
  isLocked: boolean;
}

const PILLAR_ICONS = {
  startup: Rocket,
  cash: Briefcase,
  school: GraduationCap,
};

export function FocusPillarSelector({ value, onChange, isLocked }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      {/* Header */}
      <div className="mb-4">
        <span className="text-xs font-mono text-muted-foreground">Section X</span>
        <h3 className="font-semibold text-foreground mt-1">Daily Focus Declaration</h3>
        <p className="text-sm text-muted-foreground mt-1">
          What was your primary focus today?
        </p>
      </div>

      {/* Pillar Options */}
      <div className="space-y-2">
        {FOCUS_PILLAR_OPTIONS.map((option) => {
          const Icon = PILLAR_ICONS[option.value];
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              onClick={() => !isLocked && onChange(option.value)}
              disabled={isLocked}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-md border transition-all text-left",
                isSelected && "border-primary bg-primary/10",
                !isSelected && !isLocked && "border-border hover:border-primary/50 hover:bg-muted/50",
                isLocked && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              {isSelected && (
                <Check className="h-5 w-5 text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selection Note */}
      {value && !isLocked && (
        <p className="mt-3 text-xs text-muted-foreground text-center">
          This selection controls which execution section you'll complete
        </p>
      )}
      {isLocked && value && (
        <p className="mt-3 text-xs text-amber-500 text-center">
          Pillar locked after submission
        </p>
      )}
    </div>
  );
}
