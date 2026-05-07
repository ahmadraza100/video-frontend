/**
 * API Client & Endpoint Definitions
 * 
 * This module provides centralized HTTP client configuration and API endpoint definitions
 * for communicating with the VidShare backend. It handles:
 * - Axios configuration with base URL management
 * - Authentication token injection via interceptors
 * - Automatic logout on 401 (Unauthorized) responses
 * - Grouped API endpoints by feature (auth, users, videos, interactions, comments)
 * 
 * Usage:
 *   import { videoAPI, authAPI } from '@/lib/api';
 *   const response = await videoAPI.getAllVideos(1, 20);
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

/** Backend API base URL from environment or default production endpoint */
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://video-backend-769.azurewebsites.net/api";

/**
 * Standard authentication response structure from backend
 */
interface AuthResponse {
  success: boolean;
  data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Generic API response wrapper used by most backend endpoints
 * All responses follow this shape for consistency
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

/**
 * Axios client instance for all API calls
 * Configured with base URL and default headers
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor: Automatically attach JWT token to all requests
 * Retrieves token from localStorage and adds it to Authorization header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Handle authentication failures and token expiration
 * On 401 response, clears stored tokens and redirects to login page
 * This ensures user is logged out when token becomes invalid or expires
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all authentication data from local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      // Redirect to login (home page)
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API Endpoints
 * 
 * Handles user signup, login, session management
 * All responses include user data and JWT tokens
 */
export const authAPI = {
  /**
   * Register new user account
   * @param username - Unique username for login
   * @param email - Email address for account recovery
   * @param displayName - Public display name
   * @param password - Account password
   * @param confirmPassword - Password confirmation for validation
   * @returns AuthResponse with user data and tokens
   */
  signup: (username: string, email: string, displayName: string, password: string, confirmPassword: string) =>
    apiClient.post<AuthResponse>("/auth/signup", {
      username,
      email,
      displayName,
      password,
      confirmPassword,
    }),

  /**
   * Authenticate user and retrieve session tokens
   * @param username - User's username or email
   * @param password - User's password
   * @returns AuthResponse with user data and access/refresh tokens
   */
  login: (username: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/login", {
      username,
      password,
    }),

  /**
   * Fetch currently authenticated user profile
   * Requires valid JWT token in Authorization header
   * @returns User profile data
   */
  getCurrentUser: () =>
    apiClient.get<ApiResponse<any>>("/auth/me"),

  /**
   * End user session and invalidate tokens
   * Should clear localStorage tokens after calling this
   */
  logout: () =>
    apiClient.post<ApiResponse<any>>("/auth/logout"),
};

/**
 * User Profile & Social API Endpoints
 * 
 * Manages user profiles, following relationships, user discovery
 * Includes follow/unfollow, profile updates, user search
 */
export const userAPI = {
  /**
   * Fetch user profile by ID
   * @param userId - Target user's ID
   * @returns User profile with stats (follower count, video count, etc.)
   */
  getUserProfile: (userId: string) =>
    apiClient.get<ApiResponse<any>>(`/users/${userId}`),

  /**
   * Update authenticated user's profile information
   * @param displayName - New public display name
   * @param bio - User biography/about text
   * @param avatar - Avatar image URL (optional)
   * @param coverImage - Cover/header image URL (optional)
   * @returns Updated user profile
   */
  updateProfile: (displayName: string, bio: string, avatar?: string, coverImage?: string) =>
    apiClient.put<ApiResponse<any>>("/users/", {
      displayName,
      bio,
      avatar,
      coverImage,
    }),

  /**
   * Follow a user (add to current user's following list)
   * @param userId - ID of user to follow
   * @returns Confirmation response
   */
  followUser: (userId: string) =>
    apiClient.post<ApiResponse<any>>(`/users/${userId}/follow`),

  /**
   * Unfollow a user (remove from current user's following list)
   * @param userId - ID of user to unfollow
   * @returns Confirmation response
   */
  unfollowUser: (userId: string) =>
    apiClient.post<ApiResponse<any>>(`/users/${userId}/unfollow`),

  /**
   * Fetch list of user's followers (users following this user)
   * @param userId - Target user's ID
   * @returns Array of follower user profiles
   */
  getFollowers: (userId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/users/${userId}/followers`),

  /**
   * Fetch list of users this user is following
   * @param userId - Target user's ID
   * @returns Array of user profiles being followed
   */
  getFollowing: (userId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/users/${userId}/following`),

  /**
   * Search for users by name or username
   * @param query - Search term (name, username, etc.)
   * @param limit - Maximum number of results (default: 20)
   * @returns Array of matching user profiles
   */
  searchUsers: (query: string, limit = 20) =>
    apiClient.get<ApiResponse<any[]>>("/users/search", {
      params: { q: query, limit },
    }),
};

/**
 * Video Content API Endpoints
 * 
 * Core video operations: create, retrieve, update, delete, search, filter
 * Includes trending videos and user-specific video collections
 */
export const videoAPI = {
  /**
   * Create new video with metadata
   * Title, description, category, and thumbnail are required
   * @param videoData - Video metadata and file URLs
   * @returns Created video object with ID
   */
  createVideo: (videoData: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    videoUrl: string;
    thumbnail: string;
    isDraft: boolean;
  }) =>
    apiClient.post<ApiResponse<any>>("/videos", videoData),

  /**
   * Fetch paginated list of all public videos
   * Optionally filter by category (see Explore page)
   * @param page - Page number (1-indexed)
   * @param limit - Videos per page (default: 10)
   * @param category - Optional category filter
   * @returns Paginated video array with metadata
   */
  getAllVideos: (page = 1, limit = 10, category?: string) =>
    apiClient.get<ApiResponse<any>>("/videos", {
      params: { page, limit, ...(category && { category }) },
    }),

  /**
   * Fetch single video details by ID
   * Includes creator info, engagement stats, comments count
   * @param videoId - Target video ID
   * @returns Complete video object with metadata
   */
  getVideoById: (videoId: string) =>
    apiClient.get<ApiResponse<any>>(`/videos/${videoId}`),

  /**
   * Update video metadata (title, description, category, tags)
   * Only video creator can update
   * @param videoId - Target video ID
   * @param updateData - Partial video object with fields to update
   * @returns Updated video object
   */
  updateVideo: (videoId: string, updateData: Partial<any>) =>
    apiClient.put<ApiResponse<any>>(`/videos/${videoId}`, updateData),

  /**
   * Delete video permanently
   * Only video creator can delete
   * Removes all associated data (comments, interactions, etc.)
   * @param videoId - Target video ID
   * @returns Confirmation response
   */
  deleteVideo: (videoId: string) =>
    apiClient.delete<ApiResponse<any>>(`/videos/${videoId}`),

  /**
   * Fetch all published videos by a specific user
   * Used for user profile video gallery
   * @param userId - Target user's ID
   * @param page - Page number for pagination
   * @param limit - Videos per page
   * @returns Paginated user's public videos
   */
  getUserVideos: (userId: string, page = 1, limit = 10) =>
    apiClient.get<ApiResponse<any>>(`/videos/user/${userId}`, {
      params: { page, limit },
    }),

  /**
   * Fetch draft videos for authenticated user
   * Only accessible to video creator (current user)
   * @param userId - Current user's ID
   * @param page - Page number
   * @param limit - Videos per page
   * @returns Paginated draft videos
   */
  getUserDrafts: (userId: string, page = 1, limit = 10) =>
    apiClient.get<ApiResponse<any>>(`/videos/user/${userId}/drafts`, {
      params: { page, limit },
    }),

  /**
   * Full-text search for videos by title/description
   * @param query - Search keywords
   * @param page - Page number
   * @param limit - Results per page
   * @returns Matching videos with relevance ranking
   */
  searchVideos: (query: string, page = 1, limit = 10) =>
    apiClient.get<ApiResponse<any>>("/videos/search", {
      params: { q: query, page, limit },
    }),

  /**
   * Fetch trending videos (most liked/viewed in recent period)
   * Used for home page recommendations
   * @param page - Page number
   * @param limit - Videos per page
   * @returns Trending videos ranked by engagement
   */
  getTrendingVideos: (page = 1, limit = 10) =>
    apiClient.get<ApiResponse<any>>("/videos/trending", {
      params: { page, limit },
    }),
};

/**
 * Video Interaction API Endpoints
 * 
 * Legacy endpoints for likes, bookmarks, comments
 * Consider using commentAPI for comment operations (newer interface)
 */
export const interactionAPI = {
  /**
   * Like a video (add to current user's liked videos)
   * @param videoId - Target video ID
   * @returns Updated like count
   */
  likeVideo: (videoId: string) =>
    apiClient.post<ApiResponse<any>>(`/interactions/${videoId}/like`),

  /**
   * Unlike a video (remove from current user's liked videos)
   * @param videoId - Target video ID
   * @returns Updated like count
   */
  unlikeVideo: (videoId: string) =>
    apiClient.delete<ApiResponse<any>>(`/interactions/${videoId}/like`),

  /**
   * Bookmark a video (save for later viewing)
   * @param videoId - Target video ID
   * @returns Confirmation response
   */
  bookmarkVideo: (videoId: string) =>
    apiClient.post<ApiResponse<any>>(`/interactions/${videoId}/bookmark`),

  /**
   * Remove video from bookmarks
   * @param videoId - Target video ID
   * @returns Confirmation response
   */
  removeBookmark: (videoId: string) =>
    apiClient.delete<ApiResponse<any>>(`/interactions/${videoId}/bookmark`),

  /**
   * Post comment on video (legacy endpoint)
   * Prefer commentAPI.createComment() for new code
   * @param videoId - Target video ID
   * @param text - Comment text content
   * @returns Created comment object
   */
  addComment: (videoId: string, text: string) =>
    apiClient.post<ApiResponse<any>>(`/interactions/${videoId}/comments`, {
      text,
    }),

  /**
   * Delete comment (legacy endpoint)
   * Prefer commentAPI.deleteComment() for new code
   * @param videoId - Target video ID
   * @param commentId - Target comment ID
   * @returns Confirmation response
   */
  deleteComment: (videoId: string, commentId: string) =>
    apiClient.delete<ApiResponse<any>>(`/interactions/${videoId}/comments/${commentId}`),

  /**
   * Like a comment (legacy endpoint)
   * @param videoId - Target video ID
   * @param commentId - Target comment ID
   * @returns Updated like count
   */
  likeComment: (videoId: string, commentId: string) =>
    apiClient.post<ApiResponse<any>>(`/interactions/${videoId}/comments/${commentId}/like`),

  /**
   * Unlike a comment (legacy endpoint)
   * @param videoId - Target video ID
   * @param commentId - Target comment ID
   * @returns Updated like count
   */
  unlikeComment: (videoId: string, commentId: string) =>
    apiClient.delete<ApiResponse<any>>(`/interactions/${videoId}/comments/${commentId}/like`),

  /**
   * Fetch users who liked a video
   * @param videoId - Target video ID
   * @param page - Page number
   * @param limit - Results per page
   * @returns Paginated list of users
   */
  getVideoLikes: (videoId: string, page = 1, limit = 20) =>
    apiClient.get<ApiResponse<any>>(`/interactions/${videoId}/likes`, {
      params: { page, limit },
    }),

  /**
   * Fetch current user's bookmarked videos
   * @param page - Page number
   * @param limit - Videos per page
   * @returns Paginated list of bookmarked videos
   */
  getUserBookmarks: (page = 1, limit = 20) =>
    apiClient.get<ApiResponse<any>>("/interactions/bookmarks", {
      params: { page, limit },
    }),
};

/**
 * Comment API Endpoints (Recommended)
 * 
 * Modern comment management interface
 * Provides pagination, sorting, and like toggles
 * Preferred over legacy interactionAPI comment methods
 */
export const commentAPI = {
  /**
   * List comments on a video with pagination and sorting
   * @param videoId - Target video ID
   * @param page - Page number (1-indexed)
   * @param limit - Comments per page (default: 20)
   * @param sort - Sort order: "recent" or "top" (default: recent)
   * @returns Paginated comment array with creator info
   */
  getComments: (videoId: string, page = 1, limit = 20, sort = "recent") =>
    apiClient.get<ApiResponse<any>>(`/videos/${videoId}/comments`, {
      params: { page, limit, sort },
    }),

  /**
   * Post new comment on video
   * Comment text is required and validated server-side (1-1000 chars)
   * @param videoId - Target video ID
   * @param text - Comment text content
   * @returns Created comment object with ID and metadata
   */
  createComment: (videoId: string, text: string) =>
    apiClient.post<ApiResponse<any>>(`/videos/${videoId}/comments`, { text }),

  /**
   * Update existing comment text
   * Only comment creator can update
   * @param videoId - Target video ID
   * @param commentId - Target comment ID
   * @param text - New comment text
   * @returns Updated comment object
   */
  updateComment: (videoId: string, commentId: string, text: string) =>
    apiClient.put<ApiResponse<any>>(`/videos/${videoId}/comments/${commentId}`, { text }),

  /**
   * Delete comment permanently
   * Only comment creator or video creator can delete
   * @param videoId - Target video ID
   * @param commentId - Target comment ID
   * @returns Confirmation response
   */
  deleteComment: (videoId: string, commentId: string) =>
    apiClient.delete<ApiResponse<any>>(`/videos/${videoId}/comments/${commentId}`),

  /**
   * Toggle like on a comment (toggle: like if not liked, unlike if liked)
   * Server returns updated liked state
   * @param videoId - Target video ID
   * @param commentId - Target comment ID
   * @returns Updated comment with new like count and current user's like state
   */
  toggleLikeComment: (videoId: string, commentId: string) =>
    apiClient.post<ApiResponse<any>>(`/videos/${videoId}/comments/${commentId}/like`),
};

/** Export default client for direct use if needed (avoid for new code) */

export default apiClient;
