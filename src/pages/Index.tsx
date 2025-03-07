
import React, { useState, useEffect } from 'react';
import WeatherBackground from '@/components/WeatherBackground';
import WeatherCard from '@/components/WeatherCard';
import TimeDisplay from '@/components/TimeDisplay';
import LocationSelector from '@/components/LocationSelector';
import { useWeather } from '@/hooks/useWeather';
import { getWeatherCondition } from '@/utils/weatherUtils';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { weatherData, loading, error, location, changeLocation } = useWeather();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (weatherData) {
      setIsInitialLoad(false);
    }
  }, [weatherData]);
  
  // Early return for initial loading state with nice loading animation
  if (isInitialLoad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="animate-pulse-subtle">
          <div className="text-white text-2xl mb-6 font-light">Climate Vision</div>
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
          <div className="text-white/60 text-sm mt-6">Loading weather data...</div>
        </div>
      </div>
    );
  }
  
  // Safeguard for when weather data is not yet available
  if (!weatherData) {
    return null;
  }
  
  const weatherCondition = getWeatherCondition(weatherData.current.condition.code);
  const isDay = weatherData.current.is_day === 1;
  
  // Calculate appropriate greeting based on the time
  const currentHour = new Date(weatherData.location.localtime).getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
  }

  return (
    <WeatherBackground condition={weatherCondition} isDay={isDay}>
      <div className="min-h-screen container mx-auto px-4 py-8 flex flex-col max-w-4xl">
        {/* Header section with location and time */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 animate-slide-down">
          <div className="flex items-center">
            <h1 className="text-2xl font-light text-white frosted-text">Climate Vision</h1>
          </div>
          <LocationSelector 
            currentLocation={location} 
            onLocationChange={changeLocation} 
          />
        </header>
        
        {/* Main content area */}
        <main className="flex-1 flex flex-col items-center justify-center gap-10">
          <div className="w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <TimeDisplay className="mb-8" />
            <h2 className="text-3xl text-center font-light text-white frosted-text mb-2">
              {greeting}, <span className="font-normal">{weatherData.location.name}</span>
            </h2>
            <p className="text-center text-white/70">
              {weatherData.location.region && `${weatherData.location.region}, `}{weatherData.location.country}
            </p>
          </div>
          
          <div className="w-full max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <WeatherCard weatherData={weatherData} />
          </div>
          
          {/* Forecast preview */}
          {weatherData.forecast && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {weatherData.forecast.forecastday.slice(0, 3).map((day) => (
                <div key={day.date} className="frost-panel p-4 rounded-2xl hover-lift transition-all">
                  <div className="text-white text-center mb-2">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  <div className="flex items-center justify-center">
                    <img 
                      src={day.day.condition.icon.replace('64x64', '128x128')} 
                      alt={day.day.condition.text} 
                      className="w-12 h-12"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex justify-center gap-4 text-white mt-2">
                    <span className="font-medium">{Math.round(day.day.maxtemp_c)}°</span>
                    <span className="text-white/60">{Math.round(day.day.mintemp_c)}°</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        
        {/* Footer with Powered by Pineapple and copyright */}
        <footer className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="text-white/40 text-xs mb-1">Data provided by WeatherAPI.com</p>
          <p className="text-white/30 text-[10px] mb-1">Powered by Pineapple</p>
          <p className="text-white/40 text-xs">© 2025 Climate Vision. All rights reserved.</p>
        </footer>
      </div>
    </WeatherBackground>
  );
};

export default Index;
