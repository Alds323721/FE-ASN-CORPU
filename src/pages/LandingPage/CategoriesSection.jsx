import React from 'react';
import {
  Users,
  HandHeart,
  Monitor,
  Landmark,
  Scale,
  Banknote,
  UserPlus,
  ShieldCheck
} from 'lucide-react';

const CategoryCard = ({ icon: Icon, title, count }) => (
  <div className="bg-white border border-[#BBC9C7] rounded-md p-6 md:p-8 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-[#3FCDC1] transition-all cursor-pointer group">
    <div className="bg-[#3FCDC1] text-[#00534D] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4 md:mb-5 shadow-sm group-hover:scale-110 group-hover:bg-[#00534D] group-hover:text-[#3FCDC1] transition-all duration-300">
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
    </div>
    <h3 className="font-bold text-[#1D315F] text-xs md:text-[13px] mb-2">{title}</h3>
    <p className="text-[10px] md:text-[11px] text-gray-500 font-medium">{count} Pelatihan</p>
  </div>
);

export default function CategoriesSection() {
  const categories = [
    { icon: Users, title: 'Manajemen Kepemimpinan', count: 42 },
    { icon: HandHeart, title: 'Pelayanan Publik', count: 38 },
    { icon: Monitor, title: 'Teknologi & Informasi', count: 56 },
    { icon: Landmark, title: 'Tata Kelola Pemerintahan', count: 29 },
    { icon: Scale, title: 'Hukum & Kebijakan', count: 21 },
    { icon: Banknote, title: 'Keuangan Negara', count: 45 },
    { icon: UserPlus, title: 'Pengembangan Diri', count: 62 },
    { icon: ShieldCheck, title: 'Kesehatan & Keselamatan', count: 24 },
  ];

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto bg-white">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] mb-2 md:mb-3">Komunitas & Kategori Pelatihan</h2>
        <p className="text-gray-500 text-xs sm:text-sm px-4">
          Temukan berbagai topik pelatihan yang relevan dengan bidang<br className="hidden sm:block" />
          tugas dan fungsi Anda di pemerintahan.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {categories.map((cat, idx) => (
          <CategoryCard key={idx} {...cat} />
        ))}
      </div>
    </section>
  );
}
