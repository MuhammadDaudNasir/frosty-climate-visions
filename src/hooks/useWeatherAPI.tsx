
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Define the structure of prayer times
interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

// Define weather alert interface
interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'moderate' | 'severe' | 'extreme';
  time: string;
  expires: string;
}

export function useWeatherAPI() {
  const { userPreferences } = useAuth();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isLoadingPrayers, setIsLoadingPrayers] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [prayerError, setPrayerError] = useState<string | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  // Convert temperature based on user preferences
  const convertTemperature = (celsiusTemp: number): number => {
    if (userPreferences.units === 'imperial') {
      return celsiusTemp * 9/5 + 32;
    }
    return celsiusTemp;
  };

  // Format temperature with the right unit
  const formatTemperature = (celsiusTemp: number): string => {
    const temp = convertTemperature(celsiusTemp);
    const unit = userPreferences.units === 'imperial' ? '°F' : '°C';
    return `${Math.round(temp)}${unit}`;
  };

  // Convert wind speed based on user preferences
  const convertWindSpeed = (kphSpeed: number): number => {
    switch (userPreferences.windSpeedFormat) {
      case 'mph':
        return kphSpeed * 0.621371;
      case 'm/s':
        return kphSpeed * 0.277778;
      default:
        return kphSpeed;
    }
  };

  // Format wind speed with the right unit
  const formatWindSpeed = (kphSpeed: number): string => {
    const speed = convertWindSpeed(kphSpeed);
    return `${Math.round(speed)} ${userPreferences.windSpeedFormat}`;
  };

  // Fetch accurate prayer times based on coordinates
  const fetchPrayerTimes = async (latitude: number, longitude: number, date: string): Promise<PrayerTimes | null> => {
    if (!latitude || !longitude) return null;
    
    setIsLoadingPrayers(true);
    setPrayerError(null);
    
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=2`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prayer times: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 200 && data.data && data.data.timings) {
        const prayerTimesData: PrayerTimes = {
          Fajr: data.data.timings.Fajr,
          Sunrise: data.data.timings.Sunrise,
          Dhuhr: data.data.timings.Dhuhr,
          Asr: data.data.timings.Asr,
          Maghrib: data.data.timings.Maghrib,
          Isha: data.data.timings.Isha
        };
        
        setPrayerTimes(prayerTimesData);
        return prayerTimesData;
      } else {
        throw new Error('Invalid prayer times data format');
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setPrayerError(error instanceof Error ? error.message : 'Unknown error');
      return null;
    } finally {
      setIsLoadingPrayers(false);
    }
  };

  // Fetch weather alerts for a location
  const fetchWeatherAlerts = async (latitude: number, longitude: number): Promise<WeatherAlert[]> => {
    if (!latitude || !longitude || !userPreferences.notificationsEnabled) return [];
    
    setIsLoadingAlerts(true);
    setAlertsError(null);
    
    try {
      // This is just a placeholder - in a real app, you'd use a weather alerts API
      // For now, we'll simulate alerts based on random conditions
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate random alerts (in a real app, this would come from an API)
      const randomSeverity = Math.floor(Math.random() * 3);
      const severity = randomSeverity === 0 ? 'moderate' : randomSeverity === 1 ? 'severe' : 'extreme';
      
      const currentDate = new Date();
      const expiresDate = new Date(currentDate.getTime() + (3 * 60 * 60 * 1000)); // 3 hours later
      
      // 30% chance of having an alert
      if (Math.random() < 0.3) {
        const alerts: WeatherAlert[] = [{
          id: `alert-${Date.now()}`,
          title: severity === 'extreme' ? 'Severe Weather Warning' : 'Weather Advisory',
          description: severity === 'extreme' 
            ? 'Dangerous weather conditions expected. Take precautions immediately.' 
            : 'Potential weather hazards in your area. Stay informed.',
          severity: severity as 'moderate' | 'severe' | 'extreme',
          time: currentDate.toISOString(),
          expires: expiresDate.toISOString()
        }];
        
        // Show toast for new alerts
        if (alerts.length > 0) {
          toast({
            title: alerts[0].title,
            description: alerts[0].description,
            variant: severity === 'extreme' ? 'destructive' : 'default'
          });
        }
        
        setWeatherAlerts(alerts);
        return alerts;
      }
      
      setWeatherAlerts([]);
      return [];
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      setAlertsError(error instanceof Error ? error.message : 'Unknown error');
      return [];
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  return {
    convertTemperature,
    formatTemperature,
    convertWindSpeed,
    formatWindSpeed,
    fetchPrayerTimes,
    fetchWeatherAlerts,
    prayerTimes,
    weatherAlerts,
    isLoadingPrayers,
    isLoadingAlerts,
    prayerError,
    alertsError
  };
}
