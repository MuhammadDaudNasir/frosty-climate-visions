
import { useState, useEffect } from 'react';
import { WeatherData } from '../utils/weatherUtils';
import { toast } from '@/components/ui/use-toast';

const API_KEY = '67f927c2a1bd45b4afa122608251702';
const BASE_URL = 'https://api.weatherapi.com/v1';

export function useWeather(defaultLocation = 'San Francisco') {
  const [location, setLocation] = useState<string>(defaultLocation);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (loc: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(loc)}&days=3&aqi=no&alerts=no`
      );
      
      if (!response.ok) {
        throw new Error(`Weather data not available (${response.status})`);
      }
      
      const data = await response.json();
      setWeatherData(data);
      
      // Save the last successful location to localStorage
      localStorage.setItem('lastLocation', loc);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const changeLocation = (newLocation: string) => {
    setLocation(newLocation);
    fetchWeather(newLocation);
  };

  useEffect(() => {
    // Try to get the last location from localStorage
    const savedLocation = localStorage.getItem('lastLocation');
    const initialLocation = savedLocation || defaultLocation;
    
    setLocation(initialLocation);
    fetchWeather(initialLocation);
    
    // Set up interval to refresh data every 30 minutes
    const intervalId = setInterval(() => {
      fetchWeather(location);
    }, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [defaultLocation]);

  return {
    weatherData,
    loading,
    error,
    location,
    changeLocation,
    refreshWeather: () => fetchWeather(location)
  };
}
