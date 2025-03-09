
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, User, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface WeatherAlert {
  id: string;
  user_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  alert_type: string;
  severity: string;
  description: string;
  created_at: string;
  expires_at: string;
  username?: string;
  avatar_url?: string;
}

interface LocalWeatherAlertsProps {
  latitude: number;
  longitude: number;
  radius?: number; // in km
}

const LocalWeatherAlerts: React.FC<LocalWeatherAlertsProps> = ({
  latitude,
  longitude,
  radius = 20 // Larger radius for alerts than reports
}) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    
    // Set up real-time listener
    const channel = supabase
      .channel('public:local_weather_alerts')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'local_weather_alerts' 
        }, 
        (payload) => {
          // Check if new alert is within radius
          const newAlert = payload.new as WeatherAlert;
          const distance = calculateDistance(
            latitude, 
            longitude, 
            newAlert.latitude, 
            newAlert.longitude
          );
          
          if (distance <= radius) {
            fetchUserInfo([newAlert]).then(alerts => {
              setAlerts(prev => [...alerts, ...prev]);
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [latitude, longitude, radius]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate bounding box for rough filtering
      const approxLatDegreePerKm = 0.01; // ~1km per 0.01 degree at equator
      const approxLngDegreePerKm = 0.01 / Math.cos(latitude * (Math.PI / 180));
      const latRange = radius * approxLatDegreePerKm;
      const lngRange = radius * approxLngDegreePerKm;
      
      const { data, error } = await supabase
        .from('local_weather_alerts')
        .select('*')
        .gte('latitude', latitude - latRange)
        .lte('latitude', latitude + latRange)
        .gte('longitude', longitude - lngRange)
        .lte('longitude', longitude + lngRange)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Further filter by actual distance
      const filteredAlerts = data.filter(alert => {
        const distance = calculateDistance(
          latitude, 
          longitude, 
          alert.latitude, 
          alert.longitude
        );
        return distance <= radius;
      });
      
      // Get user information
      const alertsWithUserInfo = await fetchUserInfo(filteredAlerts);
      
      setAlerts(alertsWithUserInfo);
      
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load weather alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async (alerts: WeatherAlert[]) => {
    if (alerts.length === 0) return [];
    
    const userIds = [...new Set(alerts.map(alert => alert.user_id))];
    
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      
      const userMap = new Map();
      profiles?.forEach(profile => {
        userMap.set(profile.id, {
          username: profile.username,
          avatar_url: profile.avatar_url
        });
      });
      
      return alerts.map(alert => ({
        ...alert,
        username: userMap.get(alert.user_id)?.username || 'Anonymous',
        avatar_url: userMap.get(alert.user_id)?.avatar_url
      }));
      
    } catch (error) {
      console.error('Error fetching user info:', error);
      return alerts;
    }
  };

  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    // Haversine formula for distance calculation
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-500/70';
      case 'moderate': return 'bg-orange-500/70';
      case 'severe': return 'bg-red-500/70';
      case 'extreme': return 'bg-red-700/90';
      default: return 'bg-yellow-500/70';
    }
  };

  const formatAlertType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="frost-panel p-4 rounded-2xl text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-3/4 bg-white/20 rounded mb-3"></div>
          <div className="h-20 w-full bg-white/10 rounded mb-2"></div>
          <div className="h-20 w-full bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="frost-panel p-4 rounded-2xl text-center">
        <p className="text-white/70">{error}</p>
        <Button 
          onClick={fetchAlerts} 
          className="mt-2 bg-white/10 hover:bg-white/20 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null; // Don't display anything if no alerts
  }

  return (
    <div className="frost-panel p-4 rounded-2xl">
      <h3 className="text-white text-lg font-medium mb-4 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-white/80" />
        Local Weather Alerts
      </h3>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-3 rounded-xl animate-fade-in border-l-4 ${getSeverityColor(alert.severity)} bg-white/5`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {alert.avatar_url ? (
                  <img 
                    src={alert.avatar_url} 
                    alt={alert.username} 
                    className="w-9 h-9 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-white/60" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">
                      {alert.username || 'Anonymous'}
                    </p>
                    <div className="flex items-center text-white/60 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      <span className="mx-1">•</span>
                      <MapPin className="h-3 w-3 mr-1" />
                      {Math.round(calculateDistance(latitude, longitude, alert.latitude, alert.longitude))} km away
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 text-xs ${getSeverityColor(alert.severity)} text-white rounded-full`}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="text-white font-medium">
                    {formatAlertType(alert.alert_type)}
                  </div>
                  <p className="text-white/80 text-sm">
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalWeatherAlerts;
