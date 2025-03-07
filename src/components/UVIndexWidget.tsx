
import React from 'react';
import { Sun } from 'lucide-react';

interface UVIndexWidgetProps {
  uvIndex: number;
  className?: string;
}

const UVIndexWidget: React.FC<UVIndexWidgetProps> = ({ uvIndex, className = "" }) => {
  // Get UV Index classification
  const getUVLevel = (uvIndex: number): 
    { level: string; color: string; advice: string } => {
    if (uvIndex <= 2) {
      return { 
        level: 'Low', 
        color: 'text-green-400', 
        advice: 'No protection needed for most people'
      };
    }
    if (uvIndex <= 5) {
      return { 
        level: 'Moderate', 
        color: 'text-yellow-400', 
        advice: 'Wear sunscreen and sunglasses'
      };
    }
    if (uvIndex <= 7) {
      return { 
        level: 'High', 
        color: 'text-orange-400', 
        advice: 'Reduce time in the sun from 10am to 4pm'
      };
    }
    if (uvIndex <= 10) {
      return { 
        level: 'Very High', 
        color: 'text-red-500', 
        advice: 'Take extra precautions, seek shade'
      };
    }
    return { 
      level: 'Extreme', 
      color: 'text-purple-500', 
      advice: 'Avoid being outside during midday hours'
    };
  };

  const { level, color, advice } = getUVLevel(uvIndex);

  return (
    <div className={`frost-panel p-4 rounded-2xl hover-lift transition-all ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-sm font-medium">UV Index</h3>
        <Sun size={16} className="text-white/70" />
      </div>
      
      <div className="flex flex-col items-center justify-center my-3">
        <span className={`text-3xl font-medium ${color}`}>{uvIndex}</span>
        <span className={`text-sm font-medium mt-1 ${color}`}>{level}</span>
      </div>
      
      <p className="text-white/70 text-xs text-center mt-1">{advice}</p>
    </div>
  );
};

export default UVIndexWidget;
