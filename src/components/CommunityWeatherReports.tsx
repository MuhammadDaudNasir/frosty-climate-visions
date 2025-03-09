
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, CloudRain, Clock, MapPin, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface WeatherReport {
  id: string;
  user_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  condition: string;
  description: string;
  intensity: string;
  created_at: string;
  expires_at: string;
  photo_url?: string;
  username?: string;
  avatar_url?: string;
}

interface CommunityWeatherReportsProps {
  latitude: number;
  longitude: number;
  radius?: number; // in km
}

const CommunityWeatherReports: React.FC<CommunityWeatherReportsProps> = ({
  latitude,
  longitude,
  radius = 10
}) => {
  const [reports, setReports] = useState<WeatherReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
    // Set up real-time listener
    const channel = supabase
      .channel('public:user_weather_reports')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_weather_reports' 
        }, 
        (payload) => {
          // Check if new report is within radius
          const newReport = payload.new as WeatherReport;
          const distance = calculateDistance(
            latitude, 
            longitude, 
            newReport.latitude, 
            newReport.longitude
          );
          
          if (distance <= radius) {
            fetchUserInfo([newReport]).then(reports => {
              setReports(prev => [...reports, ...prev]);
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [latitude, longitude, radius]);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate bounding box for rough filtering
      const approxLatDegreePerKm = 0.01; // ~1km per 0.01 degree at equator
      const approxLngDegreePerKm = 0.01 / Math.cos(latitude * (Math.PI / 180));
      const latRange = radius * approxLatDegreePerKm;
      const lngRange = radius * approxLngDegreePerKm;
      
      const { data, error } = await supabase
        .from('user_weather_reports')
        .select('*')
        .gte('latitude', latitude - latRange)
        .lte('latitude', latitude + latRange)
        .gte('longitude', longitude - lngRange)
        .lte('longitude', longitude + lngRange)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Further filter by actual distance
      const filteredReports = data.filter(report => {
        const distance = calculateDistance(
          latitude, 
          longitude, 
          report.latitude, 
          report.longitude
        );
        return distance <= radius;
      });
      
      // Get user information
      const reportsWithUserInfo = await fetchUserInfo(filteredReports);
      
      setReports(reportsWithUserInfo);
      
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load community reports');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async (reports: WeatherReport[]) => {
    if (reports.length === 0) return [];
    
    const userIds = [...new Set(reports.map(report => report.user_id))];
    
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
      
      return reports.map(report => ({
        ...report,
        username: userMap.get(report.user_id)?.username || 'Anonymous',
        avatar_url: userMap.get(report.user_id)?.avatar_url
      }));
      
    } catch (error) {
      console.error('Error fetching user info:', error);
      return reports;
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

  const getConditionIcon = (condition: string) => {
    // Could be expanded with more specific icons based on condition
    return <CloudRain className="h-5 w-5" />;
  };

  const handleAccuracyRating = async (reportId: string, isAccurate: boolean) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;
      
      const { error } = await supabase
        .from('weather_accuracy_ratings')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          location_name: report.location_name,
          latitude: report.latitude,
          longitude: report.longitude,
          is_accurate: isAccurate
        });
        
      if (error) throw error;
      
      toast({
        title: "Thanks for your feedback",
        description: `You marked this report as ${isAccurate ? 'accurate' : 'inaccurate'}.`
      });
      
    } catch (error) {
      console.error('Error rating report:', error);
      toast({
        title: "Couldn't submit rating",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleReportAlert = (reportId: string) => {
    // Implementation for reporting inappropriate content
    toast({
      title: "Report submitted",
      description: "Thank you for helping us keep the community safe!"
    });
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
          onClick={fetchReports} 
          className="mt-2 bg-white/10 hover:bg-white/20 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="frost-panel p-4 rounded-2xl text-center">
        <p className="text-white/70">No community reports in this area</p>
      </div>
    );
  }

  return (
    <div className="frost-panel p-4 rounded-2xl">
      <h3 className="text-white text-lg font-medium mb-4">Community Weather Reports</h3>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {reports.map((report) => (
          <div 
            key={report.id} 
            className="p-3 bg-white/5 rounded-xl animate-fade-in hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {report.avatar_url ? (
                  <img 
                    src={report.avatar_url} 
                    alt={report.username} 
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
                    <p className="text-white font-medium line-clamp-1">
                      {report.username || 'Anonymous'}
                    </p>
                    <div className="flex items-center text-white/60 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      <span className="mx-1">•</span>
                      <MapPin className="h-3 w-3 mr-1" />
                      {Math.round(calculateDistance(latitude, longitude, report.latitude, report.longitude))} km away
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="px-2 py-1 text-xs bg-white/10 text-white/80 rounded-full">
                      {report.condition.replace('_', ' ')}
                      {report.intensity && ` - ${report.intensity}`}
                    </div>
                  </div>
                </div>
                
                <p className="mt-2 text-white/80 text-sm">
                  {report.description}
                </p>
                
                {report.photo_url && (
                  <div className="mt-2">
                    <img 
                      src={report.photo_url} 
                      alt="Weather" 
                      className="max-h-48 rounded-lg object-cover"
                    />
                  </div>
                )}
                
                <div className="mt-2 flex justify-between">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 px-2 text-xs bg-white/5 hover:bg-white/10 text-white/70"
                      onClick={() => handleAccuracyRating(report.id, true)}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Accurate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 px-2 text-xs bg-white/5 hover:bg-white/10 text-white/70"
                      onClick={() => handleAccuracyRating(report.id, false)}
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      Inaccurate
                    </Button>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2 text-xs bg-white/5 hover:bg-white/10 text-white/70"
                    onClick={() => handleReportAlert(report.id)}
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityWeatherReports;
