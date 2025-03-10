
import { Session, User } from '@supabase/supabase-js';

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

export interface AuthContextProps {
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
