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

  const shadowColor = barColor.replace('bg-', 'shadow-');

  return (
    <div className="mb-3 group">
      <div className="flex justify-between text-xs mb-1 font-mono">
        <span className="text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`${percentage > 100 ? "text-cyber-danger animate-pulse" : "text-slate-300"}`}>
          {used.toFixed(1)} <span className="text-slate-500">/</span> {total.toFixed(1)} {unit}
        </span>
      </div>
      
      <div className="w-full bg-slate-900/80 h-3 border border-slate-800 relative overflow-hidden">
        {/* Grid lines overlay */}
        <div className="absolute inset-0 w-full h-full flex" style={{pointerEvents: 'none'}}>
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex-1 border-r border-black/40 h-full last:border-0"></div>
            ))}
        </div>

        {/* The Bar */}
        <div 
          className={`h-full transition-all duration-500 ${barColor} shadow-[0_0_10px_rgba(0,0,0,0.5)] relative`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
            {/* Glint effect */}
            <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-white/50 shadow-[0_0_8px_white]"></div>
        </div>

        {/* Overselling warning stripes */}
        {percentage > 100 && (
             <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,0,60,0.2)_25%,rgba(255,0,60,0.2)_50%,transparent_50%,transparent_75%,rgba(255,0,60,0.2)_75%,rgba(255,0,60,0.2)_100%)] bg-[length:10px_10px]"></div>
        )}
      </div>
    </div>
  );
};