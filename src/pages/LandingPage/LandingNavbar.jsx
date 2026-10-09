import React from 'react';
import logoImg from '../../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../../assets/ASN-CORPU.png';
import { Home, LogIn } from 'lucide-react';

export default function LandingNavbar({ onLoginClick, onNavigatePortal }) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-t-[4px] border-[#0099FF] shadow-xs flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 h-14 sm:h-16 transition-all">
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
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {onNavigatePortal && (
          <button
            onClick={onNavigatePortal}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1D315F] hover:text-[#0099FF] transition-colors py-1.5 px-2.5 sm:px-3.5 rounded-full hover:bg-blue-50/60 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006A63]" />
            <span className="hidden sm:inline">Portal Utama</span>
          </button>
        )}
        <button
          onClick={onLoginClick}
          className="group relative inline-flex items-center justify-between gap-2 sm:gap-2.5 bg-gradient-to-r from-[#00A3FF] via-[#0088FF] to-[#0066FF] hover:from-[#0095FF] hover:to-[#0055EE] text-white pl-3.5 sm:pl-4 pr-1 sm:pr-1.5 py-1 sm:py-1 rounded-full shadow-[0_3px_12px_rgba(0,153,255,0.32)] hover:shadow-[0_6px_20px_rgba(0,153,255,0.45)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer border border-white/30 select-none"
          title="Masuk ke Akun LMS"
        >
          <span className="font-extrabold text-[11px] sm:text-xs tracking-wider uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">
            LOG IN
          </span>
          <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-[#0080FF] shadow-xs group-hover:bg-blue-50/90 group-hover:scale-105 transition-all duration-200">
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] text-[#0077EE] group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </button>
      </div>
    </nav>
  );
}
