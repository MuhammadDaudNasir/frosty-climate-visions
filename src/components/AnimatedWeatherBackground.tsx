
import React, { useEffect, useRef, useState } from 'react';
import { WeatherCondition } from '@/utils/weatherUtils';
import { useAuth } from '@/contexts/AuthContext';

interface AnimatedWeatherBackgroundProps {
  condition: WeatherCondition;
  isDay: boolean;
  children: React.ReactNode;
}

const AnimatedWeatherBackground: React.FC<AnimatedWeatherBackgroundProps> = ({
  condition,
  isDay,
  children
}) => {
  const { userPreferences } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationElements, setAnimationElements] = useState<React.ReactNode>(null);
  const requestRef = useRef<number>();
  const particlesRef = useRef<any[]>([]);
  const darkMode = userPreferences?.darkMode || false;

  // Define the background class based on weather and dark mode
  const getBackgroundClass = () => {
    const darkModePrefix = darkMode ? 'dark-' : '';
    
    if (condition === 'sunny' || condition === 'clear') {
      return isDay ? `${darkModePrefix}bg-clear-day` : `${darkModePrefix}bg-clear-night`;
    } else if (condition === 'partly-cloudy') {
      return isDay ? `${darkModePrefix}bg-partly-cloudy-day` : `${darkModePrefix}bg-partly-cloudy-night`;
    } else if (condition === 'cloudy' || condition === 'overcast' || condition === 'mist' || condition === 'fog') {
      return `${darkModePrefix}bg-cloudy`;
    } else if (condition === 'rain' || condition === 'drizzle') {
      return `${darkModePrefix}bg-rainy`;
    } else if (condition === 'snow' || condition === 'sleet') {
      return `${darkModePrefix}bg-snowy`;
    } else if (condition === 'thunderstorm') {
      return `${darkModePrefix}bg-stormy`;
    } else {
      return isDay ? `${darkModePrefix}bg-clear-day` : `${darkModePrefix}bg-clear-night`;
    }
  };

  // Initialize 3D canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to viewport size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation setup
    let particles: any[] = [];
    
    const createParticles = () => {
      particles = [];
      const particleCount = getParticleCount();
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
      particlesRef.current = particles;
    };
    
    const getParticleCount = () => {
      switch (condition) {
        case 'rain':
        case 'drizzle':
          return 200;
        case 'snow':
        case 'sleet':
          return 100;
        case 'thunderstorm':
          return 250;
        case 'sunny':
        case 'clear':
          return isDay ? 30 : 100; // Sun rays or stars
        default:
          return 50;
      }
    };
    
    const createParticle = () => {
      const baseParticle = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speedX: 0,
        speedY: 0,
        color: 'rgba(255, 255, 255, 0.8)',
        depth: Math.random() * 3
      };
      
      switch (condition) {
        case 'rain':
        case 'drizzle':
          return {
            ...baseParticle,
            size: Math.random() * 2 + 1,
            speedY: Math.random() * 3 + 8,
            speedX: Math.random() * 1 - 0.5,
            color: 'rgba(196, 232, 255, 0.6)'
          };
        case 'snow':
        case 'sleet':
          return {
            ...baseParticle,
            size: Math.random() * 4 + 2,
            speedY: Math.random() * 1 + 1,
            speedX: Math.random() * 1 - 0.5,
            color: 'rgba(255, 255, 255, 0.8)',
            rotationAngle: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() * 2 - 1) * 0.01
          };
        case 'thunderstorm':
          return {
            ...baseParticle,
            size: Math.random() * 2 + 1,
            speedY: Math.random() * 5 + 10,
            speedX: Math.random() * 2 - 1,
            color: 'rgba(196, 232, 255, 0.5)'
          };
        case 'sunny':
        case 'clear':
          if (isDay) {
            // Sun rays
            return {
              ...baseParticle,
              x: canvas.width / 2,
              y: canvas.height / 4,
              size: Math.random() * 100 + 50,
              speedX: 0,
              speedY: 0,
              color: 'rgba(255, 255, 200, 0.1)',
              angle: Math.random() * Math.PI * 2,
              distance: Math.random() * canvas.width * 0.3,
              pulseSpeed: Math.random() * 0.01 + 0.005
            };
          } else {
            // Stars for night sky
            return {
              ...baseParticle,
              size: Math.random() * 2 + 1,
              color: 'rgba(255, 255, 255, 0.8)',
              twinkleSpeed: Math.random() * 0.05 + 0.01,
              twinklePhase: Math.random() * Math.PI * 2
            };
          }
        case 'cloudy':
        case 'overcast':
          return {
            ...baseParticle,
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height / 2),
            size: Math.random() * 100 + 50,
            speedX: Math.random() * 0.5 - 0.25,
            color: 'rgba(200, 200, 200, 0.2)',
          };
        default:
          return baseParticle;
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update each particle
      particles.forEach(particle => {
        updateParticle(particle);
        drawParticle(ctx, particle);
      });
      
      // Draw lightning for thunderstorm
      if (condition === 'thunderstorm' && Math.random() < 0.01) {
        drawLightning(ctx);
      }
      
      requestRef.current = requestAnimationFrame(drawParticles);
    };
    
    const updateParticle = (particle: any) => {
      // Different update logic based on particle type
      if (condition === 'rain' || condition === 'drizzle' || condition === 'thunderstorm') {
        particle.y += particle.speedY * (particle.depth);
        particle.x += particle.speedX;
        
        // Reset particle when it goes off screen
        if (particle.y > canvas.height) {
          particle.y = -10;
          particle.x = Math.random() * canvas.width;
        }
      } else if (condition === 'snow' || condition === 'sleet') {
        particle.y += particle.speedY * (particle.depth);
        particle.x += particle.speedX + Math.sin(particle.y * 0.01) * 0.5;
        particle.rotationAngle += particle.rotationSpeed;
        
        // Reset particle when it goes off screen
        if (particle.y > canvas.height) {
          particle.y = -10;
          particle.x = Math.random() * canvas.width;
        }
      } else if (condition === 'sunny' || condition === 'clear') {
        if (isDay) {
          // Pulsating sun rays
          particle.size = particle.size * (1 + Math.sin(Date.now() * particle.pulseSpeed) * 0.05);
        } else {
          // Twinkling stars
          const alpha = 0.3 + 0.5 * Math.sin(Date.now() * particle.twinkleSpeed + particle.twinklePhase);
          particle.color = `rgba(255, 255, 255, ${alpha})`;
        }
      } else if (condition === 'cloudy' || condition === 'overcast') {
        particle.x += particle.speedX;
        
        // Wraparound for clouds
        if (particle.x > canvas.width + particle.size) {
          particle.x = -particle.size;
        } else if (particle.x < -particle.size) {
          particle.x = canvas.width + particle.size;
        }
      }
    };
    
    const drawParticle = (ctx: CanvasRenderingContext2D, particle: any) => {
      ctx.fillStyle = particle.color;
      
      if (condition === 'rain' || condition === 'drizzle' || condition === 'thunderstorm') {
        // Draw raindrops
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x, particle.y + particle.size * 2);
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.size / 2;
        ctx.stroke();
      } else if (condition === 'snow' || condition === 'sleet') {
        // Draw snowflakes
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotationAngle);
        
        // Draw a snowflake
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, particle.size);
          ctx.stroke();
          ctx.rotate(Math.PI / 3);
        }
        
        ctx.restore();
      } else if (condition === 'sunny' || condition === 'clear') {
        if (isDay) {
          // Draw sun rays
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 3);
          ctx.rotate(particle.angle);
          
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
          gradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
          gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.distance, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        } else {
          // Draw stars
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow effect
          const glow = ctx.createRadialGradient(
            particle.x, 
            particle.y, 
            0, 
            particle.x, 
            particle.y, 
            particle.size * 3
          );
          glow.addColorStop(0, particle.color);
          glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (condition === 'cloudy' || condition === 'overcast') {
        // Draw clouds
        const gradient = ctx.createRadialGradient(
          particle.x, 
          particle.y, 
          0, 
          particle.x, 
          particle.y, 
          particle.size
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    const drawLightning = (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      
      const startX = Math.random() * canvas.width;
      const startY = 0;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      let x = startX;
      let y = startY;
      
      while (y < canvas.height * 0.7) {
        x += (Math.random() - 0.5) * 80;
        y += Math.random() * 20 + 10;
        
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // Flash effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Fade out the flash after a short delay
      setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 50);
    };

    // Initialize animation
    createParticles();
    requestRef.current = requestAnimationFrame(drawParticles);

    // Cleanup function
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [condition, isDay, darkMode]);

  // Create additional animated elements based on weather condition
  useEffect(() => {
    let elements;
    
    switch (condition) {
      case 'partly-cloudy':
        elements = (
          <>
            {isDay && (
              <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-yellow-400 blur-xl opacity-50 animate-pulse-subtle"></div>
            )}
            <div className="absolute top-20 left-[20%] w-40 h-20 rounded-full bg-white blur-xl opacity-30 animate-drift-cloud"></div>
            <div className="absolute bottom-32 right-[25%] w-56 h-24 rounded-full bg-white blur-xl opacity-20 animate-drift-cloud" style={{ animationDelay: '2s', animationDuration: '15s' }}></div>
          </>
        );
        break;
        
      case 'mist':
      case 'fog':
        elements = (
          <>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute top-10 left-0 right-0 h-40 bg-white/20 blur-xl"></div>
            <div className="absolute bottom-10 left-0 right-0 h-40 bg-white/20 blur-xl"></div>
          </>
        );
        break;
        
      default:
        elements = null;
    }
    
    setAnimationElements(elements);
  }, [condition, isDay]);

  const backgroundClass = getBackgroundClass();

  return (
    <div className={`min-h-screen ${backgroundClass} overflow-hidden relative weather-transition`}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ touchAction: 'none' }}
      />
      {animationElements}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedWeatherBackground;
