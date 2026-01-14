import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const DAILY_MANTRAS = [
  {
    title: "Pinpoint a Buyer in Real Pain",
    description: "Stop focusing on generic targets. Identify the specific '3 a.m. search' that keeps your audience awake."
  },
  {
    title: "Lived Experience is Credibility",
    description: "The most effective problems to solve are the ones you've personally overcome. Your past pain is your authority."
  },
  {
    title: "The P.S.L. Content Framework",
    description: "Point (lead with pain in 7 words), Story (20-second anecdote), Lesson (one action they can take today)."
  },
  {
    title: "Quality Over Follower Count",
    description: "A small, engaged audience generates more than a large, passive one. Prioritize depth over breadth."
  },
  {
    title: "Research Pre-validated Ideas",
    description: "Study high-performing content from successful creators. Find concepts already proven to resonate."
  },
  {
    title: "Convert via O-Q-C in DMs",
    description: "Open (ask about their pain), Qualify (timeline & budget), Close (direct payment link once intent is clear)."
  },
  {
    title: "Diagnostic Selling",
    description: "Approach sales like a doctor. Diagnose the specific pain rather than just entertaining the customer."
  },
  {
    title: "The One-Message Offer",
    description: "Streamline your pitch: Problem → Promise → Process → Price → Proof. All in one message."
  },
  {
    title: "Systems Over Hustle",
    description: "Avoid burnout by batching creation and using saved replies. High-leverage outputs over just 'putting in hours'."
  }
];

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

      {/* Daily Mantras Dropdown */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative mt-6">
        <CollapsibleTrigger className="flex items-center justify-center gap-2 mx-auto text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <span>Daily Mantras</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <div className="max-w-2xl mx-auto text-left space-y-3">
            {DAILY_MANTRAS.map((mantra, index) => (
              <div 
                key={index} 
                className="p-3 rounded border border-border/50 bg-background/50 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-mono flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{mantra.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{mantra.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
