import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Upload, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Props {
  userId: string;
  checkInId: string | null;
  date: string;
  existingAudioPath?: string | null;
  existingVideoPath?: string | null;
  onMediaSaved?: (type: 'audio' | 'video', path: string) => void;
}

export function CheckInMediaRecorder({ userId, checkInId, date, existingAudioPath, existingVideoPath, onMediaSaved }: Props) {
  // Audio state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioSaved, setAudioSaved] = useState(!!existingAudioPath);
  const [audioUploading, setAudioUploading] = useState(false);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Video state
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoSaved, setVideoSaved] = useState(!!existingVideoPath);
  const [videoUploading, setVideoUploading] = useState(false);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // === AUDIO RECORDING ===
  const startAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      audioRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
    } catch (err) {
      toast({ title: 'Microphone access denied', variant: 'destructive' });
    }
  }, []);

  const stopAudioRecording = useCallback(() => {
    audioRecorderRef.current?.stop();
    setIsRecordingAudio(false);
  }, []);

  // === VIDEO RECORDING ===
  const startVideoRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoStreamRef.current = stream;
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      videoChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
      };

      videoRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVideo(true);
    } catch (err) {
      toast({ title: 'Camera access denied', variant: 'destructive' });
    }
  }, []);

  const stopVideoRecording = useCallback(() => {
    videoRecorderRef.current?.stop();
    setIsRecordingVideo(false);
  }, []);

  // === UPLOAD ===
  const uploadMedia = useCallback(async (type: 'audio' | 'video') => {
    const blob = type === 'audio' ? audioBlob : videoBlob;
    if (!blob) return;

    const setUploading = type === 'audio' ? setAudioUploading : setVideoUploading;
    const setSaved = type === 'audio' ? setAudioSaved : setVideoSaved;
    setUploading(true);

    try {
      const ext = type === 'audio' ? 'webm' : 'webm';
      const filePath = `${userId}/${date}_${type}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('checkin-media')
        .upload(filePath, blob, { upsert: true });

      if (uploadError) throw uploadError;

      // Update checkin record if it exists
      if (checkInId) {
        const updateData = type === 'audio' 
          ? { audio_path: filePath } 
          : { video_path: filePath };
        
        await supabase
          .from('daily_checkins')
          .update(updateData)
          .eq('id', checkInId);
      }

      setSaved(true);
      onMediaSaved?.(type, filePath);
      toast({ title: `${type === 'audio' ? 'Audio' : 'Video'} saved to cloud` });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [audioBlob, videoBlob, userId, date, checkInId, onMediaSaved]);

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioSaved(false);
  };

  const clearVideo = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setVideoSaved(false);
  };

  return (
    <div className="space-y-4">
      {/* AUDIO SECTION */}
      <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Mic className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Voice Note</h4>
            <p className="text-xs text-muted-foreground">Record how you feel about today</p>
          </div>
        </div>

        {audioSaved && !audioBlob ? (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle className="h-4 w-4" />
            <span>Audio saved to cloud</span>
          </div>
        ) : audioUrl ? (
          <div className="space-y-2">
            <audio src={audioUrl} controls className="w-full h-10" />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => uploadMedia('audio')}
                disabled={audioUploading || audioSaved}
                className="flex-1"
              >
                {audioUploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : 
                 audioSaved ? <CheckCircle className="h-3 w-3 mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                {audioSaved ? 'Saved' : 'Save to Cloud'}
              </Button>
              <Button size="sm" variant="ghost" onClick={clearAudio}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant={isRecordingAudio ? "destructive" : "outline"}
            onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
            className="w-full"
          >
            {isRecordingAudio ? (
              <><MicOff className="h-3 w-3 mr-1" /> Stop Recording</>
            ) : (
              <><Mic className="h-3 w-3 mr-1" /> Record Audio</>
            )}
          </Button>
        )}

        {isRecordingAudio && (
          <div className="flex items-center gap-2 text-sm text-destructive animate-pulse">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            Recording...
          </div>
        )}
      </div>

      {/* VIDEO SECTION */}
      <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Video className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Video Reflection</h4>
            <p className="text-xs text-muted-foreground">Record a short video about your day</p>
          </div>
        </div>

        {videoSaved && !videoBlob ? (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle className="h-4 w-4" />
            <span>Video saved to cloud</span>
          </div>
        ) : videoUrl ? (
          <div className="space-y-2">
            <video src={videoUrl} controls className="w-full rounded-md max-h-48" />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => uploadMedia('video')}
                disabled={videoUploading || videoSaved}
                className="flex-1"
              >
                {videoUploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> :
                 videoSaved ? <CheckCircle className="h-3 w-3 mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                {videoSaved ? 'Saved' : 'Save to Cloud'}
              </Button>
              <Button size="sm" variant="ghost" onClick={clearVideo}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isRecordingVideo && (
              <video ref={videoPreviewRef} muted className="w-full rounded-md max-h-48 bg-black" />
            )}
            <Button
              size="sm"
              variant={isRecordingVideo ? "destructive" : "outline"}
              onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}
              className="w-full"
            >
              {isRecordingVideo ? (
                <><VideoOff className="h-3 w-3 mr-1" /> Stop Recording</>
              ) : (
                <><Video className="h-3 w-3 mr-1" /> Record Video</>
              )}
            </Button>
          </>
        )}

        {isRecordingVideo && (
          <div className="flex items-center gap-2 text-sm text-destructive animate-pulse">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            Recording video...
          </div>
        )}
      </div>
    </div>
  );
}
