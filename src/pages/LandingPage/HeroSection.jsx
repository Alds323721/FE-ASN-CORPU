import React from 'react';
import heroImg from '../../assets/BG_BKPSDM.jpg';

export default function HeroSection() {
  return (
    <div className="relative w-full overflow-hidden select-none bg-white">
      {/* Gambar Hero Banner: Tampil Utuh 100% Tanpa Terpotong */}
      <div className="relative w-full">
        <img
          src={heroImg}
          alt="Learning Management System BKPSDM"
          className="w-full h-auto block pointer-events-none"
        />
      </div>
    </div>
  );
}
