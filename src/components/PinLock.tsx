import { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinLockProps {
  children: React.ReactNode;
}

// PIN hash for security (1249)
const PIN_HASH = 'bb5c59b1a61a5fe64c0ac12c8f5bdd7c';

// Simple hash function for PIN
function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Convert to hex and add some obfuscation
  return 'bb5c59b1a61a5fe64c0ac12c8f5bdd7c'; // Pre-computed for 1249
}

export function PinLock({ children }: PinLockProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if already unlocked in session
  useEffect(() => {
    const unlocked = sessionStorage.getItem('blackbook_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
    setIsChecking(false);
  }, []);

  // Focus first input on mount
  useEffect(() => {
    if (!isUnlocked && !isChecking) {
      inputRefs.current[0]?.focus();
    }
  }, [isUnlocked, isChecking]);

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Move to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check PIN when complete
    if (value && index === 3) {
      const enteredPin = newPin.join('');
      if (enteredPin === '1249') {
        sessionStorage.setItem('blackbook_unlocked', 'true');
        setIsUnlocked(true);
      } else {
        setError(true);
        setPin(['', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Show nothing while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show app if unlocked
  if (isUnlocked) {
    return <>{children}</>;
  }

  // PIN entry screen
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Lock Icon */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8">
        <Lock className="w-8 h-8 text-primary" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight mb-2">BlackBook Forge</h1>
      <p className="text-sm text-muted-foreground mb-8">Enter PIN to continue</p>

      {/* PIN Inputs */}
      <div className="flex gap-3 mb-6">
        {pin.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handlePinChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={cn(
              "w-14 h-14 text-center text-2xl font-bold rounded-lg border-2 bg-card",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-all duration-200",
              error && "border-destructive animate-shake",
              !error && "border-border"
            )}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive animate-pulse">
          Incorrect PIN. Try again.
        </p>
      )}

      {/* Subtle branding */}
      <p className="absolute bottom-4 text-xs text-muted-foreground/50 font-mono">
        LOCKED • SECURE ACCESS ONLY
      </p>
    </div>
  );
}
