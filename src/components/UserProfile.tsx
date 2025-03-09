
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserPreferences } from '@/contexts/AuthContext';
import { 
  User, Settings, LogOut, Loader2, CheckCircle, Camera,
  Sun, Moon, BellRing, BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const UserProfile: React.FC = () => {
  const { user, profile, signOut, userPreferences, updateUserPreferences } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [username, setUsername] = useState(profile?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [preferences, setPreferences] = useState<UserPreferences>(userPreferences);

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
      
      // Create preview URL
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
      // Upload avatar if changed
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
      
      // Update profile
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
      
      setIsEditing(false);
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

  const handleToggleDarkMode = () => {
    const updatedPreferences = {
      ...preferences,
      darkMode: !preferences.darkMode
    };
    setPreferences(updatedPreferences);
    updateUserPreferences(updatedPreferences);
  };

  const handleToggleNotifications = () => {
    const updatedPreferences = {
      ...preferences,
      notificationsEnabled: !preferences.notificationsEnabled
    };
    setPreferences(updatedPreferences);
    updateUserPreferences(updatedPreferences);
  };

  const handleUnitChange = (value: 'metric' | 'imperial') => {
    const updatedPreferences = {
      ...preferences,
      units: value
    };
    setPreferences(updatedPreferences);
    updateUserPreferences(updatedPreferences);
  };

  const handleWindSpeedFormatChange = (value: 'km/h' | 'mph' | 'm/s') => {
    const updatedPreferences = {
      ...preferences,
      windSpeedFormat: value
    };
    setPreferences(updatedPreferences);
    updateUserPreferences(updatedPreferences);
  };

  if (isEditing) {
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
              setIsEditing(false);
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

  return (
    <div className="space-y-6 p-6 frost-panel rounded-2xl animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 bg-white/10">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-white/20 text-white"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="data-[state=active]:bg-white/20 text-white"
          >
            Preferences
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-0">
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
          
          <div className="flex flex-wrap gap-2 mt-6">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            
            <Button
              variant="ghost"
              onClick={signOut}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="mt-0 space-y-5">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl">
            <div className="flex items-center">
              {preferences.darkMode ? 
                <Moon className="h-5 w-5 text-blue-300 mr-3" /> : 
                <Sun className="h-5 w-5 text-yellow-300 mr-3" />
              }
              <div>
                <h4 className="text-white font-medium">Dark Mode</h4>
                <p className="text-white/60 text-xs">Enable dark mode for the app</p>
              </div>
            </div>
            <Switch 
              checked={preferences.darkMode} 
              onCheckedChange={handleToggleDarkMode} 
            />
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl">
            <div className="flex items-center">
              {preferences.notificationsEnabled ? 
                <BellRing className="h-5 w-5 text-green-300 mr-3" /> : 
                <BellOff className="h-5 w-5 text-red-300 mr-3" />
              }
              <div>
                <h4 className="text-white font-medium">Weather Alerts</h4>
                <p className="text-white/60 text-xs">Get notifications about severe weather</p>
              </div>
            </div>
            <Switch 
              checked={preferences.notificationsEnabled} 
              onCheckedChange={handleToggleNotifications} 
            />
          </div>
          
          <div className="p-3 bg-white/5 rounded-2xl">
            <h4 className="text-white font-medium mb-2">Temperature Units</h4>
            <RadioGroup value={preferences.units} onValueChange={handleUnitChange as any}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="metric" id="metric" className="text-white" />
                <Label htmlFor="metric" className="text-white">Metric (°C)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperial" id="imperial" className="text-white" />
                <Label htmlFor="imperial" className="text-white">Imperial (°F)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="p-3 bg-white/5 rounded-2xl">
            <h4 className="text-white font-medium mb-2">Wind Speed Format</h4>
            <RadioGroup value={preferences.windSpeedFormat} onValueChange={handleWindSpeedFormatChange as any}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="km/h" id="kmh" className="text-white" />
                <Label htmlFor="kmh" className="text-white">km/h</Label>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="mph" id="mph" className="text-white" />
                <Label htmlFor="mph" className="text-white">mph</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="m/s" id="ms" className="text-white" />
                <Label htmlFor="ms" className="text-white">m/s</Label>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
