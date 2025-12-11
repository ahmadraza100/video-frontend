import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Settings, Grid, Heart, Edit, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { VideoCard } from "@/components/video/VideoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { mockVideos, mockUsers, currentUser, type Video } from "@/lib/mockData";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { useVideos } from "@/hooks/useVideos";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { getProfile, updateProfile, followUser, unfollowUser } = useUsers();
  const { getUserVideos, deleteVideo } = useVideos();

  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // If no id, show current user's profile
  const isOwnProfile = !id || id === authUser?._id || id === "user1";
  const displayUser = isOwnProfile ? currentUser : mockUsers.find((u) => u.id === id);

  const [editForm, setEditForm] = useState({
    displayName: displayUser?.displayName || "",
    bio: displayUser?.bio || "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (isOwnProfile && authUser?._id) {
          const profile = await getProfile(authUser._id);
          setUserProfile(profile);
          setEditForm({
            displayName: profile.fullName || "",
            bio: profile.bio || "",
          });
        } else if (id) {
          const profile = await getProfile(id);
          setUserProfile(profile);
          setEditForm({
            displayName: profile.fullName || "",
            bio: profile.bio || "",
          });
        } else {
          setUserProfile(displayUser);
        }
      } catch (error) {
        // Fallback to mock data
        setUserProfile(displayUser);
      } finally {
        setLoading(false);
      }
    };

    const fetchVideos = async () => {
      try {
        const userId = id || authUser?._id;
        console.log("Fetching videos for userId:", userId);
        if (!userId) {
          console.log("No userId available, skipping video fetch");
          setUserVideos([]);
          return;
        }
        
        const response = await getUserVideos(userId, 1, 20);
        console.log("getUserVideos response:", response);
        
        // Handle both array and paginated response formats
        let videosArray: any[] = [];
        if (Array.isArray(response)) {
          videosArray = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          videosArray = response.data;
        } else {
          console.error("Invalid response format from getUserVideos:", response);
          setUserVideos([]);
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
        
        console.log("Formatted videos:", formattedVideos);
        setUserVideos(formattedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setUserVideos([]);
      }
    };

    fetchProfile();
    fetchVideos();
  }, [id, authUser, isOwnProfile, getProfile, getUserVideos]);

  if (!userProfile && !displayUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const user = userProfile || displayUser;

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleEditProfile = async () => {
    try {
      await updateProfile(editForm.displayName, editForm.bio);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleDeleteVideo = async () => {
    try {
      if (selectedVideoId) {
        await deleteVideo(selectedVideoId);
        setUserVideos(userVideos.filter((v) => v.id !== selectedVideoId));
        setShowDeleteModal(false);
        setSelectedVideoId(null);
      }
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <Layout>
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-accent overflow-hidden">
        <img
          src={user.coverImage}
          alt="Cover"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 md:-mt-20 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Avatar */}
            <Avatar className="h-28 w-28 md:h-36 md:w-36 ring-4 ring-background shadow-medium">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-3xl">{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>

            {/* User info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{user.displayName}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
                
                <div className="flex gap-2 md:ml-auto">
                  {isOwnProfile ? (
                    <>
                      <Button variant="outline" onClick={() => setShowEditModal(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant={isFollowing ? "secondary" : "default"}
                      onClick={() => setIsFollowing(!isFollowing)}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 max-w-2xl text-muted-foreground">{user.bio}</p>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="font-bold text-lg">{formatCount(user.followers)}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{formatCount(user.following)}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{user.videosCount}</p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="videos" className="mb-8">
          <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="videos"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              <Grid className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger
              value="liked"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              <Heart className="h-4 w-4 mr-2" />
              Liked
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            {userVideos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No videos yet</p>
                {isOwnProfile && (
                  <Link to="/upload">
                    <Button>Upload your first video</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="relative group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <VideoCard video={video} />
                    {isOwnProfile && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="secondary" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/upload?edit=${video.id}`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedVideoId(video.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <div className="text-center py-16">
              <p className="text-muted-foreground">Liked videos will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this video? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVideo}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
