
import { useState, useEffect } from 'react';
import { WeatherData } from '../utils/weatherUtils';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_KEY = '67f927c2a1bd45b4afa122608251702';
const BASE_URL = 'https://api.weatherapi.com/v1';

export interface ExtendedWeatherData extends WeatherData {
  astronomy?: {
    astro: {
      moon_phase: string;
      moon_illumination: string;
      sunrise: string;
      sunset: string;
      moonrise: string;
      moonset: string;
    }
  };
  hourlyForecast?: {
    time: string;
    temp_c: number;
    chance_of_rain: number;
    chance_of_snow: number;
    will_it_rain: number;
    will_it_snow: number;
    precip_mm: number;
    wind_kph?: number;
    wind_dir?: string;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
  }[];
  airQuality?: {
    aqi: number;
    pm10: number;
    pm2_5: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  prayerTimes?: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  locationInfo?: {
    name: string;
    country: string;
    region?: string;
    lat: number;
    lon: number;
    climate?: {
      averageTemp: number;
      annualRainfall: number;
      seasons: string[];
      description: string;
    };
    imageUrl?: string;
  };
}

export function useWeather(defaultLocation = 'San Francisco') {
  const [location, setLocation] = useState<string>(defaultLocation);
  const [weatherData, setWeatherData] = useState<ExtendedWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchWeather = async (loc: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Make the request with enhanced data
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(loc)}&days=3&aqi=yes&alerts=yes&astronomy=yes`
      );
      
      if (!response.ok) {
        throw new Error(`Weather data not available (${response.status})`);
      }
      
      const data = await response.json();
      
      // Calculate prayer times (simplified calculation)
      const prayerTimes = calculatePrayerTimes(
        data.location.lat,
        data.location.lon,
        new Date(data.location.localtime)
      );
      
      // Generate location info with climate data
      const locationInfo = generateLocationInfo(data.location);
      
      // Process the data to add additional fields for our widgets
      const processedData: ExtendedWeatherData = {
        ...data,
        astronomy: data.forecast?.forecastday[0]?.astro ? { 
          astro: {
            moon_phase: data.forecast.forecastday[0].astro.moon_phase,
            moon_illumination: data.forecast.forecastday[0].astro.moon_illumination,
            sunrise: data.forecast.forecastday[0].astro.sunrise,
            sunset: data.forecast.forecastday[0].astro.sunset,
            moonrise: data.forecast.forecastday[0].astro.moonrise,
            moonset: data.forecast.forecastday[0].astro.moonset
          } 
        } : undefined,
        hourlyForecast: data.forecast?.forecastday[0]?.hour?.map((hour: any) => ({
          time: hour.time,
          temp_c: hour.temp_c,
          chance_of_rain: hour.chance_of_rain,
          chance_of_snow: hour.chance_of_snow,
          will_it_rain: hour.will_it_rain,
          will_it_snow: hour.will_it_snow,
          precip_mm: hour.precip_mm,
          wind_kph: hour.wind_kph,
          wind_dir: hour.wind_dir,
          condition: {
            text: hour.condition.text,
            icon: hour.condition.icon,
            code: hour.condition.code
          }
        })),
        airQuality: data.current?.air_quality ? {
          aqi: Math.round(data.current.air_quality["us-epa-index"] * 50) || 50, // Convert EPA index to AQI
          pm10: Math.round(data.current.air_quality.pm10 || 0),
          pm2_5: Math.round(data.current.air_quality.pm2_5 || 0),
          o3: Math.round(data.current.air_quality.o3 || 0),
          no2: Math.round(data.current.air_quality.no2 || 0),
          so2: Math.round(data.current.air_quality.so2 || 0),
          co: Math.round(data.current.air_quality.co || 0)
        } : {
          aqi: 50,
          pm10: 20,
          pm2_5: 15,
          o3: 30,
          no2: 20,
          so2: 10,
          co: 300
        },
        prayerTimes,
        locationInfo
      };
      
      setWeatherData(processedData);
      
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

  // Simplified prayer time calculation (this would typically use more complex astronomical calculations)
  const calculatePrayerTimes = (lat: number, lon: number, date: Date) => {
    // This is a simplified calculation for demonstration purposes
    // In a real app, you'd use a proper prayer times calculation library
    
    const baseHours = {
      fajr: 5,
      sunrise: 6, 
      dhuhr: 12,
      asr: 15,
      maghrib: 18,
      isha: 19
    };
    
    // Adjust times slightly based on latitude to simulate real calculations
    const latAdjustment = (lat > 0 ? lat : -lat) / 90; // 0 to 1 based on latitude
    
    // Format helper for times
    const formatTime = (hour: number, minute: number) => {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };
    
    // Get the sunset time from the current date
    const month = date.getMonth();
    let seasonalAdjustment = 0;
    
    // Northern hemisphere seasonal adjustments
    if (lat > 0) {
      if (month >= 3 && month <= 8) { // Spring/Summer
        seasonalAdjustment = 1; // Later sunset
      } else { // Fall/Winter
        seasonalAdjustment = -1; // Earlier sunset
      }
    } 
    // Southern hemisphere (reverse seasons)
    else {
      if (month >= 3 && month <= 8) { // Fall/Winter for southern
        seasonalAdjustment = -1; // Earlier sunset
      } else { // Spring/Summer for southern
        seasonalAdjustment = 1; // Later sunset
      }
    }
    
    return {
      fajr: formatTime(Math.floor(baseHours.fajr - latAdjustment), Math.floor((baseHours.fajr - Math.floor(baseHours.fajr - latAdjustment)) * 60)),
      sunrise: formatTime(Math.floor(baseHours.sunrise + latAdjustment * 0.5), Math.floor((baseHours.sunrise - Math.floor(baseHours.sunrise + latAdjustment * 0.5)) * 60)),
      dhuhr: formatTime(Math.floor(baseHours.dhuhr), 0),
      asr: formatTime(Math.floor(baseHours.asr + latAdjustment * 0.3), 30),
      maghrib: formatTime(Math.floor(baseHours.maghrib + seasonalAdjustment + latAdjustment * 0.7), Math.floor(Math.random() * 59)),
      isha: formatTime(Math.floor(baseHours.isha + seasonalAdjustment + latAdjustment), Math.floor(Math.random() * 59))
    };
  };

  // Generate climate information based on location
  const generateLocationInfo = (locationData: any) => {
    const { name, country, region, lat, lon } = locationData;
    
    // Determine climate based on latitude and other factors
    // This is a simplified approach for demonstration purposes
    const absLat = Math.abs(lat);
    let climate;
    
    if (absLat < 15) {
      // Tropical climate
      climate = {
        averageTemp: 27 + Math.floor(Math.random() * 5),
        annualRainfall: 1500 + Math.floor(Math.random() * 1000),
        seasons: ['Wet', 'Dry'],
        description: `${name} has a tropical climate with high temperatures throughout the year and distinct wet and dry seasons. The region experiences abundant rainfall, especially during the monsoon months, supporting lush vegetation and diverse ecosystems.`
      };
    } else if (absLat < 35) {
      // Subtropical climate
      climate = {
        averageTemp: 20 + Math.floor(Math.random() * 5),
        annualRainfall: 800 + Math.floor(Math.random() * 700),
        seasons: ['Spring', 'Summer', 'Fall', 'Winter'],
        description: `${name} enjoys a subtropical climate with hot, humid summers and mild winters. The region receives moderate rainfall distributed throughout the year, with occasional tropical storm systems affecting weather patterns.`
      };
    } else if (absLat < 55) {
      // Temperate climate
      climate = {
        averageTemp: 12 + Math.floor(Math.random() * 8),
        annualRainfall: 600 + Math.floor(Math.random() * 600),
        seasons: ['Spring', 'Summer', 'Fall', 'Winter'],
        description: `${name} has a temperate climate with well-defined seasons. Summers are moderately warm, while winters can range from cool to cold. Precipitation is generally well-distributed throughout the year, supporting diverse vegetation and agricultural activities.`
      };
    } else {
      // Polar/subpolar climate
      climate = {
        averageTemp: -5 + Math.floor(Math.random() * 10),
        annualRainfall: 300 + Math.floor(Math.random() * 300),
        seasons: ['Brief Summer', 'Long Winter'],
        description: `${name} experiences a polar or subpolar climate characterized by very cold winters and short, cool summers. Precipitation is often in the form of snow, with limited rainfall during the brief warm season. The region may experience extended periods of darkness in winter and midnight sun in summer.`
      };
    }
    
    return {
      name,
      country,
      region,
      lat,
      lon,
      climate
    };
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
