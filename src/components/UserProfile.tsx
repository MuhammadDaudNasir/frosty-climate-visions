
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSection from './profile/ProfileSection';
import PreferencesSection from './profile/PreferencesSection';

const UserProfile: React.FC = () => {
  const { user, profile, signOut, updateUserPreferences } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="space-y-6 p-6 frost-panel rounded-2xl animate-fade-in">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-white/10">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSection user={user} profile={profile} />
          
          <div className="flex flex-wrap gap-2 mt-4">
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
          <PreferencesSection 
            profile={profile} 
            onSavePreferences={updateUserPreferences} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
