
import React from 'react';
import { ResearchItem, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { FlaskConical, Check, Lock, Fan, Bot, Search, Heart, Globe, Shield, Zap } from 'lucide-react';

interface ResearchLabProps {
  upgrades: ResearchItem[];
  unlockedIds: string[];
  onUnlock: (id: string) => void;
  cash: number;
  language: Language;
}

export const ResearchLab: React.FC<ResearchLabProps> = ({ upgrades, unlockedIds, onUnlock, cash, language }) => {
  const t = TRANSLATIONS[language];

  const getIcon = (iconName: string) => {
      switch(iconName) {
          case 'Fan': return <Fan size={16} />;
          case 'Bot': return <Bot size={16} />;
          case 'Search': return <Search size={16} />;
          case 'Heart': return <Heart size={16} />;
          case 'Globe': return <Globe size={16} />;
          case 'Shield': return <Shield size={16} />;
          default: return <Zap size={16} />;
      }
  };

  return (
    <div className="space-y-3 animate-fade-in">
        {/* Compact Header */}
        <div className="bg-cyber-panel/40 backdrop-blur border border-slate-700 p-3 relative overflow-hidden clip-card">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-primary"></div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-black/50 border border-cyber-primary/50">
                    <FlaskConical size={20} className="text-cyber-primary" />
                </div>
                <div>
                    <h2 className="text-base md:text-lg font-bold text-white font-mono uppercase">{t.lab.title}</h2>
                    <p className="text-[10px] text-slate-500 font-mono">{unlockedIds.length} / {upgrades.length} 已解锁</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {upgrades.map(item => {
                const isUnlocked = unlockedIds.includes(item.id);
                const canAfford = cash >= item.cost;

                return (
                    <div key={item.id} className={`relative p-3 border transition-all duration-300 group overflow-hidden ${
                        isUnlocked 
                        ? 'bg-cyber-primary/5 border-cyber-primary/50' 
                        : canAfford 
                            ? 'bg-black/30 border-slate-700 hover:border-slate-500' 
                            : 'bg-black/60 border-slate-800 opacity-60'
                    }`}>
                        {/* Status Bar */}
                        <div className={`absolute top-0 left-0 w-full h-0.5 ${isUnlocked ? 'bg-cyber-primary' : 'bg-slate-800'}`}></div>

                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-1.5 ${isUnlocked ? 'bg-cyber-primary text-black' : 'bg-slate-800 text-slate-400'}`}>
                                {getIcon(item.icon)}
                            </div>
                            {isUnlocked ? (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-cyber-primary border border-cyber-primary px-1.5 py-0.5 bg-black/50">
                                    <Check size={10} /> ✓
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 border border-slate-800 px-1.5 py-0.5 bg-black/50">
                                    <Lock size={10} /> ○
                                </span>
                            )}
                        </div>

                        <h3 className={`text-sm font-bold font-mono mb-1.5 leading-tight ${isUnlocked ? 'text-cyber-primary' : 'text-white'}`}>
                            {item.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 mb-2 font-mono leading-snug min-h-[32px]">
                            {item.description}
                        </p>

                        <div className="border-t border-slate-800 pt-2 mb-2">
                             <div className="text-[9px] uppercase tracking-wider text-slate-500">
                                 效果: <span className="text-white font-bold">+{item.effectValue * 100}%</span>
                             </div>
                        </div>

                        {!isUnlocked && (
                            <button 
                                onClick={() => onUnlock(item.id)}
                                disabled={!canAfford}
                                className={`w-full py-1.5 font-bold font-mono uppercase text-[10px] transition-all clip-btn ${
                                    canAfford 
                                    ? 'bg-cyber-primary text-black hover:bg-white' 
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                解锁 ${item.cost}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};
