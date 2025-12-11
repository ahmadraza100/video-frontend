import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Upload as UploadIcon, X, Image, Video, Check } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { categories, mockVideos } from "@/lib/mockData";
import { buildMediaUrl } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useVideos } from "@/hooks/useVideos";
import { cn } from "@/lib/utils";

const Upload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { createVideo, updateVideo, loading } = useVideos();
  
  const editId = searchParams.get("edit");
  const editingVideo = editId ? mockVideos.find((v) => v.id === editId) : null;

  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(editingVideo?.thumbnail || null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(editingVideo?.thumbnail || null);

  const [formData, setFormData] = useState({
    title: editingVideo?.title || "",
    description: editingVideo?.description || "",
    category: editingVideo?.category || "",
    tags: editingVideo?.tags || [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("video/")) {
      handleVideoFile(files[0]);
    }
  }, []);

  const handleVideoFile = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    
    // Simulate upload progress
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        toast({ title: "Video processed!", description: "Your video is ready for publishing." });
      }
    }, 200);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleVideoFile(files[0]);
    }
  };

  const handleThumbnailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setThumbnailPreview(url);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 10 && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim().toLowerCase()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    if (!videoFile && !editingVideo) {
      toast({ title: "Error", description: "Please upload a video first.", variant: "destructive" });
      return;
    }

    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Please add a title.", variant: "destructive" });
      return;
    }

    if (!formData.category.trim()) {
      toast({ title: "Error", description: "Please select a category.", variant: "destructive" });
      return;
    }

    try {
      setIsUploading(true);
      let videoUrl = "";
      let thumbnailUrl = "";

      // Upload video and thumbnail files if provided
      if (videoFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("video", videoFile);
        
        // Generate thumbnail from video
        // Create a placeholder thumbnail
        // In production, you'd generate a frame from the video
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#ffffff";
          ctx.font = "16px Arial";
          ctx.textAlign = "center";
          ctx.fillText("Video Thumbnail", 160, 90);
        }
        
        // Convert canvas to blob synchronously for immediate append
        const canvasBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob || new Blob());
          }, "image/jpeg", 0.8);
        });
        
        formDataToSend.append("thumbnail", canvasBlob, "thumbnail.jpg");

        const response = await fetch(`https://video-backend-769.azurewebsites.net/api/videos/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "File upload failed");
        }

        const uploadData = await response.json();
        videoUrl = uploadData.data.videoUrl;
        thumbnailUrl = uploadData.data.thumbnailUrl;

        toast({
          title: "Success",
          description: "Video files uploaded successfully",
        });
      }

      if (editingVideo) {
        // Update existing video
        await updateVideo(editingVideo.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
        });
      } else {
        // Create new video with uploaded files
        await createVideo({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          videoUrl: videoUrl,
          thumbnail: thumbnailUrl,
          isDraft: isDraft,
        });
      }
      
      navigate("/profile");
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast({ title: "Error", description: error.message || "Failed to upload video", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setUploadProgress(0);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {editingVideo ? "Edit Video" : "Upload Video"}
          </h1>
          <p className="text-muted-foreground">
            {editingVideo ? "Update your video details" : "Share your content with the world"}
          </p>
        </div>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
          {/* Upload Zone */}
          {!videoPreview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 text-center transition-all",
                isDragging
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50 hover:bg-secondary"
              )}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                  <UploadIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">Drag and drop your video</p>
                  <p className="text-muted-foreground text-sm mb-4">
                    MP4, MOV, or WebM up to 500MB
                  </p>
                  <label>
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Video className="h-4 w-4 mr-2" />
                        Select File
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="aspect-video bg-foreground rounded-2xl overflow-hidden">
                <img
                  src={buildMediaUrl(videoPreview) || videoPreview || undefined}
                  alt="Video preview"
                  className="w-full h-full object-cover"
                />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-2xl">
                  <p className="font-medium mb-2">Uploading... {uploadProgress}%</p>
                  <Progress value={uploadProgress} className="w-48" />
                </div>
              )}
              {!isUploading && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={clearVideo}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {!isUploading && uploadProgress === 100 && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Uploaded
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Video Details */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Add a title that describes your video"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell viewers about your video"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="tags"
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        #{tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.tags.length}/10 tags
                </p>
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <Label>Thumbnail</Label>
              <div className="mt-1.5">
                {thumbnailPreview ? (
                  <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
                    <img
                      src={buildMediaUrl(thumbnailPreview) || thumbnailPreview || undefined}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => setThumbnailPreview(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="block aspect-video border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-secondary cursor-pointer transition-all">
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                      <Image className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload thumbnail</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailInput}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: 1280x720 (16:9 aspect ratio)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button type="submit" size="lg" disabled={isUploading || loading}>
              {editingVideo ? "Save Changes" : "Publish"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isUploading || loading}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => navigate(-1)}
              className="sm:ml-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Upload;
