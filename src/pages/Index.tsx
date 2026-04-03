import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTodayKey } from '@/lib/timeEngine';
import { CoreStatement } from '@/components/CoreStatement';
import { StatusPanel } from '@/components/StatusPanel';
import { FutureSelfGallery } from '@/components/FutureSelfGallery';
import { PastSelfGallery } from '@/components/PastSelfGallery';
import { VaultPreview } from '@/components/VaultPreview';
import { LegacyLock } from '@/components/LegacyLock';
import { ActiveFloorTimer } from '@/components/dashboard/ActiveFloorTimer';
import { MyPlaylist } from '@/components/playlist/MyPlaylist';
import { NotificationSettings } from '@/components/NotificationSettings';
import { Button } from '@/components/ui/button';
import { Video, Mic, CheckCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [hasRecording, setHasRecording] = useState(false);

  useEffect(() => {
    const checkRecording = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const todayKey = getTodayKey();
      const { data } = await supabase
        .from('daily_checkins')
        .select('video_path, audio_path')
        .eq('user_id', user.id)
        .eq('date', todayKey)
        .maybeSingle();
      if (data && (data.video_path || data.audio_path)) {
        setHasRecording(true);
      }
    };
    checkRecording();
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0 pt-40 md:pt-24">
      {/* Core Statement */}
      <CoreStatement />

      {/* Active Floor Timer - only shows when timer is running */}
      <ActiveFloorTimer />

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-6 space-y-6">
        {/* Notification Settings */}
        <NotificationSettings />

        {/* Record Today's Reflection */}
        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Video className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Daily Reflection</h3>
          </div>
          {hasRecording ? (
            <Button variant="outline" className="w-full" onClick={() => navigate('/record/today')}>
              <CheckCircle className="h-4 w-4 mr-2 text-primary" />
              ✅ View / Re-record Today's Reflection
            </Button>
          ) : (
            <>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/record/today')}>
                  <Video className="h-4 w-4 mr-2" /> Record Video
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate('/record/today')}>
                  <Mic className="h-4 w-4 mr-2" /> Record Audio
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">📹 You haven't recorded today's reflection yet.</p>
            </>
          )}
        </div>

        {/* Status Panel */}
        <StatusPanel />

        {/* Vision State - Future Self */}
        <FutureSelfGallery />

        {/* My Playlist - After Vision State */}
        <MyPlaylist />

        {/* Reality State - Past Self */}
        <PastSelfGallery />

        {/* Vault Preview */}
        <VaultPreview />

        {/* Legacy Lock */}
        <LegacyLock />
      </div>
    </div>
  );
};

export default Index;
