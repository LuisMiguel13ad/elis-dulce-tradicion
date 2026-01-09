/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, getUserProfile } from '@/lib/supabase';
import { AuthUser, UserRole } from '@/types/auth';
import type { Session, User } from '@supabase/supabase-js';

// DEV MODE: Set to true to enable dummy logins (disable in production)
const DEV_MODE = true;

// Dummy users for development (Owner and Baker only)
const DUMMY_USERS: Record<string, AuthUser> = {
  owner: {
    id: 'dev-owner-001',
    email: 'owner@elisdulce.com',
    profile: {
      id: 'dev-owner-001',
      role: 'owner',
      full_name: 'Eli (Owner)',
      phone: '555-0001',
      email_notifications_enabled: true,
      sms_notifications_enabled: true,
    },
  },
  baker: {
    id: 'dev-baker-001',
    email: 'baker@elisdulce.com',
    profile: {
      id: 'dev-baker-001',
      role: 'baker',
      full_name: 'Baker Demo',
      phone: '555-0002',
      email_notifications_enabled: true,
      sms_notifications_enabled: true,
    },
  },
};

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  // Dev mode helpers
  devLogin: (role: 'owner' | 'baker') => void;
  isDevMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dev mode login - stores in localStorage for persistence
  const devLogin = (role: 'owner' | 'baker') => {
    if (!DEV_MODE) return;
    const dummyUser = DUMMY_USERS[role];
    setUser(dummyUser);
    localStorage.setItem('dev_user_role', role);
    // toast.success(`Dev login as ${role}`); // Removed to avoid confusion with Front Desk (which uses baker role)
  };

  // Load user session on mount
  useEffect(() => {
    // Check for dev mode login first
    if (DEV_MODE) {
      const savedRole = localStorage.getItem('dev_user_role') as 'owner' | 'baker' | null;
      if (savedRole && DUMMY_USERS[savedRole]) {
        setUser(DUMMY_USERS[savedRole]);
        setIsLoading(false);
        return;
      }
    }

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser: User) => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await getUserProfile(authUser.id);

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          profile,
        });
      } else {
        // Profile might not exist yet, create a minimal user object
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          profile: null,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        profile: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        toast.success('Signed in successfully');
        return { success: true };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => {
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Profile will be created automatically by the trigger
        // But we can update it with phone if provided
        if (phone && data.user.id) {
          await supabase
            .from('profiles')
            .update({ phone, full_name: fullName })
            .eq('id', data.user.id)
            .select('id, role, full_name, phone'); // Only select needed columns
        }

        toast.success('Account created successfully! Please check your email to verify your account.');
        return { success: true };
      }

      return { success: false, error: 'Sign up failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    // Clear dev mode login
    if (DEV_MODE) {
      localStorage.removeItem('dev_user_role');
    }

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }

    setUser(null);
    setSession(null);
    toast.info('Signed out successfully');
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user?.profile) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.profile.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
        isLoading,
        hasRole,
        devLogin,
        isDevMode: DEV_MODE,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
