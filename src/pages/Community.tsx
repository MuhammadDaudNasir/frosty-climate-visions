
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWeather } from '@/hooks/useWeather';
import { ArrowLeft, Users, CloudRain, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WeatherBackground from '@/components/WeatherBackground';
import WeatherReportForm from '@/components/WeatherReportForm';
import CommunityWeatherReports from '@/components/CommunityWeatherReports';
import WeatherAlertForm from '@/components/WeatherAlertForm';
import LocalWeatherAlerts from '@/components/LocalWeatherAlerts';

const Community: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { weatherData, location } = useWeather();
  const [activeTab, setActiveTab] = useState('reports');
  
  // If the weather data is still loading, use default coordinates
  const latitude = weatherData?.location?.lat || 37.7749;
  const longitude = weatherData?.location?.lon || -122.4194;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const getCondition = () => {
    if (!weatherData) return 'clear';
    const condition = weatherData.current.condition.text.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'rain';
    } else if (condition.includes('cloud')) {
      return 'cloudy';
    } else if (condition.includes('snow')) {
      return 'snow';
    } else if (condition.includes('thunder') || condition.includes('storm')) {
      return 'stormy' as 'clear' | 'cloudy' | 'rain' | 'snow' | 'stormy' | 'fog';
    }
    
    return 'clear';
  };
  
  const isDay = weatherData?.current?.is_day === 1;
  
  return (
    <WeatherBackground condition={getCondition()} isDay={isDay}>
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
            
            <div className="flex items-center">
              <h1 className="text-2xl font-light text-white frosted-text">
                <Users className="inline-block mr-2 h-6 w-6" />
                Community
              </h1>
            </div>
          </div>
          
          <div className="mb-4 text-center">
            <div className="inline-flex items-center bg-white/10 px-3 py-1 rounded-full text-white/80 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {location || 'Current Location'}
            </div>
          </div>
          
          <Tabs defaultValue="reports" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 mb-6 bg-white/10 w-full">
              <TabsTrigger value="reports" className="flex items-center">
                <CloudRain className="h-4 w-4 mr-2" />
                Weather Reports
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Weather Alerts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <WeatherReportForm 
                    location={location} 
                    latitude={latitude} 
                    longitude={longitude} 
                  />
                </div>
                <div>
                  <CommunityWeatherReports 
                    latitude={latitude} 
                    longitude={longitude} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="alerts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <WeatherAlertForm 
                    location={location} 
                    latitude={latitude} 
                    longitude={longitude} 
                  />
                </div>
                <div>
                  <LocalWeatherAlerts 
                    latitude={latitude} 
                    longitude={longitude} 
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 text-center">
            <p className="text-white/40 text-xs">© 2025 Climate Vision. All rights reserved.</p>
          </div>
        </div>
      </div>
    </WeatherBackground>
  );
};

export default Community;
