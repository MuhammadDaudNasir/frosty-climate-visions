
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, Settings, LogOut, Loader2, CheckCircle, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const UserProfile: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);

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
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          onClick={() => setIsEditing(true)}
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
    </div>
  );
};

export default UserProfile;
