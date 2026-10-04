import React from 'react';
import { Clock, Check } from 'lucide-react';
import heroImg from '../../assets/BG_BKPSDM.jpg';

export default function HeroSection({ onAuthClick }) {
  return (
    <div className="relative h-[650px] sm:h-[700px] flex flex-col justify-center text-left">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#1D315F]/50 z-10"></div>
        <img
          src={heroImg}
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col md:flex-row justify-between items-center mt-10">

        {/* Left Content */}
        <div className="w-full md:w-1/2 text-white mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Inter'] font-semibold text-white mb-4 md:mb-6 tracking-tight">BKPSDM</h1>
          <p className="text-sm md:text-base lg:text-lg text-white/90 leading-relaxed max-w-xl mb-6">
            Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Buleleng bertugas membantu Bupati melaksanakan fungsi penunjang urusan pemerintahan di bidang kepegawaian serta pendidikan dan pelatihan.
          </p>
          <div className="inline-block mt-4">
            <button
              onClick={onAuthClick}
              className="bg-[#10B981] text-white font-bold py-3 px-10 text-sm sm:text-base rounded-full hover:bg-[#0d9668] transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-1 cursor-pointer"
            >
              Masuk Menggunakan NIP
            </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-5/12 bg-white/10 backdrop-blur-sm border border-white/20 p-6 md:p-8 rounded-2xl shadow-xl">
          <h3 className="text-white font-bold text-lg md:text-xl mb-5 border-b border-white/20 pb-3">Bidang Layanan</h3>
          <ul className="space-y-4">
            {[
              'Bidang Penilaian Kinerja Aparatur dan Promosi (PKAP)',
              'Bidang Pengadaan, Pemberhentian dan Informasi (PPI)',
              'Bidang Mutasi',
              'Bidang Pengembangan Kompetensi Aparatur (PKA)'
            ].map((bidang, idx) => (
              <li key={idx} className="flex items-start gap-3 text-white/90 text-sm md:text-base">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3FCDC1]/20 border border-[#3FCDC1]/50 text-[#3FCDC1] flex items-center justify-center mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>{bidang}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Jam Pelayanan (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 hidden md:block text-right text-white/80 text-xs bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-white/10">
        <p className="font-semibold text-[#3FCDC1] mb-1"><Clock className="inline w-3.5 h-3.5 mr-1" /> Jam Pelayanan</p>
        <p>Senin - Kamis: 07.30 - 16.00</p>
        <p>Jumat: 07.00 - 13.00</p>
      </div>
    </div>
  );
}
