
import React, { useState } from 'react';
import { Wind, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AirQualityProps {
  airQuality: {
    aqi: number;
    pm10: number;
    pm2_5: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  className?: string;
}

const AirQualityWidget: React.FC<AirQualityProps> = ({ airQuality, className = "" }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get air quality level based on AQI
  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) {
      return { 
        level: 'Good', 
        color: 'text-green-400',
        bgColor: 'bg-green-400',
        description: 'Air quality is satisfactory, and air pollution poses little or no risk.'
      };
    }
    if (aqi <= 100) {
      return { 
        level: 'Moderate', 
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400',
        description: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.'
      };
    }
    if (aqi <= 150) {
      return { 
        level: 'Unhealthy for Sensitive Groups', 
        color: 'text-orange-400',
        bgColor: 'bg-orange-400',
        description: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.'
      };
    }
    if (aqi <= 200) {
      return { 
        level: 'Unhealthy', 
        color: 'text-red-500',
        bgColor: 'bg-red-500',
        description: 'Everyone may begin to experience health effects. Members of sensitive groups may experience more serious health effects.'
      };
    }
    if (aqi <= 300) {
      return { 
        level: 'Very Unhealthy', 
        color: 'text-purple-500',
        bgColor: 'bg-purple-500',
        description: 'Health alert: The risk of health effects is increased for everyone.'
      };
    }
    return { 
      level: 'Hazardous', 
      color: 'text-rose-800',
      bgColor: 'bg-rose-800',
      description: 'Health warning of emergency conditions: everyone is more likely to be affected.'
    };
  };

  const { level, color, bgColor, description } = getAQILevel(airQuality.aqi);

  return (
    <>
      <div 
        className={`frost-panel p-4 rounded-2xl hover-lift transition-all cursor-pointer ${className}`}
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-sm font-medium">Air Quality</h3>
          <Wind size={16} className="text-white/70" />
        </div>
        
        <div className="flex flex-col items-center justify-center my-3">
          <span className={`text-3xl font-medium ${color}`}>{airQuality.aqi}</span>
          <span className={`text-sm font-medium mt-1 ${color}`}>{level}</span>
        </div>
        
        <Progress 
          value={Math.min(100, (airQuality.aqi / 300) * 100)} 
          className="h-1.5 mt-2"
          indicatorClassName={bgColor}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md frost-glass-dark border-white/10 backdrop-blur-xl bg-black/60 animate-blur-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Wind className={color} size={18} />
              <span>Air Quality Index: <span className={color}>{airQuality.aqi} - {level}</span></span>
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Current air quality conditions at your location
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-white">
            <p className="text-sm text-white/80">{description}</p>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Pollutant Levels</h4>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-xs text-white/70">PM2.5</div>
                  <div className="text-xs">{airQuality.pm2_5} μg/m³</div>
                  <Progress value={Math.min(100, (airQuality.pm2_5 / 50) * 100)} className="h-1.5 col-span-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-xs text-white/70">PM10</div>
                  <div className="text-xs">{airQuality.pm10} μg/m³</div>
                  <Progress value={Math.min(100, (airQuality.pm10 / 100) * 100)} className="h-1.5 col-span-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-xs text-white/70">Ozone (O₃)</div>
                  <div className="text-xs">{airQuality.o3} μg/m³</div>
                  <Progress value={Math.min(100, (airQuality.o3 / 120) * 100)} className="h-1.5 col-span-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-xs text-white/70">NO₂</div>
                  <div className="text-xs">{airQuality.no2} μg/m³</div>
                  <Progress value={Math.min(100, (airQuality.no2 / 100) * 100)} className="h-1.5 col-span-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-xs text-white/70">SO₂</div>
                  <div className="text-xs">{airQuality.so2} μg/m³</div>
                  <Progress value={Math.min(100, (airQuality.so2 / 100) * 100)} className="h-1.5 col-span-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-xs text-white/70">CO</div>
                  <div className="text-xs">{airQuality.co} μg/m³</div>
                  <Progress value={Math.min(100, (airQuality.co / 10000) * 100)} className="h-1.5 col-span-2" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Health Recommendations</h4>
              <div className="space-y-2 text-sm text-white/80">
                {level === 'Good' && (
                  <p>Enjoy outdoor activities! Air quality is ideal for most individuals.</p>
                )}
                {level === 'Moderate' && (
                  <p>Unusually sensitive people should consider reducing prolonged or intense outdoor activities.</p>
                )}
                {level === 'Unhealthy for Sensitive Groups' && (
                  <p>Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.</p>
                )}
                {level === 'Unhealthy' && (
                  <p>Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion; everyone else, especially children, should limit prolonged outdoor exertion.</p>
                )}
                {level === 'Very Unhealthy' && (
                  <p>Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion; everyone else, especially children, should limit outdoor exertion.</p>
                )}
                {level === 'Hazardous' && (
                  <p>Everyone should avoid all outdoor exertion.</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AirQualityWidget;
