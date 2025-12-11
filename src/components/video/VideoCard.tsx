import { Link } from "react-router-dom";
import { Heart, MessageCircle, Play } from "lucide-react";
import { Video } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, buildMediaUrl } from "@/lib/utils";

interface VideoCardProps {
  video: Video;
  className?: string;
}

export function VideoCard({ video, className }: VideoCardProps) {
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Link
      to={`/video/${video.id}`}
      className={cn("group block hover-lift", className)}
    >
      <div className="video-thumbnail">
        {video.thumbnail ? (
          <img
            src={buildMediaUrl(video.thumbnail) || undefined}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.warn(`Failed to load thumbnail for video ${video.id}`);
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No thumbnail</span>
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-background/90 flex items-center justify-center shadow-medium">
            <Play className="h-6 w-6 text-primary fill-primary ml-1" />
          </div>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-foreground/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6 ring-2 ring-background">
              <AvatarImage src={buildMediaUrl(video.creatorAvatar) || undefined} alt={video.creatorName} />
              <AvatarFallback className="text-xs">{video.creatorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-background truncate">
              {video.creatorName}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-background/80">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatCount(video.likes)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {video.comments.length}
            </span>
          </div>
        </div>
      </div>

      {/* Title below thumbnail */}
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground">{formatCount(video.views)} views</p>
      </div>
    </Link>
  );
}
