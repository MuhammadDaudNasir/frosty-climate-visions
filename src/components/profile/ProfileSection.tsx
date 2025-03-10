
import React, { useState } from 'react';
import { User, Camera, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserProfile } from '@/types/auth';

interface ProfileSectionProps {
  user: any;
  profile: UserProfile | null;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, profile }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);

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

  if (isEditingProfile) {
    return (
      <div className="space-y-6">
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

  return (
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
  );
};

export default ProfileSection;
