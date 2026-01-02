import { Lock, Image, Music, MessageSquare } from 'lucide-react';

export function VaultPreview() {
  // Placeholder vault items - will be populated later
  const vaultStats = {
    total: 0,
    locked: 0,
    unlocked: 0,
  };

  return (
    <section className="py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          VAULT STATUS
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Locked rewards. Earn access through execution.
        </p>
      </div>

      <div className="execution-card p-6 rounded">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-2">
              <Image className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="data-label">Images</span>
            <p className="font-mono text-foreground">0</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-2">
              <Music className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="data-label">Audio</span>
            <p className="font-mono text-foreground">0</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-2">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="data-label">Messages</span>
            <p className="font-mono text-foreground">0</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 p-4 bg-locked/20 rounded border border-locked/30">
          <Lock className="w-5 h-5 text-locked-foreground" />
          <span className="text-sm text-locked-foreground">
            Upload future assets to begin
          </span>
        </div>
      </div>
    </section>
  );
}
