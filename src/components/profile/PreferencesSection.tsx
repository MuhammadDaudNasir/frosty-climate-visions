
import React, { useState } from 'react';
import { Settings, Wind, ThermometerSun, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserProfile, UserPreferences } from '@/types/auth';

interface PreferencesSectionProps {
  profile: UserProfile | null;
  onSavePreferences: (preferences: UserPreferences) => Promise<void>;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({ profile, onSavePreferences }) => {
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<UserPreferences>(
    profile?.preferences || {
      unit: 'metric',
      wind_speed: 'km/h',
      dark_mode: false,
      temperature_unit: 'celsius'
    }
  );

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      await onSavePreferences(tempPreferences);
      setIsEditingPreferences(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditingPreferences) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl text-white font-medium text-center">Preferences</h3>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-white text-sm font-medium flex items-center">
              <ThermometerSun className="h-4 w-4 mr-2" />
              Temperature Unit
            </h4>
            <RadioGroup 
              value={tempPreferences.unit} 
              onValueChange={(value) => setTempPreferences({
                ...tempPreferences,
                unit: value as 'metric' | 'imperial',
                temperature_unit: value === 'metric' ? 'celsius' : 'fahrenheit'
              })}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metric" id="metric" />
                <Label htmlFor="metric" className="text-white/90">Metric (°C)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperial" id="imperial" />
                <Label htmlFor="imperial" className="text-white/90">Imperial (°F)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-white text-sm font-medium flex items-center">
              <Wind className="h-4 w-4 mr-2" />
              Wind Speed Format
            </h4>
            <RadioGroup 
              value={tempPreferences.wind_speed} 
              onValueChange={(value) => setTempPreferences({
                ...tempPreferences,
                wind_speed: value as 'km/h' | 'mph' | 'm/s'
              })}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="km/h" id="kmh" />
                <Label htmlFor="kmh" className="text-white/90">Kilometers per hour (km/h)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mph" id="mph" />
                <Label htmlFor="mph" className="text-white/90">Miles per hour (mph)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="m/s" id="ms" />
                <Label htmlFor="ms" className="text-white/90">Meters per second (m/s)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-white text-sm font-medium flex items-center">
                {tempPreferences.dark_mode ? (
                  <Moon className="h-4 w-4 mr-2" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" />
                )}
                Dark Mode
              </div>
            </div>
            <Switch 
              checked={tempPreferences.dark_mode}
              onCheckedChange={(enabled) => setTempPreferences({
                ...tempPreferences,
                dark_mode: enabled
              })}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setIsEditingPreferences(false);
              setTempPreferences(profile?.preferences || {
                unit: 'metric',
                wind_speed: 'km/h',
                dark_mode: false,
                temperature_unit: 'celsius'
              });
            }}
            className="bg-white/10 hover:bg-white/20 text-white"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePreferences}
            className="bg-white/20 hover:bg-white/30 text-white"
            disabled={isLoading}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
        <div className="flex items-center">
          <ThermometerSun className="h-4 w-4 mr-2 text-white/70" />
          <span className="text-white">Temperature Unit</span>
        </div>
        <div className="text-white/80 bg-white/10 px-3 py-1 rounded-full text-sm">
          {profile?.preferences.unit === 'metric' ? 'Metric (°C)' : 'Imperial (°F)'}
        </div>
      </div>
      
      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
        <div className="flex items-center">
          <Wind className="h-4 w-4 mr-2 text-white/70" />
          <span className="text-white">Wind Speed</span>
        </div>
        <div className="text-white/80 bg-white/10 px-3 py-1 rounded-full text-sm">
          {profile?.preferences.wind_speed}
        </div>
      </div>
      
      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
        <div className="flex items-center">
          {profile?.preferences.dark_mode ? (
            <Moon className="h-4 w-4 mr-2 text-white/70" />
          ) : (
            <Sun className="h-4 w-4 mr-2 text-white/70" />
          )}
          <span className="text-white">Theme</span>
        </div>
        <div className="text-white/80 bg-white/10 px-3 py-1 rounded-full text-sm">
          {profile?.preferences.dark_mode ? 'Dark Mode' : 'Light Mode'}
        </div>
      </div>
      
      <Button
        variant="ghost"
        onClick={() => setIsEditingPreferences(true)}
        className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white"
      >
        <Settings className="h-4 w-4 mr-2" />
        Edit Preferences
      </Button>
    </div>
  );
};

export default PreferencesSection;
