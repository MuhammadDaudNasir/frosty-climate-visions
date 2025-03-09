
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  timestamp: number | null;
}

export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    timestamp: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        loading: false
      }));
      return;
    }

    const geoSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
        timestamp: position.timestamp
      });
    };

    const geoError = (error: GeolocationPositionError) => {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
      
      if (error.code === 1) { // Permission denied
        toast({
          title: "Location access denied",
          description: "We'll use your last saved location instead",
          variant: "default"
        });
      } else {
        toast({
          title: "Location error",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(
      geoSuccess,
      geoError,
      { ...defaultOptions, ...options }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  return state;
}
