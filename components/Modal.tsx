import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-cyber-panel border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto clip-card animate-fade-in scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-cyber-dark/95 backdrop-blur-md border-b border-slate-800 p-3 md:p-4 flex justify-between items-center z-10">
          <h2 className="text-base md:text-lg font-bold text-white font-mono uppercase tracking-wider">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded border border-transparent hover:border-slate-600 transition-colors text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

