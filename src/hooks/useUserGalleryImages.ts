import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserGalleryImage {
  id: string;
  url: string;
  createdAt: string;
}

export function useUserGalleryImages(section: 'past' | 'future') {
  const [images, setImages] = useState<UserGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const loadImages = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch user's images for this section from assets table
      const { data: assets, error } = await supabase
        .from('assets')
        .select('id, file_path, created_at')
        .eq('user_id', user.id)
        .eq('category', section)
        .eq('type', 'image')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading gallery images:', error);
        setIsLoading(false);
        return;
      }

      // Convert file paths to public URLs
      const userImages: UserGalleryImage[] = (assets || [])
        .filter(asset => asset.file_path)
        .map(asset => {
          const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(asset.file_path!);
          
          return {
            id: asset.id,
            url: publicUrl,
            createdAt: asset.created_at,
          };
        });

      setImages(userImages);
    } catch (err) {
      console.error('Error in loadImages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [section]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const uploadImage = async (file: File): Promise<boolean> => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

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
          type: 'image',
          file_path: fileName,
          name: `${section}-upload-${Date.now()}`,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        // Cleanup uploaded file on failure
        await supabase.storage.from('assets').remove([fileName]);
        return false;
      }

      // Reload images
      await loadImages();
      return true;
    } catch (err) {
      console.error('Error uploading image:', err);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    images,
    isLoading,
    isUploading,
    uploadImage,
    refresh: loadImages,
  };
}
