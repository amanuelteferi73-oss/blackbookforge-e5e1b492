// Offline sync engine - syncs pending check-ins and media when online
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  getPendingCheckIns,
  markCheckInSynced,
  getPendingMedia,
  markMediaSynced,
} from '@/lib/offlineDb';
import { toast } from '@/hooks/use-toast';

export function useOfflineSync(userId: string | null) {
  const isSyncing = useRef(false);

  const syncPendingCheckIns = useCallback(async () => {
    if (!userId) return;
    const pending = await getPendingCheckIns();
    if (pending.length === 0) return;

    console.log(`[OFFLINE-SYNC] Syncing ${pending.length} pending check-ins`);

    for (const item of pending) {
      try {
        // Insert check-in
        const insertPayload = {
          ...item.payload,
          user_id: userId,
        } as any;
        const { data: checkIn, error: checkInError } = await supabase
          .from('daily_checkins')
          .insert(insertPayload)
          .select()
          .single();

        if (checkInError) {
          // If duplicate date, mark as synced (already exists)
          if (checkInError.code === '23505') {
            await markCheckInSynced(item.id);
            continue;
          }
          throw checkInError;
        }

        // Insert failed items
        if (item.failedItems.length > 0 && checkIn) {
          await supabase.from('failed_items').insert(
            item.failedItems.map((fi: any) => ({
              ...fi,
              daily_checkin_id: checkIn.id,
            }))
          );
        }

        await markCheckInSynced(item.id);
        console.log(`[OFFLINE-SYNC] Check-in ${item.date} synced`);
      } catch (err) {
        console.error(`[OFFLINE-SYNC] Failed to sync check-in ${item.date}:`, err);
      }
    }
  }, [userId]);

  const syncPendingMedia = useCallback(async () => {
    if (!userId) return;
    const pending = await getPendingMedia();
    if (pending.length === 0) return;

    console.log(`[OFFLINE-SYNC] Syncing ${pending.length} pending media files`);

    for (const item of pending) {
      try {
        // Upload blob to storage
        const { error: uploadError } = await supabase.storage
          .from('checkin-media')
          .upload(item.filePath, item.blob, {
            upsert: true,
            contentType: item.type === 'video' ? 'video/webm' : 'audio/webm',
          });

        if (uploadError) throw uploadError;

        // Update the check-in record with media path
        const updateData = item.type === 'video'
          ? { video_path: item.filePath }
          : { audio_path: item.filePath };

        await supabase
          .from('daily_checkins')
          .update(updateData)
          .eq('user_id', userId)
          .eq('date', item.date);

        await markMediaSynced(item.id);
        console.log(`[OFFLINE-SYNC] Media ${item.filePath} synced`);
      } catch (err) {
        console.error(`[OFFLINE-SYNC] Failed to sync media ${item.filePath}:`, err);
      }
    }
  }, [userId]);

  const syncAll = useCallback(async () => {
    if (!navigator.onLine || isSyncing.current || !userId) return;
    isSyncing.current = true;

    try {
      await syncPendingCheckIns();
      await syncPendingMedia();

      // Check if anything was synced
      const remainingCheckins = await getPendingCheckIns();
      const remainingMedia = await getPendingMedia();
      
      if (remainingCheckins.length === 0 && remainingMedia.length === 0) {
        // All synced - no notification needed unless we just synced something
      }
    } catch (err) {
      console.error('[OFFLINE-SYNC] Sync error:', err);
    } finally {
      isSyncing.current = false;
    }
  }, [userId, syncPendingCheckIns, syncPendingMedia]);

  useEffect(() => {
    if (!userId) return;

    // Sync on mount if online
    if (navigator.onLine) syncAll();

    // Sync when coming back online
    const handleOnline = () => {
      toast({ title: '🌐 Back online', description: 'Syncing offline data...' });
      setTimeout(syncAll, 1000);
    };

    window.addEventListener('online', handleOnline);

    // Periodic sync every 30 seconds when online
    const interval = setInterval(() => {
      if (navigator.onLine) syncAll();
    }, 30_000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, [userId, syncAll]);

  return { syncAll };
}
