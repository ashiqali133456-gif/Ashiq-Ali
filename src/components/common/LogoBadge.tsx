/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoBadgeProps {
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LogoBadge: React.FC<LogoBadgeProps> = ({ logoUrl, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  if (logoUrl) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
        <img
          src={logoUrl}
          alt="Jinnah Polytechnic Institute Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain drop-shadow-md rounded-full"
        />
      </div>
    );
  }

  // Fallback high-fidelity SVG seal
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      <div className="w-full h-full rounded-full bg-blue-900 border-2 border-orange-500 flex flex-col items-center justify-center p-1 text-white shadow-lg overflow-hidden">
        <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center text-center p-0.5 border border-blue-900">
          <span className="text-[7px] font-black text-blue-950 leading-none uppercase tracking-tighter">JINNAH</span>
          <span className="text-[4.5px] font-bold text-blue-800 leading-none">POLYTECHNIC</span>
          <div className="bg-orange-500 text-white text-[4px] font-black px-1 rounded-sm mt-0.5 leading-tight">
            FSD CAMPUS
          </div>
          <span className="text-[4px] font-semibold text-blue-900 mt-0.5">ESTD 1995</span>
        </div>
      </div>
    </div>
  );
};
