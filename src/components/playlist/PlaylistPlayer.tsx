import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Shuffle, Repeat } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import type { PlaylistTrack } from '@/hooks/usePlaylist';

interface PlaylistPlayerProps {
  tracks: PlaylistTrack[];
  currentTrackIndex: number;
  onTrackChange: (index: number) => void;
}

export function PlaylistPlayer({ tracks, currentTrackIndex, onTrackChange }: PlaylistPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  // Format time as MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Media Session API for notification controls
  const updateMediaSession = useCallback(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.name,
      artist: 'My Playlist',
      album: 'Execution OS',
      artwork: [
        { src: '/favicon.png', sizes: '512x512', type: 'image/png' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play();
      setIsPlaying(true);
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });

    navigator.mediaSession.setActionHandler('previoustrack', handlePrevious);
    navigator.mediaSession.setActionHandler('nexttrack', handleNext);

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (audioRef.current && details.seekTime !== undefined) {
        audioRef.current.currentTime = details.seekTime;
        setCurrentTime(details.seekTime);
      }
    });
  }, [currentTrack]);

  useEffect(() => {
    updateMediaSession();
  }, [updateMediaSession]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      updateMediaSession();
    };
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat, updateMediaSession]);

  // Auto-play when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrackIndex, currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      onTrackChange(randomIndex);
    } else {
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      onTrackChange(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;
    
    // If more than 3 seconds into track, restart it
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    onTrackChange(prevIndex);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No tracks in playlist
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} preload="metadata">
        <source src={currentTrack.url} />
      </audio>

      {/* Now Playing Display */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-border">
        {/* Album Art Placeholder */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Music className="w-8 h-8 text-primary" />
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{currentTrack.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Track {currentTrackIndex + 1} of {tracks.length}</p>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-mono text-muted-foreground w-10">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-2">
        {/* Shuffle */}
        <button
          onClick={() => setIsShuffled(!isShuffled)}
          className={`p-2 rounded-full transition-colors ${isShuffled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Main Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Repeat */}
        <button
          onClick={() => setIsRepeat(!isRepeat)}
          className={`p-2 rounded-full transition-colors ${isRepeat ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 px-4">
        <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-24"
        />
      </div>
    </div>
  );
}
