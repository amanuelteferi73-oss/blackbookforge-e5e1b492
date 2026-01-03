import { useRef, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GalleryUploadButtonProps {
  section: 'reality' | 'vision';
  isUploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
  imageIndex: number;
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

export function GalleryUploadButton({ section, isUploading, onUpload, imageIndex }: GalleryUploadButtonProps) {
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
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 10MB');
      return;
    }

    try {
      setProcessing(true);
      const processedFile = await processImage(file);
      const success = await onUpload(processedFile);
      
      if (success) {
        toast.success('Image uploaded');
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      console.error('Processing error:', err);
      toast.error('Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  const isWorking = isUploading || processing;
  const label = section === 'reality' 
    ? 'Upload your reality image' 
    : 'Upload your vision image';

  return (
    <div className="relative aspect-square overflow-hidden rounded bg-muted/30 border border-dashed border-border group">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
          {isWorking ? 'Uploading...' : label}
        </span>
      </button>

      {/* Number badge matching existing images */}
      <div className="absolute bottom-2 left-2">
        <span className="font-mono text-[10px] text-muted-foreground">
          #{(imageIndex + 1).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
