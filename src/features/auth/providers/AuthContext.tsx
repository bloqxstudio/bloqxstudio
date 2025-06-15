
import React, { createContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Função para verificar se o usuário é admin consultando o banco
  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return false;
      }

      console.log('User role from database:', data?.role);
      return data?.role === 'admin';
    } catch (error) {
      console.error('Unexpected error checking user role:', error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Verificar papel de admin se usuário logado
      if (session?.user) {
        // Usar setTimeout para evitar problemas de callback
        setTimeout(async () => {
          if (mounted) {
            const adminStatus = await checkUserRole(session.user.id);
            console.log("Is admin from database:", adminStatus);
            setIsAdmin(adminStatus);
          }
        }, 0);
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });

    // Then get initial session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error("Error fetching auth session:", error);
          setIsError(true);
          toast.error("Falha ao conectar com o serviço de autenticação");
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          // Log user info for debugging
          console.log("Session user:", data.session?.user);
          
          // Verificar papel de admin se usuário logado
          if (data.session?.user) {
            const adminStatus = await checkUserRole(data.session.user.id);
            console.log("Initial admin check:", adminStatus);
            setIsAdmin(adminStatus);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
        if (mounted) {
          setIsError(true);
          toast.error("Serviço de autenticação indisponível");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message || "Falha no login");
      } else {
        toast.success("Login realizado com sucesso!");
      }
      return { error };
    } catch (err: any) {
      toast.error("Ocorreu um erro inesperado durante o login");
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: 'user' // Default role for new users
          }
        }
      });
      
      if (error) {
        toast.error(error.message || "Falha no cadastro");
      } else if (data) {
        toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.");
      }
      
      return { data, error };
    } catch (err: any) {
      toast.error("Ocorreu um erro inesperado durante o cadastro");
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (err) {
      console.error("Error during sign out:", err);
      toast.error("Falha ao realizar logout");
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
