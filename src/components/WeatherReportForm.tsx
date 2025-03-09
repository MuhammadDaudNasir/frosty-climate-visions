
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CloudRain, Send, Camera } from 'lucide-react';

interface WeatherReportFormProps {
  location: string;
  latitude: number;
  longitude: number;
  onReportSubmitted?: () => void;
}

const WeatherReportForm: React.FC<WeatherReportFormProps> = ({
  location,
  latitude,
  longitude,
  onReportSubmitted
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState('moderate');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="text-center p-4 bg-white/5 backdrop-blur-md rounded-xl">
        <p className="text-white/80">Sign in to report weather conditions</p>
      </div>
    );
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!condition || !description) {
      toast({
        title: "Missing information",
        description: "Please provide a condition and description",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload photo if provided
      let photoUrl = null;
      
      if (photo) {
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${photo.name.split('.').pop()}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('weather_photos')
          .upload(fileName, photo);
          
        if (uploadError) throw uploadError;
        
        photoUrl = supabase.storage.from('weather_photos').getPublicUrl(fileName).data.publicUrl;
      }
      
      // Insert weather report
      const { error } = await supabase
        .from('user_weather_reports')
        .insert({
          user_id: user.id,
          location_name: location,
          latitude,
          longitude,
          condition,
          description,
          intensity,
          photo_url: photoUrl
        });
        
      if (error) throw error;
      
      // Success
      toast({
        title: "Weather report submitted",
        description: "Thank you for contributing to our weather community!",
      });
      
      // Reset form
      setCondition('');
      setDescription('');
      setIntensity('moderate');
      setPhoto(null);
      setPhotoPreview(null);
      
      // Callback
      if (onReportSubmitted) {
        onReportSubmitted();
      }
      
    } catch (error) {
      console.error('Error submitting weather report:', error);
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
        <CloudRain className="h-5 w-5 mr-2 text-white/80" />
        Report Weather Conditions
      </h3>
      
      <div className="space-y-2">
        <label className="text-white/80 text-sm">Weather Condition</label>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Clear Sky</SelectItem>
            <SelectItem value="partly_cloudy">Partly Cloudy</SelectItem>
            <SelectItem value="cloudy">Cloudy</SelectItem>
            <SelectItem value="rain">Rain</SelectItem>
            <SelectItem value="thunderstorm">Thunderstorm</SelectItem>
            <SelectItem value="snow">Snow</SelectItem>
            <SelectItem value="fog">Fog</SelectItem>
            <SelectItem value="windy">Windy</SelectItem>
            <SelectItem value="hail">Hail</SelectItem>
            <SelectItem value="sleet">Sleet</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {(condition === 'rain' || condition === 'snow' || condition === 'thunderstorm' || condition === 'windy') && (
        <div className="space-y-2">
          <label className="text-white/80 text-sm">Intensity</label>
          <Select value={intensity} onValueChange={setIntensity}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select intensity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="heavy">Heavy</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-white/80 text-sm">Description</label>
        <Textarea 
          placeholder="Describe the current weather conditions..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 bg-white/5 border-white/10 text-white resize-none"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-white/80 text-sm flex items-center">
          <Camera className="h-4 w-4 mr-1" />
          Add Photo (Optional)
        </label>
        
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            onClick={() => document.getElementById('photo-input')?.click()}
          >
            Choose File
          </Button>
          <span className="text-white/60 text-sm">
            {photo ? photo.name : 'No file chosen'}
          </span>
          <input
            type="file"
            id="photo-input"
            className="hidden"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>
        
        {photoPreview && (
          <div className="mt-2">
            <img 
              src={photoPreview} 
              alt="Weather condition preview" 
              className="max-h-32 rounded-lg object-cover"
            />
          </div>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-white/10 hover:bg-white/20 text-white"
        disabled={isSubmitting || !condition || !description}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Submit Report
      </Button>
    </form>
  );
};

export default WeatherReportForm;
