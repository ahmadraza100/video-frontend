import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles, Upload, Users } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { VideoGrid } from "@/components/video/VideoGrid";
import { CategoryFilter } from "@/components/video/CategoryFilter";
import { Button } from "@/components/ui/button";
import { useVideos } from "@/hooks/useVideos";
import { mockVideos, type Video } from "@/lib/mockData";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [displayVideos, setDisplayVideos] = useState<Video[]>([]);
  const { getTrendingVideos, loading } = useVideos();

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        const response = await getTrendingVideos(1, 12);
        console.log("getTrendingVideos response:", response);
        
        // Handle both array and paginated response formats
        let videosArray: any[] = [];
        if (Array.isArray(response)) {
          videosArray = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          videosArray = response.data;
        } else {
          console.error("Invalid response format from getTrendingVideos:", response);
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
        console.log("Formatted trending videos:", formattedVideos);
        setDisplayVideos(formattedVideos);
      } catch (error) {
        console.error("Error fetching trending videos:", error);
        setDisplayVideos([]);
      }
    };

    fetchTrendingVideos();
  }, [getTrendingVideos]);

  const filteredVideos = selectedCategory === "All"
    ? displayVideos
    : displayVideos.filter((video) => video.category === selectedCategory);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent via-background to-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              Share Your Story with{" "}
              <span className="gradient-text">BitClips</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Create, share, and discover amazing short videos. Join millions of creators worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <Link to="/upload">
                <Button size="lg" className="gap-2 shadow-glow">
                  <Upload className="h-5 w-5" />
                  Start Creating
                </Button>
              </Link>
              <Link to="/explore">
                <Button size="lg" variant="outline" className="gap-2">
                  <Play className="h-5 w-5" />
                  Explore Videos
                </Button>
              </Link>
            </div>

         
          </div>
        </div>
      </section>

      {/* Trending Videos Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Trending Now</h2>
            <p className="text-muted-foreground">Discover what's popular today</p>
          </div>
          <Link to="/explore" className="text-primary font-medium hover:underline flex items-center gap-1">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <VideoGrid videos={filteredVideos} />
      </section>

      {/* Features Section */}
      <section className="bg-surface py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose BitClips?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The best platform for sharing and discovering short-form video content
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-6 shadow-soft hover-lift">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Easy Upload</h3>
              <p className="text-muted-foreground text-sm">
                Upload your videos in seconds with our drag-and-drop interface. Support for all major formats.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-soft hover-lift">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Growing Community</h3>
              <p className="text-muted-foreground text-sm">
                Connect with millions of creators and viewers. Build your audience and grow together.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-soft hover-lift">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Discovery</h3>
              <p className="text-muted-foreground text-sm">
                Our AI-powered algorithm helps your content reach the right audience at the right time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
