
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle, Send } from 'lucide-react';

interface WeatherAlertFormProps {
  location: string;
  latitude: number;
  longitude: number;
  onAlertSubmitted?: () => void;
}

const WeatherAlertForm: React.FC<WeatherAlertFormProps> = ({
  location,
  latitude,
  longitude,
  onAlertSubmitted
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [description, setDescription] = useState('');

  if (!user) {
    return (
      <div className="text-center p-4 bg-white/5 backdrop-blur-md rounded-xl">
        <p className="text-white/80">Sign in to report weather alerts</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alertType || !severity || !description) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('local_weather_alerts')
        .insert({
          user_id: user.id,
          location_name: location,
          latitude,
          longitude,
          alert_type: alertType,
          severity,
          description
        });
        
      if (error) throw error;
      
      // Success
      toast({
        title: "Weather alert submitted",
        description: "Thank you for alerting the community!",
      });
      
      // Reset form
      setAlertType('');
      setSeverity('moderate');
      setDescription('');
      
      // Callback
      if (onAlertSubmitted) {
        onAlertSubmitted();
      }
      
    } catch (error) {
      console.error('Error submitting weather alert:', error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 frost-panel p-5 rounded-2xl animate-fade-in">
      <h3 className="text-white text-lg font-medium mb-4 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-white/80" />
        Report Local Weather Alert
      </h3>
      
      <div className="space-y-2">
        <label className="text-white/80 text-sm">Alert Type</label>
        <Select value={alertType} onValueChange={setAlertType}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select alert type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flood">Flooding</SelectItem>
            <SelectItem value="severe_storm">Severe Storm</SelectItem>
            <SelectItem value="tornado">Tornado</SelectItem>
            <SelectItem value="hurricane">Hurricane/Typhoon</SelectItem>
            <SelectItem value="hail">Large Hail</SelectItem>
            <SelectItem value="high_winds">High Winds</SelectItem>
            <SelectItem value="blizzard">Blizzard</SelectItem>
            <SelectItem value="extreme_heat">Extreme Heat</SelectItem>
            <SelectItem value="extreme_cold">Extreme Cold</SelectItem>
            <SelectItem value="wildfire">Wildfire</SelectItem>
            <SelectItem value="air_quality">Poor Air Quality</SelectItem>
            <SelectItem value="fog">Dense Fog</SelectItem>
            <SelectItem value="other">Other Hazard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-white/80 text-sm">Severity</label>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minor">Minor - Be Aware</SelectItem>
            <SelectItem value="moderate">Moderate - Be Prepared</SelectItem>
            <SelectItem value="severe">Severe - Take Action</SelectItem>
            <SelectItem value="extreme">Extreme - Immediate Danger</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-white/80 text-sm">Description</label>
        <Textarea 
          placeholder="Describe the weather hazard and any specific details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 bg-white/5 border-white/10 text-white resize-none"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-white/10 hover:bg-white/20 text-white"
        disabled={isSubmitting || !alertType || !severity || !description}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Submit Alert
      </Button>
    </form>
  );
};

export default WeatherAlertForm;
