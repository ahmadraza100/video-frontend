import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { VideoGrid } from "@/components/video/VideoGrid";
import { CategoryFilter } from "@/components/video/CategoryFilter";
// search UI removed to keep Explore simple
import { useVideos } from "@/hooks/useVideos";
import { mockVideos, type Video } from "@/lib/mockData";

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [displayVideos, setDisplayVideos] = useState<Video[]>([]);
  const { getVideos, loading } = useVideos();

  // Fetch all videos on component mount and when category changes
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await getVideos(1, 50, selectedCategory === "All" ? undefined : selectedCategory);

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

    fetchVideos();
  }, [selectedCategory, getVideos]);

  const filteredVideos = displayVideos;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore</h1>
          <p className="text-muted-foreground">Discover videos from creators around the world</p>
        </div>

        {/* Search removed to simplify Explore page */}

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
