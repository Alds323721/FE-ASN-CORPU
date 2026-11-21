import React from 'react';
import {
  Users,
  HandHeart,
  Monitor,
  Landmark,
  Scale,
  Banknote,
  UserPlus,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import hiasanBalinese from '../../assets/Hiasan.png';

export default function CategoriesSection({ onSelectCategory }) {
  const categories = [
    {
      id: 'kepemimpinan',
      title: 'Manajemen Kepemimpinan',
      desc: 'Pengembangan kepemimpinan manajerial, perencanaan strategis, dan pengawasan ASN.',
      count: 42,
      icon: Users,
      gradient: 'from-[#1D315F] to-[#2563EB]'
    },
    {
      id: 'pelayanan-publik',
      title: 'Pelayanan Publik',
      desc: 'Standar pelayanan prima, etika publik, dan kepuasan masyarakat berbasis digital.',
      count: 38,
      icon: HandHeart,
      gradient: 'from-[#006A63] to-[#0D9488]'
    },
    {
      id: 'teknologi-informasi',
      title: 'Teknologi & Informasi',
      desc: 'Sistem Pemerintahan Berbasis Elektronik (SPBE), keamanan siber, dan data analitik.',
      count: 56,
      icon: Monitor,
      gradient: 'from-[#0284C7] to-[#0EA5E9]'
    },
    {
      id: 'tata-kelola',
      title: 'Tata Kelola Pemerintahan',
      desc: 'Reformasi birokrasi, sistem akuntabilitas kinerja SAKIP, dan kelembagaan daerah.',
      count: 29,
      icon: Landmark,
      gradient: 'from-[#4F46E5] to-[#6366F1]'
    },
    {
      id: 'hukum-kebijakan',
      title: 'Hukum & Kebijakan',
      desc: 'Penyusunan regulasi daerah, analisis perundang-undangan, dan kepatuhan hukum ASN.',
      count: 21,
      icon: Scale,
      gradient: 'from-[#BE123C] to-[#E11D48]'
    },
    {
      id: 'keuangan-negara',
      title: 'Keuangan Negara',
      desc: 'Pengelolaan APBD, penatausahaan aset daerah, SIPD, dan pengadaan barang/jasa.',
      count: 45,
      icon: Banknote,
      gradient: 'from-[#059669] to-[#10B981]'
    },
    {
      id: 'pengembangan-diri',
      title: 'Pengembangan Diri',
      desc: 'Internalisasi Core Values BerAKHLAK, komunikasi efektif, dan peningkatan kinerja.',
      count: 62,
      icon: UserPlus,
      gradient: 'from-[#D97706] to-[#F59E0B]'
    },
    {
      id: 'kesehatan-keselamatan',
      title: 'Kesehatan & Keselamatan',
      desc: 'Manajemen K3 perkantoran, tanggap darurat bencana, dan mitigasi risiko kerja.',
      count: 24,
      icon: ShieldCheck,
      gradient: 'from-[#C2410C] to-[#EA580C]'
    }
  ];

  const handleCardClick = (title) => {
    if (onSelectCategory) {
      onSelectCategory(title);
    } else {
      const el = document.getElementById('pendaftaran-komunitas');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCommunityScroll = () => {
    const el = document.getElementById('pendaftaran-komunitas');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-white via-[#F8FBFC] to-[#EFF5F8] px-4 sm:px-6 relative overflow-hidden">
      {/* Authentic Balinese Decorative Watermark Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl opacity-[0.04] pointer-events-none select-none">
        <img src={hiasanBalinese} alt="" className="w-full h-auto object-contain" />
      </div>

      {/* Atmospheric Soft Ambient Glows */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section Header */}
        <ScrollReveal animation="fade-up" className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1D315F] tracking-tight leading-tight">
            Komunitas & Kategori Pelatihan
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-2.5 leading-relaxed font-medium">
            Temukan berbagai topik dan jalur pengembangan kompetensi terstandar LAN RI yang selaras dengan rumpun jabatan, kompetensi teknis, serta sasaran kinerja Anda di pemerintahan.
          </p>
        </ScrollReveal>

        {/* 8 Categories Grid */}
        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {categories.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.id} animation="fade-up" delay={idx * 60} className="h-full">
                <div
                  onClick={() => handleCardClick(item.title)}
                  className="group relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-teal-300/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full overflow-hidden cursor-pointer"
                >
                  {/* Subtle Top-Right Ambient Accent */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-slate-50 group-hover:bg-teal-50/40 rounded-bl-full transition-colors pointer-events-none" />

                  <div>
                    {/* Top Row: Icon container & Pelatihan count */}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:scale-108 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100/90 group-hover:bg-teal-50 group-hover:text-[#006A63] px-2.5 py-1 rounded-lg border border-slate-200/70 transition-colors">
                        {item.count} Pelatihan
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-[17px] font-bold text-[#1D315F] group-hover:text-[#006A63] transition-colors leading-snug mb-2 relative z-10">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-[12.5px] text-gray-500 leading-relaxed font-normal relative z-10 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  {/* Subtle Bottom Accent Indicator on Hover */}
                  <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom Banner Prompt (Samakan dengan Section Berita) */}
        <ScrollReveal animation="fade-up" delay={200} className="mt-10 sm:mt-12">
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#1D315F] via-[#10306E] to-[#006A63] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-white/10">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                <Users className="w-5.5 h-5.5 text-amber-300" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">Ingin Mengusulkan Komunitas atau Rumpun Kompetensi Baru?</h4>
                <p className="text-xs sm:text-sm text-blue-100/80 font-normal">Daftarkan komunitas belajar anda untuk memperluas ruang belajar dan kolaborasi pengembangan kopetensi ASN.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCommunityScroll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#1D315F] hover:bg-amber-300 hover:text-[#1D315F] font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 shadow-md cursor-pointer"
            >
              <span>Daftarkan Komunitas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
