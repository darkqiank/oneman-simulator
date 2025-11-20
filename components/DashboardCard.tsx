
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass?: string; // e.g. text-cyber-primary
  borderColor?: string; // e.g. border-cyber-primary
  subtext?: string;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  icon, 
  colorClass = "text-white", 
  borderColor = "border-slate-700",
  subtext,
  className = "" 
}) => {
  // Extract color keyword for bg/border logic
  const baseColor = colorClass.replace('text-', '');

  return (
    <div className={`group relative transition-all duration-300 hover:-translate-y-0.5 ${className}`}>
      {/* Main Card Shape using CSS class for theming */}
      <div 
        className={`relative bg-cyber-panel/80 backdrop-blur-md p-2 md:p-3 overflow-hidden border-l-4 transition-all clip-card ${borderColor} h-full flex flex-col justify-between`}
      >
        {/* Dynamic colored sidebar/accent */}
        <div className={`absolute top-0 bottom-0 left-0 w-0.5 ${colorClass.replace('text-', 'bg-')} opacity-80`}></div>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
               <span className={`inline-block w-1 h-1 ${colorClass.replace('text-', 'bg-')}`}></span>
               <p className="text-slate-400 text-[8px] md:text-[9px] font-mono uppercase tracking-widest truncate">
                 {title}
               </p>
            </div>
            <h3 className={`text-lg md:text-2xl font-bold font-mono ${colorClass} drop-shadow-lg tracking-tight leading-none`}>{value}</h3>
          </div>
          
          {/* Icon Container */}
          <div className="relative flex items-center justify-center w-7 h-7 md:w-10 md:h-10 shrink-0">
             <div className={`absolute inset-0 rounded-full opacity-20 ${colorClass.replace('text-','bg-')} blur-md`}></div>
             <div className={`relative z-10 ${colorClass} [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5`}>
                {icon}
             </div>
          </div>
        </div>

        {subtext && <p className="text-[8px] md:text-[9px] text-slate-500 mt-1 font-mono tracking-tight border-t border-slate-700/50 pt-1 inline-block w-full truncate">{subtext}</p>}
      </div>
    </div>
  );
};
