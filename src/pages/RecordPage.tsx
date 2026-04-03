import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTimeEngine } from '@/hooks/useTimeEngine';
import { getTodayKey } from '@/lib/timeEngine';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Video, VideoOff, Mic, MicOff, Camera, RotateCcw, 
  Square, Circle, ArrowLeft, Save, Trash2, Play, 
  Loader2, CheckCircle, Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type RecordMode = 'video' | 'audio';
type RecordState = 'idle' | 'recording' | 'preview';

export default function RecordPage() {
  const navigate = useNavigate();
  const timeState = useTimeEngine(1000);
  
  const [mode, setMode] = useState<RecordMode>('video');
  const [state, setState] = useState<RecordState>('idle');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [maxDuration, setMaxDuration] = useState(200);
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const overlayIntervalRef = useRef<number | null>(null);

  // Get user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
      else navigate('/auth');
    });
  }, [navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopEverything();
    };
  }, []);

  const stopEverything = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (overlayIntervalRef.current) clearInterval(overlayIntervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Start camera preview
  const startCamera = useCallback(async () => {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop());
      
      const constraints: MediaStreamConstraints = mode === 'video' 
        ? {
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 },
              facingMode: { ideal: facingMode },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100,
            }
          }
        : { audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current && mode === 'video') {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      toast({ title: 'Camera/mic access denied', description: 'Please allow access in your browser settings.', variant: 'destructive' });
    }
  }, [mode, facingMode]);

  // Auto-start camera when mode is video and idle
  useEffect(() => {
    if (state === 'idle' && mode === 'video') {
      startCamera();
    }
    return () => {
      if (state === 'idle') {
        streamRef.current?.getTracks().forEach(t => t.stop());
      }
    };
  }, [mode, facingMode, state]);

  // Draw timestamp overlay on canvas
  const drawOverlay = useCallback(() => {
    if (!canvasRef.current || !videoRef.current || mode !== 'video') return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    // Draw video frame (mirror if front camera)
    ctx.save();
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw timestamp overlay
    const now = new Date();
    const dateText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const timeText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dayText = `DAY ${timeState.dayNumber}`;

    const fontSize = Math.max(16, Math.floor(canvas.width / 60));
    ctx.font = `bold ${fontSize}px monospace`;
    
    // Background box
    const padding = 10;
    const lineHeight = fontSize + 4;
    const boxHeight = lineHeight * 3 + padding * 2;
    const boxWidth = Math.max(
      ctx.measureText(dateText).width,
      ctx.measureText(timeText).width,
      ctx.measureText(dayText).width
    ) + padding * 2;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.roundRect(12, 12, boxWidth, boxHeight, 6);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(dateText, 12 + padding, 12 + padding + fontSize);
    ctx.fillText(timeText, 12 + padding, 12 + padding + fontSize + lineHeight);
    ctx.fillStyle = 'hsl(142, 76%, 60%)';
    ctx.fillText(dayText, 12 + padding, 12 + padding + fontSize + lineHeight * 2);
  }, [mode, facingMode, timeState.dayNumber]);

  // Start recording with canvas-based overlay for video
  const startRecording = useCallback(async () => {
    if (!streamRef.current && mode === 'audio') {
      await startCamera();
      await new Promise(r => setTimeout(r, 300));
    }
    
    if (!streamRef.current) {
      toast({ title: 'No media stream', variant: 'destructive' });
      return;
    }

    chunksRef.current = [];
    
    let recordStream: MediaStream;

    if (mode === 'video' && canvasRef.current) {
      // Use canvas stream to burn in timestamp overlay
      overlayIntervalRef.current = window.setInterval(drawOverlay, 1000 / 30); // 30fps overlay
      drawOverlay(); // Initial draw
      
      const canvasStream = canvasRef.current.captureStream(30);
      // Add audio tracks from original stream
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(t => canvasStream.addTrack(t));
      recordStream = canvasStream;
    } else {
      recordStream = streamRef.current;
    }

    const mimeType = mode === 'video'
      ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
          ? 'video/webm;codecs=vp9,opus' 
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
            ? 'video/webm;codecs=vp8,opus'
            : 'video/webm')
      : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm');

    const recorder = new MediaRecorder(recordStream, {
      mimeType,
      videoBitsPerSecond: mode === 'video' ? 5_000_000 : undefined,
      audioBitsPerSecond: 128_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const type = mode === 'video' ? 'video/webm' : 'audio/webm';
      const recordedBlob = new Blob(chunksRef.current, { type });
      setBlob(recordedBlob);
      setPreviewUrl(URL.createObjectURL(recordedBlob));
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    recorderRef.current = recorder;
    recorder.start(1000);
    setState('recording');
    setElapsed(0);

    timerRef.current = window.setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= maxDuration) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [mode, maxDuration, startCamera, drawOverlay]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (overlayIntervalRef.current) {
      clearInterval(overlayIntervalRef.current);
      overlayIntervalRef.current = null;
    }
    recorderRef.current?.stop();
    setState('preview');
  }, []);

  // Retake
  const handleRetake = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setBlob(null);
    setPreviewUrl(null);
    setElapsed(0);
    setState('idle');
  }, [previewUrl]);

  // Discard
  const handleDiscard = useCallback(() => {
    handleRetake();
    navigate(-1);
  }, [handleRetake, navigate]);

  // Switch camera
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Save & attach to today's check-in
  const handleSave = useCallback(async () => {
    if (!blob || !userId) return;
    setIsSaving(true);

    try {
      const todayKey = getTodayKey();
      const ext = 'webm';
      const filePath = `${userId}/${todayKey}_${mode}_reflection.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('checkin-media')
        .upload(filePath, blob, { upsert: true, contentType: mode === 'video' ? 'video/webm' : 'audio/webm' });

      if (uploadError) throw uploadError;

      // Find or create today's check-in
      let { data: checkIn } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', userId)
        .eq('date', todayKey)
        .maybeSingle();

      if (!checkIn) {
        const { data: newCheckIn, error: createError } = await supabase
          .from('daily_checkins')
          .insert({
            user_id: userId,
            date: todayKey,
            total_score: 0,
            is_missed: false,
          })
          .select('id')
          .single();
        if (createError) throw createError;
        checkIn = newCheckIn;
      }

      // Update check-in with media path
      const updateData = mode === 'video'
        ? { video_path: filePath }
        : { audio_path: filePath };

      const { error: updateError } = await supabase
        .from('daily_checkins')
        .update(updateData)
        .eq('id', checkIn!.id);

      if (updateError) throw updateError;

      toast({ title: `${mode === 'video' ? 'Video' : 'Audio'} reflection saved!`, description: 'Attached to today\'s check-in permanently.' });
      navigate('/check-in');
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [blob, userId, mode, navigate]);

  // Format timer
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => state === 'recording' ? null : navigate(-1)} className="text-white hover:bg-white/20" disabled={state === 'recording'}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="text-white/90 text-xs font-mono">{dateStr}</p>
            <p className="text-white text-sm font-bold font-mono">{timeStr}</p>
            <p className="text-primary text-xs font-mono">DAY {timeState.dayNumber}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="text-white hover:bg-white/20" disabled={state === 'recording'}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* REC indicator */}
        {state === 'recording' && (
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-500 font-bold text-sm font-mono">REC</span>
            </div>
            <span className="text-white font-mono text-lg">{formatTime(elapsed)}</span>
            <span className="text-white/50 font-mono text-xs">/ {formatTime(maxDuration)}</span>
          </div>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && state === 'idle' && (
        <div className="absolute top-20 left-4 right-4 z-30 bg-black/90 border border-white/20 rounded-lg p-4 space-y-4">
          <h3 className="text-white font-semibold text-sm">Recording Settings</h3>
          <div>
            <label className="text-white/70 text-xs block mb-2">Max Duration: {maxDuration}s ({formatTime(maxDuration)})</label>
            <Slider
              value={[maxDuration]}
              onValueChange={([v]) => setMaxDuration(v)}
              min={30}
              max={600}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={mode === 'video' ? 'default' : 'outline'} onClick={() => setMode('video')} className="flex-1">
              <Video className="h-3 w-3 mr-1" /> Video
            </Button>
            <Button size="sm" variant={mode === 'audio' ? 'default' : 'outline'} onClick={() => setMode('audio')} className="flex-1">
              <Mic className="h-3 w-3 mr-1" /> Audio
            </Button>
          </div>
        </div>
      )}

      {/* Camera preview / video area */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Hidden canvas for recording with burned-in timestamp */}
        <canvas ref={canvasRef} className="hidden" />

        {state !== 'preview' && mode === 'video' && (
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        )}

        {state !== 'preview' && mode === 'audio' && (
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center",
              state === 'recording' ? "bg-destructive/20 animate-pulse" : "bg-white/10"
            )}>
              <Mic className={cn("h-16 w-16", state === 'recording' ? "text-destructive" : "text-white/60")} />
            </div>
            {state === 'recording' && (
              <p className="text-white/60 text-sm">Recording audio...</p>
            )}
            {state === 'idle' && (
              <p className="text-white/40 text-sm">Audio-only mode</p>
            )}
          </div>
        )}

        {/* Preview */}
        {state === 'preview' && previewUrl && (
          mode === 'video' ? (
            <video src={previewUrl} controls playsInline className="absolute inset-0 w-full h-full object-contain bg-black" />
          ) : (
            <div className="flex flex-col items-center gap-4 p-8">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <Play className="h-10 w-10 text-primary" />
              </div>
              <audio src={previewUrl} controls className="w-72" />
              <p className="text-white/50 text-sm">Duration: {formatTime(elapsed)}</p>
            </div>
          )
        )}

        {/* Live overlay indicator on screen (timestamp is burned into recording via canvas) */}
        {state === 'recording' && mode === 'video' && (
          <div className="absolute top-16 left-4 bg-black/50 px-2 py-1 rounded pointer-events-none">
            <p className="text-white/90 text-[10px] font-mono">{dateStr} • {timeStr}</p>
            <p className="text-primary text-[10px] font-mono">DAY {timeState.dayNumber}</p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/90 to-transparent">
        {state === 'idle' && (
          <div className="flex items-center justify-center gap-8">
            {/* Mode toggle */}
            <Button variant="ghost" size="icon" onClick={() => setMode(mode === 'video' ? 'audio' : 'video')} className="text-white hover:bg-white/20">
              {mode === 'video' ? <Mic className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>

            {/* Record button */}
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Circle className="h-14 w-14 text-red-500 fill-red-500" />
            </button>

            {/* Switch camera (video only) */}
            {mode === 'video' ? (
              <Button variant="ghost" size="icon" onClick={switchCamera} className="text-white hover:bg-white/20">
                <RotateCcw className="h-5 w-5" />
              </Button>
            ) : (
              <div className="w-10" /> 
            )}
          </div>
        )}

        {state === 'recording' && (
          <div className="flex items-center justify-center">
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Square className="h-10 w-10 text-red-500 fill-red-500" />
            </button>
          </div>
        )}

        {state === 'preview' && (
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={handleDiscard} className="border-white/30 text-white hover:bg-white/10">
              <Trash2 className="h-4 w-4 mr-2" /> Discard
            </Button>
            <Button variant="outline" onClick={handleRetake} className="border-white/30 text-white hover:bg-white/10">
              <RotateCcw className="h-4 w-4 mr-2" /> Retake
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground">
              {isSaving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save & Attach</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
