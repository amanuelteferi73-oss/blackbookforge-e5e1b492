import { useState, useRef, useEffect } from "react";

export const Preloader = ({ children }: { children: React.ReactNode }) => {
  const [showPreloader, setShowPreloader] = useState(() => {
    return !sessionStorage.getItem("preloader-shown");
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleEnter = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // If audio fails to play, just proceed
        handleComplete();
      });
      setIsPlaying(true);
    }
  };

  const handleComplete = () => {
    setIsFading(true);
    setTimeout(() => {
      sessionStorage.setItem("preloader-shown", "true");
      setShowPreloader(false);
    }, 500);
  };

  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    handleComplete();
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("ended", handleComplete);
      return () => audio.removeEventListener("ended", handleComplete);
    }
  }, []);

  if (!showPreloader) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        <audio ref={audioRef} src="/audio/preload.mp3" preload="auto" />

        {!isPlaying ? (
          <button
            onClick={handleEnter}
            className="text-white/80 hover:text-white text-lg font-mono tracking-widest uppercase transition-all duration-300 hover:tracking-[0.3em] border border-white/20 hover:border-white/40 px-8 py-4"
          >
            Enter FORGE
          </button>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
            <button
              onClick={handleSkip}
              className="text-white/40 hover:text-white/60 text-xs font-mono tracking-wider uppercase transition-colors"
            >
              Skip
            </button>
          </div>
        )}
      </div>
      <div className="hidden">{children}</div>
    </>
  );
};
