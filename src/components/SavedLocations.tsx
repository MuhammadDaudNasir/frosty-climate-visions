
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface SavedLocationsProps {
  currentLocation: string;
  onLocationSelect: (location: string) => void;
}

const SavedLocations: React.FC<SavedLocationsProps> = ({ 
  currentLocation, 
  onLocationSelect 
}) => {
  const { user } = useAuth();
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch saved locations when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchSavedLocations();
    } else {
      setSavedLocations([]);
    }
  }, [user]);

  const fetchSavedLocations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .select('location_name')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSavedLocations(data.map(item => item.location_name));
    } catch (error) {
      console.error('Error fetching saved locations:', error);
      toast({
        title: 'Failed to load saved locations',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentLocation = async () => {
    if (!user || !currentLocation || savedLocations.includes(currentLocation)) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('saved_locations')
        .insert({
          user_id: user.id,
          location_name: currentLocation
        });
      
      if (error) throw error;
      
      setSavedLocations([...savedLocations, currentLocation]);
      toast({
        title: 'Location saved',
        description: `${currentLocation} has been added to your saved locations`,
      });
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: 'Failed to save location',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeLocation = async (location: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('saved_locations')
        .delete()
        .eq('user_id', user.id)
        .eq('location_name', location);
      
      if (error) throw error;
      
      setSavedLocations(savedLocations.filter(loc => loc !== location));
      toast({
        title: 'Location removed',
        description: `${location} has been removed from your saved locations`,
      });
    } catch (error) {
      console.error('Error removing location:', error);
      toast({
        title: 'Failed to remove location',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  // If the user isn't logged in, don't show this component
  if (!user) return null;

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-medium frosted-text">Saved Locations</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={saveCurrentLocation}
          disabled={isSaving || savedLocations.includes(currentLocation)}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Save Current
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
      ) : savedLocations.length === 0 ? (
        <div className="text-white/60 text-center py-4">
          No saved locations yet. Save your favorite places!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {savedLocations.map((location) => (
            <div 
              key={location}
              className={`
                relative group frost-panel px-3 py-2 rounded-xl cursor-pointer
                ${location === currentLocation ? 'bg-white/20' : 'bg-white/5'}
                hover:bg-white/15 transition-colors
              `}
              onClick={() => onLocationSelect(location)}
            >
              <div className="text-white truncate pr-6">{location}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeLocation(location);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-white/60 hover:text-white/90 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedLocations;
