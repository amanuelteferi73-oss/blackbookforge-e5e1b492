import { PastSelfGallery } from '@/components/PastSelfGallery';
import { AlertTriangle } from 'lucide-react';

export default function RealityPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            REALITY STATE
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            The truth of where you came from. Permanent. Undeletable.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="execution-card p-4 rounded border-destructive/30 bg-destructive/5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">
                These images cannot be deleted
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                They serve as a permanent reminder of the lowest points. 
                Every time you want to quit, look at these.
              </p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <PastSelfGallery />

        {/* Context */}
        <div className="mt-8 p-6 execution-card rounded">
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
            Purpose
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These moments represent the reality you're escaping. The late nights studying with no result. 
            The pain. The uncertainty. The version of yourself that almost gave up. 
            This archive exists so you never forget what you're fighting against.
          </p>
        </div>
      </div>
    </div>
  );
}
