/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, MessageSquare, ChevronRight } from 'lucide-react';

interface PrincipalMessageFloatingButtonProps {
  onNavigate: (route: string) => void;
}

export const PrincipalMessageFloatingButton: React.FC<PrincipalMessageFloatingButtonProps> = ({ onNavigate }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 group">
      <button
        onClick={() => onNavigate('principal')}
        className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-950 via-blue-900 to-orange-600 text-white font-bold text-xs rounded-full shadow-2xl hover:shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all duration-300 border border-orange-400/40"
        title="View Official Desk of the Principal & Directives"
      >
        <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-inner shrink-0">
          <Award className="w-4 h-4 animate-pulse" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] text-orange-200 font-extrabold uppercase tracking-widest leading-none">Desk of Principal</p>
          <p className="text-xs font-black tracking-tight text-white leading-tight">PRINCIPAL MESSAGE</p>
        </div>
        <span className="sm:hidden font-black text-xs tracking-tight">PRINCIPAL</span>
        <ChevronRight className="w-4 h-4 text-orange-200 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
