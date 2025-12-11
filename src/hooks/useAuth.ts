import { useState, useCallback, useEffect } from "react";
import { authAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  followers: string[];
  following: string[];
  videosCount: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Logout function (defined early so it can be used in effects)
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: "Success",
      description: "Logged out successfully!",
    });
  }, [toast]);

  // Get current user function
  const getCurrentUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching current user:", error);
      logout();
      throw error;
    }
  }, [logout]);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");
        
        if (token && userId) {
          // Token exists, try to fetch user data
          await getCurrentUser();
          setIsAuthenticated(true);
        } else {
          // No token, not authenticated
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Error fetching user, logout
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [getCurrentUser]);

  const signup = useCallback(
    async (username: string, email: string, displayName: string, password: string, confirmPassword?: string) => {
      setLoading(true);
      try {
        const response = await authAPI.signup(username, email, displayName, password, confirmPassword || password);
        const { user: userData, accessToken, refreshToken } = response.data.data;
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userData._id);
        
        setUser(userData);
        setIsAuthenticated(true);
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        return userData;
      } catch (error: any) {
        const message = error.response?.data?.message || "Signup failed";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      try {
        const response = await authAPI.login(username, password);
        const { user: userData, accessToken, refreshToken } = response.data.data;
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userData._id);
        
        setUser(userData);
        setIsAuthenticated(true);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        return userData;
      } catch (error: any) {
        const message = error.response?.data?.message || "Login failed";
        toast({
          title: "Error",
          description: message,
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
    loading,
    isAuthenticated,
    signup,
    login,
    logout,
    getCurrentUser,
  };
};

