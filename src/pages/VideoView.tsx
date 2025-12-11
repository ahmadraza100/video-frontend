import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, Bookmark, ChevronLeft, ChevronRight, X, Copy, Check } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { CommentSection } from "@/components/video/CommentSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockVideos, mockUsers } from "@/lib/mockData";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useVideos } from "@/hooks/useVideos";
import { useInteractions } from "@/hooks/useInteractions";
import { useUsers } from "@/hooks/useUsers";

const VideoView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getVideoById } = useVideos();
  const { likeVideo, unlikeVideo, bookmarkVideo, removeBookmark, addComment } = useInteractions();
  const { getProfile } = useUsers();

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [video, setVideo] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentIndex = mockVideos.findIndex((v) => v.id === id);
  const prevVideo = currentIndex > 0 ? mockVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < mockVideos.length - 1 ? mockVideos[currentIndex + 1] : null;

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        if (id) {
          const videoData = await getVideoById(id);
          if (!videoData) {
            throw new Error("Video not found");
          }
          setVideo(videoData);
          
          // If creatorId is an object with _id, use that; otherwise use creatorId directly
          const creatorId = typeof videoData.creatorId === 'object' 
            ? videoData.creatorId._id 
            : videoData.creatorId;
            
          if (creatorId) {
            try {
              const creatorData = await getProfile(creatorId);
              setCreator(creatorData);
            } catch (err) {
              console.error("Error fetching creator profile:", err);
              // Creator data is optional, video can be displayed without it
            }
          }
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        // Don't fall back to mock data, show error state instead
        setVideo(null);
        setCreator(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, getVideoById, getProfile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevVideo) {
        navigate(`/video/${prevVideo.id}`);
      } else if (e.key === "ArrowRight" && nextVideo) {
        navigate(`/video/${nextVideo.id}`);
      } else if (e.key === "Escape") {
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevVideo, nextVideo, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </Layout>
    );
  }

  if (!video || !video.creatorId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Video not found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleLike = async () => {
    try {
      if (!isLiked) {
        await likeVideo(id!);
      } else {
        await unlikeVideo(id!);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (!isSaved) {
        await bookmarkVideo(id!);
      } else {
        await removeBookmark(id!);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error saving video:", error);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!", description: "Video link copied to clipboard" });
  };

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Video Player Section */}
          <div className="lg:w-[400px] shrink-0">
            <div className="sticky top-24">
              {/* Navigation arrows */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => prevVideo && navigate(`/video/${prevVideo.id}`)}
                  disabled={!prevVideo}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                  <X className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => nextVideo && navigate(`/video/${nextVideo.id}`)}
                  disabled={!nextVideo}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <VideoPlayer thumbnail={video.thumbnail} title={video.title} />

              {/* Action buttons */}
              <div className="flex items-center justify-around mt-4 py-3 bg-secondary rounded-xl">
                <button
                  onClick={handleLike}
                  className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Heart className={`h-6 w-6 ${isLiked ? "fill-primary text-primary" : ""}`} />
                  <span className="text-xs font-medium">{formatCount((video.likes?.length || 0) + (isLiked ? 1 : 0))}</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-6 w-6" />
                  <span className="text-xs font-medium">{formatCount(video.comments?.length || 0)}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Share2 className="h-6 w-6" />
                  <span className="text-xs font-medium">Share</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Bookmark className={`h-6 w-6 ${isSaved ? "fill-primary text-primary" : ""}`} />
                  <span className="text-xs font-medium">Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            {/* Creator info */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to={`/profile/${typeof video.creatorId === 'object' ? video.creatorId._id : video.creatorId}`}
                className="flex items-center gap-3 group"
              >
                <Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-primary transition-all">
                  <AvatarImage src={video.creatorAvatar || undefined} alt={String(video.creatorName || 'Creator')} />
                  <AvatarFallback>{(typeof video.creatorName === 'string' && video.creatorName.length > 0) ? video.creatorName.charAt(0) : "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold group-hover:text-primary transition-colors">{String(video.creatorName || "Unknown")}</p>
                  <p className="text-sm text-muted-foreground">
                    {creator && formatCount(creator.followers)} followers
                  </p>
                </div>
              </Link>
              <Button
                variant={isFollowing ? "secondary" : "default"}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>

            {/* Video info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{video.title || "Untitled"}</h1>
              <p className="text-muted-foreground mb-4">{video.description || ""}</p>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {(video.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-accent">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatCount(video.views || 0)} views</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(video.createdAt || new Date()), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Comments */}
            <div className="border-t border-border pt-6">
              <CommentSection comments={video.comments} />
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <Button size="sm" variant="ghost" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {["Twitter", "Facebook", "WhatsApp", "Email"].map((platform) => (
                <button
                  key={platform}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-surface-hover transition-colors"
                >
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <span className="text-xs">{platform}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default VideoView;
