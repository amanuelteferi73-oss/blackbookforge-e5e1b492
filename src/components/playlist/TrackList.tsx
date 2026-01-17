import { Music, Lock, Play } from 'lucide-react';
import type { PlaylistTrack } from '@/hooks/usePlaylist';

interface TrackListProps {
  tracks: PlaylistTrack[];
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
}

export function TrackList({ tracks, currentTrackIndex, onTrackSelect }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No tracks yet</p>
        <p className="text-xs mt-1">Upload your first track to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto">
      {tracks.map((track, index) => (
        <button
          key={track.id}
          onClick={() => onTrackSelect(index)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all group ${
            index === currentTrackIndex
              ? 'bg-primary/20 border border-primary/30'
              : 'bg-muted/30 border border-transparent hover:bg-muted/50 hover:border-border'
          }`}
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

          {/* Locked Indicator */}
          <div className="flex-shrink-0">
            <Lock className="w-3 h-3 text-muted-foreground/50" />
          </div>
        </button>
      ))}
    </div>
  );
}
