
import React from 'react';
import { CloudRain } from 'lucide-react';

interface PrecipitationWidgetProps {
  precipitationData: {
    chance: number;
    amount: number;
    type?: 'rain' | 'snow' | 'none';
  };
  className?: string;
}

const PrecipitationWidget: React.FC<PrecipitationWidgetProps> = ({ 
  precipitationData, 
  className = "" 
}) => {
  const { chance, amount, type = 'rain' } = precipitationData;
  
  // Get icon based on precipitation type
  const getIcon = () => {
    if (type === 'none' || chance === 0) return '☀️';
    if (type === 'snow') return '❄️';
    
    // Rain icon - could be light, moderate or heavy based on amount
    if (amount < 1) return '🌦️';
    if (amount < 5) return '🌧️';
    return '⛈️';
  };
  
  // Get description text
  const getDescription = () => {
    if (type === 'none' || chance === 0) return 'No precipitation expected';
    if (chance < 30) return 'Low chance of precipitation';
    if (chance < 70) return 'Moderate chance of precipitation';
    return 'High chance of precipitation';
  };
  
  return (
    <div className={`frost-panel p-4 rounded-2xl hover-lift transition-all ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-sm font-medium">Precipitation</h3>
        <CloudRain size={16} className="text-white/70" />
      </div>
      
      <div className="flex items-center justify-center my-3">
        <span className="text-4xl">{getIcon()}</span>
      </div>
      
      <div className="text-center">
        <p className="text-white text-base">{chance}% chance</p>
        <p className="text-white/70 text-xs mt-1">{getDescription()}</p>
        {amount > 0 && (
          <p className="text-white/70 text-xs mt-1">
            Expected: {amount} mm {type === 'snow' ? '(snow)' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default PrecipitationWidget;
