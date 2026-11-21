import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Route,
  Users,
  Users2,
  Award,
  Bell,
  Target,
  MonitorPlay,
  ExternalLink,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import sloganWhiteImg from '../../assets/slogan_asn_buleleng_white.png';
import asnTeamImg from '../../assets/asn_workers_team.webp';

export default function HeroSection({ onAuthClick }) {
  const [heroReentryKey, setHeroReentryKey] = React.useState(0);
  const hasScrolledDownRef = React.useRef(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 350) {
        hasScrolledDownRef.current = true;
      } else if (currentY < 90 && hasScrolledDownRef.current) {
        // Pengguna melakukan scroll kembali ke atas (hero section)
        hasScrolledDownRef.current = false;
        setHeroReentryKey((k) => k + 1);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleIdpClick = () => {
    window.open('https://idp.makarti.id/', '_blank', 'noopener,noreferrer');
  };

  const handleLmsClick = () => {
    if (onAuthClick) {
      onAuthClick('dashboard');
    } else {
      window.location.href = '/LMS';
    }
  };

  const scrollToContent = () => {
    const el = document.getElementById('kategori-pelatihan');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: 550, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-gradient-to-b from-[#EFF6F9] via-[#E4EFF5] to-[#DAE8F0] pt-1 sm:pt-2 lg:pt-3 pb-0 overflow-hidden select-none min-h-[calc(100vh-4rem)] flex flex-col justify-between">

      {/* 1. Initial Shimmer Light Sweep Accent on First Load & Scroll Up Return */}
      <div key={`shimmer-${heroReentryKey}`} className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer-sweep" />
      </div>

      {/* 2. Digital Mesh Grid Texture with Soft Radial Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(#1D315F_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-[0.045] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] z-0" />

      {/* 3. Atmospheric Aurora Ambient Glows */}
      <div className="absolute -top-20 left-[10%] w-[420px] h-[420px] bg-amber-300/20 rounded-full blur-3xl pointer-events-none z-0 animate-glow-bloom" />
      <div className="absolute top-1/4 right-[30%] w-[500px] h-[500px] bg-cyan-300/20 rounded-full blur-3xl pointer-events-none z-0 animate-glow-bloom [animation-delay:200ms]" />
      <div className="absolute top-1/2 right-10 w-[420px] h-[420px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0 animate-glow-bloom [animation-delay:350ms]" />

      {/* MOBILE-ONLY TOP-RIGHT BLUE ARCH & SLOGAN (Persis Gambar Referensi) */}
      <div className="lg:hidden absolute top-0 right-0 z-10 pointer-events-none overflow-hidden select-none">
        <div className="relative w-40 xs:w-48 sm:w-60 h-34 xs:h-42 sm:h-52 bg-gradient-to-bl from-[#052C65] via-[#032451] to-[#021A3D] rounded-bl-[110px] xs:rounded-bl-[140px] sm:rounded-bl-[170px] border-b-[6px] xs:border-b-8 sm:border-b-10 border-l-[6px] xs:border-l-8 sm:border-l-10 border-[#F1B904] shadow-xl flex items-center justify-center p-3 xs:p-4 pt-2 pr-2">
          {/* Subtle inner radial glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
          <img
            src={sloganWhiteImg}
            alt="ASN Kompeten Buleleng Paten"
            className="w-26 xs:w-32 sm:w-42 h-auto object-contain drop-shadow-md -rotate-3 translate-x-1 -translate-y-1"
          />
        </div>
      </div>

      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10 w-full flex-grow flex flex-col justify-between">

        {/* Main 2-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center min-h-0 lg:min-h-[640px] xl:min-h-[700px] pt-2 sm:pt-4 lg:pt-3 pb-4 lg:pb-8">

          {/* Kolom Kiri: Teks Sambutan, Judul Besar, dan 2 Tombol Bulat Beranimasi */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left z-20 pt-2 sm:pt-4 lg:pt-0 pr-0 lg:pr-6 xl:pr-8">

            {/* Teks "Selamat Datang di" asli dengan font Courgette (Sejajar dengan Judul di Bawahnya) */}
            <div key={`welcome-${heroReentryKey}`} className="block animate-entrance-slide-right [animation-delay:100ms] text-left">
              <span className="font-courgette text-[#1D315F] text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-[2.35rem] xl:text-[2.85rem] 2xl:text-[3.1rem] leading-tight select-none drop-shadow-xs block font-normal tracking-normal -mb-1 sm:-mb-2">
                Selamat Datang di
              </span>
            </div>

            {/* Judul Besar: BULELENG ASN CORPU (Mobile) / CORPORATE UNIVERSITY (Desktop) */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[2.85rem] xl:text-[3.65rem] 2xl:text-6xl font-black tracking-tight leading-[1.1] sm:leading-[1.08] text-[#1D315F] animate-entrance-slide-up [animation-delay:220ms] max-w-[220px] xs:max-w-[280px] sm:max-w-none">
              <span className="text-[#D97706]">BULELENG</span>{' '}
              <span>ASN</span>
              <br />
              <span className="lg:hidden text-[#1D315F]">CORPU</span>
              <span className="hidden lg:inline text-[#1D315F]">CORPORATE UNIVERSITY</span>
            </h1>

            {/* Sub-judul Sesuai Gambar Banner */}
            <p className="text-gray-600 text-xs sm:text-base md:text-lg lg:text-lg leading-relaxed max-w-xl lg:max-w-lg xl:max-w-xl font-medium animate-entrance-slide-up [animation-delay:340ms]">
              Sistem Pembelajaran Pengembangan Kompetensi secara Terintegrasi bagi Aparatur Sipil Negara di Lingkungan Pemerintah Kabupaten Buleleng
            </p>

            {/* MOBILE ONLY: 2 Tombol Bulat di Kolom Kiri (Konsep Warna Baru Sesuai Gambar Referensi) */}
            <div key={`buttons-mobile-${heroReentryKey}`} className="block lg:hidden pt-4 pb-3 sm:pt-6 sm:pb-5">
              <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-8">

                {/* TOMBOL BULAT 1: HCDP & IDP (BIRU) */}
                <div className="relative group shrink-0 flex flex-col items-center animate-entrance-pop [animation-delay:460ms]">
                  <div className="animate-float flex flex-col items-center">
                    {/* Pill Badge PERENCANAAN & PENGEMBANGAN (Biru) */}
                    <div className="z-30 mb-2.5 sm:mb-3 px-2.5 sm:px-3 py-0.5 rounded-full bg-[#1D315F] text-white text-[7px] sm:text-[8px] font-black tracking-normal uppercase shadow-md border border-white/30 select-none whitespace-nowrap">
                      PERENCANAAN & PENGEMBANGAN
                    </div>

                    <div className="relative">
                      {/* Outer Orbiting Light Halo (Cahaya Biru Melingkar) */}
                      <div
                        className="absolute -inset-2 sm:-inset-2.5 rounded-full blur-md opacity-85 group-hover:opacity-100 pointer-events-none animate-orbit-light transition-opacity duration-300"
                        style={{
                          background: 'conic-gradient(from 0deg, transparent 0%, transparent 40%, rgba(37,99,235,0.25) 60%, rgba(96,165,250,0.85) 85%, #60A5FA 95%, #FFFFFF 100%)'
                        }}
                      />
                      {/* Soft Ambient Core Glow */}
                      <div className="absolute -inset-1 rounded-full bg-blue-500/20 blur-sm pointer-events-none" />

                      {/* Rotating Ring Container */}
                      <div className="relative p-[3px] sm:p-1 rounded-full overflow-hidden shadow-[0_0_24px_rgba(37,99,235,0.4),0_8px_24px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-transform duration-300">
                        {/* Active Spinning Conic Gradient Ring */}
                        <div
                          className="absolute inset-[-100%] animate-orbit-light pointer-events-none"
                          style={{
                            background: 'conic-gradient(from 0deg, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.2) 45%, rgba(59,130,246,0.5) 70%, #3B82F6 85%, #93C5FD 95%, #FFFFFF 100%)'
                          }}
                        />

                        {/* Badan Tombol Putih Bersih Seperti Gambar Referensi */}
                        <button
                          type="button"
                          onClick={handleIdpClick}
                          className="relative flex flex-col items-center justify-center w-28 h-28 sm:w-34 sm:h-34 rounded-full bg-gradient-to-b from-white via-[#F8FAFC] to-[#EFF6FF] border-2 border-blue-200/90 text-[#1D315F] cursor-pointer active:scale-95 transition-all duration-200 text-center p-2 overflow-hidden z-10"
                          title="Akses Sistem HCDP & IDP (https://idp.makarti.id/)"
                        >
                          {/* Lingkaran Konsentris Halus Mengelilingi Ikon */}
                          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-blue-300/60 bg-blue-50/60 flex items-center justify-center mb-1 group-hover:bg-blue-100/70 transition-colors">
                            <Target className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-blue-600 stroke-[2.2]" />
                          </div>

                          {/* Judul Tombol */}
                          <span className="text-[11px] sm:text-sm font-black text-[#1D315F] tracking-wider uppercase leading-none drop-shadow-2xs">
                            HCDP & IDP
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOMBOL BULAT 2: LMS (HIJAU SESUAI GAMBAR REFERENSI) */}
                <div className="relative group shrink-0 flex flex-col items-center animate-entrance-pop [animation-delay:560ms]">
                  <div className="animate-float-delayed flex flex-col items-center">
                    {/* Pill Badge SI-BIJAK PATEN (Hijau) */}
                    <div className="z-30 mb-2.5 sm:mb-3 px-3 py-0.5 rounded-full bg-[#006A63] text-white text-[8px] sm:text-[9.5px] font-black tracking-wider uppercase shadow-md border border-white/30 select-none">
                      SI-BIJAK PATEN
                    </div>

                    <div className="relative">
                      {/* Outer Orbiting Light Halo (Cahaya Hijau Melingkar) */}
                      <div
                        className="absolute -inset-2 sm:-inset-2.5 rounded-full blur-md opacity-85 group-hover:opacity-100 pointer-events-none animate-orbit-light-reverse transition-opacity duration-300"
                        style={{
                          background: 'conic-gradient(from 180deg, transparent 0%, transparent 40%, rgba(5,150,105,0.25) 60%, rgba(52,211,153,0.85) 85%, #34D399 95%, #FFFFFF 100%)'
                        }}
                      />
                      {/* Soft Ambient Core Glow */}
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm pointer-events-none" />

                      {/* Rotating Ring Container */}
                      <div className="relative p-[3px] sm:p-1 rounded-full overflow-hidden shadow-[0_0_24px_rgba(16,185,129,0.4),0_8px_24px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-transform duration-300">
                        {/* Active Spinning Conic Gradient Ring (Reverse) */}
                        <div
                          className="absolute inset-[-100%] animate-orbit-light-reverse pointer-events-none"
                          style={{
                            background: 'conic-gradient(from 180deg, rgba(5,150,105,0.15) 0%, rgba(5,150,105,0.2) 45%, rgba(16,185,129,0.5) 70%, #10B981 85%, #6EE7B7 95%, #FFFFFF 100%)'
                          }}
                        />

                        {/* Badan Tombol Putih Bersih Seperti Gambar Referensi */}
                        <button
                          type="button"
                          onClick={handleLmsClick}
                          className="relative flex flex-col items-center justify-center w-28 h-28 sm:w-34 sm:h-34 rounded-full bg-gradient-to-b from-white via-[#F0FDF4] to-[#E6F8EF] border-2 border-emerald-200/90 text-[#1D315F] cursor-pointer active:scale-95 transition-all duration-200 text-center p-2 overflow-hidden z-10"
                          title="Masuk ke LMS BKPSDM"
                        >
                          {/* Lingkaran Konsentris Halus Mengelilingi Ikon */}
                          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-emerald-300/60 bg-emerald-50/60 flex items-center justify-center mb-1 group-hover:bg-emerald-100/70 transition-colors">
                            <MonitorPlay className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-emerald-700 stroke-[2.2]" />
                          </div>

                          {/* Judul Tombol */}
                          <span className="text-xs sm:text-base font-black text-[#1D315F] tracking-wider uppercase leading-none drop-shadow-2xs">
                            LMS
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* DESKTOP ONLY: 6 Elemen Fitur Pembelajaran Menggantikan Posisi Tombol di Kolom Kiri */}
            <div key={`cards-desktop-${heroReentryKey}`} className="hidden lg:block pt-3 xl:pt-4 w-full">
              <div className="grid grid-cols-2 gap-2.5 xl:gap-3 max-w-xl">
                {/* Card 1: Modul Pembelajaran */}
                <div className="animate-entrance-card [animation-delay:420ms]">
                  <div
                    className="animate-float-card flex items-center gap-2.5 xl:gap-3 p-2.5 xl:p-3 rounded-xl bg-white/95 backdrop-blur-xs border border-blue-100/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 cursor-default"
                    style={{ animationDelay: '0s' }}
                  >
                    <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-gradient-to-br from-[#1D315F] to-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <BookOpen className="w-4.5 h-4.5 xl:w-5 xl:h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs xl:text-sm font-bold text-[#1D315F] truncate">Modul Pembelajaran</h4>
                      <p className="text-[10px] xl:text-[11px] text-gray-500 leading-tight">Akses berbagai materi pengembangan</p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Jalur Pengembangan */}
                <div className="animate-entrance-card [animation-delay:480ms]">
                  <div
                    className="animate-float-card flex items-center gap-2.5 xl:gap-3 p-2.5 xl:p-3 rounded-xl bg-white/95 backdrop-blur-xs border border-amber-100/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-amber-300 transition-all duration-300 cursor-default"
                    style={{ animationDelay: '0.7s' }}
                  >
                    <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-gradient-to-br from-[#D97706] to-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Route className="w-4.5 h-4.5 xl:w-5 xl:h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs xl:text-sm font-bold text-[#1D315F] truncate">Jalur Pengembangan</h4>
                      <p className="text-[10px] xl:text-[11px] text-gray-500 leading-tight">Sesuai kebutuhan jabatan & karier</p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Komunitas Belajar */}
                <div className="animate-entrance-card [animation-delay:540ms]">
                  <div
                    className="animate-float-card flex items-center gap-2.5 xl:gap-3 p-2.5 xl:p-3 rounded-xl bg-white/95 backdrop-blur-xs border border-cyan-100/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-cyan-300 transition-all duration-300 cursor-default"
                    style={{ animationDelay: '1.4s' }}
                  >
                    <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-gradient-to-br from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Users2 className="w-4.5 h-4.5 xl:w-5 xl:h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs xl:text-sm font-bold text-[#1D315F] truncate">Komunitas Belajar</h4>
                      <p className="text-[10px] xl:text-[11px] text-gray-500 leading-tight">Berbagi ilmu dan pengalaman</p>
                    </div>
                  </div>
                </div>

                {/* Card 4: Sertifikat */}
                <div className="animate-entrance-card [animation-delay:600ms]">
                  <div
                    className="animate-float-card flex items-center gap-2.5 xl:gap-3 p-2.5 xl:p-3 rounded-xl bg-white/95 backdrop-blur-xs border border-emerald-100/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-emerald-300 transition-all duration-300 cursor-default"
                    style={{ animationDelay: '2.1s' }}
                  >
                    <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-gradient-to-br from-[#059669] to-[#10B981] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Award className="w-4.5 h-4.5 xl:w-5 xl:h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs xl:text-sm font-bold text-[#1D315F] truncate">Sertifikat</h4>
                      <p className="text-[10px] xl:text-[11px] text-gray-500 leading-tight">Pantau pencapaian pembelajaran</p>
                    </div>
                  </div>
                </div>

                {/* Card 5: Uji Kompetensi */}
                <div className="animate-entrance-card [animation-delay:660ms]">
                  <div
                    className="animate-float-card flex items-center gap-2.5 xl:gap-3 p-2.5 xl:p-3 rounded-xl bg-white/95 backdrop-blur-xs border border-rose-100/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-rose-300 transition-all duration-300 cursor-default"
                    style={{ animationDelay: '2.8s' }}
                  >
                    <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-gradient-to-br from-[#E11D48] to-[#FB7185] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-4.5 h-4.5 xl:w-5 xl:h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs xl:text-sm font-bold text-[#1D315F] truncate">Uji Kompetensi</h4>
                      <p className="text-[10px] xl:text-[11px] text-gray-500 leading-tight">Asesmen & kuis pemahaman materi</p>
                    </div>
                  </div>
                </div>

                {/* Card 6: Informasi Terbaru */}
                <div className="animate-entrance-card [animation-delay:720ms]">
                  <div
                    className="animate-float-card flex items-center gap-2.5 xl:gap-3 p-2.5 xl:p-3 rounded-xl bg-white/95 backdrop-blur-xs border border-purple-100/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-purple-300 transition-all duration-300 cursor-default"
                    style={{ animationDelay: '3.5s' }}
                  >
                    <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Bell className="w-4.5 h-4.5 xl:w-5 xl:h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs xl:text-sm font-bold text-[#1D315F] truncate">Informasi Terbaru</h4>
                      <p className="text-[10px] xl:text-[11px] text-gray-500 leading-tight">Berita agenda & pengumuman terkini</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Slogan, Blue Curved Arch, dan Foto Tim ASN (Hanya Tampil di Desktop / Layar Besar) */}
          <div className="hidden lg:flex lg:col-span-6 relative flex-col items-end justify-end h-full min-h-[640px] xl:min-h-[720px]">

            {/* Background Blue Curved Arch - Diperlebar proporsional agar tim ASN & laptop terbingkai rapi */}
            <div className="absolute -top-3 sm:-top-5 lg:-top-6 xl:-top-7 -right-3 sm:-right-5 lg:-right-7 xl:-right-9 w-[108%] lg:w-[113%] xl:w-[116%] 2xl:w-[118%] h-[calc(100%+2.5rem)] sm:h-[calc(100%+3rem)] lg:h-[calc(100%+3.75rem)] bg-gradient-to-bl from-[#143B85] via-[#10306E] to-[#0D2452] rounded-bl-[140px] sm:rounded-bl-[160px] lg:rounded-bl-[175px] xl:rounded-bl-[190px] border-b-8 sm:border-b-10 border-l-8 sm:border-l-10 border-[#F59E0B] shadow-2xl overflow-hidden pointer-events-none z-0 animate-entrance-arch [animation-delay:180ms]">
              {/* Subtle inner radial glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Slogan ASN KOMPETEN BULELENG PATEN DIPERBESAR */}
            <div
              key={`slogan-${heroReentryKey}`}
              className="relative z-20 self-center lg:self-end pr-4 sm:pr-8 lg:pr-10 pt-3 sm:pt-4 mb-2 animate-entrance-slogan [animation-delay:380ms]"
            >
              <img
                src={sloganWhiteImg}
                alt="ASN Kompeten Buleleng Paten"
                className="w-64 sm:w-80 md:w-96 lg:w-[420px] xl:w-[480px] h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Foto Tim 4 ASN Buleleng Transparan Cutout + 2 Tombol Bulat Tepat di Posisi Lingkaran Gambar Referensi */}
            <div className="relative z-10 w-full flex justify-end items-end mt-auto -mr-3 sm:-mr-5 lg:-mr-7 xl:-mr-9 -mb-1 sm:-mb-2 lg:-mb-[8px] xl:-mb-[11px] animate-entrance-team [animation-delay:500ms]">
              <div className="relative w-full lg:w-[104%] xl:w-[108%] 2xl:w-[110%]">
                <img
                  src={asnTeamImg}
                  alt="Aparatur Sipil Negara Kabupaten Buleleng"
                  className="w-full h-auto object-contain object-right-bottom drop-shadow-2xl pointer-events-none"
                />

                {/* TOMBOL BULAT 1: HCDP & IDP (DESKTOP - BIRU) - Tepat di Lingkaran Biru */}
                <div
                  key={`buttons-desktop-idp-${heroReentryKey}`}
                  className="absolute z-30 -translate-x-1/2 -translate-y-1/2 animate-entrance-pop [animation-delay:460ms]"
                  style={{ left: '43.4%', top: '20.4%' }}
                >
                  <div className="animate-float flex flex-col items-center">
                    {/* Pill Badge PERENCANAAN & PENGEMBANGAN (Biru) - Berjarak rapi dari tombol */}
                    <div className="z-30 mb-2.5 xl:mb-3 px-2.5 xl:px-3 py-0.5 rounded-full bg-[#1D315F] text-white text-[6px] lg:text-[6.5px] xl:text-[7.5px] font-black tracking-normal uppercase shadow-md border border-white/30 select-none whitespace-nowrap">
                      PERENCANAAN & PENGEMBANGAN
                    </div>

                    <div className="relative">
                      {/* Outer Orbiting Light Halo (Cahaya Biru Melingkar) */}
                      <div
                        className="absolute -inset-2 xl:-inset-2.5 rounded-full blur-md opacity-85 group-hover:opacity-100 pointer-events-none animate-orbit-light transition-opacity duration-300"
                        style={{
                          background: 'conic-gradient(from 0deg, transparent 0%, transparent 40%, rgba(37,99,235,0.25) 60%, rgba(96,165,250,0.85) 85%, #60A5FA 95%, #FFFFFF 100%)'
                        }}
                      />
                      {/* Soft Ambient Core Glow */}
                      <div className="absolute -inset-1 rounded-full bg-blue-500/20 blur-sm pointer-events-none" />

                      {/* Rotating Ring Container */}
                      <div className="relative p-[2.5px] xl:p-[3px] rounded-full overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.4),0_8px_20px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-transform duration-300">
                        <div
                          className="absolute inset-[-100%] animate-orbit-light pointer-events-none"
                          style={{
                            background: 'conic-gradient(from 0deg, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.2) 45%, rgba(59,130,246,0.5) 70%, #3B82F6 85%, #93C5FD 95%, #FFFFFF 100%)'
                          }}
                        />

                        {/* Tombol Bulat Putih Bersih HCDP & IDP */}
                        <button
                          type="button"
                          onClick={handleIdpClick}
                          className="relative flex flex-col items-center justify-center w-20 h-20 lg:w-22 lg:h-22 xl:w-26 xl:h-26 rounded-full bg-gradient-to-b from-white via-[#F8FAFC] to-[#EFF6FF] border-2 border-blue-200/90 text-[#1D315F] cursor-pointer active:scale-95 transition-all duration-200 text-center p-1 xl:p-1.5 overflow-hidden z-10"
                          title="Akses Sistem HCDP & IDP (https://idp.makarti.id/)"
                        >
                          {/* Lingkaran Konsentris Halus Mengelilingi Ikon */}
                          <div className="w-8 h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full border border-blue-300/60 bg-blue-50/60 flex items-center justify-center mb-0.5 xl:mb-1 group-hover:bg-blue-100/70 transition-colors">
                            <Target className="w-4 h-4 lg:w-4.5 lg:h-4.5 xl:w-5 xl:h-5 text-blue-600 stroke-[2.2]" />
                          </div>

                          <span className="text-[9px] lg:text-[10px] xl:text-[11px] font-black text-[#1D315F] tracking-wider uppercase leading-none drop-shadow-2xs">
                            HCDP & IDP
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOMBOL BULAT 2: LMS (DESKTOP - HIJAU) - Tepat di Lingkaran Hijau */}
                <div
                  key={`buttons-desktop-lms-${heroReentryKey}`}
                  className="absolute z-30 -translate-x-1/2 -translate-y-1/2 animate-entrance-pop [animation-delay:560ms]"
                  style={{ left: '68.6%', top: '24.2%' }}
                >
                  <div className="animate-float-delayed flex flex-col items-center">
                    {/* Pill Badge SI-BIJAK PATEN (Hijau) - Berjarak rapi dari tombol */}
                    <div className="z-30 mb-2.5 xl:mb-3 px-2.5 xl:px-3 py-0.5 rounded-full bg-[#006A63] text-white text-[7px] lg:text-[7.5px] xl:text-[8.5px] font-black tracking-wider uppercase shadow-md border border-white/30 select-none">
                      SI-BIJAK PATEN
                    </div>

                    <div className="relative">
                      {/* Outer Orbiting Light Halo (Cahaya Hijau Melingkar) */}
                      <div
                        className="absolute -inset-2 xl:-inset-2.5 rounded-full blur-md opacity-85 group-hover:opacity-100 pointer-events-none animate-orbit-light-reverse transition-opacity duration-300"
                        style={{
                          background: 'conic-gradient(from 180deg, transparent 0%, transparent 40%, rgba(5,150,105,0.25) 60%, rgba(52,211,153,0.85) 85%, #34D399 95%, #FFFFFF 100%)'
                        }}
                      />
                      {/* Soft Ambient Core Glow */}
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm pointer-events-none" />

                      {/* Rotating Ring Container */}
                      <div className="relative p-[2.5px] xl:p-[3px] rounded-full overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.4),0_8px_20px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-transform duration-300">
                        <div
                          className="absolute inset-[-100%] animate-orbit-light-reverse pointer-events-none"
                          style={{
                            background: 'conic-gradient(from 180deg, rgba(5,150,105,0.15) 0%, rgba(5,150,105,0.2) 45%, rgba(16,185,129,0.5) 70%, #10B981 85%, #6EE7B7 95%, #FFFFFF 100%)'
                          }}
                        />

                        {/* Tombol Bulat Putih Bersih LMS */}
                        <button
                          type="button"
                          onClick={handleLmsClick}
                          className="relative flex flex-col items-center justify-center w-20 h-20 lg:w-22 lg:h-22 xl:w-26 xl:h-26 rounded-full bg-gradient-to-b from-white via-[#F0FDF4] to-[#E6F8EF] border-2 border-emerald-200/90 text-[#1D315F] cursor-pointer active:scale-95 transition-all duration-200 text-center p-1 xl:p-1.5 overflow-hidden z-10"
                          title="Masuk ke LMS BKPSDM"
                        >
                          {/* Lingkaran Konsentris Halus Mengelilingi Ikon */}
                          <div className="w-8 h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full border border-emerald-300/60 bg-emerald-50/60 flex items-center justify-center mb-0.5 xl:mb-1 group-hover:bg-emerald-100/70 transition-colors">
                            <MonitorPlay className="w-4 h-4 lg:w-4.5 lg:h-4.5 xl:w-5 xl:h-5 text-emerald-700 stroke-[2.2]" />
                          </div>

                          <span className="text-[10px] lg:text-[11px] xl:text-xs font-black text-[#1D315F] tracking-wider uppercase leading-none drop-shadow-2xs">
                            LMS
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* MOBILE ONLY: 6 Bottom Feature Cards Horizontal Strip */}
        <div key={`cards-mobile-${heroReentryKey}`} className="block lg:hidden pt-6 pb-4 sm:pt-12 sm:pb-8 border-t border-teal-200/50 mt-4 sm:mt-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4.5">

            {/* Card 1: Modul Pembelajaran (Floating Animation) */}
            <div className="animate-entrance-card [animation-delay:600ms]">
              <div
                className="animate-float-card flex items-center gap-3 p-3 sm:p-4.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-blue-100 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-blue-300 transition-all duration-300 cursor-default"
                style={{ animationDelay: '0s' }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#1D315F] to-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1D315F] truncate">Modul Pembelajaran</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">Akses berbagai materi pengembangan</p>
                </div>
              </div>
            </div>

            {/* Card 2: Jalur Pengembangan Kompetensi (Floating Animation) */}
            <div className="animate-entrance-card [animation-delay:680ms]">
              <div
                className="animate-float-card flex items-center gap-3 p-3 sm:p-4.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-amber-100 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-amber-300 transition-all duration-300 cursor-default"
                style={{ animationDelay: '0.7s' }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#D97706] to-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Route className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1D315F] truncate">Jalur Pengembangan</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">Sesuai kebutuhan jabatan & karier</p>
                </div>
              </div>
            </div>

            {/* Card 3: Komunitas Belajar (Floating Animation) */}
            <div className="animate-entrance-card [animation-delay:760ms]">
              <div
                className="animate-float-card flex items-center gap-3 p-3 sm:p-4.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-cyan-100 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-cyan-300 transition-all duration-300 cursor-default"
                style={{ animationDelay: '1.4s' }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1D315F] truncate">Komunitas Belajar</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">Berbagi ilmu dan pengalaman</p>
                </div>
              </div>
            </div>

            {/* Card 4: Sertifikat (Floating Animation) */}
            <div className="animate-entrance-card [animation-delay:840ms]">
              <div
                className="animate-float-card flex items-center gap-3 p-3 sm:p-4.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-emerald-100 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-emerald-300 transition-all duration-300 cursor-default"
                style={{ animationDelay: '2.1s' }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#059669] to-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1D315F] truncate">Sertifikat</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">Pantau pencapaian pembelajaran</p>
                </div>
              </div>
            </div>

            {/* Card 5: Uji Kompetensi (Floating Animation) */}
            <div className="animate-entrance-card [animation-delay:920ms]">
              <div
                className="animate-float-card flex items-center gap-3 p-3 sm:p-4.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-rose-100 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-rose-300 transition-all duration-300 cursor-default"
                style={{ animationDelay: '2.8s' }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#FB7185] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1D315F] truncate">Uji Kompetensi</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">Asesmen & kuis pemahaman materi</p>
                </div>
              </div>
            </div>

            {/* Card 6: Informasi Terbaru (Floating Animation) */}
            <div className="animate-entrance-card [animation-delay:980ms]">
              <div
                className="animate-float-card flex items-center gap-3 p-3 sm:p-4.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-purple-100 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-purple-300 transition-all duration-300 cursor-default"
                style={{ animationDelay: '3.5s' }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1D315F] truncate">Informasi Terbaru</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">Berita agenda & pengumuman terkini</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Interactive Scroll Down Prompt */}
        <div className="flex justify-center pt-3 pb-2 animate-entrance-card [animation-delay:980ms]">
          <button
            type="button"
            onClick={scrollToContent}
            className="group inline-flex flex-col items-center gap-1.5 py-1.5 px-4 rounded-full text-gray-500 hover:text-[#1D315F] hover:bg-white/70 transition-all cursor-pointer select-none"
            title="Gulir ke bawah untuk eksplorasi materi"
          >
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-gray-500 group-hover:text-[#1D315F] transition-colors">
              Gulir Ke Bawah
            </span>
            <div className="w-5 h-8 rounded-full border-2 border-gray-400 group-hover:border-[#1D315F] flex items-start justify-center p-1 transition-colors shadow-2xs">
              <div className="w-1.5 h-2 rounded-full bg-amber-500 group-hover:bg-[#1D315F] animate-mouse-scroll" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#1D315F] -mt-1 animate-bounce" />
          </button>
        </div>

      </div>

      {/* Modern Floating Metrics Dock */}
      <div className="w-full px-4 sm:px-6 relative z-20 pb-5 sm:pb-8 pt-1">
        <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1D315F] via-[#10306E] to-[#006A63] text-white p-3.5 sm:p-5 shadow-xl border border-white/15 backdrop-blur-xs">
          <div className="grid grid-cols-3 divide-x divide-white/15">
            {/* ASN Aktif */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3.5 text-center sm:text-left px-1.5 sm:px-4">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-4 h-4 sm:w-5.5 sm:h-5.5 text-amber-300" />
              </div>
              <div>
                <div className="text-base sm:text-xl md:text-2xl font-extrabold text-white tracking-tight leading-none">
                  1.2k+
                </div>
                <div className="text-[10px] sm:text-xs text-blue-100/90 font-medium mt-1">
                  ASN Aktif
                </div>
              </div>
            </div>

            {/* Kursus Tersedia */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3.5 text-center sm:text-left px-1.5 sm:px-4">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-2xs">
                <BookOpen className="w-4 h-4 sm:w-5.5 sm:h-5.5 text-amber-300" />
              </div>
              <div>
                <div className="text-base sm:text-xl md:text-2xl font-extrabold text-white tracking-tight leading-none">
                  50+
                </div>
                <div className="text-[10px] sm:text-xs text-blue-100/90 font-medium mt-1">
                  Kursus Tersedia
                </div>
              </div>
            </div>

            {/* Sertifikat Terbit */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3.5 text-center sm:text-left px-1.5 sm:px-4">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-2xs">
                <Award className="w-4 h-4 sm:w-5.5 sm:h-5.5 text-amber-300" />
              </div>
              <div>
                <div className="text-base sm:text-xl md:text-2xl font-extrabold text-white tracking-tight leading-none">
                  500+
                </div>
                <div className="text-[10px] sm:text-xs text-blue-100/90 font-medium mt-1">
                  Sertifikat Terbit
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
