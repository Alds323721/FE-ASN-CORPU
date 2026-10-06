import React from 'react';
import heroImg from '../../assets/BG_BKPSDM.jpg';

export default function HeroSection({ onAuthClick }) {
  return (
    <div className="relative w-full overflow-hidden select-none bg-white">
      {/* Gambar Hero Banner: Tampil Utuh 100% Tanpa Terpotong */}
      <div className="relative w-full">
        <img
          src={heroImg}
          alt="Learning Management System BKPSDM"
          className="w-full h-auto block pointer-events-none"
        />

        {/* Tampilan Desktop & Tablet (>= sm): Tombol Kaca Bening Transparan Murni dengan Teks Hitam */}
        <div className="hidden sm:block absolute top-[41%] sm:top-[42%] left-[3.5%] sm:left-[4%] z-20">
          <button
            onClick={onAuthClick}
            className="group relative overflow-hidden bg-white/15 hover:bg-white/25 backdrop-blur-2xl border border-white/50 hover:border-white/70 text-black font-bold py-2 sm:py-2.5 md:py-3 lg:py-3.5 px-6 sm:px-7 md:px-9 lg:px-11 text-xs sm:text-sm md:text-base lg:text-lg rounded-full transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_32px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-95 cursor-pointer tracking-wide"
          >
            <span className="relative z-10 text-black">Masuk Menggunakan NIP</span>
          </button>
        </div>
      </div>

      {/* Tampilan Mobile (< sm): Tombol kaca bening teks hitam */}
      <div className="sm:hidden w-full bg-white px-4 py-3.5 flex justify-center border-b border-gray-100 shadow-2xs">
        <button
          onClick={onAuthClick}
          className="w-full max-w-xs bg-slate-900/10 hover:bg-slate-900/15 text-black font-bold py-2.5 px-6 text-sm rounded-full backdrop-blur-xl border border-slate-300 transition-all shadow-xs active:scale-95 cursor-pointer text-center tracking-wide"
        >
          Masuk Menggunakan NIP
        </button>
      </div>
    </div>
  );
}
