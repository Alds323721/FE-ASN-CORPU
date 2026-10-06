import React from 'react';
import logoImg from '../../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../../assets/ASN-CORPU.png';

import { Home } from 'lucide-react';

export default function LandingNavbar({ onLoginClick, onNavigatePortal }) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-t-[4px] border-[#0099FF] shadow-xs flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 h-14 sm:h-16">
      <div 
        className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group min-w-0"
        onClick={onNavigatePortal}
        title="Kembali ke Portal Utama"
      >
        <img src={logoImg} alt="Logo BKPSDM" className="w-7 sm:w-9 h-7 sm:h-9 object-contain group-hover:scale-105 transition-transform shrink-0" />
        <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-7 sm:w-9 h-7 sm:h-9 object-contain group-hover:scale-105 transition-transform shrink-0" />
        <span className="font-bold text-sm sm:text-xl text-[#1D315F] tracking-wide group-hover:text-[#0099FF] transition-colors truncate">
          Buleleng ASN Corpu
        </span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {onNavigatePortal && (
          <button
            onClick={onNavigatePortal}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1D315F] hover:text-[#0099FF] transition-colors py-1.5 px-2.5 sm:px-4 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006A63]" />
            <span className="hidden sm:inline">Portal Utama</span>
          </button>
        )}
        <button
          onClick={onLoginClick}
          className="border border-gray-400 text-[#4B5563] font-semibold py-1 sm:py-1.5 px-3 sm:px-5 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer text-xs sm:text-sm shadow-xs"
        >
          Login
        </button>
      </div>
    </nav>
  );
}
