import { useState } from 'react';
import { Lock, Upload, Image, Music, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LegacyLock } from '@/components/LegacyLock';

const CATEGORIES = [
  { id: 'future', label: 'Future Self', icon: Image },
  { id: 'dream', label: 'Dream Life', icon: Image },
  { id: 'reward', label: 'Rewards', icon: Music },
];

export default function VaultPage() {
  const [activeCategory, setActiveCategory] = useState('future');

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            ASSET VAULT
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your future. Locked until earned.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm whitespace-nowrap transition-colors ${
                activeCategory === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div className="execution-card p-12 rounded text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-locked/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-locked-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Assets Yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Upload images of your future self, dream life, and rewards. 
            They will be locked until you earn access through consistent execution.
          </p>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Upload Assets
          </Button>
        </div>

        {/* Legacy Lock Section */}
        <div className="mt-8">
          <LegacyLock />
        </div>
      </div>
    </div>
  );
}
