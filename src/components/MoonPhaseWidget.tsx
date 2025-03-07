
import React from 'react';
import { Moon } from 'lucide-react';

interface MoonPhaseWidgetProps {
  moonPhase: number;
  moonIllumination: number;
  className?: string;
}

const MoonPhaseWidget: React.FC<MoonPhaseWidgetProps> = ({ 
  moonPhase, 
  moonIllumination,
  className = "" 
}) => {
  // Convert moon phase to text
  const getMoonPhaseText = (phase: number): string => {
    if (phase === 0 || phase === 1) return "New Moon";
    if (phase < 0.25) return "Waxing Crescent";
    if (phase === 0.25) return "First Quarter";
    if (phase < 0.5) return "Waxing Gibbous";
    if (phase === 0.5) return "Full Moon";
    if (phase < 0.75) return "Waning Gibbous";
    if (phase === 0.75) return "Last Quarter";
    return "Waning Crescent";
  };

  // Get the appropriate moon icon based on phase
  const getMoonIcon = (phase: number): string => {
    if (phase === 0 || phase === 1) return "🌑";
    if (phase < 0.25) return "🌒";
    if (phase === 0.25) return "🌓";
    if (phase < 0.5) return "🌔";
    if (phase === 0.5) return "🌕";
    if (phase < 0.75) return "🌖";
    if (phase === 0.75) return "🌗";
    return "🌘";
  };

  const moonPhaseText = getMoonPhaseText(moonPhase);
  const moonIcon = getMoonIcon(moonPhase);

  return (
    <div className={`frost-panel p-4 rounded-2xl hover-lift transition-all ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-sm font-medium">Moon Phase</h3>
        <Moon size={16} className="text-white/70" />
      </div>
      
      <div className="flex items-center justify-center my-3">
        <span className="text-4xl">{moonIcon}</span>
      </div>
      
      <div className="text-center">
        <p className="text-white text-base">{moonPhaseText}</p>
        <p className="text-white/70 text-xs mt-1">{Math.round(moonIllumination * 100)}% illuminated</p>
      </div>
    </div>
  );
};

export default MoonPhaseWidget;
