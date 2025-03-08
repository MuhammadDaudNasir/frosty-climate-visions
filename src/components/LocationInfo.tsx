
import React, { useState, useEffect } from 'react';
import { MapPin, ThermometerSun, Cloud, Umbrella, Calendar, Building } from 'lucide-react';
import { formatDate } from '@/utils/weatherUtils';

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
    imageUrl?: string;
  };
}

const LocationInfo: React.FC<LocationInfoProps> = ({ locationData }) => {
  const { name, country, region, lat, lon, climate, imageUrl } = locationData;
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create better search query for Unsplash
  const getOptimizedSearchQuery = () => {
    const searchTerms = [name];
    
    // Add relevant landmarks or features based on location
    if (country === 'United States' || country === 'USA') {
      searchTerms.push('cityscape');
    } else if (country === 'Japan') {
      searchTerms.push('landmark');
    } else if (country === 'Saudi Arabia') {
      searchTerms.push('architecture');
    } else {
      searchTerms.push('landmark');
    }
    
    // Add climate-related terms if available
    if (climate) {
      if (climate.averageTemp > 25) {
        searchTerms.push('sunny');
      } else if (climate.averageTemp < 10) {
        searchTerms.push('cold');
      }
    }
    
    return encodeURIComponent(searchTerms.join(' '));
  };
  
  // Prepare high-quality image URL with optimized search terms
  const defaultImage = `https://source.unsplash.com/1600x900/?${getOptimizedSearchQuery()}`;
  
  // Load and handle image
  useEffect(() => {
    setIsLoading(true);
    const imgToLoad = imageUrl || defaultImage;
    
    // Preload image
    const img = new Image();
    img.src = imgToLoad;
    img.onload = () => {
      setLoadedImage(imgToLoad);
      setIsLoading(false);
    };
    img.onerror = () => {
      // Fallback to a more generic search if the specific one fails
      const fallbackImage = `https://source.unsplash.com/1600x900/?${encodeURIComponent(country + ' landscape')}`;
      setLoadedImage(fallbackImage);
      setIsLoading(false);
    };
  }, [imageUrl, name, country]);
  
  return (
    <section className="py-8 md:py-16 overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="relative w-full h-[70vh] mb-10 overflow-hidden rounded-xl">
        {isLoading ? (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="text-white/50">Loading image of {name}...</div>
          </div>
        ) : (
          <img 
            src={loadedImage || defaultImage} 
            alt={`${name}, ${country}`} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 hover:scale-110"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 w-full p-8">
          <h2 className="text-4xl md:text-6xl font-light text-white frosted-text mb-3 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            {name}
          </h2>
          <div className="flex items-center text-white/80 mb-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <MapPin size={18} className="mr-2" />
            <span>{region ? `${region}, ${country}` : country}</span>
          </div>
          <div className="flex items-center text-white/60 text-sm animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <span>Lat: {lat.toFixed(2)}° • Lon: {lon.toFixed(2)}°</span>
          </div>
        </div>
      </div>
      
      {climate && (
        <div className="container mx-auto">
          <h3 className="text-2xl font-light text-white frosted-text mb-8 text-center animate-slide-up" style={{ animationDelay: '0.8s' }}>
            Climate Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="frost-panel p-8 rounded-3xl animate-slide-up hover:translate-y-[-5px] transition-all duration-300" style={{ animationDelay: '0.9s' }}>
              <div className="flex items-center mb-5">
                <ThermometerSun size={24} className="text-amber-400 mr-4" />
                <h4 className="text-xl text-white">Temperature</h4>
              </div>
              <p className="text-4xl text-white font-light mb-3">{climate.averageTemp}°C</p>
              <p className="text-white/70 text-sm">Annual average temperature</p>
            </div>
            
            <div className="frost-panel p-8 rounded-3xl animate-slide-up hover:translate-y-[-5px] transition-all duration-300" style={{ animationDelay: '1s' }}>
              <div className="flex items-center mb-5">
                <Umbrella size={24} className="text-blue-400 mr-4" />
                <h4 className="text-xl text-white">Precipitation</h4>
              </div>
              <p className="text-4xl text-white font-light mb-3">{climate.annualRainfall} mm</p>
              <p className="text-white/70 text-sm">Annual rainfall</p>
            </div>
            
            <div className="frost-panel p-8 rounded-3xl animate-slide-up hover:translate-y-[-5px] transition-all duration-300" style={{ animationDelay: '1.1s' }}>
              <div className="flex items-center mb-5">
                <Calendar size={24} className="text-green-400 mr-4" />
                <h4 className="text-xl text-white">Seasons</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {climate.seasons.map((season, index) => (
                  <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-white text-sm">
                    {season}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="frost-panel p-8 rounded-3xl mb-10 animate-slide-up hover:translate-y-[-5px] transition-all duration-300" style={{ animationDelay: '1.2s' }}>
            <h4 className="text-2xl text-white mb-5">Climate Description</h4>
            <p className="text-white/90 leading-relaxed text-lg">{climate.description}</p>
          </div>
          
          <div className="text-center text-white/50 text-sm animate-fade-in" style={{ animationDelay: '1.3s' }}>
            <p>Image provided by Unsplash • Climate data is approximate</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default LocationInfo;
