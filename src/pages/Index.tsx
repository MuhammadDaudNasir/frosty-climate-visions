
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeather } from '@/hooks/useWeather';
import WeatherCard from '@/components/WeatherCard';
import AnimatedWeatherBackground from '@/components/AnimatedWeatherBackground';
import EnhancedLocationSelector from '@/components/EnhancedLocationSelector';
import SavedLocations from '@/components/SavedLocations';
import TimeDisplay from '@/components/TimeDisplay';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Loader2,
  MapPin,
  Compass,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Index: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const [shouldUseGeolocation, setShouldUseGeolocation] = useState<boolean>(true);
  
  // Get the last location from localStorage, or default to San Francisco
  const getInitialLocation = () => {
    if (shouldUseGeolocation && latitude && longitude) {
      return `${latitude},${longitude}`;
    }
    return localStorage.getItem('lastLocation') || 'San Francisco';
  };
  
  const { 
    weatherData, 
    loading: weatherLoading, 
    error: weatherError, 
    location, 
    changeLocation,
    refreshWeather
  } = useWeather(getInitialLocation());
  
  // Timer for auto-refreshing weather data
  useEffect(() => {
    const timer = setInterval(() => {
      refreshWeather();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(timer);
  }, [refreshWeather]);
  
  // Use geolocation when available
  useEffect(() => {
    if (shouldUseGeolocation && latitude && longitude && !geoLoading) {
      changeLocation(`${latitude},${longitude}`);
    } else if (geoError && !geoLoading) {
      // If error in geolocation, fallback to last location and show toast
      setShouldUseGeolocation(false);
      if (geoError === 'User denied Geolocation') {
        toast({
          title: "Location access denied",
          description: "We're showing your last saved location instead",
        });
      }
    }
  }, [latitude, longitude, geoLoading, geoError, shouldUseGeolocation, changeLocation]);
  
  // When location changes, save to localStorage
  useEffect(() => {
    if (location && !weatherLoading && !weatherError) {
      localStorage.setItem('lastLocation', location);
    }
  }, [location, weatherLoading, weatherError]);
  
  const handleLocationChange = (newLocation: string) => {
    setShouldUseGeolocation(false);
    changeLocation(newLocation);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setShouldUseGeolocation(true);
      toast({
        title: "Locating you",
        description: "Fetching your current location weather...",
      });
    } else {
      toast({
        title: "Location unavailable",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
    }
  };
  
  const isLoading = weatherLoading || (geoLoading && shouldUseGeolocation);
  const weatherCondition = weatherData?.current?.condition?.text?.toLowerCase() || 'clear';
  const isDay = weatherData?.current?.is_day === 1;
  
  // While weather data is loading, show loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto" />
          <p className="mt-4 text-white text-lg">Loading weather data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <AnimatedWeatherBackground condition={weatherCondition} isDay={isDay}>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <Link 
                to={user ? "/profile" : "/auth"} 
                className="rounded-full bg-white/10 hover:bg-white/20 p-2 transition-all"
              >
                <User size={20} className="text-white" />
              </Link>
              {user && (
                <Link 
                  to="/alerts" 
                  className="rounded-full bg-white/10 hover:bg-white/20 p-2 transition-all"
                >
                  <Bell size={20} className="text-white" />
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUseMyLocation}
                className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                disabled={shouldUseGeolocation && geoLoading}
              >
                {shouldUseGeolocation && geoLoading ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Compass size={16} className="mr-2" />
                )}
                My Location
              </Button>
              
              <EnhancedLocationSelector 
                currentLocation={location}
                onLocationChange={handleLocationChange}
              />
            </div>
          </header>
          
          <TimeDisplay 
            timezone={weatherData?.location?.tz_id}
            localtime={weatherData?.location?.localtime}
          />
          
          {/* Conditional render for saved locations */}
          {user && (
            <div className="mb-8">
              <SavedLocations 
                currentLocation={location} 
                onLocationSelect={handleLocationChange}
              />
            </div>
          )}
          
          {/* Main Weather Data */}
          <div>
            <WeatherCard weatherData={weatherData} />
          </div>
        </div>
      </div>
    </AnimatedWeatherBackground>
  );
};

export default Index;
