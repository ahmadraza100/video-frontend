import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { cn, buildMediaUrl } from "@/lib/utils";

interface VideoPlayerProps {
  thumbnail: string;
  title: string;
  className?: string;
}

export function VideoPlayer({ thumbnail, title, className }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  return (
    <div
      className={cn("relative bg-foreground rounded-xl overflow-hidden aspect-[9/16] group", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <img
        src={buildMediaUrl(thumbnail) || undefined}
        alt={title}
        className="w-full h-full object-cover"
      />

      {/* Play/Pause overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-foreground/20 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
        onClick={() => setIsPlaying(!isPlaying)}
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
        <div className="w-full h-1 bg-background/30 rounded-full mb-3 overflow-hidden">
          <div className="h-full w-1/3 bg-primary rounded-full" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="text-background hover:text-primary transition-colors"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="text-background hover:text-primary transition-colors"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <span className="text-xs text-background/80">0:15 / 0:45</span>
          </div>
          <button className="text-background hover:text-primary transition-colors">
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
