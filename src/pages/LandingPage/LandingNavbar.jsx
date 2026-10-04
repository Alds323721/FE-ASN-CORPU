import React from 'react';
import logoImg from '../../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../../assets/ASN-CORPU.png';

export default function LandingNavbar({ onLoginClick }) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-t-[5px] border-[#0099FF] shadow-sm flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logoImg} alt="Logo BKPSDM" className="w-7 sm:w-9 h-7 sm:h-9 object-contain" />
        <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-7 sm:w-9 h-7 sm:h-9 object-contain" />
        <span className="font-bold text-lg sm:text-xl text-[#1D315F] tracking-wide">Buleleng ASN Corpu</span>
      </div>
      <button
        onClick={onLoginClick}
        className="border border-gray-400 text-[#4B5563] font-semibold py-1.5 sm:py-2 px-3 sm:px-5 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer text-xs sm:text-sm shadow-sm"
      >
        Login
      </button>
    </nav>
  );
}
