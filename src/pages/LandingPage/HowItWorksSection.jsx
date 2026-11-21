import React from 'react';
import {
  Fingerprint,
  BookOpenCheck,
  GraduationCap,
  Award,
  CheckCircle2,
  LogIn
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import hiasanBalinese from '../../assets/Hiasan.png';

export default function HowItWorksSection({ onLoginClick }) {
  const steps = [
    {
      step: '01',
      title: 'Login dengan NIP Resmi',
      desc: 'Masuk ke portal dengan 18 digit NIP resmi Anda. Untuk pertama kali, kata sandi dapat diatur langsung secara mandiri melalui menu Lupa Sandi.',
      icon: Fingerprint,
      gradient: 'from-[#1D315F] to-[#2563EB]',
      highlights: ['Autentikasi Aman & Cepat', 'Profil ASN Terverifikasi']
    },
    {
      step: '02',
      title: 'Pilih Pelatihan & Jalur',
      desc: 'Eksplorasi katalog pelatihan terakreditasi dan pilih materi yang selaras dengan rumpun jabatan, kompetensi teknis, dan sasaran kinerja Anda.',
      icon: BookOpenCheck,
      gradient: 'from-[#0284C7] to-[#38BDF8]',
      highlights: ['Katalog Standar LAN RI', 'Sesuai Kebutuhan Karier']
    },
    {
      step: '03',
      title: 'Belajar Mandiri & Kuis',
      desc: 'Akses modul pembelajaran interaktif, video materi, dan studi kasus kapan saja. Selesaikan kuis evaluasi pemahaman di akhir materi sesuai ritme Anda.',
      icon: GraduationCap,
      gradient: 'from-[#D97706] to-[#F59E0B]',
      highlights: ['Materi Interaktif & Ringkas', 'Kuis Evaluasi Pemahaman']
    },
    {
      step: '04',
      title: 'Dapatkan E-Sertifikat',
      desc: 'Unduh sertifikat digital resmi ber-barcode validasi setelah menuntaskan kursus. Capaian jam pelajaran (JP) otomatis terintegrasi ke portofolio ASN.',
      icon: Award,
      gradient: 'from-[#059669] to-[#10B981]',
      highlights: ['Barcode Verifikasi Resmi', 'Terintegrasi Riwayat Diklat']
    }
  ];

  const handleLoginAction = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      window.location.href = '/LMS';
    }
  };

  return (
    <section className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-white via-[#F4F9FB] to-[#EBF3F6] overflow-hidden">
      {/* Authentic Balinese Decorative Watermark Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl opacity-[0.05] pointer-events-none select-none">
        <img src={hiasanBalinese} alt="" className="w-full h-auto object-contain" />
      </div>

      {/* Atmospheric Soft Ambient Glows */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-teal-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <ScrollReveal animation="fade-up" className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1D315F] tracking-tight leading-tight">
            Cara Kerja & Alur Platform
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-3 leading-relaxed font-medium">
            Empat langkah praktis bagi Aparatur Sipil Negara di lingkungan Pemkab Buleleng untuk meningkatkan kompetensi secara mandiri hingga penerbitan sertifikat resmi.
          </p>
        </ScrollReveal>

        {/* 4 Process Cards Grid with Connecting Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 relative">

          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.step} animation="fade-up" delay={idx * 130} className="h-full">
                <div className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-teal-300/80 hover:-translate-y-2.5 transition-all duration-300 flex flex-col justify-between h-full overflow-hidden">

                  {/* Watermark Large Step Number in Background */}
                  <span className="absolute top-3 right-4 text-5xl sm:text-6xl font-black text-slate-100 group-hover:text-teal-50/70 transition-colors pointer-events-none select-none font-mono">
                    {item.step}
                  </span>

                  <div>
                    {/* Top Row: Icon Container */}
                    <div className="mb-5 relative z-10">
                      <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-md shadow-blue-900/10 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6.5 h-6.5 sm:w-7 sm:h-7 stroke-[2.2]" />
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#1D315F] group-hover:text-[#006A63] transition-colors leading-snug mb-2.5 relative z-10">
                      {item.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal mb-5 relative z-10">
                      {item.desc}
                    </p>
                  </div>

                  {/* Key Highlights List */}
                  <div className="pt-4 border-t border-slate-100 space-y-2 relative z-10">
                    {item.highlights.map((highlight, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-[11.5px] font-semibold text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#006A63] shrink-0" />
                        <span className="truncate">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Accent Highlight Bar on Hover */}
                  <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </div>
              </ScrollReveal>
            );
          })}

        </div>

        {/* Interactive Bottom CTA Banner */}
        <ScrollReveal animation="fade-up" delay={300} className="mt-14 sm:mt-18">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1D315F] via-[#153B75] to-[#006A63] text-white p-6 sm:p-10 shadow-2xl border border-white/10">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 text-center lg:text-left">
              <div className="max-w-2xl">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Siap Meningkatkan Kompetensi Anda?
                </h3>
                <p className="text-xs sm:text-sm text-blue-100/90 mt-2 leading-relaxed font-normal">
                  Penuhi target minimal 20 Jam Pelajaran (JP) per tahun dengan fleksibilitas pembelajaran mandiri di Buleleng ASN Corporate University.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleLoginAction}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white hover:bg-amber-300 text-[#1D315F] hover:text-[#1D315F] font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Masuk Portal LMS</span>
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
