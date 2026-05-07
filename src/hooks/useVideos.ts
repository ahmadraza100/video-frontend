/**
 * useVideos Hook
 * 
 * Encapsulates all video-related API operations with state management.
 * Provides methods for fetching, creating, updating, deleting, and searching videos.
 * 
 * Features:
 * - Centralized video state (videos, loading, pagination)
 * - Automatic error handling with toast notifications
 * - Support for pagination and filtering by category
 * - Search and trending video discovery
 * 
 * Usage:
 *   const { videos, loading, getVideos, getVideoById } = useVideos();
 *   await getVideos(1, 20, 'music'); // Fetch page 1, 20 videos, music category
 */

import { useState, useCallback } from "react";
import { videoAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

/**
 * Video data structure matching backend schema
 */
export interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  creatorId: string;
  creator?: any; // Populated user object from backend
  category: string;
  tags: string[];
  likes: string[]; // Array of user IDs who liked
  views: number;
  comments: any[];
  isPublished: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response wrapper for paginated video results
 */
interface PaginatedResponse {
  data: Video[];
  pagination: {
    total: number; // Total videos in collection
    page: number; // Current page (1-indexed)
    limit: number; // Results per page
    pages: number; // Total number of pages
  };
}

/**
 * Hook that provides video CRUD operations and state management
 * Wraps videoAPI calls with loading state and toast notifications
 * 
 * @returns Object with video state and operation methods
 */
export const useVideos = () => {
  // State for storing fetched videos
  const [videos, setVideos] = useState<Video[]>([]);
  // Loading state for API calls
  const [loading, setLoading] = useState(false);
  // Pagination metadata for paginated requests
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });
  const { toast } = useToast();

  /**
   * Fetch paginated list of all videos, optionally filtered by category
   * Updates videos and pagination state
   * @param page - Page number (1-indexed, default: 1)
   * @param limit - Videos per page (default: 10)
   * @param category - Optional category filter (e.g., "music", "gaming")
   * @returns Paginated response or throws error
   */
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

  /**
   * Fetch single video by ID with full details (creator, comments, etc.)
   * Does NOT update videos state; use for detailed view pages
   * @param videoId - ID of video to fetch
   * @returns Full video object with all metadata
   */
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

  /**
   * Create new video with metadata and file URLs
   * URLs should be from file upload API response (separate endpoint)
   * @param videoData - Video metadata object with title, description, URLs, etc.
   * @returns Created video object with ID from backend
   */
  const createVideo = useCallback(
    async (videoData: {
      title: string;
      description: string;
      category: string;
      tags: string[];
      videoUrl: string; // Relative or absolute URL from upload
      thumbnail: string; // Relative or absolute URL from upload
      isDraft: boolean; // False for published, true for draft
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

  /**
   * Update video metadata (title, description, category, tags)
   * Only video creator can update their videos
   * @param videoId - Video to update
   * @param updateData - Partial video object with fields to update
   * @returns Updated video object
   */
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

  /**
   * Delete video permanently
   * Only video creator can delete. Removes all associated data (comments, interactions)
   * @param videoId - Video to delete
   */
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

  /**
   * Fetch all published videos by a specific user
   * Used for user profile video gallery (does NOT fetch drafts)
   * @param userId - User whose videos to fetch
   * @param page - Page number
   * @param limit - Videos per page
   * @returns Paginated user's public videos
   */
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

  /**
   * Full-text search for videos by title, description, or tags
   * @param query - Search keywords
   * @param page - Page number
   * @param limit - Results per page
   * @returns Paginated search results with relevance ranking
   */
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

  /**
   * Fetch trending videos (most liked/viewed in recent period)
   * Used for home page and recommendations
   * @param page - Page number
   * @param limit - Videos per page
   * @returns Paginated trending videos ranked by engagement
   */
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

  // Return hook interface with state and methods
  return {
    videos, // Current fetched videos array
    loading, // API request loading state
    pagination, // Pagination metadata (total, page, limit, pages)
    getVideos, // Fetch paginated video list
    getVideoById, // Fetch single video details
    createVideo, // Create new video
    updateVideo, // Update video metadata
    deleteVideo, // Delete video
    getUserVideos, // Fetch user's videos
    searchVideos, // Search videos by query
    getTrendingVideos, // Fetch trending videos
  };
};
