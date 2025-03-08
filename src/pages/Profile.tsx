
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/UserProfile';
import WeatherBackground from '@/components/WeatherBackground';

const Profile: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // If still checking auth status, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }
  
  return (
    <WeatherBackground condition="clear" isDay={true}>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-between items-center mb-8 animate-slide-down">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Weather
            </Button>
            
            <h1 className="text-2xl font-light text-white frosted-text">Your Profile</h1>
          </div>
          
          <div className="max-w-lg mx-auto">
            <UserProfile />
            
            <div className="mt-8 text-center">
              <p className="text-white/40 text-xs mb-1">© 2025 Climate Vision. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </WeatherBackground>
  );
};

export default Profile;
