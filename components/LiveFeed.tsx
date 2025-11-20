
import React, { useRef, useEffect } from 'react';
import { UserReview } from '../types';
import { MessageSquare } from 'lucide-react';

interface LiveFeedProps {
    reviews: UserReview[];
    title: string;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ reviews, title }) => {
    // Use a ref for the scrollable container
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // When reviews update, scroll the container to the bottom.
        // This avoids scrolling the entire window.
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [reviews]);

    return (
        <div className="bg-cyber-panel/40 backdrop-blur-md border border-slate-700 h-full flex flex-col overflow-hidden rounded-sm shadow-xl">
            <div className="bg-black/40 px-3 py-2 border-b border-slate-700 flex items-center gap-2">
                <MessageSquare size={14} className="text-cyber-primary animate-pulse" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">{title}</span>
            </div>
            
            {/* Attach the ref to the scrollable div */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar relative">
                 {/* Gradient Overlay for fade effect at top */}
                 <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10"></div>

                 {reviews.length === 0 && (
                     <div className="text-center text-slate-600 text-xs py-10 italic">No activity yet...</div>
                 )}

                 {reviews.map((review) => (
                     <div key={review.id} className="bg-black/30 border-l-2 p-2 text-xs animate-fade-in" style={{
                         borderColor: review.sentiment === 'positive' ? '#00ff9f' : review.sentiment === 'negative' ? '#ff003c' : '#94a3b8'
                     }}>
                         <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-slate-300">@{review.username}</span>
                             <span className="text-[10px] text-slate-600">{new Date(review.timestamp).toLocaleTimeString()}</span>
                         </div>
                         <p className={`leading-relaxed ${
                             review.sentiment === 'positive' ? 'text-emerald-400' : review.sentiment === 'negative' ? 'text-rose-400' : 'text-slate-400'
                         }`}>
                             "{review.content}"
                         </p>
                     </div>
                 ))}
            </div>
        </div>
    );
};
