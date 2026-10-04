import React from 'react';
import { ChevronLeft } from 'lucide-react';
import hiasanImg from '../../assets/Hiasan.png';

export default function CourseHeader({ onBack, courseData }) {
  return (
    <div
      className="bg-[#1D315F] py-6 md:py-8 px-6 md:px-12 relative overflow-hidden"
      style={{ backgroundImage: `url(${hiasanImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-[#1D315F] opacity-55"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-white text-2xl md:text-3xl font-bold mb-4">{courseData?.judul || 'Detail Pelatihan'}</h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white text-xs sm:text-sm">
            <button
              onClick={onBack}
              className="flex items-center gap-1 hover:text-[#3FCDC1] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Pelatihanku</span>
            </button>
            <span className="hidden sm:inline">•</span>
            <span className="text-xs sm:text-sm">{courseData?.kategori || ''}</span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-white">{courseData?.progress}% Selesai</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <div className="w-32 sm:w-48 h-2 bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-[#3FCDC1]" style={{ width: `${courseData?.progress || 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
