import React, { useState } from 'react';
import {
  Newspaper,
  Calendar,
  ArrowUpRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

export default function NewsSection() {
  const [activeCategory, setActiveCategory] = useState('Semua');

  const categories = ['Semua', 'Kedinasan', 'Kepegawaian', 'Sosial & Lingkungan'];

  const allNews = [
    {
      id: 1,
      title: "APEL PAGI, SATUKAN LANGKAH",
      category: "Kedinasan",
      date: "07 September 2026",
      author: "Humas BKPSDM",
      excerpt: "Meningkatkan kedisiplinan dan soliditas korps pegawai di lingkungan Pemkab Buleleng dalam menyukseskan program kerja terintegrasi.",
      image: "https://bkpsdm.bulelengkab.go.id/uploads/konten/thumbnail/28_apel-pagi-satukan-langkah_2026-09-07-08-35-21.jpeg",
      url: "https://bkpsdm.bulelengkab.go.id/informasi/detail/berita/28_apel-pagi-satukan-langkah",
      iconColor: "text-blue-400"
    },
    {
      id: 2,
      title: "BKPSDM Buleleng Ikut Aksi Bersih Lingkungan",
      category: "Sosial & Lingkungan",
      date: "04 September 2026",
      author: "Humas BKPSDM",
      excerpt: "Wujud kepedulian nyata aparatur negara terhadap kelestarian ekosistem dan kebersihan lingkungan hidup di wilayah Kabupaten Buleleng.",
      image: "https://bkpsdm.bulelengkab.go.id/uploads/konten/thumbnail/76_bkpsdm-buleleng-ikut-aksi-bersih-lingkungan_2026-09-04-08-31-45.jpeg",
      url: "https://bkpsdm.bulelengkab.go.id/informasi/detail/berita/76_bkpsdm-buleleng-ikut-aksi-bersih-lingkungan",
      iconColor: "text-emerald-400"
    },
    {
      id: 3,
      title: "Rekonsiliasi Data Peserta Tapera 2026",
      category: "Kepegawaian",
      date: "03 September 2026",
      author: "Humas BKPSDM",
      excerpt: "Sinkronisasi dan pemadanan data kepesertaan Tabungan Perumahan Rakyat guna memastikan transparansi dan keakuratan hak ASN.",
      image: "https://bkpsdm.bulelengkab.go.id/uploads/konten/thumbnail/82_rekonsiliasi-data-peserta-tapera-2026_08-44-08.jpeg",
      url: "https://bkpsdm.bulelengkab.go.id/informasi/detail/berita/82_rekonsiliasi-data-peserta-tapera-2026",
      iconColor: "text-amber-400"
    }
  ];

  const filteredNews = activeCategory === 'Semua'
    ? allNews
    : allNews.filter(n => n.category === activeCategory);

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#F3F7FA] via-[#EAF1F5] to-[#E2ECF2] px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative Subtle Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <ScrollReveal animation="fade-up" className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1D315F] tracking-tight leading-tight">
              Berita & Agenda Terkini
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-2.5 leading-relaxed font-medium">
              Ikuti liputan kegiatan, agenda resmi kedinasan, dan pembaruan kebijakan pengembangan kompetensi ASN Kabupaten Buleleng.
            </p>
          </ScrollReveal>

          {/* Direct External Portal Link Button */}
          <ScrollReveal animation="fade-left" delay={100} className="shrink-0">
            <a
              href="https://bkpsdm.bulelengkab.go.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-amber-300 text-[#1D315F] hover:text-[#1D315F] border border-slate-200 hover:border-amber-300 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <span>Kunjungi Website BKPSDM Buleleng</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </ScrollReveal>
        </div>

        {/* Interactive Category Filter Tabs */}
        <ScrollReveal animation="fade-up" delay={150} className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#006A63] text-white shadow-md shadow-teal-900/15 ring-2 ring-[#006A63]/30 scale-102'
                      : 'bg-white/90 hover:bg-white text-gray-600 hover:text-[#1D315F] border border-gray-200/90 shadow-2xs'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {filteredNews.map((item, idx) => (
            <ScrollReveal key={item.id} animation="fade-up" delay={idx * 120} className="h-full">
              <article className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-teal-300/80 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">

                {/* Thumbnail Image Container with Badge Overlays */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Soft bottom vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

                  {/* Top-Left Category Badge (Konsep Dark Translucent Capsule) */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold border border-white/15 shadow-sm">
                      <Tag className={`w-3.5 h-3.5 ${item.iconColor || 'text-amber-300'}`} />
                      <span>{item.category}</span>
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Metadata: Date and Author */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-2.5">
                      <span className="inline-flex items-center gap-1 text-gray-600 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-[#006A63]" />
                        <span>{item.date}</span>
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] text-gray-400">{item.author}</span>
                    </div>

                    {/* Headline Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#1D315F] group-hover:text-[#006A63] transition-colors line-clamp-2 leading-snug">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </h3>

                    {/* Excerpt Description */}
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed line-clamp-2 mt-2 font-normal">
                      {item.excerpt}
                    </p>
                  </div>

                  {/* Card Bottom CTA Action */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#006A63] group-hover:text-[#004D47] transition-colors group/btn"
                    >
                      <span>Baca Berita</span>
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>

                    <span className="text-[10.5px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      Portal Resmi
                    </span>
                  </div>
                </div>

              </article>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom Banner Prompt */}
        <ScrollReveal animation="fade-up" delay={250} className="mt-10 sm:mt-12">
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#1D315F] via-[#10306E] to-[#006A63] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-white/10">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                <Newspaper className="w-5.5 h-5.5 text-amber-300" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">Ingin Mengetahui Agenda & Informasi Lengkap Lainnya?</h4>
                <p className="text-xs sm:text-sm text-blue-100/80 font-normal">Kunjungi website resmi BKPSDM Kabupaten Buleleng untuk mengakses informasi layanan, publikasi, dan pengumuman kepegawaian.</p>
              </div>
            </div>
            <a
              href="https://bkpsdm.bulelengkab.go.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#1D315F] hover:bg-amber-300 hover:text-[#1D315F] font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 shadow-md cursor-pointer"
            >
              <span>Kunjungi Website BKPSDM Buleleng</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
