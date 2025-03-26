
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to check if a user is an admin
const isUserAdmin = (user: User | null): boolean => {
  if (!user) return false;
  
  // Log user metadata for debugging
  console.log('User metadata:', user.user_metadata);
  
  // Check role in user_metadata
  return user.user_metadata?.role === 'admin';
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null, data: any | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed", session?.user?.email);
      console.log("User metadata:", session?.user?.user_metadata);
      setSession(session);
      setUser(session?.user ?? null);
      setIsAdmin(session?.user ? isUserAdmin(session.user) : false);
      setIsLoading(false);
    });

    // Then get initial session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching auth session:", error);
          setIsError(true);
          toast.error("Failed to connect to authentication service");
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          // Log user info for debugging
          console.log("Session user:", data.session?.user);
          console.log("User metadata:", data.session?.user?.user_metadata);
          
          const admin = data.session?.user ? isUserAdmin(data.session.user) : false;
          console.log("Is admin:", admin);
          setIsAdmin(admin);
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
        setIsError(true);
        toast.error("Authentication service unavailable");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message || "Failed to sign in");
      }
      return { error };
    } catch (err: any) {
      toast.error("An unexpected error occurred during sign in");
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'user' // Default role for new users
          }
        }
      });
      
      if (error) {
        toast.error(error.message || "Failed to sign up");
      } else if (data) {
        toast.success("Registration successful! Please check your email to confirm your account.");
      }
      
      return { data, error };
    } catch (err: any) {
      toast.error("An unexpected error occurred during sign up");
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error during sign out:", err);
      toast.error("Failed to sign out properly");
    }
  };

  const value = {
    session,
    user,
    isLoading,
    isError,
    isAdmin,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
