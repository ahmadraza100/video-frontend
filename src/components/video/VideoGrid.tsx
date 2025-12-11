import { Video } from "@/lib/mockData";
import { VideoCard } from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <VideoCard video={video} />
        </div>
      ))}
    </div>
  );
}
