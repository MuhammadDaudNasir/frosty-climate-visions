
import React from 'react';
import { Wind } from 'lucide-react';

interface WindMapWidgetProps {
  windSpeed: number;
  windDirection: string;
  className?: string;
}

const WindMapWidget: React.FC<WindMapWidgetProps> = ({ 
  windSpeed, 
  windDirection, 
  className = "" 
}) => {
  // Get cardinal direction from abbreviation
  const getFullWindDirection = (abbr: string): string => {
    const directions: Record<string, string> = {
      'N': 'North',
      'NNE': 'North-Northeast',
      'NE': 'Northeast',
      'ENE': 'East-Northeast',
      'E': 'East',
      'ESE': 'East-Southeast',
      'SE': 'Southeast',
      'SSE': 'South-Southeast',
      'S': 'South',
      'SSW': 'South-Southwest',
      'SW': 'Southwest',
      'WSW': 'West-Southwest',
      'W': 'West',
      'WNW': 'West-Northwest',
      'NW': 'Northwest',
      'NNW': 'North-Northwest'
    };
    return directions[abbr] || abbr;
  };

  // Get wind intensity description
  const getWindIntensity = (speed: number): string => {
    if (speed < 5) return 'Calm';
    if (speed < 12) return 'Light breeze';
    if (speed < 20) return 'Moderate breeze';
    if (speed < 30) return 'Fresh breeze';
    if (speed < 40) return 'Strong breeze';
    if (speed < 50) return 'Near gale';
    if (speed < 62) return 'Gale';
    if (speed < 75) return 'Strong gale';
    if (speed < 89) return 'Storm';
    return 'Hurricane force';
  };

  const fullDirection = getFullWindDirection(windDirection);
  const intensity = getWindIntensity(windSpeed);

  // Calculate rotation angle for the arrow (north = 0°, east = 90°, etc.)
  const getRotationAngle = (dir: string): number => {
    const directions: Record<string, number> = {
      'N': 0,
      'NNE': 22.5,
      'NE': 45,
      'ENE': 67.5,
      'E': 90,
      'ESE': 112.5,
      'SE': 135,
      'SSE': 157.5,
      'S': 180,
      'SSW': 202.5,
      'SW': 225,
      'WSW': 247.5,
      'W': 270,
      'WNW': 292.5,
      'NW': 315,
      'NNW': 337.5
    };
    return directions[dir] || 0;
  };

  const rotationAngle = getRotationAngle(windDirection);

  return (
    <div className={`frost-panel p-4 rounded-2xl hover-lift transition-all ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-sm font-medium">Wind</h3>
        <Wind size={16} className="text-white/70" />
      </div>
      
      <div className="flex flex-col items-center justify-center my-3">
        <div className="relative h-16 w-16 flex items-center justify-center">
          <div className="absolute border-2 border-white/20 rounded-full h-full w-full"></div>
          {/* Wind direction arrow */}
          <div 
            className="absolute h-12 w-1 bg-blue-400 rounded-full origin-bottom transform" 
            style={{ 
              transform: `rotate(${rotationAngle}deg)`, 
              bottom: '50%' 
            }}
          ></div>
          <div 
            className="absolute w-3 h-3 bg-blue-400 transform rotate-45" 
            style={{ 
              transform: `rotate(${rotationAngle}deg) translateY(-32px) rotate(45deg)`
            }}
          ></div>
          <div className="text-sm text-white/90">
            {windDirection}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-white text-base">{windSpeed} km/h</p>
        <p className="text-white/70 text-xs mt-1">{intensity} from {fullDirection}</p>
      </div>
    </div>
  );
};

export default WindMapWidget;
