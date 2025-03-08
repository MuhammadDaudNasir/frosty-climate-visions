
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Compass, Wind, Cloud, Thermometer, MapPin, ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LocationInfoProps {
  locationData: {
    name: string;
    country: string;
    region?: string;
    lat: number;
    lon: number;
    climate?: {
      averageTemp: number;
      annualRainfall: number;
      seasons: string[];
      description: string;
    };
  };
}

const LocationInfo: React.FC<LocationInfoProps> = ({ locationData }) => {
  const [images, setImages] = useState<{url: string, credit: string, tags: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    const fetchLocationImages = async () => {
      setLoading(true);
      setImageLoadError(false);
      
      try {
        const { data, error } = await supabase.functions.invoke('get-location-image', {
          body: { location: `${locationData.name} ${locationData.country}` }
        });
        
        if (error) throw error;
        
        if (data.images && data.images.length > 0) {
          setImages(data.images);
          
          // Preload images
          data.images.forEach((image: {url: string}) => {
            const img = new Image();
            img.src = image.url;
          });
        } else {
          setImageLoadError(true);
        }
      } catch (error) {
        console.error('Error fetching location images:', error);
        setImageLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationImages();
  }, [locationData.name, locationData.country]);

  // Change image every 10 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [images.length]);

  const { climate } = locationData;

  return (
    <div className="py-16 px-4 bg-black/80 backdrop-blur-lg">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-extralight text-white mb-3 text-center">
          <MapPin className="inline-block mr-2 mb-1" size={28} />
          {locationData.name}, {locationData.country}
        </h2>
        
        {locationData.region && (
          <p className="text-white/70 text-center mb-8">{locationData.region}</p>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Location image */}
          <div className="relative h-[400px] frost-glass rounded-3xl overflow-hidden shadow-2xl">
            {loading ? (
              <Skeleton className="w-full h-full bg-gray-800/50" />
            ) : imageLoadError || images.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/50 p-6">
                <ImageIcon size={48} className="text-white/30 mb-4" />
                <p className="text-white/60 text-center">
                  No images available for this location
                </p>
              </div>
            ) : (
              <>
                {images.map((image, index) => (
                  <div
                    key={image.url}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${locationData.name}, ${locationData.country}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-xs text-white/70">
                      Image by {image.credit} via Pixabay
                    </div>
                  </div>
                ))}
                
                {images.length > 1 && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/30'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Climate information */}
          <div className="space-y-6">
            {climate ? (
              <>
                <h3 className="text-2xl font-light text-white mb-4">Climate Profile</h3>
                
                <p className="text-white/80 leading-relaxed">
                  {climate.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="frost-panel p-4 rounded-2xl">
                    <div className="flex items-center mb-2">
                      <Thermometer className="text-white/70 mr-2" size={18} />
                      <h4 className="text-white text-lg">Temperature</h4>
                    </div>
                    <p className="text-white/80">
                      Average: {climate.averageTemp}°C
                    </p>
                  </div>
                  
                  <div className="frost-panel p-4 rounded-2xl">
                    <div className="flex items-center mb-2">
                      <Cloud className="text-white/70 mr-2" size={18} />
                      <h4 className="text-white text-lg">Rainfall</h4>
                    </div>
                    <p className="text-white/80">
                      Annual: {climate.annualRainfall}mm
                    </p>
                  </div>
                  
                  <div className="frost-panel p-4 rounded-2xl">
                    <div className="flex items-center mb-2">
                      <Compass className="text-white/70 mr-2" size={18} />
                      <h4 className="text-white text-lg">Latitude</h4>
                    </div>
                    <p className="text-white/80">
                      {locationData.lat.toFixed(2)}° {locationData.lat >= 0 ? 'N' : 'S'}
                    </p>
                  </div>
                  
                  <div className="frost-panel p-4 rounded-2xl">
                    <div className="flex items-center mb-2">
                      <Wind className="text-white/70 mr-2" size={18} />
                      <h4 className="text-white text-lg">Seasons</h4>
                    </div>
                    <p className="text-white/80">
                      {climate.seasons.join(', ')}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/60 text-center">
                  Climate data not available for this location.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;
