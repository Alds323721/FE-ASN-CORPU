import React from 'react';
import { ChevronLeft } from 'lucide-react';
import hiasanImg from '../../assets/Hiasan.png';

export default function KuisHeader({ onBack, testData, answeredCount = 0 }) {
  return (
    <div
      className="bg-[#1D315F] py-6 md:py-8 px-6 md:px-12 relative overflow-hidden"
      style={{ backgroundImage: `url(${hiasanImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-[#1D315F] opacity-55"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-white text-2xl md:text-3xl font-semibold mb-4">{testData?.judul_kuis || 'Kuis Evaluasi'}</h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white text-xs sm:text-sm">
            <button
              onClick={onBack}
              className="flex items-center gap-1 hover:text-[#3FCDC1] transition-colors font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Pelatihan</span>
            </button>
            <span className="hidden sm:inline">•</span>
            <span className="text-xs sm:text-sm font-semibold">{testData?.judul_modul || 'Modul'}</span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <span className="text-white">Kuis</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <div className="w-16 sm:w-20 h-1.5 bg-[#3FCDC1] rounded-full"></div>
              <span className="text-white text-xs">{answeredCount}/{testData?.soal?.length || 0} Terjawab</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
