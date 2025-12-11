import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://video-backend-769.azurewebsites.net/api";

interface AuthResponse {
  success: boolean;
  data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add token to headers
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

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// ========== AUTH ENDPOINTS ==========
export const authAPI = {
  signup: (username: string, email: string, displayName: string, password: string, confirmPassword: string) =>
    apiClient.post<AuthResponse>("/auth/signup", {
      username,
      email,
      displayName,
      password,
      confirmPassword,
    }),

  login: (username: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/login", {
      username,
      password,
    }),

  getCurrentUser: () =>
    apiClient.get<ApiResponse<any>>("/auth/me"),

  logout: () =>
    apiClient.post<ApiResponse<any>>("/auth/logout"),
};

// ========== USER ENDPOINTS ==========
export const userAPI = {
  getUserProfile: (userId: string) =>
    apiClient.get<ApiResponse<any>>(`/users/${userId}`),

  updateProfile: (displayName: string, bio: string, avatar?: string, coverImage?: string) =>
    apiClient.put<ApiResponse<any>>("/users/", {
      displayName,
      bio,
      avatar,
      coverImage,
    }),

  followUser: (userId: string) =>
    apiClient.post<ApiResponse<any>>(`/users/${userId}/follow`),

  unfollowUser: (userId: string) =>
    apiClient.post<ApiResponse<any>>(`/users/${userId}/unfollow`),

  getFollowers: (userId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/users/${userId}/followers`),

  getFollowing: (userId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/users/${userId}/following`),

  searchUsers: (query: string, limit = 20) =>
    apiClient.get<ApiResponse<any[]>>("/users/search", {
      params: { q: query, limit },
    }),
};

// ========== VIDEO ENDPOINTS ==========
export const videoAPI = {
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

  getAllVideos: (page = 1, limit = 10, category?: string) =>
    apiClient.get<ApiResponse<any>>("/videos", {
      params: { page, limit, ...(category && { category }) },
    }),

  getVideoById: (videoId: string) =>
    apiClient.get<ApiResponse<any>>(`/videos/${videoId}`),

  updateVideo: (videoId: string, updateData: Partial<any>) =>
    apiClient.put<ApiResponse<any>>(`/videos/${videoId}`, updateData),

  deleteVideo: (videoId: string) =>
    apiClient.delete<ApiResponse<any>>(`/videos/${videoId}`),

  getUserVideos: (userId: string, page = 1, limit = 10) =>
    apiClient.get<ApiResponse<any>>(`/videos/user/${userId}`, {
      params: { page, limit },
    }),

  getUserDrafts: (userId: string, page = 1, limit = 10) =>
    apiClient.get<ApiResponse<any>>(`/videos/user/${userId}/drafts`, {
      params: { page, limit },
    }),

  searchVideos: (query: string, page = 1, limit = 10) =>
    apiClient.get<ApiResponse<any>>("/videos/search", {
      params: { q: query, page, limit },
    }),

  getTrendingVideos: (page = 1, limit = 10) =>
    apiClient.get<ApiResponse<any>>("/videos/trending", {
      params: { page, limit },
    }),
};

// ========== INTERACTION ENDPOINTS ==========
export const interactionAPI = {
  likeVideo: (videoId: string) =>
    apiClient.post<ApiResponse<any>>(`/interactions/${videoId}/like`),

  unlikeVideo: (videoId: string) =>
    apiClient.delete<ApiResponse<any>>(`/interactions/${videoId}/like`),

  bookmarkVideo: (videoId: string) =>
    apiClient.post<ApiResponse<any>>(`/interactions/${videoId}/bookmark`),

  removeBookmark: (videoId: string) =>
    apiClient.delete<ApiResponse<any>>(`/interactions/${videoId}/bookmark`),

  addComment: (videoId: string, text: string) =>
    apiClient.post<ApiResponse<any>>(`/interactions/${videoId}/comments`, {
      text,
    }),

  deleteComment: (videoId: string, commentId: string) =>
    apiClient.delete<ApiResponse<any>>(`/interactions/${videoId}/comments/${commentId}`),

  likeComment: (videoId: string, commentId: string) =>
    apiClient.post<ApiResponse<any>>(`/interactions/${videoId}/comments/${commentId}/like`),

  unlikeComment: (videoId: string, commentId: string) =>
    apiClient.delete<ApiResponse<any>>(`/interactions/${videoId}/comments/${commentId}/like`),

  getVideoLikes: (videoId: string, page = 1, limit = 20) =>
    apiClient.get<ApiResponse<any>>(`/interactions/${videoId}/likes`, {
      params: { page, limit },
    }),

  getUserBookmarks: (page = 1, limit = 20) =>
    apiClient.get<ApiResponse<any>>("/interactions/bookmarks", {
      params: { page, limit },
    }),
};

export default apiClient;
