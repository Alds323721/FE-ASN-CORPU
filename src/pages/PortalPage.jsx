import React from 'react';
import { 
  Target, 
  UserCheck, 
  MonitorPlay, 
  ChevronRight, 
  BarChart3, 
  FileText, 
  BookOpen 
} from 'lucide-react';
import Swal from 'sweetalert2';
import portalBannerImg from '../assets/LANDING PAGE BKPSDM.jpg.jpeg';
import logoBkpsdm from '../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../assets/ASN-CORPU.png';

export default function PortalPage({ onNavigateLMS, onNavigate }) {
  const handleIdpClick = () => {
    window.open('https://idp.makarti.id/', '_blank', 'noopener,noreferrer');
  };

  const handleHcdpClick = () => {
    Swal.fire({
      icon: 'info',
      title: 'Masih dalam Pengembangan',
      html: `
        <div class="text-left text-sm text-gray-600 space-y-3 pt-2">
          <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
            <span class="text-lg leading-none">ℹ️</span>
            <div>
              <strong class="font-semibold block mb-0.5">Sistem HCDP Sedang Disiapkan</strong>
              Modul <b>Human Capital Development Plan (HCDP)</b> Pemerintah Kabupaten Buleleng saat ini dalam proses integrasi & penyempurnaan sistem.
            </div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">
            Layanan ini akan segera tersedia untuk memfasilitasi pemetaan dan perencanaan kebutuhan pengembangan kompetensi ASN Kabupaten Buleleng secara terpadu.
          </p>
        </div>
      `,
      confirmButtonColor: '#0066EB',
      confirmButtonText: 'Tutup',
      buttonsStyling: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-gray-100',
        confirmButton: 'rounded-xl px-6 py-2.5 font-semibold text-sm shadow-md'
      }
    });
  };

  return (
    <div className="w-full min-h-0 lg:h-screen lg:overflow-hidden relative flex flex-col font-['Inter'] bg-white select-none">
      {/* Container Banner & Tombol */}
      <div className="w-full relative flex items-center justify-center lg:flex-1 lg:h-full lg:w-full lg:overflow-hidden bg-white">
        {/* Wrapper Banner yang menjaga proporsi gambar dan posisi logo */}
        <div className="relative w-full max-w-7xl mx-auto lg:max-w-none lg:w-full lg:h-full flex items-center justify-center">
          {/* Gambar Poster: Stretched rapi mengisi layar desktop penuh tanpa terpotong (object-fill), Natural Aspect Ratio pada Mobile & iPad */}
          <img
            src={portalBannerImg}
            alt="Selamat Datang di Buleleng ASN Corpu"
            className="w-full h-auto lg:w-full lg:h-full object-contain lg:object-fill pointer-events-none select-none block"
          />

          {/* LOGO DI POJOK KIRI ATAS BANNER (Tepat di atas tulisan "Selamat Datang di", tidak menutupi tulisan) */}
          <div className="absolute top-1 sm:top-1.5 md:top-2.5 lg:top-3.5 xl:top-4 left-2.5 sm:left-3.5 md:left-5 lg:left-6 xl:left-8 z-30 flex items-center gap-1 sm:gap-1.5 lg:gap-2">
            <img 
              src={logoBkpsdm} 
              alt="Logo BKPSDM" 
              className="h-3.5 sm:h-5 md:h-6 lg:h-7 xl:h-8 w-auto object-contain drop-shadow-xs hover:scale-105 transition-transform" 
            />
            <img 
              src={asnCorpuLogo} 
              alt="Logo ASN Corpu" 
              className="h-3.5 sm:h-5 md:h-6 lg:h-7 xl:h-8 w-auto object-contain drop-shadow-xs hover:scale-105 transition-transform" 
            />
          </div>

          {/* TOMBOL KESAMPING (Desktop Layar Besar >= 1024px) */}
          <div className="hidden lg:block absolute left-0 right-0 z-20 px-6 lg:px-8 bottom-[19%] lg:bottom-[20%] xl:bottom-[21%] 2xl:bottom-[22%]">
            <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
              <div className="grid grid-cols-3 gap-3.5 lg:gap-5 xl:gap-6">
                
                {/* TOMBOL 1: HCDP (Biru) */}
                <button
                  type="button"
                  onClick={handleHcdpClick}
                  className="group relative overflow-hidden flex items-center justify-between p-3.5 sm:p-4 lg:p-4.5 xl:p-5 rounded-2xl bg-gradient-to-r from-[#0066EB] via-[#0055D0] to-[#0042B3] text-white shadow-xl hover:shadow-2xl border border-white/20 transform hover:-translate-y-1 hover:brightness-105 active:scale-98 transition-all duration-200 cursor-pointer text-left"
                >
                  {/* Silhouette Watermark Background */}
                  <BarChart3 className="absolute -right-2 -bottom-2 w-20 h-20 lg:w-24 lg:h-24 text-white/10 pointer-events-none" />

                  <div className="flex items-center gap-3 lg:gap-3.5 z-10 min-w-0 pr-2">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                      <Target className="w-5 h-5 lg:w-6 lg:h-6 text-white stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-white tracking-wide leading-tight drop-shadow-xs">
                        HCDP
                      </div>
                      <div className="text-[10px] sm:text-xs lg:text-xs text-blue-100 font-medium truncate drop-shadow-xs">
                        Human Capital Development Plan
                      </div>
                    </div>
                  </div>

                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-1 transition-transform z-10">
                    <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-[#0055D0] stroke-[3]" />
                  </div>
                </button>

                {/* TOMBOL 2: IDP (Gold / Amber) */}
                <button
                  type="button"
                  onClick={handleIdpClick}
                  className="group relative overflow-hidden flex items-center justify-between p-3.5 sm:p-4 lg:p-4.5 xl:p-5 rounded-2xl bg-gradient-to-r from-[#C27C00] via-[#B06F00] to-[#965E00] text-white shadow-xl hover:shadow-2xl border border-white/20 transform hover:-translate-y-1 hover:brightness-105 active:scale-98 transition-all duration-200 cursor-pointer text-left"
                >
                  {/* Silhouette Watermark Background */}
                  <FileText className="absolute -right-2 -bottom-2 w-20 h-20 lg:w-24 lg:h-24 text-white/10 pointer-events-none" />

                  <div className="flex items-center gap-3 lg:gap-3.5 z-10 min-w-0 pr-2">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                      <UserCheck className="w-5 h-5 lg:w-6 lg:h-6 text-white stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-white tracking-wide leading-tight drop-shadow-xs">
                        IDP
                      </div>
                      <div className="text-[10px] sm:text-xs lg:text-xs text-amber-100 font-medium truncate drop-shadow-xs">
                        Individual Development Plan
                      </div>
                    </div>
                  </div>

                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-1 transition-transform z-10">
                    <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-[#B06F00] stroke-[3]" />
                  </div>
                </button>

                {/* TOMBOL 3: LMS (Teal / Hijau) */}
                <button
                  type="button"
                  onClick={onNavigateLMS}
                  className="group relative overflow-hidden flex items-center justify-between p-3.5 sm:p-4 lg:p-4.5 xl:p-5 rounded-2xl bg-gradient-to-r from-[#00895D] via-[#007750] to-[#005E3F] text-white shadow-xl hover:shadow-2xl border border-white/20 transform hover:-translate-y-1 hover:brightness-105 active:scale-98 transition-all duration-200 cursor-pointer text-left"
                >
                  {/* Silhouette Watermark Background */}
                  <BookOpen className="absolute -right-2 -bottom-2 w-20 h-20 lg:w-24 lg:h-24 text-white/10 pointer-events-none" />

                  <div className="flex items-center gap-3 lg:gap-3.5 z-10 min-w-0 pr-2">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                      <MonitorPlay className="w-5 h-5 lg:w-6 lg:h-6 text-white stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-white tracking-wide leading-tight drop-shadow-xs">
                        LMS
                      </div>
                      <div className="text-[10px] sm:text-xs lg:text-xs text-emerald-100 font-medium truncate drop-shadow-xs">
                        Learning Management System
                      </div>
                    </div>
                  </div>

                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-1 transition-transform z-10">
                    <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-[#007750] stroke-[3]" />
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TAMPILAN MOBILE & IPAD/TABLET (< 1024px): Tombol tepat di bawah gambar tanpa celah berlebih, latar putih bersih */}
      <div className="lg:hidden w-full bg-white px-4 sm:px-6 pt-1.5 pb-4 sm:pb-6">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
          <div className="text-center mb-2.5 sm:mb-3.5">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              PILIH LAYANAN SISTEM TERPADU
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
              BKPSDM Pemerintah Kabupaten Buleleng
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {/* Mobile / Tablet HCDP */}
            <button
              type="button"
              onClick={handleHcdpClick}
              className="group flex items-center justify-between py-2.5 px-3.5 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0066EB] to-[#0047AB] text-white shadow-md hover:shadow-lg active:scale-98 transition-all duration-150 text-left cursor-pointer border border-blue-400/20"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <Target className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-black text-white leading-none">HCDP</div>
                  <div className="text-[10px] sm:text-xs text-blue-100 font-medium mt-0.5 sm:mt-1">Human Capital Development Plan</div>
                </div>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:translate-x-0.5 transition-transform">
                <ChevronRight className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[#0047AB] stroke-[3]" />
              </div>
            </button>

            {/* Mobile / Tablet IDP */}
            <button
              type="button"
              onClick={handleIdpClick}
              className="group flex items-center justify-between py-2.5 px-3.5 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#C27C00] to-[#8C5800] text-white shadow-md hover:shadow-lg active:scale-98 transition-all duration-150 text-left cursor-pointer border border-amber-400/20"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <UserCheck className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-black text-white leading-none">IDP</div>
                  <div className="text-[10px] sm:text-xs text-amber-100 font-medium mt-0.5 sm:mt-1">Individual Development Plan</div>
                </div>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:translate-x-0.5 transition-transform">
                <ChevronRight className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[#8C5800] stroke-[3]" />
              </div>
            </button>

            {/* Mobile / Tablet LMS */}
            <button
              type="button"
              onClick={onNavigateLMS}
              className="group flex items-center justify-between py-2.5 px-3.5 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#00895D] to-[#005B3D] text-white shadow-md hover:shadow-lg active:scale-98 transition-all duration-150 text-left cursor-pointer border border-emerald-400/20"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <MonitorPlay className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-black text-white leading-none">LMS</div>
                  <div className="text-[10px] sm:text-xs text-emerald-100 font-medium mt-0.5 sm:mt-1">Learning Management System</div>
                </div>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:translate-x-0.5 transition-transform">
                <ChevronRight className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[#005B3D] stroke-[3]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
