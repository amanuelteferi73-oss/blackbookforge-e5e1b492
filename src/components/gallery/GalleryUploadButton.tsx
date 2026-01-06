import { useRef, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GalleryUploadButtonProps {
  section: 'reality' | 'vision';
  isUploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
  mediaIndex: number;
}

// Compress and crop image to square aspect ratio
async function processImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Crop to square (center crop)
      const size = Math.min(img.width, img.height);
      const targetSize = Math.min(size, 1024); // Max 1024px
      
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Calculate center crop coordinates
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      ctx.drawImage(img, sx, sy, size, size, 0, 0, targetSize, targetSize);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// File size limits in MB
const SIZE_LIMITS = {
  image: 10,
  audio: 25,
  video: 50,
};

function getMediaType(file: File): 'image' | 'audio' | 'video' | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  return null;
}

export function GalleryUploadButton({ section, isUploading, onUpload, mediaIndex }: GalleryUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    // Validate file type
    const mediaType = getMediaType(file);
    if (!mediaType) {
      toast.error('Please select an image, audio, or video file');
      return;
    }

    // Validate file size based on type
    const maxSize = SIZE_LIMITS[mediaType] * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} too large. Maximum size is ${SIZE_LIMITS[mediaType]}MB`);
      return;
    }

    try {
      setProcessing(true);
      
      // Only process images (compress/crop), pass audio/video as-is
      let fileToUpload = file;
      if (mediaType === 'image') {
        fileToUpload = await processImage(file);
      }
      
      const success = await onUpload(fileToUpload);
      
      if (success) {
        toast.success(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploaded`);
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      console.error('Processing error:', err);
      toast.error('Failed to process file');
    } finally {
      setProcessing(false);
    }
  };

  const isWorking = isUploading || processing;

  return (
    <div className="relative aspect-square overflow-hidden rounded bg-muted/30 border border-dashed border-border group">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,audio/*,video/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isWorking}
      />
      
      <button
        onClick={handleClick}
        disabled={isWorking}
        className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isWorking ? (
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        ) : (
          <Plus className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
        <span className="text-[10px] text-muted-foreground text-center leading-tight group-hover:text-foreground transition-colors">
          {isWorking ? 'Uploading...' : 'Add media'}
        </span>
      </button>

      {/* Number badge matching existing items */}
      <div className="absolute bottom-2 left-2">
        <span className="font-mono text-[10px] text-muted-foreground">
          #{(mediaIndex + 1).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
