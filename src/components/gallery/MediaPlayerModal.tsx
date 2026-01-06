import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import type { MediaType } from '@/hooks/useUserGalleryMedia';

interface MediaPlayerModalProps {
  url: string;
  type: MediaType;
  onClose: () => void;
}

export function MediaPlayerModal({ url, type, onClose }: MediaPlayerModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-foreground" />
      </button>

      {/* Media content */}
      <div className="max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
        {type === 'image' && (
          <img
            src={url}
            alt="Full size view"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        )}

        {type === 'audio' && (
          <div className="w-full max-w-md bg-muted rounded-lg p-8 flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <audio
              src={url}
              controls
              autoPlay
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {type === 'video' && (
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[85vh] rounded-lg"
          >
            Your browser does not support the video element.
          </video>
        )}
      </div>
    </div>
  );
}
