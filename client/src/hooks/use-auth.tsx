import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { type InsertUser, type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
  googleSignInMutation: ReturnType<typeof useGoogleSignInMutation>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

const AuthContext = createContext<AuthContextType | null>(null);

function useLoginMutation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login...");
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();
      console.log("Login response:", data);
      return data;
    },
    onSuccess: (user: User) => {
      console.log("Login successful, updating user data:", user);
      queryClient.removeQueries();
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });
}

function useRegisterMutation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertUser) => {
      console.log("Attempting registration...");
      const res = await apiRequest("POST", "/api/register", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (user: User) => {
      console.log("Registration successful, updating user data:", user);
      queryClient.removeQueries();
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome!",
        description: "Your account has been created",
      });
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Username already exists",
        variant: "destructive",
      });
    },
  });
}

function useGoogleSignInMutation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log("Attempting Google sign-in...");
      const res = await apiRequest("POST", "/api/auth/google");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Google sign-in failed");
      }
      return await res.json();
    },
    onSuccess: (user: User) => {
      console.log("Google sign-in successful, updating user data:", user);
      queryClient.removeQueries();
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google",
      });
    },
    onError: (error: any) => {
      console.error("Google sign-in error:", error);
      toast({
        title: "Sign-in failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    },
  });
}

function useLogoutMutation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.removeQueries();
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Goodbye!",
        description: "Successfully logged out",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        console.log("Fetching user data...");
        const res = await fetch("/api/user", {
          credentials: "include",
        });

        // Return null for 401 responses
        if (res.status === 401) {
          console.log("User not authenticated");
          return null;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        console.log("User data fetched:", data);
        return data;
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    },
    retry: 0, // Don't retry failed requests
    staleTime: 0, // Ensure fresh data on mount
  });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const googleSignInMutation = useGoogleSignInMutation();

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error: error as Error | null,
        loginMutation,
        registerMutation,
        logoutMutation,
        googleSignInMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}