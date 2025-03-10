
import React, { useState } from 'react';
import { Sun, Calendar, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DailyUVForecast {
  date: string;
  uvIndex: number;
  maxTemp: number;
  condition: string;
  conditionIcon: string;
}

interface UVWeekForecastProps {
  forecast: DailyUVForecast[];
  className?: string;
}

const UVWeekForecast: React.FC<UVWeekForecastProps> = ({ forecast, className = "" }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Get UV Index classification
  const getUVLevel = (uvIndex: number): 
    { level: string; color: string; advice: string } => {
    if (uvIndex <= 2) {
      return { 
        level: 'Low', 
        color: 'text-green-400', 
        advice: 'No protection needed'
      };
    }
    if (uvIndex <= 5) {
      return { 
        level: 'Moderate', 
        color: 'text-yellow-400', 
        advice: 'Wear sunscreen'
      };
    }
    if (uvIndex <= 7) {
      return { 
        level: 'High', 
        color: 'text-orange-400', 
        advice: 'Seek shade during midday'
      };
    }
    if (uvIndex <= 10) {
      return { 
        level: 'Very High', 
        color: 'text-red-500', 
        advice: 'Take extra precautions'
      };
    }
    return { 
      level: 'Extreme', 
      color: 'text-purple-500', 
      advice: 'Avoid sun exposure'
    };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div 
        className={`frost-panel p-4 rounded-2xl hover-lift transition-all cursor-pointer animate-float ${className}`}
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-sm font-medium">UV Forecast</h3>
          <Calendar size={16} className="text-white/70" />
        </div>
        
        <div className="flex items-center gap-3 my-3 overflow-x-auto pb-2 animate-blur-in">
          {forecast.slice(0, 4).map((day, index) => {
            const { level, color } = getUVLevel(day.uvIndex);
            return (
              <div key={index} className="flex flex-col items-center min-w-[60px] group transition-all">
                <div className="text-xs text-white/70 mb-1">{formatDate(day.date).split(' ')[0]}</div>
                <div className={`text-xl font-medium ${color} transition-transform duration-300 group-hover:scale-110`}>
                  {day.uvIndex}
                </div>
                <div className={`text-xs ${color} mb-1`}>{level}</div>
                <img 
                  src={day.conditionIcon} 
                  alt={day.condition} 
                  className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </div>
            );
          })}
        </div>
        
        <p className="text-white/70 text-xs text-center mt-1 animate-fade-in">
          View 7-day UV index forecast
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md frost-glass-dark border-white/10 backdrop-blur-xl bg-black/60 animate-scale-reveal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Sun size={18} className="text-yellow-400" />
              <span>Weekly UV Index Forecast</span>
            </DialogTitle>
            <DialogDescription className="text-white/70">
              UV protection recommendations for the upcoming week
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-white">
            <div className="grid grid-cols-7 gap-1 overflow-x-auto">
              {forecast.map((day, index) => {
                const { level, color, advice } = getUVLevel(day.uvIndex);
                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="text-xs text-white/70">{formatDate(day.date).split(' ')[0]}</div>
                    <div className={`text-2xl font-medium ${color} my-1`}>{day.uvIndex}</div>
                    <div className={`text-xs ${color} mb-1`}>{level}</div>
                    <img 
                      src={day.conditionIcon} 
                      alt={day.condition} 
                      className="w-6 h-6 opacity-70"
                    />
                    <div className="text-xs mt-1">{Math.round(day.maxTemp)}°</div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium mb-2">UV Index Guide</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span>0-2: Low - No protection needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span>3-5: Moderate - Wear sunscreen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <span>6-7: High - Cover up, wear hat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>8-10: Very High - Extra precautions</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>11+: Extreme - Stay indoors during midday</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-white/60 mt-2">
              <Info size={12} />
              <span>UV radiation is highest between 10am and 4pm, even on cloudy days.</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UVWeekForecast;
