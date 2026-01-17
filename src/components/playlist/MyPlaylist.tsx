import { useState } from 'react';
import { Music2, Disc3, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePlaylist } from '@/hooks/usePlaylist';
import { PlaylistPlayer } from './PlaylistPlayer';
import { TrackList } from './TrackList';
import { PlaylistUploadButton } from './PlaylistUploadButton';

export function MyPlaylist() {
  const { tracks, isLoading, isUploading, uploadTrack } = usePlaylist();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  return (
    <section className="py-8 border-t border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Header */}
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              {/* Animated Disc Icon */}
              <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 flex items-center justify-center border border-border shadow-lg ${isOpen ? 'animate-spin-slow' : ''}`}>
                <Disc3 className="w-6 h-6 text-primary" />
                <div className="absolute inset-1 rounded-full border border-primary/20" />
              </div>

              <div className="text-left">
                <h2 className="text-lg font-semibold text-foreground tracking-tight uppercase flex items-center gap-2">
                  My Playlist
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </h2>
                <p className="text-xs text-muted-foreground">
                  {tracks.length === 0 
                    ? 'Your personal soundtrack for execution' 
                    : `${tracks.length} track${tracks.length === 1 ? '' : 's'} • Locked forever`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Track Count Badge */}
              {tracks.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-mono">
                  {tracks.length}
                </span>
              )}
              
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Content */}
        <CollapsibleContent className="mt-6">
          <div className="rounded-xl border border-border bg-gradient-to-b from-card to-background overflow-hidden">
            {/* Spotify-like Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent">
              <div className="flex items-end gap-4">
                {/* Large Playlist Art */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-gradient-to-br from-primary/40 via-accent/30 to-primary/20 flex items-center justify-center shadow-2xl border border-border">
                  <Music2 className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>

                <div className="flex-1 min-w-0 pb-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Playlist</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mt-1 truncate">
                    My Execution Tracks
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tracks.length} track{tracks.length === 1 ? '' : 's'} • Full quality • No backing out
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-4 md:p-6 space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Disc3 className="w-8 h-8 text-muted-foreground animate-spin" />
                </div>
              ) : (
                <>
                  {/* Player */}
                  {tracks.length > 0 && (
                    <PlaylistPlayer
                      tracks={tracks}
                      currentTrackIndex={currentTrackIndex}
                      onTrackChange={setCurrentTrackIndex}
                    />
                  )}

                  {/* Track List */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                      Tracks
                    </h4>
                    <TrackList
                      tracks={tracks}
                      currentTrackIndex={currentTrackIndex}
                      onTrackSelect={setCurrentTrackIndex}
                    />
                  </div>

                  {/* Upload Button */}
                  <PlaylistUploadButton
                    isUploading={isUploading}
                    onUpload={uploadTrack}
                  />

                  {/* Locked Notice */}
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                    <Lock className="w-3 h-3" />
                    <span>Once uploaded, tracks cannot be deleted or edited</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Add spinning animation */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </section>
  );
}
