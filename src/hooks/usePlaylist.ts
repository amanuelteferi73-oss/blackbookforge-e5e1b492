import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlaylistTrack {
  id: string;
  url: string;
  name: string;
  lyrics: string | null;
  createdAt: string;
}

export function usePlaylist() {
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const loadTracks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch user's playlist tracks from assets table
      const { data: assets, error } = await supabase
        .from('assets')
        .select('id, file_path, name, content, created_at')
        .eq('user_id', user.id)
        .eq('category', 'dream')
        .eq('type', 'audio')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading playlist:', error);
        setIsLoading(false);
        return;
      }

      // Convert file paths to public URLs
      const playlistTracks: PlaylistTrack[] = (assets || [])
        .filter(asset => asset.file_path)
        .map(asset => {
          const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(asset.file_path!);
          
          return {
            id: asset.id,
            url: publicUrl,
            name: asset.name || 'Untitled Track',
            lyrics: asset.content || null,
            createdAt: asset.created_at,
          };
        });

      setTracks(playlistTracks);
    } catch (err) {
      console.error('Error in loadTracks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const uploadTrack = async (file: File, lyrics?: string): Promise<boolean> => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get original filename without extension for display name
      const originalName = file.name.replace(/\.[^/.]+$/, '');

      // Create unique file path preserving original extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/playlist/${Date.now()}.${fileExt}`;

      // Upload to storage at full quality (no processing)
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, file, {
          cacheControl: '31536000', // 1 year cache for audio
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return false;
      }

      // Create asset record with original name and lyrics
      const { error: insertError } = await supabase
        .from('assets')
        .insert({
          user_id: user.id,
          category: 'dream',
          type: 'audio',
          file_path: fileName,
          name: originalName,
          content: lyrics?.trim() || null, // Store lyrics in content field
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        // Cleanup uploaded file on failure
        await supabase.storage.from('assets').remove([fileName]);
        return false;
      }

      // Reload tracks
      await loadTracks();
      return true;
    } catch (err) {
      console.error('Error uploading track:', err);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    tracks,
    isLoading,
    isUploading,
    uploadTrack,
    refresh: loadTracks,
  };
}
