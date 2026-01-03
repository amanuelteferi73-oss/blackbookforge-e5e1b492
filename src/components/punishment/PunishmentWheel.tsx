import { useState, useEffect, useCallback } from 'react';
import { PUNISHMENTS, selectRandomPunishment } from '@/lib/punishments';
import { AlertTriangle } from 'lucide-react';

interface PunishmentWheelProps {
  onPunishmentSelected: (index: number, text: string) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export function PunishmentWheel({ 
  onPunishmentSelected, 
  isSpinning, 
  setIsSpinning 
}: PunishmentWheelProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [finalPunishment, setFinalPunishment] = useState<{ index: number; text: string } | null>(null);
  const [spinPhase, setSpinPhase] = useState<'idle' | 'fast' | 'slowing' | 'stopped'>('idle');

  const startSpin = useCallback(() => {
    if (isSpinning || finalPunishment) return;
    
    setIsSpinning(true);
    setSpinPhase('fast');
    
    // Select the final punishment immediately (but don't reveal)
    const selected = selectRandomPunishment();
    
    // Fast phase - 2 seconds
    let count = 0;
    const fastInterval = setInterval(() => {
      setDisplayIndex(Math.floor(Math.random() * PUNISHMENTS.length));
      count++;
    }, 50);
    
    setTimeout(() => {
      clearInterval(fastInterval);
      setSpinPhase('slowing');
      
      // Slowing phase - 2 seconds
      let slowCount = 0;
      const delays = [100, 150, 200, 300, 400, 500, 700, 900];
      
      const slowTick = () => {
        if (slowCount >= delays.length) {
          setSpinPhase('stopped');
          setFinalPunishment(selected);
          setDisplayIndex(selected.index);
          setIsSpinning(false);
          onPunishmentSelected(selected.index, selected.text);
          return;
        }
        
        setDisplayIndex(Math.floor(Math.random() * PUNISHMENTS.length));
        slowCount++;
        setTimeout(slowTick, delays[slowCount - 1]);
      };
      
      slowTick();
    }, 2000);
  }, [isSpinning, finalPunishment, onPunishmentSelected, setIsSpinning]);

  // Auto-start spin on mount
  useEffect(() => {
    const timer = setTimeout(startSpin, 500);
    return () => clearTimeout(timer);
  }, [startSpin]);

  const currentText = finalPunishment?.text || PUNISHMENTS[displayIndex] || '';

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      {/* Header */}
      <div className="flex items-center gap-3 text-destructive">
        <AlertTriangle className="w-8 h-8 animate-pulse" />
        <h2 className="text-2xl font-mono font-bold uppercase tracking-wider">
          Punishment Selection
        </h2>
        <AlertTriangle className="w-8 h-8 animate-pulse" />
      </div>

      {/* Wheel Container */}
      <div className="relative w-full max-w-lg">
        {/* Spinning indicator lights */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-100 ${
                isSpinning 
                  ? i % 2 === (Math.floor(Date.now() / 100) % 2) 
                    ? 'bg-destructive' 
                    : 'bg-destructive/30'
                  : finalPunishment 
                    ? 'bg-destructive' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Main display */}
        <div 
          className={`
            relative overflow-hidden rounded-lg border-4 
            ${finalPunishment ? 'border-destructive' : 'border-border'}
            bg-card p-6 min-h-[200px] flex items-center justify-center
            transition-all duration-300
            ${isSpinning ? 'shadow-[0_0_30px_rgba(239,68,68,0.5)]' : ''}
          `}
        >
          {/* Slot machine effect - rapid text changes */}
          <div className={`
            text-center transition-all duration-100
            ${isSpinning ? 'blur-[1px]' : ''}
          `}>
            <p className={`
              text-lg font-medium leading-relaxed
              ${finalPunishment ? 'text-destructive' : 'text-foreground'}
            `}>
              {currentText}
            </p>
          </div>

          {/* Flash overlay during spin */}
          {isSpinning && (
            <div className="absolute inset-0 bg-destructive/5 animate-pulse" />
          )}
        </div>

        {/* Bottom indicator */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-100 ${
                isSpinning 
                  ? i % 2 !== (Math.floor(Date.now() / 100) % 2) 
                    ? 'bg-destructive' 
                    : 'bg-destructive/30'
                  : finalPunishment 
                    ? 'bg-destructive' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        {spinPhase === 'fast' && (
          <p className="text-muted-foreground animate-pulse font-mono">
            SELECTING PUNISHMENT...
          </p>
        )}
        {spinPhase === 'slowing' && (
          <p className="text-destructive animate-pulse font-mono">
            LOCKING IN...
          </p>
        )}
        {spinPhase === 'stopped' && finalPunishment && (
          <p className="text-destructive font-mono font-bold">
            PUNISHMENT ASSIGNED
          </p>
        )}
      </div>
    </div>
  );
}
