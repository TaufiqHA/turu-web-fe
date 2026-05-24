import React from 'react';
import { Wifi } from 'lucide-react';

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center relative ${className}`}>
      <Wifi className="text-red-600 w-6 h-6 -mb-3 z-10" strokeWidth={3} />
      <div className="relative flex items-center justify-center">
        <span className="text-[40px] font-serif font-black text-red-600 tracking-tighter" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>T</span>
        <span className="text-[45px] font-serif font-bold text-white tracking-tighter absolute top-[4px] left-[10px]" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.3)' }}>S</span>
      </div>
    </div>
  );
}

