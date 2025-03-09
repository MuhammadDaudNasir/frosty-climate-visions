
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

export interface UserPreferences {
  unit: 'metric' | 'imperial';
  wind_speed: 'km/h' | 'mph' | 'm/s';
  dark_mode: boolean;
  temperature_unit: 'celsius' | 'fahrenheit';
}

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  updated_at: string;
  created_at: string;
  favorite_locations: string[] | null;
  preferences: UserPreferences;
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      // Ensure preferences exists and has default values if not set
      if (!data.preferences) {
        data.preferences = {
          unit: 'metric',
          wind_speed: 'km/h',
          dark_mode: false,
          temperature_unit: 'celsius'
        };
      }

      setProfile(data as UserProfile);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Successfully signed in",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username || email.split('@')[0]
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created",
        description: "Please check your email for verification instructions",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear all local user state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) return;
    
    try {
      // Get current profile
      const currentProfile = profile;
      if (!currentProfile) {
        throw new Error("Profile not loaded");
      }
      
      // Merge new preferences with existing ones
      const updatedPreferences = {
        ...currentProfile.preferences,
        ...preferences
      };
      
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setProfile({
        ...currentProfile,
        preferences: updatedPreferences,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Preferences updated",
        description: "Your settings have been saved successfully"
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update preferences",
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateUserPreferences
  };

  return (
    <AuthContext.Provider value={value}>
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
