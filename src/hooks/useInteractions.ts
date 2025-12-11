import { useState, useCallback } from "react";
import { interactionAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export interface Comment {
  _id: string;
  authorId: string;
  author?: any;
  text: string;
  likes: string[];
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export const useInteractions = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const likeVideo = useCallback(
    async (videoId: string) => {
      try {
        const response = await interactionAPI.likeVideo(videoId);
        toast({
          title: "Success",
          description: "Video liked!",
        });
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to like video",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const unlikeVideo = useCallback(
    async (videoId: string) => {
      try {
        const response = await interactionAPI.unlikeVideo(videoId);
        toast({
          title: "Success",
          description: "Like removed",
        });
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to unlike video",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const bookmarkVideo = useCallback(
    async (videoId: string) => {
      try {
        const response = await interactionAPI.bookmarkVideo(videoId);
        toast({
          title: "Success",
          description: "Video bookmarked!",
        });
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to bookmark video",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const removeBookmark = useCallback(
    async (videoId: string) => {
      try {
        const response = await interactionAPI.removeBookmark(videoId);
        toast({
          title: "Success",
          description: "Bookmark removed",
        });
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to remove bookmark",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const addComment = useCallback(
    async (videoId: string, text: string) => {
      try {
        const response = await interactionAPI.addComment(videoId, text);
        const newComment = response.data.data as Comment;
        setComments((prev) => [newComment, ...prev]);
        toast({
          title: "Success",
          description: "Comment posted!",
        });
        return newComment;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to post comment",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const deleteComment = useCallback(
    async (videoId: string, commentId: string) => {
      try {
        await interactionAPI.deleteComment(videoId, commentId);
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast({
          title: "Success",
          description: "Comment deleted",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete comment",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const likeComment = useCallback(
    async (videoId: string, commentId: string) => {
      try {
        const response = await interactionAPI.likeComment(videoId, commentId);
        toast({
          title: "Success",
          description: "Comment liked!",
        });
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to like comment",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const unlikeComment = useCallback(
    async (videoId: string, commentId: string) => {
      try {
        const response = await interactionAPI.unlikeComment(videoId, commentId);
        toast({
          title: "Success",
          description: "Like removed",
        });
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to unlike comment",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const getVideoLikes = useCallback(
    async (videoId: string, page = 1, limit = 20) => {
      setLoading(true);
      try {
        const response = await interactionAPI.getVideoLikes(videoId, page, limit);
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch likes",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const getUserBookmarks = useCallback(
    async (page = 1, limit = 20) => {
      setLoading(true);
      try {
        const response = await interactionAPI.getUserBookmarks(page, limit);
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch bookmarks",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  return {
    comments,
    loading,
    likeVideo,
    unlikeVideo,
    bookmarkVideo,
    removeBookmark,
    addComment,
    deleteComment,
    likeComment,
    unlikeComment,
    getVideoLikes,
    getUserBookmarks,
  };
};
