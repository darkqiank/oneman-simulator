
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
    <div className={`group relative transition-all duration-300 hover:-translate-y-1 ${className}`}>
      {/* Main Card Shape using CSS class for theming */}
      <div 
        className={`relative bg-cyber-panel/80 backdrop-blur-md p-3 md:p-5 overflow-hidden border-l-4 transition-all clip-card ${borderColor} h-full flex flex-col justify-between`}
      >
        {/* Dynamic colored sidebar/accent */}
        <div className={`absolute top-0 bottom-0 left-0 w-1 ${colorClass.replace('text-', 'bg-')} opacity-80`}></div>
        
        {/* Tech Background Texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,white_25%,white_50%,transparent_50%,transparent_75%,white_75%,white_100%)] bg-[length:4px_4px]"></div>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 md:mb-2">
               <span className={`inline-block w-1.5 h-1.5 ${colorClass.replace('text-', 'bg-')} shadow-[0_0_5px_currentColor]`}></span>
               <p className="text-slate-400 text-[9px] md:text-[10px] font-mono uppercase tracking-widest truncate">
                 {title}
               </p>
            </div>
            <h3 className={`text-xl md:text-3xl font-bold font-mono ${colorClass} drop-shadow-lg tracking-tight`}>{value}</h3>
          </div>
          
          {/* Icon Container */}
          <div className="relative flex items-center justify-center w-8 h-8 md:w-12 md:h-12 shrink-0">
             {/* Hexagon removed to clean up look for other themes, replaced with soft glow or circle */}
             <div className={`absolute inset-0 rounded-full opacity-20 ${colorClass.replace('text-','bg-')} blur-md`}></div>
             <div className={`relative z-10 ${colorClass} drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6`}>
                {icon}
             </div>
          </div>
        </div>

        {subtext && <p className="text-[9px] md:text-[10px] text-slate-500 mt-1 md:mt-2 font-mono tracking-tight border-t border-slate-700/50 pt-1 inline-block w-full truncate">{subtext}</p>}

        {/* Bottom Right Deco */}
        <div className={`absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-tl from-${baseColor}/20 to-transparent pointer-events-none`}></div>
      </div>
    </div>
  );
};
