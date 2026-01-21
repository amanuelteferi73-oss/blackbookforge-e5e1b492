import { useRef, useState } from 'react';
import { Plus, Loader2, Music, FileText, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PlaylistUploadButtonProps {
  isUploading: boolean;
  onUpload: (file: File, lyrics?: string) => Promise<boolean>;
}

// Audio file size limit in MB
const AUDIO_SIZE_LIMIT = 50;

export function PlaylistUploadButton({ isUploading, onUpload }: PlaylistUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

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

    // Show the upload form with lyrics input
    setSelectedFile(file);
    setShowUploadForm(true);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const success = await onUpload(selectedFile, lyrics);
    
    if (success) {
      toast.success('Track added to playlist', {
        description: lyrics ? 'Track with lyrics locked in forever.' : 'This track is now locked in forever.',
        icon: <Music className="w-4 h-4" />,
      });
      // Reset form
      setSelectedFile(null);
      setLyrics('');
      setShowUploadForm(false);
    } else {
      toast.error('Upload failed');
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setLyrics('');
    setShowUploadForm(false);
  };

  if (showUploadForm && selectedFile) {
    return (
      <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">{selectedFile.name}</span>
          </div>
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Lyrics Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm text-muted-foreground">
              Paste Lyrics (optional - locked forever once saved)
            </label>
          </div>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Paste your lyrics here...&#10;&#10;Verse 1:&#10;Your lyrics go here..."
            className="w-full h-40 p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-sm"
            disabled={isUploading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload & Lock</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          ⚠️ Once uploaded, this track and lyrics cannot be edited or deleted
        </p>
      </div>
    );
  }

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
