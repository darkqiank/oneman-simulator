import React from 'react';

interface ProgressBarProps {
  label: string;
  used: number;
  total: number;
  unit: string;
  color?: string; // tailwind color class for background
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ label, used, total, unit, color = "bg-cyber-primary" }) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  
  let barColor = color;
  let textColor = "text-cyber-primary";
  
  // Dynamic coloring based on load
  if (percentage > 90) { barColor = "bg-cyber-warning"; textColor = "text-cyber-warning"; }
  if (percentage > 100) { barColor = "bg-cyber-danger"; textColor = "text-cyber-danger"; }

  return (
    <div className="group">
      <div className="flex justify-between text-[10px] mb-1 font-mono">
        <span className="text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`font-bold ${percentage > 100 ? "text-cyber-danger animate-pulse" : textColor}`}>
          {used.toFixed(1)}<span className="text-slate-600 text-[8px]">/</span>{total.toFixed(1)} <span className="text-[8px]">{unit}</span>
        </span>
      </div>
      
      <div className="w-full bg-slate-900/80 h-2 border border-slate-800 relative overflow-hidden">
        {/* The Bar */}
        <div 
          className={`h-full transition-all duration-500 ${barColor} relative`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
            {/* Glint effect */}
            <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/50"></div>
        </div>

        {/* Overselling warning stripes */}
        {percentage > 100 && (
             <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,0,60,0.2)_25%,rgba(255,0,60,0.2)_50%,transparent_50%,transparent_75%,rgba(255,0,60,0.2)_75%,rgba(255,0,60,0.2)_100%)] bg-[length:8px_8px] animate-pulse"></div>
        )}
      </div>
      
      <div className="mt-0.5 text-right">
        <span className={`text-[8px] font-mono ${percentage > 100 ? 'text-cyber-danger' : 'text-slate-500'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};