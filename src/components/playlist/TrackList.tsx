import { useState } from 'react';
import { Music, Lock, Play, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { PlaylistTrack } from '@/hooks/usePlaylist';

interface TrackListProps {
  tracks: PlaylistTrack[];
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
}

export function TrackList({ tracks, currentTrackIndex, onTrackSelect }: TrackListProps) {
  const [expandedLyrics, setExpandedLyrics] = useState<string | null>(null);

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No tracks yet</p>
        <p className="text-xs mt-1">Upload your first track to get started</p>
      </div>
    );
  }

  const toggleLyrics = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLyrics(prev => prev === trackId ? null : trackId);
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {tracks.map((track, index) => (
        <div key={track.id} className="space-y-0">
          <div
            onClick={() => onTrackSelect(index)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all group cursor-pointer ${
              index === currentTrackIndex
                ? 'bg-primary/20 border border-primary/30'
                : 'bg-muted/30 border border-transparent hover:bg-muted/50 hover:border-border'
            } ${expandedLyrics === track.id ? 'rounded-b-none border-b-0' : ''}`}
          >
            {/* Track Number / Play Icon */}
            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
              index === currentTrackIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-foreground'
            }`}>
              {index === currentTrackIndex ? (
                <Play className="w-4 h-4" />
              ) : (
                <span className="font-mono text-xs">{(index + 1).toString().padStart(2, '0')}</span>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0 text-left">
              <h5 className={`text-sm font-medium truncate ${
                index === currentTrackIndex ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
              }`}>
                {track.name}
              </h5>
            </div>

            {/* Lyrics Button */}
            {track.lyrics && (
              <button
                onClick={(e) => toggleLyrics(track.id, e)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                  expandedLyrics === track.id
                    ? 'bg-primary/30 text-primary'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Lyrics</span>
                {expandedLyrics === track.id ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Locked Indicator */}
            <div className="flex-shrink-0">
              <Lock className="w-3 h-3 text-muted-foreground/50" />
            </div>
          </div>

          {/* Lyrics Dropdown */}
          {track.lyrics && (
            <Collapsible open={expandedLyrics === track.id}>
              <CollapsibleContent>
                <div className={`p-4 rounded-b-lg border border-t-0 ${
                  index === currentTrackIndex
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-muted/20 border-border'
                }`}>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Lyrics
                    </span>
                    <Lock className="w-3 h-3 text-muted-foreground/50 ml-auto" />
                  </div>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                    {track.lyrics}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      ))}
    </div>
  );
}
