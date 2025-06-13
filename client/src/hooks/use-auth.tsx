import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { hasDevAdminBypass } from "@/hmr-ws-patch";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<any, Error, void>; // Use any for mutation return type to fix type issues
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  directLoginMutation: UseMutationResult<SelectUser, Error, Pick<InsertUser, "username">>;
  refetch: () => Promise<any>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: async (context): Promise<SelectUser | undefined> => {
      // First check for the dev admin bypass flag
      if (hasDevAdminBypass()) {
        // Create a fake admin user with all required fields based on the schema
        // Only log once to avoid console spam
        if (!(window as any).__loggedDevBypass) {
          console.log("🚀 Providing dummy token");
          (window as any).__loggedDevBypass = true;
        }
        const adminUser = {
          id: 9999, // Use a number for compatibility
          username: 'admin@dev-access',
          password: 'dev-only-not-stored', // Required by schema but never exposed
          isPremium: true,
          stripeCustomerId: null,
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          firstName: 'Admin',
          lastName: 'User',
          phone: null,
          city: null,
          state: null,
          firm: 'FaAxis Dev',
          aum: null,
          revenue: null,
          feeBasedPercentage: null,
          notifyNewListings: true,
          notifyMarketUpdates: true,
          notifyApprovedListings: true,
          isAdmin: true,
          adminVerificationCode: null,
          adminVerificationExpires: null,
          immediateAuthToken: null,
          immediateAuthExpires: null,
          totpSecret: null,
          totpEnabled: false,
          totpVerified: false
        };
        
        // To avoid type errors, use type assertion through unknown
        return adminUser as unknown as SelectUser;
      }
      
      // Legacy admin bypass check (for backward compatibility)
      const adminBypass = localStorage.getItem('admin_bypass');
      const adminUserJson = localStorage.getItem('admin_user');
      
      if (adminBypass === 'true' && adminUserJson) {
        console.log("Using legacy admin bypass from localStorage");
        try {
          const adminUser = JSON.parse(adminUserJson);
          return adminUser as unknown as SelectUser;
        } catch (e) {
          console.error("Failed to parse admin user from localStorage", e);
        }
      }
      
      // Check for authentication state with improved development support
      console.log("🔍 Checking authentication state for session restoration");
      
      try {
        // Always try to verify with the server first for development consistency
        let authHeaders: Record<string, string> = {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
        
        // Check for JWT token in storage and cookies
        try {
          const { getJwtToken } = await import('../lib/jwtTokenStorage');
          const token = getJwtToken(true);
          if (token) {
            authHeaders['Authorization'] = `Bearer ${token}`;
            console.log('🔑 Using stored JWT token for authentication');
          }
        } catch (error) {
          console.warn('⚠️ Could not get JWT token from storage:', error);
        }

        const response = await fetch("/api/user", {
          credentials: "include",
          headers: authHeaders
        });
        
        if (response.ok) {
          const serverUserData = await response.json();
          console.log("✅ Development server authentication successful:", {
            id: serverUserData.id,
            username: serverUserData.username,
            firstName: serverUserData.firstName,
            lastName: serverUserData.lastName
          });
          
          // Store JWT token if present in response
          if (serverUserData.token) {
            try {
              const { setJwtToken } = await import('../lib/jwtTokenStorage');
              setJwtToken(serverUserData.token);
              console.log('✅ JWT token stored from server response');
            } catch (error) {
              console.warn('⚠️ Failed to store JWT token:', error);
            }
          }
          
          // Update localStorage with fresh server data
          try {
            localStorage.setItem('user_data', JSON.stringify({
              id: serverUserData.id,
              username: serverUserData.username,
              firstName: serverUserData.firstName,
              lastName: serverUserData.lastName,
              email: serverUserData.username,
              authenticated: true,
              timestamp: Date.now()
            }));
            console.log("✅ User data persisted for development");
          } catch (error) {
            console.warn('⚠️ Failed to update localStorage:', error);
          }
          
          return serverUserData as SelectUser;
        } else if (response.status === 401) {
          console.log("⚠️ Development server returned 401 - user not authenticated");
          // Clear any stored authentication data
          localStorage.removeItem('user_data');
          try {
            const { clearJwtToken } = await import('../lib/jwtTokenStorage');
            clearJwtToken();
          } catch (error) {
            console.warn('⚠️ Failed to clear JWT token:', error);
          }
        } else {
          console.warn("⚠️ Unexpected response status from development server:", response.status);
        }
      } catch (error) {
        console.warn("⚠️ Error during development server authentication check:", error);
      }
      
      // If no valid localStorage data, use the normal auth flow
      return getQueryFn({ on401: "returnNull" })(context) as Promise<SelectUser | undefined>;
    },
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch when component mounts
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes max (renamed from cacheTime in v5)
    retry: 1, // Try once more if it fails
    retryDelay: 1000 // Wait 1 second before retrying
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        // Add a withCredentials flag to ensure cookies are sent with the request
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          credentials: "include" // This is crucial for session cookie handling
        });
        
        if (!res.ok) {
          // Handle specific status codes with user-friendly messages
          if (res.status === 401) {
            // Try to get the error message from the response
            const errorData = await res.json();
            console.error("Login failed:", errorData);
            throw new Error(errorData.message || "Invalid email or password. Please check your credentials and try again.");
          } else if (res.status === 429) {
            throw new Error("Too many login attempts. Please try again later.");
          } else if (res.status === 403) {
            throw new Error("Your account is locked. Please contact support for assistance.");
          } else {
            // Try to get a message from the response
            try {
              const errorData = await res.json();
              throw new Error(errorData.message || "Login failed. Please try again.");
            } catch {
              throw new Error("Login failed. Please try again later.");
            }
          }
        }
        return await res.json();
      } catch (error: any) {
        // Pass the error message through to the onError handler
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          throw new Error("Unable to connect to server. Please check your internet connection and try again.");
        }
        throw new Error(error.message || "Login failed. Please try again.");
      }
    },
    onSuccess: async (userData: any) => {
      console.log("🎉 Login successful, response data:", userData);
      
      // Store JWT token if present in response
      if (userData.token) {
        try {
          // Import the JWT token storage functions
          const { setJwtToken } = await import('../lib/jwtTokenStorage');
          setJwtToken(userData.token);
          console.log('✅ JWT token stored for session persistence');
        } catch (error) {
          console.warn('⚠️ Failed to store JWT token:', error);
        }
      }
      
      // Immediately update the cached user data before any network requests
      queryClient.setQueryData(["/api/user"], userData);
      
      // Store user data in localStorage for persistence
      try {
        localStorage.setItem('user_data', JSON.stringify({
          id: userData.id,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.username,
          authenticated: true,
          timestamp: Date.now()
        }));
        console.log('✅ User data stored in localStorage after login');
      } catch (error) {
        console.warn('⚠️ Failed to store user data in localStorage:', error);
      }
      
      // Wait a moment for session cookie to be properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now perform a proper user data fetch to verify session persistence
      try {
        const res = await fetch("/api/user", {
          credentials: "include", // Critical for session cookies
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (res.ok) {
          const freshUserData = await res.json();
          // Update with the fresh data
          queryClient.setQueryData(["/api/user"], freshUserData);
          console.log("✅ Successfully verified session persistence after login");
          
          // Update localStorage with fresh data
          try {
            localStorage.setItem('user_data', JSON.stringify({
              id: freshUserData.id,
              username: freshUserData.username,
              firstName: freshUserData.firstName,
              lastName: freshUserData.lastName,
              email: freshUserData.username,
              authenticated: true,
              timestamp: Date.now()
            }));
          } catch (error) {
            console.warn('⚠️ Failed to update localStorage with fresh data:', error);
          }
        }
      } catch (error) {
        console.error("Failed to verify session persistence:", error);
        // Still continue with login process even if verification fails
      }
        
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.firstName || userData.username}!`,
      });
      
      // Note: Custom onSuccess callbacks from auth-page.tsx will be called after this default one
    },
    onError: (error: Error) => {
      // Check if the error is about email verification
      if (error.message.includes("verify your email")) {
        toast({
          title: "Email verification required",
          description: "Please check your email and verify your account before logging in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      console.log('🔶 Starting registration mutation with data:', {
        username: credentials.username,
        hasPassword: !!credentials.password,
        fields: Object.keys(credentials)
      });
      
      try {
        console.log('🔄 Sending registration API request to JWT endpoint');
        const res = await apiRequest("POST", "/api/jwt/register", credentials);
        console.log('✅ Registration API request completed', { status: res.status, ok: res.ok });
        
        if (!res.ok) {
          console.warn('⚠️ Registration response not OK', { status: res.status, statusText: res.statusText });
          
          // Handle specific status codes with user-friendly messages
          if (res.status === 400) {
            try {
              const errorData = await res.json();
              console.log('📤 Registration error data:', errorData);
              
              // Check for common registration errors
              if (errorData.message?.includes("username already exists") || 
                  errorData.message?.includes("already registered") ||
                  errorData.message?.includes("already in use")) {
                throw new Error("This email address is already registered. Please try logging in instead.");
              } else if (errorData.message?.includes("password")) {
                throw new Error(errorData.message || "Please check your password and try again.");
              } else {
                throw new Error(errorData.message || "Registration failed. Please check your information and try again.");
              }
            } catch (e: any) {
              console.error('❌ Error parsing registration error response', e);
              if (e.message !== "Registration failed") {
                throw e;
              }
              throw new Error("Registration failed. Please check your information and try again.");
            }
          } else if (res.status === 404) {
            console.error('❌ Registration endpoint not found (404)');
            throw new Error("Registration service unavailable. Please try again later or contact support.");
          } else if (res.status === 429) {
            console.warn('⚠️ Registration rate limit exceeded (429)');
            throw new Error("Too many registration attempts. Please try again later.");
          } else {
            // Try to get a message from the response
            try {
              const errorData = await res.json();
              console.log('📤 Registration error data from non-400 response:', errorData);
              throw new Error(errorData.message || "Registration failed. Please try again.");
            } catch (e) {
              console.error('❌ Failed to parse error response for status', res.status, e);
              throw new Error("Registration failed. Please try again later.");
            }
          }
        }
        
        console.log('🔄 Parsing successful registration response');
        const userData = await res.json();
        console.log('✅ Registration successful, got user data', { 
          userId: userData.id, 
          username: userData.username,
          message: userData.message || 'Success'
        });
        
        return userData;
      } catch (error: any) {
        console.error('❌ Registration error caught:', error);
        
        // Handle network errors
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          console.error('❌ Network error during registration', error);
          throw new Error("Unable to connect to server. Please check your internet connection and try again.");
        }
        throw new Error(error.message || "Registration failed. Please try again.");
      }
    },
    onSuccess: async (user: SelectUser & { verificationSent?: boolean; message?: string; token?: string }) => {
      console.log('🎉 Registration successful, setting user data:', {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      });
      
      // Store JWT token if present in response
      if (user.token) {
        try {
          const { setJwtToken } = await import('../lib/jwtTokenStorage');
          setJwtToken(user.token);
          console.log('✅ JWT token stored for session persistence after registration');
        } catch (error) {
          console.warn('⚠️ Failed to store JWT token after registration:', error);
        }
      }
      
      // Immediately update the cached user data
      queryClient.setQueryData(["/api/user"], user);
      
      // Store user data in localStorage for persistence
      try {
        localStorage.setItem('user_data', JSON.stringify({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.username,
          authenticated: true,
          timestamp: Date.now()
        }));
        console.log('✅ User data stored in localStorage');
      } catch (error) {
        console.warn('⚠️ Failed to store user data in localStorage:', error);
      }
      
      // Always force a refetch to ensure we have the most up-to-date user data
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Show a verification toast if the user was just created and has a verification message
      if (user.verificationSent || user.message?.includes("verify your account")) {
        toast({
          title: "Account created",
          description: user.message || "Please check your email to verify your account.",
        });
      } else {
        toast({
          title: "Account created",
          description: `Welcome, ${user.firstName || user.username}!`,
        });
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("Email address already exists")) {
        toast({
          title: "Email already in use",
          description: "This email address is already registered. Please log in or use a different email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const directLoginMutation = useMutation({
    mutationFn: async (credentials: Pick<InsertUser, "username">) => {
      try {
        // Use our new simplified direct login endpoint
        const res = await fetch("/api/user-direct-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          credentials: "include" // This is crucial for session cookie handling
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Direct login failed:", errorData);
          throw new Error(errorData.message || "Login failed. Please try again.");
        }
        return await res.json();
      } catch (error: any) {
        console.error("Direct login error:", error);
        throw new Error(error.message || "Login failed. Please try again.");
      }
    },
    onSuccess: async (userData: any) => {
      console.log("Direct login successful, response data:", userData);
      
      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], userData);
      
      // Always force a refetch to ensure we have the most up-to-date user data
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
      toast({
        title: "Logged in successfully",
        description: `Welcome, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      // First check for dev admin bypass
      if (hasDevAdminBypass()) {
        console.log("Clearing dev admin bypass during logout");
        // Import from the hmr-ws-patch
        const { clearDevAdminBypass } = await import('@/hmr-ws-patch');
        clearDevAdminBypass();
        return; // Skip server call for dev admin bypass
      }
      
      // Clear legacy admin bypass localStorage items if they exist
      const adminBypass = localStorage.getItem('admin_bypass');
      if (adminBypass === 'true') {
        console.log("Clearing admin bypass localStorage items during logout");
        localStorage.removeItem('admin_bypass');
        localStorage.removeItem('admin_user');
        return; // Skip the server call for admin bypass users, return void
      }
      
      // Normal logout for regular users
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: async () => {
      // Clear all user data from the cache
      queryClient.setQueryData(["/api/user"], null);
      
      // Force invalidation of any queries that might contain user data
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: (user as SelectUser | null) ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        directLoginMutation,
        refetch,
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
