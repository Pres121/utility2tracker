import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Create profile if user signs up
      if (event === 'SIGNED_UP' && session?.user) {
        try {
          const { error } = await supabase
            .from('profiles')
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                created_at: new Date().toISOString(),
              },
            ]);
          
          if (error) {
            console.error('Error creating profile:', error);
          }
        } catch (error) {
          console.error('Error creating profile:', error);
        }
      }
    });

    // Auto logout on page unload for security
    const handleBeforeUnload = async () => {
      if (session) {
        await supabase.auth.signOut();
      }
    };

    const handleVisibilityChange = async () => {
      if (document.hidden && session) {
        // Optional: Also logout when tab becomes hidden (more aggressive security)
        // Uncomment the next line if you want to logout when user switches tabs
        // await supabase.auth.signOut();
      }
    };

    // Add event listeners for security
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    const cleanup = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
    };

    return cleanup;
  }, []);

  // Additional security: Auto logout after inactivity
  useEffect(() => {
    if (!session) return;

    let inactivityTimer: NodeJS.Timeout;
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        console.log('Auto-logging out due to inactivity');
        await signOut();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Start the timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, [session]);
  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase is not configured. Please set up your Supabase connection.' } };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase is not configured. Please set up your Supabase connection.' } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      return;
    }
    console.log('Signing out user for security');
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isConfigured,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}