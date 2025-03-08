
import React from 'react';
import { WeatherData, getWeatherCondition, getTemperatureColor } from '@/utils/weatherUtils';
import AnimatedIcon from './AnimatedIcon';
import { Wind, Droplets, Thermometer } from 'lucide-react';

interface WeatherCardProps {
  weatherData: WeatherData;
  className?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData, className = "" }) => {
  if (!weatherData) return null;

  const { current, location } = weatherData;
  const weatherCondition = getWeatherCondition(current.condition.code);
  const tempColor = getTemperatureColor(current.temp_c);
  const feelsLikeColor = getTemperatureColor(current.feelslike_c);

  return (
    <div className={`frost-glass p-8 rounded-3xl hover-lift transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="text-white">
          <h2 className="text-3xl font-light frosted-text">{current.condition.text}</h2>
          <p className="text-white/70 text-sm mt-1">Updated just now</p>
        </div>
        <AnimatedIcon 
          condition={weatherCondition} 
          isDay={current.is_day === 1} 
          size={64}
        />
      </div>
      
      <div className="flex items-end space-x-4 mb-8">
        <div className={`text-7xl font-extralight ${tempColor} frosted-text`}>
          {Math.round(current.temp_c)}°
        </div>
        <div className="text-xl text-white/80 pb-2 frosted-text font-light">
          {Math.round(current.temp_f)}°F
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center bg-white/5 p-4 rounded-3xl hover:bg-white/10 transition-colors">
          <Wind size={22} className="text-white/80 mb-3" />
          <div className="text-lg font-light text-white/90">{current.wind_kph} km/h</div>
          <div className="text-xs text-white/60 mt-1">{current.wind_dir}</div>
        </div>
        
        <div className="flex flex-col items-center bg-white/5 p-4 rounded-3xl hover:bg-white/10 transition-colors">
          <Droplets size={22} className="text-white/80 mb-3" />
          <div className="text-lg font-light text-white/90">{current.humidity}%</div>
          <div className="text-xs text-white/60 mt-1">Humidity</div>
        </div>
        
        <div className="flex flex-col items-center bg-white/5 p-4 rounded-3xl hover:bg-white/10 transition-colors">
          <Thermometer size={22} className="text-white/80 mb-3" />
          <div className={`text-lg font-light ${feelsLikeColor}`}>{Math.round(current.feelslike_c)}°</div>
          <div className="text-xs text-white/60 mt-1">Feels like</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
