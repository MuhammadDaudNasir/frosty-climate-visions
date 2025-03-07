
import React, { useState } from 'react';
import { CloudRain } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface PrecipitationWidgetProps {
  precipitationData: {
    chance: number;
    amount: number;
    type?: 'rain' | 'snow' | 'none';
  };
  hourlyForecast?: {
    time: string;
    chance_of_rain: number;
    chance_of_snow: number;
    precip_mm: number;
  }[];
  className?: string;
}

const PrecipitationWidget: React.FC<PrecipitationWidgetProps> = ({ 
  precipitationData, 
  hourlyForecast = [],
  className = "" 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
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

  // Get detailed description based on type and amount
  const getDetailedDescription = () => {
    if (type === 'none' || chance === 0) {
      return 'Clear conditions are expected with no precipitation in the forecast.';
    }
    
    if (type === 'snow') {
      if (amount < 1) return 'Light snow flurries possible.';
      if (amount < 5) return 'Moderate snowfall expected.';
      return 'Heavy snowfall expected.';
    }
    
    // Rain descriptions
    if (amount < 0.5) return 'Very light rain or drizzle possible.';
    if (amount < 2) return 'Light rain showers expected.';
    if (amount < 5) return 'Moderate rainfall expected.';
    if (amount < 10) return 'Heavy rainfall expected.';
    return 'Very heavy rainfall or potential flooding conditions.';
  };

  // Format time for hourly forecast
  const formatHourTime = (timeStr: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate the next 6 hours of precipitation forecast
  const getHourlyForecast = () => {
    if (!hourlyForecast || hourlyForecast.length === 0) return [];
    
    const now = new Date();
    const currentHour = now.getHours();
    
    return hourlyForecast
      .filter(hour => {
        const hourTime = new Date(hour.time);
        return hourTime.getHours() >= currentHour;
      })
      .slice(0, 6);
  };

  const nextHoursForecast = getHourlyForecast();
  
  return (
    <>
      <div 
        className={`frost-panel p-4 rounded-2xl hover-lift transition-all cursor-pointer ${className}`}
        onClick={() => setDialogOpen(true)}
      >
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CloudRain size={18} />
              <span>Precipitation Forecast</span>
            </DialogTitle>
            <DialogDescription>
              Current and upcoming precipitation information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="text-5xl">{getIcon()}</div>
              <div>
                <h3 className="text-lg font-medium">{chance}% Chance</h3>
                <p className="text-sm text-muted-foreground">{getDescription()}</p>
                {amount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {amount} mm expected {type === 'snow' ? '(snowfall)' : ''}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Forecast Details</h4>
              <p className="text-sm">{getDetailedDescription()}</p>
            </div>
            
            {nextHoursForecast.length > 0 && (
              <div className="space-y-3 pt-2 border-t">
                <h4 className="font-medium text-sm">Next Hours</h4>
                {nextHoursForecast.map((hour, index) => {
                  const hourChance = Math.max(hour.chance_of_rain, hour.chance_of_snow);
                  const isSnow = hour.chance_of_snow > hour.chance_of_rain;
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span>{formatHourTime(hour.time)}</span>
                        <span className="flex items-center gap-1">
                          {isSnow ? '❄️' : '💧'} {hourChance}%
                        </span>
                      </div>
                      <Progress value={hourChance} className="h-1" />
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="space-y-2 pt-2 border-t">
              <h4 className="font-medium text-sm">Precipitation Scale</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌦️</span>
                  <span>Light (0-1mm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌧️</span>
                  <span>Moderate (1-5mm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⛈️</span>
                  <span>Heavy (5mm+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">❄️</span>
                  <span>Snow</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrecipitationWidget;
