
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
          case 'Fan': return <Fan size={24} />;
          case 'Bot': return <Bot size={24} />;
          case 'Search': return <Search size={24} />;
          case 'Heart': return <Heart size={24} />;
          case 'Globe': return <Globe size={24} />;
          case 'Shield': return <Shield size={24} />;
          default: return <Zap size={24} />;
      }
  };

  return (
    <div className="space-y-6 animate-fade-in min-h-[500px]">
        {/* Header */}
        <div className="bg-cyber-panel/60 backdrop-blur border border-slate-700 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-cyber-primary"></div>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-black/50 rounded-full border border-cyber-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                    <FlaskConical size={32} className="text-cyber-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white font-mono uppercase tracking-widest">{t.lab.title}</h2>
                    <p className="text-slate-400 text-sm font-mono">{t.lab.desc}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upgrades.map(item => {
                const isUnlocked = unlockedIds.includes(item.id);
                const canAfford = cash >= item.cost;

                return (
                    <div key={item.id} className={`relative p-6 border transition-all duration-300 group overflow-hidden ${
                        isUnlocked 
                        ? 'bg-cyber-primary/5 border-cyber-primary/50' 
                        : canAfford 
                            ? 'bg-black/40 border-slate-700 hover:border-white' 
                            : 'bg-black/60 border-slate-800 opacity-70 grayscale'
                    }`}>
                        {/* Connecting Lines Decoration (Mockup) */}
                        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-current opacity-20"></div>

                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-sm ${isUnlocked ? 'bg-cyber-primary text-black' : 'bg-slate-800 text-slate-400'}`}>
                                {getIcon(item.icon)}
                            </div>
                            {isUnlocked ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-cyber-primary border border-cyber-primary px-2 py-1 rounded-full bg-black">
                                    <Check size={12} /> {t.lab.unlocked}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-bold text-slate-500 border border-slate-800 px-2 py-1 rounded-full bg-black">
                                    <Lock size={12} /> LOCKED
                                </span>
                            )}
                        </div>

                        <h3 className={`text-lg font-bold font-mono mb-2 ${isUnlocked ? 'text-cyber-primary' : 'text-white'}`}>
                            {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 mb-4 font-mono h-10">
                            {item.description}
                        </p>

                        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                             <div className="text-[10px] uppercase tracking-wider text-slate-500">
                                 {t.lab.effects[item.effectType]}: <span className="text-white font-bold">+{item.effectValue * 100}%</span>
                             </div>
                        </div>

                        {!isUnlocked && (
                            <button 
                                onClick={() => onUnlock(item.id)}
                                disabled={!canAfford}
                                className={`w-full mt-4 py-2 font-bold font-mono uppercase text-xs transition-all clip-path-button ${
                                    canAfford 
                                    ? 'bg-cyber-primary text-black hover:bg-white hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]' 
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                {t.lab.unlock} ${item.cost}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};
