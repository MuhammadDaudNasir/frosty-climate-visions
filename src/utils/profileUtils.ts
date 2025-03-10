
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserPreferences } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
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

    // Make sure preferences has the correct shape
    const preferences = data.preferences as unknown;
    
    // Cast the data to UserProfile type after ensuring preferences has the right structure
    return {
      id: data.id,
      username: data.username,
      avatar_url: data.avatar_url,
      updated_at: data.updated_at,
      created_at: data.created_at,
      favorite_locations: data.favorite_locations,
      preferences: preferences as UserPreferences
    };
  } catch (error: any) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
};

export const updatePreferences = async (
  userId: string, 
  currentProfile: UserProfile | null, 
  newPreferences: Partial<UserPreferences>
): Promise<UserProfile | null> => {
  if (!userId || !currentProfile) {
    throw new Error("User ID or profile not available");
  }
  
  try {
    // Merge new preferences with existing ones
    const updatedPreferences = {
      ...currentProfile.preferences,
      ...newPreferences
    };
    
    // Update in database
    const { error } = await supabase
      .from('profiles')
      .update({
        preferences: updatedPreferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) throw error;
    
    // Return updated profile
    const updatedProfile = {
      ...currentProfile,
      preferences: updatedPreferences,
      updated_at: new Date().toISOString()
    };
    
    toast({
      title: "Preferences updated",
      description: "Your settings have been saved successfully"
    });

    return updatedProfile;
  } catch (error) {
    console.error('Error updating preferences:', error);
    toast({
      title: "Update failed",
      description: error instanceof Error ? error.message : "Failed to update preferences",
      variant: "destructive"
    });
    return null;
  }
};
