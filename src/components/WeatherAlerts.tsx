
import React, { useState, useEffect } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { AlertTriangle, Bell, BellOff, Wind, Droplets, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

const WeatherAlerts: React.FC = () => {
  const { weatherData } = useWeather();
  const [notifications, setNotifications] = useState<boolean>(false);
  const [alertsEnabled, setAlertsEnabled] = useState({
    temperature: true,
    wind: true,
    precipitation: true,
    uv: true
  });
  const [showAlertBadge, setShowAlertBadge] = useState(false);
  
  // Check if there are any notable conditions to alert about
  useEffect(() => {
    if (!weatherData) return;
    
    const checkForAlerts = () => {
      const alerts = [];
      
      // Temperature alerts (extreme heat or cold)
      if (alertsEnabled.temperature) {
        if (weatherData.current.temp_c > 35) {
          alerts.push('Extreme heat warning');
        } else if (weatherData.current.temp_c < 0) {
          alerts.push('Freezing conditions');
        }
      }
      
      // Wind alerts
      if (alertsEnabled.wind && weatherData.current.wind_kph > 40) {
        alerts.push('Strong winds');
      }
      
      // Precipitation alerts
      if (alertsEnabled.precipitation) {
        const currentHour = new Date(weatherData.location.localtime).getHours();
        const hourlyData = weatherData.hourlyForecast?.[currentHour];
        
        if (hourlyData?.chance_of_rain > 70 || hourlyData?.chance_of_snow > 70) {
          alerts.push('High precipitation probability');
        }
      }
      
      // UV alerts
      if (alertsEnabled.uv && weatherData.current.uv > 7) {
        alerts.push('High UV index');
      }
      
      if (alerts.length > 0 && notifications) {
        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Weather Alert', {
            body: alerts.join(', '),
            icon: '/icons/icon-192x192.png'
          });
        }
        
        // Show UI indicator
        setShowAlertBadge(true);
        
        // Show toast
        toast({
          title: "Weather Alert",
          description: alerts.join(', '),
          variant: "destructive",
        });
      }
    };
    
    checkForAlerts();
  }, [weatherData, alertsEnabled, notifications]);
  
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
      });
      return;
    }
    
    if (Notification.permission === 'granted') {
      setNotifications(true);
      return;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifications(true);
        toast({
          title: "Notifications enabled",
          description: "You'll receive alerts for important weather events",
        });
      }
    }
  };
  
  return (
    <div className="frost-panel p-4 rounded-2xl relative animate-blur-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-sm font-medium flex items-center gap-2">
          <AlertTriangle size={16} className="text-white/70" />
          Weather Alerts
          {showAlertBadge && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (notifications) {
              setNotifications(false);
              toast({
                title: "Notifications disabled",
                description: "You won't receive weather alerts",
              });
            } else {
              requestNotificationPermission();
            }
          }}
          className="text-white bg-white/10 hover:bg-white/20 h-8 w-8 p-0 rounded-full"
        >
          {notifications ? <BellOff size={16} /> : <Bell size={16} />}
        </Button>
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <div className="grid grid-cols-2 gap-2 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center">
              <Thermometer size={18} className={alertsEnabled.temperature ? "text-blue-400" : "text-white/40"} />
              <span className="text-xs mt-1 text-white/70">Temperature</span>
            </div>
            <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center">
              <Wind size={18} className={alertsEnabled.wind ? "text-blue-400" : "text-white/40"} />
              <span className="text-xs mt-1 text-white/70">Wind</span>
            </div>
            <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center">
              <Droplets size={18} className={alertsEnabled.precipitation ? "text-blue-400" : "text-white/40"} />
              <span className="text-xs mt-1 text-white/70">Precipitation</span>
            </div>
            <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center">
              <AlertTriangle size={18} className={alertsEnabled.uv ? "text-blue-400" : "text-white/40"} />
              <span className="text-xs mt-1 text-white/70">UV Index</span>
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md frost-glass-dark border-white/10 backdrop-blur-xl bg-black/60">
          <DialogHeader>
            <DialogTitle className="text-white">Weather Alert Settings</DialogTitle>
            <DialogDescription className="text-white/70">
              Configure which weather conditions you want to be alerted about
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Enable Notifications</Label>
                <p className="text-xs text-white/60">
                  Receive browser notifications about important weather events
                </p>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={(checked) => {
                  if (checked) {
                    requestNotificationPermission();
                  } else {
                    setNotifications(false);
                  }
                }} 
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium text-white">Alert Types</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer size={18} className="text-blue-400" />
                  <Label className="text-white">Temperature Alerts</Label>
                </div>
                <Switch 
                  checked={alertsEnabled.temperature} 
                  onCheckedChange={(checked) => {
                    setAlertsEnabled(prev => ({ ...prev, temperature: checked }));
                  }} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wind size={18} className="text-blue-400" />
                  <Label className="text-white">Wind Alerts</Label>
                </div>
                <Switch 
                  checked={alertsEnabled.wind} 
                  onCheckedChange={(checked) => {
                    setAlertsEnabled(prev => ({ ...prev, wind: checked }));
                  }} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets size={18} className="text-blue-400" />
                  <Label className="text-white">Precipitation Alerts</Label>
                </div>
                <Switch 
                  checked={alertsEnabled.precipitation} 
                  onCheckedChange={(checked) => {
                    setAlertsEnabled(prev => ({ ...prev, precipitation: checked }));
                  }} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle size={18} className="text-blue-400" />
                  <Label className="text-white">UV Index Alerts</Label>
                </div>
                <Switch 
                  checked={alertsEnabled.uv} 
                  onCheckedChange={(checked) => {
                    setAlertsEnabled(prev => ({ ...prev, uv: checked }));
                  }} 
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <p className="text-white/60 text-xs text-center mt-2">
        {notifications ? "Alerts enabled" : "Enable alerts for important updates"}
      </p>
    </div>
  );
};

export default WeatherAlerts;
