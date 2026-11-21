import React, { useEffect, useRef } from 'react';
import logoImg from '../../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../../assets/ASN-CORPU.png';
import logoLanRi from '../../assets/logo-lan-ri.webp';
import { LogIn } from 'lucide-react';

export default function LandingNavbar({ onLoginClick }) {
  const progressBarRef = useRef(null);

  useEffect(() => {
    // Fallback scroll progress tracking for browsers without native animation-timeline: scroll()
    if (!window.CSS || !CSS.supports || !CSS.supports('animation-timeline', 'scroll()')) {
      const handleScroll = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable > 0 && progressBarRef.current) {
          const ratio = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
          progressBarRef.current.style.transform = `scaleX(${ratio})`;
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs flex items-center justify-between px-4 sm:px-8 py-2.5 h-16 sm:h-18 transition-all animate-entrance-nav">
      {/* Brand Cluster: Logo LAN -> Logo PEMKAB BULELENG -> Logo Buleleng ASN CORPU */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        <img
          src={logoLanRi}
          alt="Logo LAN RI"
          className="h-7 sm:h-8 w-auto object-contain shrink-0"
        />
        <img
          src={logoImg}
          alt="Logo Pemkab Buleleng"
          className="h-8 sm:h-9 w-auto object-contain shrink-0"
        />
        <img
          src={asnCorpuLogo}
          alt="Logo Buleleng ASN Corpu"
          className="h-8 sm:h-9 w-auto object-contain shrink-0"
        />
        <span className="hidden min-[520px]:inline font-extrabold text-base sm:text-xl text-[#1D315F] tracking-tight truncate">
          Buleleng ASN Corpu
        </span>
      </div>

      {/* Navigasi menu dihilangkan sesuai permintaan; hanya menyisakan tombol login masuk LMS jika dibutuhkan */}
      <div className="flex items-center gap-3 shrink-0">
        {onLoginClick && (
          <button
            type="button"
            onClick={onLoginClick}
            className="group relative inline-flex items-center gap-2 bg-[#1D315F] hover:bg-[#152747] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md hover:shadow-[#1D315F]/20 transition-all duration-200 active:scale-[0.98] cursor-pointer border border-[#1D315F]/20"
            title="Masuk ke Akun LMS"
          >
            <span>Log In</span>
            <LogIn className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 group-hover:text-amber-300 transition-all duration-200" />
          </button>
        )}
      </div>

      {/* Top Scroll Progress Indicator */}
      <div
        ref={progressBarRef}
        aria-hidden="true"
        className="scroll-progress-bar absolute bottom-0 left-0 h-[2.5px] w-full bg-gradient-to-r from-[#1D315F] via-[#2563EB] to-[#D97706] origin-left pointer-events-none"
      />
    </nav>
  );
}
