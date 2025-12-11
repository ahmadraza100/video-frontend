import { useState, useCallback } from "react";
import { userAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export interface UserProfile {
  _id: string;
  email: string;
  username: string;
  fullName: string;
  bio: string;
  profileImage: string;
  coverImage: string;
  followers: string[];
  following: string[];
  followerCount: number;
  followingCount: number;
  videoCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useUsers = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getProfile = useCallback(
    async (userId: string) => {
      setLoading(true);
      try {
        const response = await userAPI.getUserProfile(userId);
        const userData = response.data.data as UserProfile;
        setUser(userData);
        return userData;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const updateProfile = useCallback(
    async (displayName: string, bio: string, avatar?: string, coverImage?: string) => {
      try {
        const response = await userAPI.updateProfile(displayName, bio, avatar, coverImage);
        const userData = response.data.data as UserProfile;
        setUser(userData);
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        return userData;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const followUser = useCallback(
    async (userId: string) => {
      try {
        const response = await userAPI.followUser(userId);
        toast({
          title: "Success",
          description: "User followed successfully!",
        });
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to follow user",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const unfollowUser = useCallback(
    async (userId: string) => {
      try {
        const response = await userAPI.unfollowUser(userId);
        toast({
          title: "Success",
          description: "User unfollowed successfully!",
        });
        return response.data.data;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to unfollow user",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const getFollowers = useCallback(
    async (userId: string, page = 1, limit = 10) => {
      setLoading(true);
      try {
        const response = await userAPI.getFollowers(userId);
        const followers = response.data.data as UserProfile[];
        return { data: followers, pagination: { page, limit, total: followers.length } };
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch followers",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const getFollowing = useCallback(
    async (userId: string, page = 1, limit = 10) => {
      setLoading(true);
      try {
        const response = await userAPI.getFollowing(userId);
        const following = response.data.data as UserProfile[];
        return { data: following, pagination: { page, limit, total: following.length } };
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch following",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const searchUsers = useCallback(
    async (query: string, page = 1, limit = 10) => {
      setLoading(true);
      try {
        const response = await userAPI.searchUsers(query, limit);
        const users = response.data.data as UserProfile[];
        setUsers(users);
        return { data: users, pagination: { page, limit, total: users.length } };
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to search users",
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
    user,
    users,
    loading,
    getProfile,
    updateProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    searchUsers,
  };
};
