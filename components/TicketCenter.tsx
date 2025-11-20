
import React from 'react';
import { SupportTicket, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { MessageSquare, Clock, Star, User, AlertCircle, CheckCircle, XCircle, Ban, DollarSign } from 'lucide-react';

interface TicketCenterProps {
  tickets: SupportTicket[];
  onResolve: (id: string, action: 'solve' | 'refund' | 'ban') => void;
  language: Language;
}

export const TicketCenter: React.FC<TicketCenterProps> = ({ tickets, onResolve, language }) => {
  const t = TRANSLATIONS[language];

  const getIssueText = (type: SupportTicket['issueType']) => {
      return t.ticketsPage.types[type] || type;
  };

  const getIssueColor = (type: SupportTicket['issueType']) => {
      switch(type) {
          case 'down': case 'attack': return 'text-cyber-danger';
          case 'refund': return 'text-cyber-warning';
          case 'slow': return 'text-orange-400';
          default: return 'text-cyber-primary';
      }
  };

  return (
    <div className="space-y-3 animate-fade-in">
        {/* Compact Header */}
        <div className="bg-cyber-panel/40 backdrop-blur border border-slate-700 p-3 relative overflow-hidden clip-card">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-secondary"></div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/50 border border-cyber-secondary/50">
                        <MessageSquare size={20} className="text-cyber-secondary" />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-white font-mono uppercase">{t.ticketsPage.title}</h2>
                        <p className="text-[10px] text-slate-500 font-mono">{tickets.length} 个待处理</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-3 gap-2">
             <div className="bg-black/30 border border-slate-800/50 p-2 flex flex-col items-center justify-center">
                 <span className="text-slate-500 text-[9px] uppercase">总数</span>
                 <span className="text-lg font-bold text-white font-mono">{tickets.length}</span>
             </div>
             <div className="bg-black/30 border border-slate-800/50 p-2 flex flex-col items-center justify-center">
                 <span className="text-slate-500 text-[9px] uppercase">VIP</span>
                 <span className="text-lg font-bold text-cyber-warning font-mono">{tickets.filter(t => t.isVip).length}</span>
             </div>
             <div className="bg-black/30 border border-slate-800/50 p-2 flex flex-col items-center justify-center">
                 <span className="text-slate-500 text-[9px] uppercase">紧急</span>
                 <span className="text-lg font-bold text-cyber-danger font-mono">{tickets.filter(t => t.issueType === 'down' || t.issueType === 'attack').length}</span>
             </div>
        </div>

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 bg-black/20">
                <CheckCircle size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 font-mono text-sm">{t.ticketsPage.empty}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-2">
                {tickets.sort((a,b) => (Number(b.isVip) - Number(a.isVip)) || (a.expiresInTicks - b.expiresInTicks)).map(ticket => (
                    <div key={ticket.id} className={`relative bg-cyber-panel/30 border p-2.5 transition-all hover:border-slate-500 group ${
                        ticket.isVip ? 'border-cyber-warning/50' : 'border-slate-700/50'
                    }`}>
                        {/* Urgency Bar */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-800">
                             <div 
                               className={`h-full transition-all duration-1000 ${ticket.expiresInTicks < 20 ? 'bg-cyber-danger animate-pulse' : 'bg-cyber-primary'}`}
                               style={{width: `${Math.min((ticket.expiresInTicks / 60) * 100, 100)}%`}}
                             ></div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mt-1">
                            
                            {/* User Info */}
                            <div className="flex items-center gap-2 min-w-[120px]">
                                <div className={`w-7 h-7 flex items-center justify-center border ${ticket.isVip ? 'bg-cyber-warning/10 border-cyber-warning' : 'bg-slate-800 border-slate-700'}`}>
                                    {ticket.isVip ? <Star size={14} className="text-cyber-warning fill-cyber-warning" /> : <User size={14} className="text-slate-400" />}
                                </div>
                                <div>
                                    <div className={`font-bold font-mono text-xs ${ticket.isVip ? 'text-cyber-warning' : 'text-slate-300'}`}>
                                        {ticket.userId}
                                    </div>
                                    <div className="text-[8px] text-slate-500 uppercase">
                                        {ticket.isVip ? 'VIP' : 'USER'}
                                    </div>
                                </div>
                            </div>

                            {/* Issue Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <AlertCircle size={12} className={getIssueColor(ticket.issueType)} />
                                    <span className={`font-mono font-bold text-xs ${getIssueColor(ticket.issueType)}`}>{getIssueText(ticket.issueType)}</span>
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono flex items-center gap-3">
                                    <span className="flex items-center gap-1"><Clock size={8}/> <span className={ticket.expiresInTicks < 15 ? 'text-red-500 font-bold' : ''}>{ticket.expiresInTicks}s</span></span>
                                    <span>{'⭐'.repeat(ticket.difficulty)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 w-full md:w-auto">
                                <button onClick={() => onResolve(ticket.id, 'solve')} className="flex-1 md:flex-none px-3 py-1.5 bg-cyber-primary text-black font-bold font-mono text-[10px] hover:bg-white transition-colors clip-btn flex items-center justify-center gap-1">
                                    <CheckCircle size={12} /> 解决
                                </button>
                                <button onClick={() => onResolve(ticket.id, 'refund')} className="flex-1 md:flex-none px-3 py-1.5 bg-transparent border border-slate-600 text-slate-400 font-bold font-mono text-[10px] hover:text-white hover:border-white transition-colors clip-btn flex items-center justify-center gap-1" title="退款">
                                    <DollarSign size={12} /> 退款
                                </button>
                                <button onClick={() => onResolve(ticket.id, 'ban')} className="px-2 py-1.5 bg-red-900/20 border border-red-900 text-red-500 hover:bg-red-600 hover:text-white transition-colors clip-btn" title="封禁">
                                    <Ban size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
