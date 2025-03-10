import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserPreferences } from '@/contexts/AuthContext';
import { 
  User, Settings, LogOut, Loader2, CheckCircle, Camera, 
  Sun, Moon, Droplets, Wind, MapPin, ThermometerSun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserProfile: React.FC = () => {
  const { user, profile, signOut, updateUserPreferences } = useAuth();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  
  const [tempPreferences, setTempPreferences] = useState<UserPreferences>(
    profile?.preferences || {
      unit: 'metric',
      wind_speed: 'km/h',
      dark_mode: false,
      temperature_unit: 'celsius'
    }
  );

  if (!user) {
    return (
      <div className="text-center py-8">
        <Button 
          onClick={() => navigate('/auth')}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </div>
    );
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let avatarUrl = profile?.avatar_url;
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);
          
        if (uploadError) throw uploadError;
        
        avatarUrl = `${(supabase.storage.from('avatars').getPublicUrl(fileName)).data.publicUrl}`;
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
      });
      
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    
    try {
      await updateUserPreferences(tempPreferences);
      setIsEditingPreferences(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDarkMode = async (enabled: boolean) => {
    setTempPreferences({
      ...tempPreferences,
      dark_mode: enabled
    });
  };

  if (isEditingProfile) {
    return (
      <div className="space-y-6 p-6 frost-panel rounded-2xl animate-fade-in">
        <h3 className="text-xl text-white font-medium text-center">Edit Profile</h3>
        
        <div className="flex flex-col items-center">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border-2 border-white/20">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-white/60" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white/20 hover:bg-white/30 p-2 rounded-full cursor-pointer">
              <Camera className="h-4 w-4 text-white" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          
          <div className="w-full space-y-4">
            <div>
              <label className="text-white/70 text-sm block mb-1">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            
            <div>
              <label className="text-white/70 text-sm block mb-1">Email</label>
              <Input
                value={user.email}
                disabled
                className="bg-white/5 border-white/10 text-white/60"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setIsEditingProfile(false);
              setUsername(profile?.username || '');
              setAvatarPreview(profile?.avatar_url || null);
              setAvatarFile(null);
            }}
            className="bg-white/10 hover:bg-white/20 text-white"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            className="bg-white/20 hover:bg-white/30 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    );
  }

  if (isEditingPreferences) {
    return (
      <div className="space-y-6 p-6 frost-panel rounded-2xl animate-fade-in">
        <h3 className="text-xl text-white font-medium text-center">Preferences</h3>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-white text-sm font-medium flex items-center">
              <ThermometerSun className="h-4 w-4 mr-2" />
              Temperature Unit
            </h4>
            <RadioGroup 
              value={tempPreferences.unit} 
              onValueChange={(value) => setTempPreferences({
                ...tempPreferences,
                unit: value as 'metric' | 'imperial',
                temperature_unit: value === 'metric' ? 'celsius' : 'fahrenheit'
              })}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metric" id="metric" />
                <Label htmlFor="metric" className="text-white/90">Metric (°C)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperial" id="imperial" />
                <Label htmlFor="imperial" className="text-white/90">Imperial (°F)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-white text-sm font-medium flex items-center">
              <Wind className="h-4 w-4 mr-2" />
              Wind Speed Format
            </h4>
            <RadioGroup 
              value={tempPreferences.wind_speed} 
              onValueChange={(value) => setTempPreferences({
                ...tempPreferences,
                wind_speed: value as 'km/h' | 'mph' | 'm/s'
              })}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="km/h" id="kmh" />
                <Label htmlFor="kmh" className="text-white/90">Kilometers per hour (km/h)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mph" id="mph" />
                <Label htmlFor="mph" className="text-white/90">Miles per hour (mph)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="m/s" id="ms" />
                <Label htmlFor="ms" className="text-white/90">Meters per second (m/s)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-white text-sm font-medium flex items-center">
                {tempPreferences.dark_mode ? (
                  <Moon className="h-4 w-4 mr-2" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" />
                )}
                Dark Mode
              </div>
            </div>
            <Switch 
              checked={tempPreferences.dark_mode}
              onCheckedChange={handleToggleDarkMode}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setIsEditingPreferences(false);
              setTempPreferences(profile?.preferences || {
                unit: 'metric',
                wind_speed: 'km/h',
                dark_mode: false,
                temperature_unit: 'celsius'
              });
            }}
            className="bg-white/10 hover:bg-white/20 text-white"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePreferences}
            className="bg-white/20 hover:bg-white/30 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Save Preferences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 frost-panel rounded-2xl animate-fade-in">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-white/10">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border-2 border-white/20">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.username || user.email} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white/60" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl text-white font-medium">
                {profile?.username || user.email?.split('@')[0]}
              </h3>
              <p className="text-white/60 text-sm">{user.email}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsEditingProfile(true)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            
            <Button
              variant="ghost"
              onClick={signOut}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <div className="flex items-center">
                <ThermometerSun className="h-4 w-4 mr-2 text-white/70" />
                <span className="text-white">Temperature Unit</span>
              </div>
              <div className="text-white/80 bg-white/10 px-3 py-1 rounded-full text-sm">
                {profile?.preferences.unit === 'metric' ? 'Metric (°C)' : 'Imperial (°F)'}
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <div className="flex items-center">
                <Wind className="h-4 w-4 mr-2 text-white/70" />
                <span className="text-white">Wind Speed</span>
              </div>
              <div className="text-white/80 bg-white/10 px-3 py-1 rounded-full text-sm">
                {profile?.preferences.wind_speed}
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <div className="flex items-center">
                {profile?.preferences.dark_mode ? (
                  <Moon className="h-4 w-4 mr-2 text-white/70" />
                ) : (
                  <Sun className="h-4 w-4 mr-2 text-white/70" />
                )}
                <span className="text-white">Theme</span>
              </div>
              <div className="text-white/80 bg-white/10 px-3 py-1 rounded-full text-sm">
                {profile?.preferences.dark_mode ? 'Dark Mode' : 'Light Mode'}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setIsEditingPreferences(true)}
            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Preferences
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
