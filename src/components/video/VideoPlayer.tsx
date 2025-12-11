import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { cn, buildMediaUrl } from "@/lib/utils";

interface VideoPlayerProps {
  thumbnail?: string | null;
  videoUrl?: string | null;
  title?: string;
  className?: string;
}

export function VideoPlayer({ thumbnail, videoUrl, title, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    const next = !isMuted;
    setIsMuted(next);
    if (el) el.muted = next;
  };

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onTimeUpdate = () => setCurrentTime(el.currentTime || 0);
    const onLoaded = () => setDuration(el.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, [videoRef.current]);

  const formatTime = (t: number) => {
    if (!isFinite(t) || t <= 0) return "0:00";
    const total = Math.floor(t);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = videoRef.current;
    if (!el || !duration) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    el.currentTime = pct * duration;
    setCurrentTime(el.currentTime);
  };
  return (
    <div
      className={cn("relative bg-foreground rounded-xl overflow-hidden aspect-[9/16] group", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video element (falls back to poster image when video is not provided) */}
      {videoUrl ? (
        <video
          ref={videoRef}
          src={buildMediaUrl(videoUrl) || undefined}
          poster={buildMediaUrl(thumbnail) || undefined}
          className="w-full h-full object-cover bg-black"
          playsInline
          preload="metadata"
          onClick={() => {
            const el = videoRef.current;
            if (!el) return;
            if (el.paused) {
              el.play().catch(() => {});
            } else {
              el.pause();
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          muted={isMuted}
        />
      ) : (
        <img
          src={buildMediaUrl(thumbnail) || thumbnail || undefined}
          alt={title}
          className="w-full h-full object-cover"
        />
      )}

      {/* Play/Pause overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-foreground/20 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
        onClick={() => {
          // clicking the overlay should toggle playback
          togglePlay();
        }}
      >
        <button className="w-16 h-16 rounded-full bg-background/90 flex items-center justify-center shadow-medium hover:scale-105 transition-transform">
          {isPlaying ? (
            <Pause className="h-7 w-7 text-foreground" />
          ) : (
            <Play className="h-7 w-7 text-foreground ml-1" />
          )}
        </button>
      </div>

      {/* Bottom controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div
          className="w-full h-2 bg-background/30 rounded-full mb-3 overflow-hidden cursor-pointer"
          onClick={handleSeek}
          aria-label="Seek"
          role="slider"
        >
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="text-background hover:text-primary transition-colors"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="text-background hover:text-primary transition-colors"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <span className="text-xs text-background/80">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <button className="text-background hover:text-primary transition-colors">
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
