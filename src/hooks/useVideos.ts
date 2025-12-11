import { useState, useCallback } from "react";
import { videoAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  creatorId: string;
  creator?: any;
  category: string;
  tags: string[];
  likes: string[];
  views: number;
  comments: any[];
  isPublished: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: Video[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });
  const { toast } = useToast();

  const getVideos = useCallback(
    async (page = 1, limit = 10, category?: string) => {
      setLoading(true);
      try {
        const response = await videoAPI.getAllVideos(page, limit, category);
        const data = response.data.data as PaginatedResponse;
        setVideos(data.data);
        setPagination(data.pagination);
        return data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch videos",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const getVideoById = useCallback(
    async (videoId: string) => {
      setLoading(true);
      try {
        const response = await videoAPI.getVideoById(videoId);
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch video",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const createVideo = useCallback(
    async (videoData: {
      title: string;
      description: string;
      category: string;
      tags: string[];
      videoUrl: string;
      thumbnail: string;
      isDraft: boolean;
    }) => {
      setLoading(true);
      try {
        const response = await videoAPI.createVideo(videoData);
        toast({
          title: "Success",
          description: "Video created successfully!",
        });
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to create video",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const updateVideo = useCallback(
    async (videoId: string, updateData: Partial<Video>) => {
      try {
        const response = await videoAPI.updateVideo(videoId, updateData);
        toast({
          title: "Success",
          description: "Video updated successfully!",
        });
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update video",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const deleteVideo = useCallback(
    async (videoId: string) => {
      try {
        await videoAPI.deleteVideo(videoId);
        toast({
          title: "Success",
          description: "Video deleted successfully!",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete video",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const getUserVideos = useCallback(
    async (userId: string, page = 1, limit = 10) => {
      setLoading(true);
      try {
        const response = await videoAPI.getUserVideos(userId, page, limit);
        const data = response.data.data as PaginatedResponse;
        return data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch user videos",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const searchVideos = useCallback(
    async (query: string, page = 1, limit = 10) => {
      setLoading(true);
      try {
        const response = await videoAPI.searchVideos(query, page, limit);
        const data = response.data.data as PaginatedResponse;
        return data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to search videos",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const getTrendingVideos = useCallback(
    async (page = 1, limit = 10) => {
      setLoading(true);
      try {
        const response = await videoAPI.getTrendingVideos(page, limit);
        const data = response.data.data as PaginatedResponse;
        return data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch trending videos",
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
    videos,
    loading,
    pagination,
    getVideos,
    getVideoById,
    createVideo,
    updateVideo,
    deleteVideo,
    getUserVideos,
    searchVideos,
    getTrendingVideos,
  };
};
