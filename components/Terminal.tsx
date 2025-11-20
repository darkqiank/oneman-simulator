
import React, { useEffect, useRef } from 'react';
import { GameEvent } from '../types';

interface TerminalProps {
  events: GameEvent[];
}

export const Terminal: React.FC<TerminalProps> = ({ events }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="bg-black border border-slate-800 rounded-sm font-mono text-xs h-full flex flex-col shadow-2xl always-dark">
      {/* Terminal Header */}
      <div className="bg-slate-900 px-3 py-1 flex justify-between items-center border-b border-slate-800">
        <div className="text-slate-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
          <span className="ml-2">root@oneman-host:~# tail -f /var/log/syslog</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-black/90 relative">
        {/* Scanline overlay only inside terminal */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
        
        <div className="space-y-1 relative z-0">
            {events.length === 0 && <div className="text-slate-600">等待系统日志流...</div>}
            
            {events.map(event => (
            <div key={event.id} className="flex gap-2 opacity-90 hover:opacity-100 transition-opacity">
                <span className="text-slate-600 shrink-0">[{event.day.toString().padStart(4, '0')}]</span>
                <span className={`
                ${event.type === 'error' ? 'text-cyber-danger font-bold' : ''}
                ${event.type === 'warning' ? 'text-cyber-warning' : ''}
                ${event.type === 'success' ? 'text-cyber-success' : ''}
                ${event.type === 'info' ? 'text-cyber-primary' : ''}
                `}>
                {event.type === 'info' && 'ℹ'}
                {event.type === 'success' && '✔'}
                {event.type === 'warning' && '⚠'}
                {event.type === 'error' && '✖'}
                </span>
                <span className="text-slate-300 break-all">{event.message}</span>
            </div>
            ))}
            <div ref={bottomRef} />
            <div className="animate-pulse text-cyber-success mt-2">_</div>
        </div>
      </div>
    </div>
  );
};
