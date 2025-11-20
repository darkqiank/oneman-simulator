
import React from 'react';
import { Wrench, Globe, Zap, Shield } from 'lucide-react';
import { HardwareModel, ServerNode } from '../types';

interface ServerRackProps {
  server: ServerNode;
  model?: HardwareModel;
  onRepair?: (id: string) => void;
}

export const ServerRack: React.FC<ServerRackProps> = ({ server, model, onRepair }) => {
  
  const getRegionFlag = (region?: string) => {
    switch(region) {
      case 'US': return '🇺🇸 US';
      case 'HK': return '🇭🇰 HK';
      case 'JP': return '🇯🇵 JP';
      case 'SG': return '🇸🇬 SG';
      case 'DE': return '🇩🇪 DE';
      default: return '🌐 WW';
    }
  };

  const getRouteColor = (route?: string) => {
    if (route?.includes('CN2')) return 'text-cyber-primary';
    if (route?.includes('9929')) return 'text-cyber-secondary';
    return 'text-slate-400';
  };

  return (
    <div className={`relative bg-black border ${server.isOnline ? 'border-slate-800' : 'border-red-900'} p-0.5 mb-2 md:mb-3 group hover:border-cyber-primary/50 transition-colors`}>
      {/* Rack Ears */}
      <div className="absolute -left-1 top-2 bottom-2 w-1 bg-slate-800 rounded-l"></div>
      <div className="absolute -right-1 top-2 bottom-2 w-1 bg-slate-800 rounded-r"></div>

      {/* Overlay when offline */}
      {!server.isOnline && (
          <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                  <div className="text-red-500 font-mono font-bold text-sm md:text-lg animate-pulse mb-2">SYSTEM FAILURE</div>
                  {onRepair && (
                      <button 
                        onClick={() => onRepair(server.id)}
                        className="px-4 py-1 bg-red-600 text-white text-xs font-mono hover:bg-red-500 flex items-center gap-2"
                      >
                          <Wrench size={12} /> Repair ($100)
                      </button>
                  )}
              </div>
          </div>
      )}

      <div className={`bg-slate-900/80 p-2 md:p-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-2 md:gap-4 ${!server.isOnline ? 'opacity-20' : ''}`}>
        
        {/* Left: Status & Info */}
        <div className="flex items-center gap-2 md:gap-3 min-w-[140px] md:min-w-[180px]">
            <div className="flex flex-col gap-1 bg-black p-1 rounded border border-slate-800 shadow-inner">
                <div className={`w-1.5 h-1.5 rounded-full ${server.isOnline ? 'bg-cyber-success animate-pulse' : 'bg-red-600'}`}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-warning animate-blink" style={{animationDuration: '0.5s'}}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-primary animate-blink" style={{animationDuration: '1.2s'}}></div>
            </div>
            
            <div>
                <div className="flex items-center gap-2">
                    <h4 className="text-cyber-primary font-mono text-xs md:text-sm font-bold tracking-tighter">{server.name}</h4>
                    <span className="text-[9px] md:text-[10px] px-1 bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono hidden sm:inline-block">
                        {model?.id.toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                   <span className="text-[9px] md:text-[10px] text-white bg-slate-700/50 px-1.5 rounded border border-slate-600/50">{getRegionFlag(model?.region)}</span>
                   <span className={`text-[9px] md:text-[10px] font-bold ${getRouteColor(model?.networkRoute)}`}>{model?.networkRoute}</span>
                </div>
            </div>
        </div>

        {/* Middle: Tech Specs Display (Hide on very small screens or adjust) */}
        <div className="flex flex-1 justify-start md:justify-center gap-3 md:gap-6 text-[9px] md:text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-1" title="IP Quality">
               <Globe size={10} className={`md:w-3 md:h-3 ${model?.ipType === 'Native' ? 'text-cyber-success' : 'text-slate-500'}`}/> 
               <span className="hidden sm:inline">{model?.ipType} IP</span>
               <span className="sm:hidden">{model?.ipType === 'Native' ? 'NAT' : 'BGP'}</span>
            </div>
            <div className="flex items-center gap-1" title="Total Bandwidth">
               <Zap size={10} className="md:w-3 md:h-3 text-cyber-warning"/> 
               {model?.bandwidthMbps}M
            </div>
            <div className="flex items-center gap-1" title="Server Health">
               <Shield size={10} className={`md:w-3 md:h-3 ${server.health > 80 ? 'text-cyber-success' : 'text-red-500'}`}/> 
               {server.health}%
            </div>
        </div>

        {/* Right: Financials */}
        <div className="text-right ml-auto">
             <div className="text-slate-400 text-[9px] md:text-[10px] font-mono hidden sm:block">UPKEEP</div>
             <div className="text-white font-mono text-[10px] md:text-xs">-${model?.dailyUpkeep}/d</div>
        </div>
      </div>
      
      {/* Glass reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
    </div>
  );
};
