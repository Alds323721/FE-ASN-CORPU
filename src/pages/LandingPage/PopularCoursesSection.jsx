import React from 'react';
import { Clock, BookOpen, Star, ChevronRight } from 'lucide-react';

const CourseCard = ({ image, category, title, instructor, jpl, modules, rating }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all">
    <div className="relative h-44">
      <img src={image} alt={title} className="w-full h-full object-cover" />
      <div className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded text-[11px] font-bold text-[#1D315F] shadow-sm">
        {category}
      </div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <h3 className="font-bold text-[#1D315F] text-[15px] leading-snug line-clamp-2 mb-4 flex-1">{title}</h3>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor}`} alt={instructor} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-[#1D315F]">{instructor}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-5 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-gray-400" /> {jpl} JPL
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <BookOpen className="w-3.5 h-3.5 text-gray-400" /> {modules} Modul
        </div>
        <div className="flex items-center gap-1 text-[#F59E0B] font-bold">
          <Star className="w-3.5 h-3.5 fill-current" /> {rating}
        </div>
      </div>

      <button className="w-full py-2.5 border border-[#006A63] text-[#006A63] bg-[#FFFFFF] rounded-md text-[13px] font-bold hover:bg-[#006A63] hover:text-white transition-colors cursor-pointer">
        Mulai Belajar
      </button>
    </div>
  </div>
);

export default function PopularCoursesSection() {
  const courses = [
    {
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      category: "Tata Kelola",
      title: "Manajemen Digitalisasi Pelayanan Publik Aparatur",
      instructor: "Dr. Budi Santoso, M.Si",
      jpl: 24,
      modules: 6,
      rating: 4.8
    },
    {
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop",
      category: "Kepemimpinan",
      title: "Kepemimpinan Transformasional di Era Digital",
      instructor: "Dra. Siti Aminah, MPA",
      jpl: 32,
      modules: 8,
      rating: 4.9
    },
    {
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop",
      category: "Keuangan",
      title: "Teknis Penyusunan Anggaran Kinerja Berbasis Hasil",
      instructor: "Ir. Ahmad Wahyudi, MM",
      jpl: 18,
      modules: 5,
      rating: 4.7
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-[#EFF5F3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] mb-2">Pelatihan Terpopuler</h2>
            <p className="text-gray-500 text-xs sm:text-sm">Ikuti pelatihan yang paling banyak diminati oleh rekan-rekan ASN lainnya.</p>
          </div>
          <a href="#" className="text-[#3FCDC1] text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline">
            Lihat Semua Pelatihan <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {courses.map((course, idx) => (
            <CourseCard key={idx} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
}
