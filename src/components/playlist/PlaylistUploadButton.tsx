import { useRef } from 'react';
import { Plus, Loader2, Music } from 'lucide-react';
import { toast } from 'sonner';

interface PlaylistUploadButtonProps {
  isUploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
}

// Audio file size limit in MB
const AUDIO_SIZE_LIMIT = 50;

export function PlaylistUploadButton({ isUploading, onUpload }: PlaylistUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    // Validate it's an audio file
    if (!file.type.startsWith('audio/')) {
      toast.error('Only audio files are allowed');
      return;
    }

    // Validate file size
    const maxSize = AUDIO_SIZE_LIMIT * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Audio file too large. Maximum size is ${AUDIO_SIZE_LIMIT}MB`);
      return;
    }

    const success = await onUpload(file);
    
    if (success) {
      toast.success('Track added to playlist', {
        description: 'This track is now locked in forever.',
        icon: <Music className="w-4 h-4" />,
      });
    } else {
      toast.error('Upload failed');
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            <span className="text-sm text-muted-foreground">Uploading...</span>
          </>
        ) : (
          <>
            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Add Track
            </span>
          </>
        )}
      </button>
    </>
  );
}
