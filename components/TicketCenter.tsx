
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
    <div className="space-y-6 animate-fade-in min-h-[500px]">
        {/* Header */}
        <div className="bg-cyber-panel/60 backdrop-blur border border-slate-700 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-cyber-secondary"></div>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-black/50 rounded-full border border-cyber-secondary/50 shadow-[0_0_15px_rgba(112,0,255,0.3)]">
                    <MessageSquare size={32} className="text-cyber-secondary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white font-mono uppercase tracking-widest">{t.ticketsPage.title}</h2>
                    <p className="text-slate-400 text-sm font-mono">{t.ticketsPage.desc}</p>
                </div>
            </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-black/40 border border-slate-800 p-4 flex flex-col items-center justify-center">
                 <span className="text-slate-500 text-xs uppercase tracking-wider">Pending</span>
                 <span className="text-2xl font-bold text-white font-mono">{tickets.length}</span>
             </div>
             <div className="bg-black/40 border border-slate-800 p-4 flex flex-col items-center justify-center">
                 <span className="text-slate-500 text-xs uppercase tracking-wider">VIP Queue</span>
                 <span className="text-2xl font-bold text-cyber-warning font-mono">{tickets.filter(t => t.isVip).length}</span>
             </div>
             <div className="bg-black/40 border border-slate-800 p-4 flex flex-col items-center justify-center">
                 <span className="text-slate-500 text-xs uppercase tracking-wider">Critical</span>
                 <span className="text-2xl font-bold text-cyber-danger font-mono">{tickets.filter(t => t.issueType === 'down' || t.issueType === 'attack').length}</span>
             </div>
        </div>

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 bg-black/20">
                <CheckCircle size={48} className="text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-mono">{t.ticketsPage.empty}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {tickets.sort((a,b) => (Number(b.isVip) - Number(a.isVip)) || (a.expiresInTicks - b.expiresInTicks)).map(ticket => (
                    <div key={ticket.id} className={`relative bg-cyber-panel/40 border p-4 transition-all hover:translate-x-1 group ${
                        ticket.isVip ? 'border-cyber-warning/50 shadow-[0_0_10px_rgba(252,238,10,0.1)]' : 'border-slate-700'
                    }`}>
                        {/* Urgency Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
                             <div 
                               className={`h-full transition-all duration-1000 ${ticket.expiresInTicks < 20 ? 'bg-cyber-danger animate-pulse' : 'bg-cyber-primary'}`}
                               style={{width: `${Math.min((ticket.expiresInTicks / 60) * 100, 100)}%`}}
                             ></div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
                            
                            {/* User Info */}
                            <div className="flex items-center gap-3 min-w-[150px]">
                                <div className={`w-10 h-10 flex items-center justify-center rounded-sm border ${ticket.isVip ? 'bg-cyber-warning/10 border-cyber-warning' : 'bg-slate-800 border-slate-700'}`}>
                                    {ticket.isVip ? <Star size={18} className="text-cyber-warning fill-cyber-warning" /> : <User size={18} className="text-slate-400" />}
                                </div>
                                <div>
                                    <div className={`font-bold font-mono text-sm ${ticket.isVip ? 'text-cyber-warning' : 'text-slate-300'}`}>
                                        {ticket.userId}
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                                        {ticket.isVip ? t.ticketsPage.vip : t.ticketsPage.normal}
                                    </div>
                                </div>
                            </div>

                            {/* Issue Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle size={14} className={getIssueColor(ticket.issueType)} />
                                    <span className={`font-mono font-bold text-base ${getIssueColor(ticket.issueType)}`}>{getIssueText(ticket.issueType)}</span>
                                    <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-slate-500 border border-slate-800">ID: {ticket.id}</span>
                                </div>
                                <div className="text-xs text-slate-400 font-mono flex items-center gap-4">
                                    <span className="flex items-center gap-1"><Clock size={10}/> {t.ticketsPage.expires}: <span className={ticket.expiresInTicks < 15 ? 'text-red-500 font-bold' : ''}>{ticket.expiresInTicks}s</span></span>
                                    <span>Difficulty: {'⭐'.repeat(ticket.difficulty)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button onClick={() => onResolve(ticket.id, 'solve')} className="flex-1 md:flex-none px-4 py-2 bg-cyber-primary text-black font-bold font-mono text-xs hover:bg-white transition-colors clip-path-button flex items-center justify-center gap-2">
                                    <CheckCircle size={14} /> {t.ticketsPage.quickReply}
                                </button>
                                <button onClick={() => onResolve(ticket.id, 'refund')} className="flex-1 md:flex-none px-4 py-2 bg-transparent border border-slate-600 text-slate-400 font-bold font-mono text-xs hover:text-white hover:border-white transition-colors clip-path-button flex items-center justify-center gap-2" title="Cost Money">
                                    <DollarSign size={14} /> {t.ticketsPage.fullRefund}
                                </button>
                                <button onClick={() => onResolve(ticket.id, 'ban')} className="px-3 py-2 bg-red-900/20 border border-red-900 text-red-500 hover:bg-red-600 hover:text-white transition-colors clip-path-button" title={t.ticketsPage.banUser}>
                                    <Ban size={14} />
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
