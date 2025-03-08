
import React, { useState } from 'react';
import { Clock, SunsetIcon, Moon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PrayerTimesProps {
  prayerTimes: {
    maghrib: string;
    fajr?: string;
    sunrise?: string;
    dhuhr?: string;
    asr?: string;
    isha?: string;
  };
  className?: string;
}

const PrayerTimesWidget: React.FC<PrayerTimesProps> = ({ prayerTimes, className = "" }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Helper function to format time from "HH:MM" to "H:MM AM/PM"
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${minutes} ${ampm}`;
  };

  // Calculate time until maghrib
  const getTimeUntilMaghrib = () => {
    const now = new Date();
    const [hours, minutes] = prayerTimes.maghrib.split(':');
    const maghribTime = new Date();
    maghribTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    
    // If maghrib has already passed today, set for tomorrow
    if (now > maghribTime) {
      maghribTime.setDate(maghribTime.getDate() + 1);
    }
    
    const diffMs = maghribTime.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <>
      <div 
        className={`frost-panel p-4 rounded-2xl hover-lift transition-all cursor-pointer ${className}`}
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-sm font-medium">Maghrib Time</h3>
          <SunsetIcon size={16} className="text-white/70" />
        </div>
        
        <div className="flex flex-col items-center justify-center my-3">
          <span className="text-2xl font-medium text-amber-400">{formatTime(prayerTimes.maghrib)}</span>
          <span className="text-sm mt-1 text-white/80">Fast breaking time</span>
        </div>
        
        <p className="text-white/70 text-xs text-center mt-1">
          Time until Maghrib: {getTimeUntilMaghrib()}
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md frost-glass-dark border-white/10 backdrop-blur-xl bg-black/60 animate-blur-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Clock className="text-amber-400" size={18} />
              <span>Prayer Times</span>
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Islamic prayer times for your current location
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-white">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Fajr</span>
                </div>
                <div className="text-sm text-right">{prayerTimes.fajr ? formatTime(prayerTimes.fajr) : 'N/A'}</div>
                
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                  <span className="text-sm">Sunrise</span>
                </div>
                <div className="text-sm text-right">{prayerTimes.sunrise ? formatTime(prayerTimes.sunrise) : 'N/A'}</div>
                
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm">Dhuhr</span>
                </div>
                <div className="text-sm text-right">{prayerTimes.dhuhr ? formatTime(prayerTimes.dhuhr) : 'N/A'}</div>
                
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Asr</span>
                </div>
                <div className="text-sm text-right">{prayerTimes.asr ? formatTime(prayerTimes.asr) : 'N/A'}</div>
                
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="text-sm font-medium">Maghrib</span>
                </div>
                <div className="text-sm text-right font-medium">{formatTime(prayerTimes.maghrib)}</div>
                
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                  <span className="text-sm">Isha</span>
                </div>
                <div className="text-sm text-right">{prayerTimes.isha ? formatTime(prayerTimes.isha) : 'N/A'}</div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <SunsetIcon size={16} className="text-amber-400" />
                  <span className="text-sm font-medium">Maghrib (Fast Breaking Time)</span>
                </div>
                <p className="text-sm text-white/80">Maghrib prayer time marks the end of the fasting day during Ramadan. It occurs at sunset when the fast is broken (Iftar).</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Moon size={14} className="text-white/70" />
                <span>Prayer Time Calculation</span>
              </h4>
              <p className="text-xs text-white/70">
                Prayer times are calculated based on the position of the sun and geographical coordinates of your location. 
                Times may vary depending on calculation methods and adjustments for different regions.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrayerTimesWidget;
