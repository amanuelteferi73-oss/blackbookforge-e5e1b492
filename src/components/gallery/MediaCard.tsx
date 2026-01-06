import { Play, Music } from 'lucide-react';
import type { MediaType } from '@/hooks/useUserGalleryMedia';

interface MediaCardProps {
  url: string;
  type: MediaType;
  index: number;
  onClick: () => void;
  variant?: 'past' | 'future';
}

export function MediaCard({ url, type, index, onClick, variant = 'past' }: MediaCardProps) {
  const isPast = variant === 'past';
  
  return (
    <div 
      className="relative aspect-square overflow-hidden rounded bg-muted border border-border group cursor-pointer"
      onClick={onClick}
    >
      {type === 'image' && (
        <img
          src={url}
          alt={`Media ${index + 1}`}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isPast 
              ? 'grayscale-[30%] group-hover:grayscale-0' 
              : 'group-hover:scale-105'
          }`}
        />
      )}

      {type === 'audio' && (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center group-hover:bg-primary/40 transition-colors">
            <Music className="w-6 h-6 text-primary" />
          </div>
          {/* Waveform decoration */}
          <div className="absolute bottom-8 left-4 right-4 flex items-end justify-center gap-[2px] h-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary/40 rounded-full"
                style={{
                  height: `${Math.random() * 100}%`,
                  minHeight: '4px',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {type === 'video' && (
        <>
          <video
            src={url}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isPast 
                ? 'grayscale-[30%] group-hover:grayscale-0' 
                : 'group-hover:scale-105'
            }`}
            muted
            preload="metadata"
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center group-hover:bg-background/90 transition-colors">
              <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
            </div>
          </div>
        </>
      )}

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${
        isPast 
          ? 'from-background/80 to-transparent opacity-60' 
          : 'from-background/90 via-background/20 to-transparent opacity-70'
      }`} />
      
      {/* Number badge */}
      <div className="absolute bottom-2 left-2">
        <span className="font-mono text-[10px] text-muted-foreground">
          #{(index + 1).toString().padStart(2, '0')}
        </span>
      </div>

      {/* Media type indicator */}
      {type !== 'image' && (
        <div className="absolute top-2 left-2">
          <span className="font-mono text-[9px] text-primary/80 uppercase tracking-wider bg-background/50 px-1 rounded">
            {type}
          </span>
        </div>
      )}

      {/* Future "soon" indicator */}
      {!isPast && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="font-mono text-[9px] text-primary/80 uppercase tracking-wider">
            soon
          </span>
        </div>
      )}
    </div>
  );
}
