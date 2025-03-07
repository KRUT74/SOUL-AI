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
      // Clear all queries before setting new user data
      queryClient.removeQueries();
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
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
      return await res.json();
    },
    onSuccess: (user: User) => {
      console.log("Registration successful, updating user data:", user);
      // Clear all queries before setting new user data
      queryClient.removeQueries();
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome!",
        description: "Your account has been created",
      });
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Username already exists",
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
        const res = await apiRequest("GET", "/api/user");
        if (res.status === 401) return null;
        const data = await res.json();
        console.log("User data fetched:", data);
        return data;
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null; 
      }
    },
    staleTime: 0, // Ensure fresh data on mount
  });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error: error as Error | null,
        loginMutation,
        registerMutation,
        logoutMutation,
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