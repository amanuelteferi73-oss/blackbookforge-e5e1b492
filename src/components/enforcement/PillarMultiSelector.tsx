import { cn } from '@/lib/utils';
import { Briefcase, Rocket, GraduationCap, Layers, Check } from 'lucide-react';

export type PillarType = 'school' | 'startup' | 'cash' | 'floor';

interface PillarOption {
  value: PillarType;
  label: string;
  description: string;
  icon: typeof Rocket;
}

const PILLAR_OPTIONS: PillarOption[] = [
  { 
    value: 'school', 
    label: 'School', 
    description: 'Classes, study, academic work',
    icon: GraduationCap,
  },
  { 
    value: 'startup', 
    label: 'Startup', 
    description: 'Building, shipping, iterating',
    icon: Rocket,
  },
  { 
    value: 'cash', 
    label: 'Cash Day', 
    description: 'Revenue, sales, outreach',
    icon: Briefcase,
  },
  { 
    value: 'floor', 
    label: 'The Floor', 
    description: 'Daily actions from The Floor system',
    icon: Layers,
  },
];

interface Props {
  selectedPillars: PillarType[];
  onToggle: (pillar: PillarType) => void;
  isLocked: boolean;
  floorDayInfo?: {
    dayNumber: number;
    dayTitle: string;
    hasActions: boolean;
  };
  maxPillars?: number;
}

export function PillarMultiSelector({ 
  selectedPillars, 
  onToggle, 
  isLocked,
  floorDayInfo,
  maxPillars = 2,
}: Props) {
  const canSelectMore = selectedPillars.length < maxPillars;

  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      {/* Header */}
      <div className="mb-4">
        <span className="text-xs font-mono text-muted-foreground">Section X</span>
        <h3 className="font-semibold text-foreground mt-1">Today's Focus Pillars</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select 1-{maxPillars} pillars that define today's work
        </p>
      </div>

      {/* Pillar Options */}
      <div className="grid grid-cols-2 gap-2">
        {PILLAR_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedPillars.includes(option.value);
          const isDisabled = isLocked || (!isSelected && !canSelectMore);
          
          // Special handling for Floor pillar
          const isFloorPillar = option.value === 'floor';
          const floorHasNoActions = isFloorPillar && floorDayInfo && !floorDayInfo.hasActions;

          return (
            <button
              key={option.value}
              onClick={() => !isDisabled && !floorHasNoActions && onToggle(option.value)}
              disabled={isDisabled || floorHasNoActions}
              className={cn(
                "relative flex flex-col items-center gap-2 p-3 rounded-md border transition-all text-center",
                isSelected && "border-primary bg-primary/10 ring-1 ring-primary",
                !isSelected && !isDisabled && !floorHasNoActions && "border-border hover:border-primary/50 hover:bg-muted/50",
                (isDisabled || floorHasNoActions) && "opacity-40 cursor-not-allowed"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div>
                <p className="font-medium text-sm text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {isFloorPillar && floorDayInfo?.dayTitle 
                    ? `Day ${floorDayInfo.dayNumber}: ${floorDayInfo.dayTitle}`
                    : option.description
                  }
                </p>
                {floorHasNoActions && (
                  <p className="text-xs text-amber-500 mt-1">No actions today</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {selectedPillars.length} of {maxPillars} selected
        </span>
        {selectedPillars.length === 0 && !isLocked && (
          <span className="text-amber-500">Select at least 1 pillar</span>
        )}
      </div>

      {isLocked && selectedPillars.length > 0 && (
        <p className="mt-2 text-xs text-amber-500 text-center">
          Pillars locked after submission
        </p>
      )}
    </div>
  );
}

export { PILLAR_OPTIONS };
