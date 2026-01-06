import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MediaType = 'image' | 'audio' | 'video';

export interface UserGalleryMedia {
  id: string;
  url: string;
  type: MediaType;
  createdAt: string;
}

function getMediaTypeFromMime(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  return 'image'; // fallback
}

function getMediaTypeFromPath(filePath: string): MediaType {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const audioExts = ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'];
  const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
  
  if (imageExts.includes(ext)) return 'image';
  if (audioExts.includes(ext)) return 'audio';
  if (videoExts.includes(ext)) return 'video';
  return 'image';
}

export function useUserGalleryMedia(section: 'past' | 'future') {
  const [media, setMedia] = useState<UserGalleryMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const loadMedia = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch user's media for this section from assets table (all types)
      const { data: assets, error } = await supabase
        .from('assets')
        .select('id, file_path, type, created_at')
        .eq('user_id', user.id)
        .eq('category', section)
        .in('type', ['image', 'audio', 'video'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading gallery media:', error);
        setIsLoading(false);
        return;
      }

      // Convert file paths to public URLs
      const userMedia: UserGalleryMedia[] = (assets || [])
        .filter(asset => asset.file_path)
        .map(asset => {
          const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(asset.file_path!);
          
          return {
            id: asset.id,
            url: publicUrl,
            type: asset.type as MediaType,
            createdAt: asset.created_at,
          };
        });

      setMedia(userMedia);
    } catch (err) {
      console.error('Error in loadMedia:', err);
    } finally {
      setIsLoading(false);
    }
  }, [section]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const uploadMedia = async (file: File): Promise<boolean> => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Determine media type from file
      const mediaType = getMediaTypeFromMime(file.type);

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${section}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return false;
      }

      // Create asset record
      const { error: insertError } = await supabase
        .from('assets')
        .insert({
          user_id: user.id,
          category: section,
          type: mediaType,
          file_path: fileName,
          name: `${section}-${mediaType}-${Date.now()}`,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        // Cleanup uploaded file on failure
        await supabase.storage.from('assets').remove([fileName]);
        return false;
      }

      // Reload media
      await loadMedia();
      return true;
    } catch (err) {
      console.error('Error uploading media:', err);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    media,
    isLoading,
    isUploading,
    uploadMedia,
    refresh: loadMedia,
  };
}
