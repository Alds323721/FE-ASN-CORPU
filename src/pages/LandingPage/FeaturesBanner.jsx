import React from 'react';
import { TrendingUp, Award, CalendarCheck } from 'lucide-react';

export default function FeaturesBanner() {
  return (
    <div className="bg-[#1D315F] text-white py-6 relative z-20 shadow-xl">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 px-6 divide-y divide-white/10 md:divide-y-0 md:divide-x">
        <div className="flex items-center gap-5 justify-start md:justify-center py-5 md:py-2 px-4">
          <div className="bg-white/10 p-3.5 rounded-full flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-[#3FCDC1]" />
          </div>
          <p className="text-[14px] text-gray-200 font-medium">Pembelajaran Berbasis Progres</p>
        </div>

        <div className="flex items-center gap-5 justify-start md:justify-center py-5 md:py-2 px-4">
          <div className="bg-white/10 p-3.5 rounded-full flex-shrink-0">
            <Award className="w-5 h-5 text-[#3FCDC1]" />
          </div>
          <p className="text-[14px] text-gray-200 font-medium">Tercatat di sistem kepegawaian</p>
        </div>

        <div className="flex items-center gap-5 justify-start md:justify-center py-5 md:py-2 px-4">
          <div className="bg-white/10 p-3.5 rounded-full flex-shrink-0">
            <CalendarCheck className="w-5 h-5 text-[#3FCDC1]" />
          </div>
          <p className="text-[14px] text-gray-200 font-medium">Akses tak terbatas untuk ASN</p>
        </div>
      </div>
    </div>
  );
}
