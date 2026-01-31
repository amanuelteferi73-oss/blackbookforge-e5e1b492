import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DISCIPLINE_RULES } from '@/lib/disciplineRules';

export function CoreStatement() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative py-12 px-6 text-center border-y border-border bg-card/50">
      <div className="absolute inset-0 scanlines opacity-50" />
      <blockquote className="relative">
        <p className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
          "We're going to die — or we're going to make it work."
        </p>
      </blockquote>

      {/* Discipline Rules Dropdown */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative mt-6">
        <CollapsibleTrigger className="flex items-center justify-center gap-2 mx-auto text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <span>37 Discipline Rules</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <div className="max-w-2xl mx-auto text-left space-y-2">
            {DISCIPLINE_RULES.map((rule) => (
              <div 
                key={rule.id} 
                className="p-3 rounded border border-border/50 bg-background/50 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-mono flex items-center justify-center">
                    {rule.id}
                  </span>
                  <p className="text-sm text-foreground">{rule.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
