import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { VideoGrid } from "@/components/video/VideoGrid";
import { CategoryFilter } from "@/components/video/CategoryFilter";
import { Input } from "@/components/ui/input";
import { useVideos } from "@/hooks/useVideos";
import { mockVideos, type Video } from "@/lib/mockData";

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayVideos, setDisplayVideos] = useState<Video[]>([]);
  const { getVideos, searchVideos, loading } = useVideos();

  // Fetch all videos on component mount and when category changes
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        let response;
        if (searchQuery) {
          response = await searchVideos(searchQuery, 1, 50);
        } else {
          response = await getVideos(1, 50, selectedCategory === "All" ? undefined : selectedCategory);
        }

        // Handle both array and paginated response formats
        let videosArray: any[] = [];
        if (Array.isArray(response)) {
          videosArray = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          videosArray = response.data;
        } else {
          console.error("Invalid response format from video API:", response);
          setDisplayVideos([]);
          return;
        }

        const formattedVideos: Video[] = videosArray.map((video: any) => {
          try {
            const creatorId = typeof video.creatorId === 'object' ? video.creatorId._id : video.creatorId;
            return {
              id: video._id,
              title: video.title || "",
              description: video.description || "",
              thumbnail: video.thumbnail || "",
              videoUrl: video.videoUrl || "",
              creatorId: creatorId,
              creatorName: (typeof video.creatorId === 'object' ? video.creatorId.displayName : null) || "Unknown Creator",
              creatorAvatar: (typeof video.creatorId === 'object' ? video.creatorId.avatar : null) || "",
              likes: video.likes?.length || 0,
              views: video.views || 0,
              comments: video.comments || [],
              tags: video.tags || [],
              category: video.category || "",
              createdAt: video.createdAt || new Date().toISOString(),
            };
          } catch (err) {
            console.error("Error mapping video:", video, err);
            throw err;
          }
        });
        console.log("Formatted explore videos:", formattedVideos);
        setDisplayVideos(formattedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
        // Don't fall back to mock data, show empty instead
        setDisplayVideos([]);
      }
    };

    const delayTimer = setTimeout(fetchVideos, 300); // Debounce search

    return () => clearTimeout(delayTimer);
  }, [searchQuery, selectedCategory, getVideos, searchVideos]);

  const filteredVideos = displayVideos;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore</h1>
          <p className="text-muted-foreground">Discover videos from creators around the world</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search videos, tags, or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-0"
          />
        </div>

        {/* Categories */}
        <div className="mb-8">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Results */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-2">No videos found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""} found
            </p>
            <VideoGrid videos={filteredVideos} />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Explore;
