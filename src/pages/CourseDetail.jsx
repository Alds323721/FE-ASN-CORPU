import { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import logoImg from '../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../assets/ASN-CORPU.png';
import hiasanImg from '../assets/Hiasan.png';
import ProfileDropdown from '../components/ProfileDropdown';
import LanguageDropdown from '../components/LanguageDropdown';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronDown,
  Menu,
  X,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  Lock,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Video,
  HelpCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const extractYouTubeId = (url) => {
  if (!url) return null;
  let cleaned = String(url).trim();
  if (cleaned.includes('<iframe')) {
    const srcMatch = cleaned.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      cleaned = srcMatch[1];
    }
  }
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = cleaned.match(regExp);
  return match ? match[1] : null;
};

const getDocumentUrl = (path) => {
  if (!path) return '';
  const trimmed = String(path).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${origin}${cleanPath}`;
};

const isMateriVideo = (materi) => {
  if (!materi) return false;
  if (materi.tipe === 'h5p') return false;
  if (materi.tipe === 'video' || materi.tipe === 'video_embed') return true;
  if (extractYouTubeId(materi.tautan)) return true;
  if (materi.tautan && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(materi.tautan)) return true;
  return false;
};

const CourseDetailNavbar = ({ onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logoImg} alt="Logo BKPSDM" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <span className="font-semibold text-base sm:text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-[#1D315F] font-semibold text-sm">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.dashboard')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('community'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.community')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.catalog')}</a>
        <a href="#" className="text-[#006A63] border-b-2 border-[#006A63] pb-1">{t('nav.myCourses')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.helpCenter')}</a>

        <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-6">
          <LanguageDropdown />
          <ProfileDropdown onLogout={() => onNavigate('landing')} />
        </div>
      </div>

      <div className="md:hidden flex items-center gap-3">
        <LanguageDropdown />
        <ProfileDropdown onLogout={() => onNavigate('landing')} />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#1D315F] hover:text-[#006A63] focus:outline-none">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-md md:hidden flex flex-col py-4 px-6 gap-4 text-[#1D315F] font-semibold text-sm z-50">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="hover:text-[#006A63] transition-colors">{t('nav.dashboard')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('community'); }} className="hover:text-[#006A63] transition-colors">{t('nav.community')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="hover:text-[#006A63] transition-colors">{t('nav.catalog')}</a>
          <a href="#" className="text-[#006A63]">{t('nav.myCourses')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors">{t('nav.helpCenter')}</a>
        </div>
      )}
    </nav>
  );
};

const CourseHeader = ({ onBack, courseData }) => {
  const currentModule = courseData?.modul?.[0]?.judul || 'Modul';
  
  return (
    <div className="bg-[#1D315F] py-6 md:py-8 px-6 md:px-12 relative overflow-hidden" style={{ backgroundImage: `url(${hiasanImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-[#1D315F] opacity-55"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-white text-2xl md:text-3xl font-bold mb-4">{courseData?.judul || 'Detail Pelatihan'}</h1>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white text-xs sm:text-sm">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 hover:text-[#3FCDC1] transition-colors"
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
};

const getQuizBadges = (tipeSoalList = []) => {
  if (!tipeSoalList || !Array.isArray(tipeSoalList) || tipeSoalList.length === 0) return [];
  const badges = [];
  if (tipeSoalList.includes('tts')) {
    badges.push({ label: '🧩 TTS', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' });
  }
  if (tipeSoalList.includes('drag_drop')) {
    badges.push({ label: '🎯 Drag & Drop', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' });
  }
  if (tipeSoalList.includes('pilihan_ganda') && (tipeSoalList.includes('tts') || tipeSoalList.includes('drag_drop'))) {
    badges.push({ label: '📝 PG', color: 'bg-teal-50 text-teal-700 border-teal-200' });
  }
  return badges;
};

const SyllabusItem = ({ index, title, subtitle, duration, status, onClick, isActive, badge, typeBadges = [] }) => {
  const getStatusIcon = () => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#10B981]" />;
    if (status === 'locked') return <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />;
    if (status === 'pre_test_ready') return <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />;
    return <Circle className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />;
  };

  return (
    <div 
      className={`flex items-start gap-2 md:gap-3 py-2 md:py-3 cursor-pointer hover:bg-gray-50 transition-colors px-2 rounded ${isActive ? 'bg-[#F4F8FB] border-l-4 border-[#3FCDC1]' : 'border-l-4 border-transparent'}`}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getStatusIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h4 className="font-semibold text-[#1D315F] text-xs md:text-sm mb-0.5">{index}. {title}</h4>
          {badge && (
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
              badge === 'Pre-Test Selesai' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {badge}
            </span>
          )}
          {typeBadges && typeBadges.map((tb, idx) => (
            <span key={idx} className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${tb.color}`}>
              {tb.label}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-1 font-semibold line-clamp-1">{subtitle}</p>
        {duration && <p className="text-xs text-gray-400 font-semibold">{duration} Menit</p>}
      </div>
    </div>
  );
};

const Sidebar = ({ courseData, activeMateri, onSelectMateri, onNavigate }) => {
  return (
    <aside className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6 overflow-y-auto max-h-[600px] custom-scrollbar">
      <h2 className="font-semibold text-[#1D315F] text-base md:text-lg mb-4">Silabus Pelatihan</h2>
      
      {courseData?.modul?.map((modul, idx) => (
        <div key={modul.modul_id} className="mb-6">
          <p className="text-xs md:text-sm text-[#006A63] font-bold mb-2">Modul {modul.urutan}: {modul.judul}</p>
          <div className="space-y-1 divide-y divide-gray-100 pl-2">
            {modul.materi?.map((mat, i) => {
              const hasPreTest = Boolean(mat.pre_test);
              const isPreTestDone = Boolean(mat.pre_test?.is_completed);
              const isPreTestReady = hasPreTest && !isPreTestDone && !mat.pre_test?.is_locked;

              let status = 'pending';
              if (mat.is_read) {
                status = 'completed';
              } else if (isPreTestReady) {
                status = 'pre_test_ready';
              } else if (mat.is_locked) {
                status = 'locked';
              }

              let badge = null;
              if (hasPreTest) {
                badge = isPreTestDone ? 'Pre-Test Selesai' : 'Wajib Pre-Test';
              }

              return (
                <SyllabusItem
                  key={mat.materi_id}
                  index={i + 1}
                  title={mat.judul}
                  subtitle={`Tipe: ${mat.tipe === 'h5p' ? 'H5P Interaktif' : isMateriVideo(mat) ? 'Video' : 'Materi Bacaan'}`}
                  duration={mat.durasi}
                  status={status}
                  badge={badge}
                  isActive={activeMateri?.materi_id === mat.materi_id}
                  onClick={() => {
                    if (mat.is_locked) {
                      if (isPreTestReady) {
                        onSelectMateri({ ...mat, currentModulId: modul.modul_id });
                        return;
                      }
                      Swal.fire({
                        icon: 'info',
                        title: 'Materi Masih Terkunci',
                        text: 'Selesaikan materi sebelumnya sesuai urutan silabus terlebih dahulu.',
                        confirmButtonColor: '#006A63'
                      });
                      return;
                    }
                    onSelectMateri({ ...mat, currentModulId: modul.modul_id });
                  }}
                />
              );
            })}
            {modul.kuis && (
              <SyllabusItem
                key={`kuis-${modul.kuis.kuis_id}`}
                index="Kuis"
                title={modul.kuis.judul}
                subtitle="Kuis Evaluasi Modul"
                duration={modul.kuis.durasi}
                status={modul.kuis.is_completed ? 'completed' : (modul.kuis.is_locked ? 'locked' : 'pending')}
                isActive={false}
                typeBadges={getQuizBadges(modul.kuis.tipe_soal_list)}
                onClick={() => {
                  if (modul.kuis.is_locked) {
                    Swal.fire({
                      icon: 'info',
                      title: 'Kuis Masih Terkunci',
                      text: 'Selesaikan seluruh materi pada modul ini terlebih dahulu sebelum mengerjakan kuis.',
                      confirmButtonColor: '#006A63'
                    });
                    return;
                  }
                  localStorage.setItem('userModulId', modul.modul_id);
                  localStorage.setItem('userKuisId', modul.kuis.kuis_id);
                  onNavigate('kuis');
                }}
              />
            )}
          </div>
        </div>
      ))}
      
      {courseData?.post_test && (
        <div className="mt-6 border-t pt-4">
          <p className="text-xs md:text-sm text-red-600 font-bold mb-2">Post Test</p>
          <SyllabusItem
            index="Akhir"
            title={courseData.post_test.judul}
            subtitle="Syarat Kelulusan"
            duration={courseData.post_test.durasi}
            status={parseFloat(courseData.progress) >= 100 ? 'active' : 'locked'}
            onClick={() => {
               if (parseFloat(courseData.progress) >= 100) onNavigate('post-test');
               else Swal.fire({
                 icon: 'info',
                 title: 'Post Test Masih Terkunci',
                 text: 'Selesaikan seluruh materi dan kuis modul terlebih dahulu sebelum mengikuti Post Test.',
                 confirmButtonColor: '#006A63'
               });
            }}
          />
        </div>
      )}
    </aside>
  );
};

const MainContent = ({ activeMateri, onMarkAsRead, onNavigate, onNextMateri, nextStepInfo }) => {
  if (!activeMateri) {
    return (
      <div className="bg-white border border-[#BBC9C7] rounded-lg p-10 text-center text-gray-500">
        Silakan pilih materi di silabus untuk mulai belajar.
      </div>
    );
  }

  if (activeMateri.is_locked) {
    const isLockedByPreTest = activeMateri.pre_test && !activeMateri.pre_test.is_completed && !activeMateri.pre_test.is_locked;

    if (isLockedByPreTest) {
      return (
        <div className="bg-white border border-amber-200 rounded-xl p-8 md:p-12 text-center flex flex-col items-center justify-center bg-gradient-to-b from-amber-50/40 to-white shadow-xs">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-2 mb-3 flex-wrap justify-center">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              Pre-Test Pemahaman Awal
            </span>
            {getQuizBadges(activeMateri.pre_test?.tipe_soal_list).map((tb, idx) => (
              <span key={idx} className={`px-2.5 py-1 text-xs font-bold rounded-full border ${tb.color}`}>
                {tb.label}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-bold text-[#1D315F] mb-2">{activeMateri.judul}</h3>
          <p className="text-sm text-gray-600 max-w-lg mb-6 leading-relaxed">
            Materi ini mewajibkan pengerjaan <strong>Pre-Test</strong> untuk mengukur pemahaman awal Anda sebelum berkas materi dapat dipelajari.
            <br className="hidden sm:inline" />
            <span className="text-xs text-gray-500 mt-1.5 block">
              Catatan: Tidak ada batas nilai kelulusan minimal. Anda hanya perlu menyelesaikan seluruh pertanyaan.
            </span>
          </p>

          <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 bg-gray-50 px-5 py-2.5 rounded-xl border border-gray-200 mb-6">
            <span>⏱️ Durasi: <strong>{activeMateri.pre_test.durasi || 15} Menit</strong></span>
            <span>•</span>
            <span>📝 Status: <strong className="text-amber-600">Belum Dikerjakan</strong></span>
          </div>

          <button
            onClick={() => {
              if (activeMateri.currentModulId) {
                localStorage.setItem('userModulId', activeMateri.currentModulId);
              }
              localStorage.setItem('userActiveMateriId', activeMateri.materi_id);
              localStorage.setItem('userKuisId', activeMateri.pre_test.kuis_id);
              onNavigate('kuis');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#006A63] text-white rounded-xl font-bold text-sm hover:bg-[#00534D] active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <span>Mulai Kerjakan Pre-Test</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white border border-[#BBC9C7] rounded-lg p-12 text-center text-gray-500 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-[#1D315F] mb-1">{activeMateri.judul}</h3>
        <p className="text-sm text-gray-500 max-w-md">
          Materi ini masih terkunci. Silakan selesaikan seluruh materi sebelumnya sesuai urutan silabus.
        </p>
      </div>
    );
  }

  const isH5P = activeMateri?.tipe === 'h5p';
  const isVideo = !isH5P && isMateriVideo(activeMateri);
  const youtubeId = isVideo ? extractYouTubeId(activeMateri.tautan) : null;
  const docUrl = getDocumentUrl(activeMateri.tautan);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white border border-[#BBC9C7] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 pb-3 md:pb-4 flex-wrap gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-[#1D315F]">
            {activeMateri.judul}
          </h2>
          {isH5P && (
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              Video Interaktif (H5P)
            </span>
          )}
        </div>
        
        {isH5P ? (
          <div className="w-full bg-slate-950 aspect-video relative overflow-hidden flex items-center justify-center">
            {activeMateri.tautan ? (
              <iframe
                id="h5p-interactive-player"
                className="w-full h-full border-0"
                src={activeMateri.tautan}
                title={activeMateri.judul || 'Video Interaktif H5P'}
                allow="autoplay; fullscreen; geolocation; microphone; camera; midi; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Sparkles className="w-12 h-12 mb-2 text-purple-400" />
                <p className="text-sm font-semibold text-white">Tautan video interaktif H5P tidak tersedia</p>
              </div>
            )}
          </div>
        ) : isVideo ? (
          <div className="w-full bg-black aspect-video relative overflow-hidden flex items-center justify-center">
            {youtubeId ? (
              <iframe
                className="w-full h-full border-0"
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                title={activeMateri.judul || 'Video Pembelajaran'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : activeMateri.tautan ? (
              <video
                controls
                className="w-full h-full object-contain"
                src={getDocumentUrl(activeMateri.tautan)}
              >
                Browser Anda tidak mendukung pemutar video.
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Video className="w-12 h-12 mb-2 text-gray-500" />
                <p className="text-sm font-semibold text-white">Tautan video tidak tersedia</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 md:p-12 bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md">
              <FileText className="w-16 h-16 text-teal-600/70 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-5 text-sm md:text-base">
                Silakan baca dokumen materi berikut
              </p>
              {activeMateri.tautan ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#006A63] text-white rounded-lg font-bold text-sm hover:bg-[#00534D] active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Buka Materi</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold">
                  Dokumen materi belum tersedia
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6 flex justify-between items-center flex-wrap gap-4">
         <div>
            <h3 className="text-base md:text-lg font-semibold text-[#1D315F] mb-1">Status Penyelesaian</h3>
            <p className="text-xs text-gray-500">
              {isH5P
                ? 'Selesaikan seluruh kuis interaktif di dalam video atau klik tombol jika sudah selesai.'
                : 'Tandai telah selesai jika Anda sudah memahami materi ini.'}
            </p>
         </div>
         <div className="flex items-center gap-3 flex-wrap">
           <button 
             onClick={onMarkAsRead}
             disabled={activeMateri.is_read}
             className={`px-6 py-2.5 rounded text-sm font-bold flex items-center gap-2 transition-colors ${
               activeMateri.is_read 
                 ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200' 
                 : isH5P
                   ? 'bg-[#006A63] text-white hover:bg-[#00534D]'
                   : 'bg-[#1D315F] text-white hover:bg-[#162847]'
             }`}
           >
             {activeMateri.is_read ? (
               <><CheckCircle2 className="w-5 h-5" /> Selesai Dipelajari</>
             ) : isH5P ? (
               <><CheckCircle2 className="w-5 h-5" /> Selesaikan Materi H5P</>
             ) : (
               'Tandai Telah Dibaca'
             )}
           </button>

           {activeMateri.is_read && nextStepInfo?.type === 'same_modul_materi' && (
             <button
               onClick={() => onNextMateri(nextStepInfo.materi, nextStepInfo.modulId)}
               className="px-5 py-2.5 bg-[#006A63] text-white hover:bg-[#00534D] rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
             >
               <span>Materi Selanjutnya</span>
               <ChevronRight className="w-4 h-4" />
             </button>
           )}

           {activeMateri.is_read && nextStepInfo?.type === 'modul_kuis' && (
             <button
               onClick={() => {
                 localStorage.setItem('userModulId', nextStepInfo.modulId);
                 localStorage.setItem('userKuisId', nextStepInfo.kuis.kuis_id);
                 onNavigate('kuis');
               }}
               className="px-5 py-2.5 bg-amber-600 text-white hover:bg-amber-700 rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
             >
               <span>Kerjakan Kuis Modul</span>
               <ChevronRight className="w-4 h-4" />
             </button>
           )}

           {activeMateri.is_read && nextStepInfo?.type === 'next_modul_materi' && (
             <button
               onClick={() => onNextMateri(nextStepInfo.materi, nextStepInfo.modulId)}
               className="px-5 py-2.5 bg-[#006A63] text-white hover:bg-[#00534D] rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
             >
               <span>Lanjut Modul Berikutnya</span>
               <ChevronRight className="w-4 h-4" />
             </button>
           )}
         </div>
      </div>
    </div>
  );
};

const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#EAEFF4] pt-16 pb-8 border-t border-[#BBC9C7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        <div className="md:col-span-5 pr-8">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-6">
            <img src={logoImg} alt="Logo BKPSDM" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
            <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
            <span className="font-semibold text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed mb-6 font-semibold">
            {t('footer.tagline')}
          </p>
          <p className="text-[11px] text-gray-500 font-semibold">
            {t('footer.copyright')}
          </p>
        </div>
        <div className="md:col-span-3">
          <h4 className="font-semibold text-[#1D315F] text-[15px] mb-6">{t('footer.quickLinks')}</h4>
          <ul className="text-[13px] text-[#1D315F] space-y-3 font-semibold">
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('catalog'); }} className="hover:text-[#006A63] transition-colors">{t('footer.courses')}</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('community'); }} className="hover:text-[#006A63] transition-colors">{t('footer.community')}</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('help-center'); }} className="hover:text-[#006A63] transition-colors">{t('footer.help')}</a></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <h4 className="font-semibold text-[#1D315F] text-[15px] mb-6">{t('footer.contactUs')}</h4>
          <ul className="text-[13px] text-gray-600 space-y-4">
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#006A63] mt-0.5 flex-shrink-0" />
              <span className="font-semibold">support@bkpsdm-pintar.go.id</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#006A63] mt-0.5 flex-shrink-0" />
              <span className="font-semibold">(021) 123-4567 (Jam Kerja)</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#006A63] mt-0.5 flex-shrink-0" />
              <span className="font-semibold leading-relaxed">Gedung Kepegawaian Lt. 3, Jl. Protokol<br/>No. 1, Jakarta</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

const findNextMateriInfo = (allModuls, currentModulId, currentMateriId) => {
  if (!allModuls || allModuls.length === 0) return null;

  const currentModul = allModuls.find(m => String(m.modul_id) === String(currentModulId));
  if (!currentModul || !Array.isArray(currentModul.materi)) return null;

  const currIdx = currentModul.materi.findIndex(m => String(m.materi_id) === String(currentMateriId));

  // 1. Cek apakah ada materi berikutnya di modul yang sama
  if (currIdx !== -1 && currIdx + 1 < currentModul.materi.length) {
    return {
      type: 'same_modul_materi',
      materi: currentModul.materi[currIdx + 1],
      modul: currentModul,
      modulId: currentModul.modul_id
    };
  }

  // 2. Jika materi terakhir di modul, cek kuis evaluasi modul
  if (currentModul.kuis && !currentModul.kuis.is_completed) {
    return {
      type: 'modul_kuis',
      kuis: currentModul.kuis,
      modul: currentModul,
      modulId: currentModul.modul_id
    };
  }

  // 3. Cek apakah ada modul berikutnya
  const curModulIdx = allModuls.findIndex(m => String(m.modul_id) === String(currentModulId));
  if (curModulIdx !== -1 && curModulIdx + 1 < allModuls.length) {
    const nextMod = allModuls[curModulIdx + 1];
    if (nextMod.materi && nextMod.materi.length > 0) {
      return {
        type: 'next_modul_materi',
        materi: nextMod.materi[0],
        modul: nextMod,
        modulId: nextMod.modul_id
      };
    }
  }

  return {
    type: 'all_completed'
  };
};

export default function CourseDetail({ onNavigate, onBack }) {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMateri, setActiveMateri] = useState(null);
  
  const courseId = localStorage.getItem('userCourseId');

  const resolveActiveMateri = (data, currentActive) => {
    if (!data?.modul || data.modul.length === 0) return null;

    // A. Cek apakah user baru saja lulus kuis modul
    const passedKuisModulId = localStorage.getItem('userCompletedKuisModulId');
    if (passedKuisModulId) {
      localStorage.removeItem('userCompletedKuisModulId');
      const passedIdx = data.modul.findIndex(m => String(m.modul_id) === String(passedKuisModulId));
      if (passedIdx !== -1) {
        const curMod = data.modul[passedIdx];
        // Cek jika masih ada materi yang belum selesai di modul yang sama
        const unreadInSameMod = curMod.materi?.find(mat => !mat.is_read && !mat.is_locked);
        if (unreadInSameMod) {
          localStorage.setItem('userActiveMateriId', unreadInSameMod.materi_id);
          localStorage.setItem('userModulId', curMod.modul_id);
          return { ...unreadInSameMod, currentModulId: curMod.modul_id };
        }

        // Lanjut ke materi pertama di modul berikutnya
        if (passedIdx + 1 < data.modul.length) {
          const nextMod = data.modul[passedIdx + 1];
          if (nextMod.materi && nextMod.materi.length > 0) {
            const nextMat = nextMod.materi[0];
            localStorage.setItem('userActiveMateriId', nextMat.materi_id);
            localStorage.setItem('userModulId', nextMod.modul_id);
            return { ...nextMat, currentModulId: nextMod.modul_id };
          }
        }
      }
    }

    // B. Cek materi yang tersimpan di localStorage (misal dari pre-test atau materi yang terakhir dibuka)
    const savedMateriId = localStorage.getItem('userActiveMateriId');
    if (savedMateriId) {
      for (const m of data.modul) {
        const found = m.materi?.find(mat => String(mat.materi_id) === String(savedMateriId));
        if (found) {
          return { ...found, currentModulId: m.modul_id };
        }
      }
    }

    // C. Jika currentActive sudah ada di state, refresh status terbarunya dari data API
    if (currentActive) {
      for (const m of data.modul) {
        const found = m.materi?.find(mat => String(mat.materi_id) === String(currentActive.materi_id));
        if (found) {
          return { ...found, currentModulId: m.modul_id };
        }
      }
    }

    // D. Cari materi pertama yang belum dibaca dan tidak terkunci
    for (const m of data.modul) {
      const firstUnread = m.materi?.find(mat => !mat.is_read && !mat.is_locked);
      if (firstUnread) {
        return { ...firstUnread, currentModulId: m.modul_id };
      }
    }

    // E. Default: materi pertama di modul pertama
    if (data.modul[0]?.materi?.[0]) {
      return { ...data.modul[0].materi[0], currentModulId: data.modul[0].modul_id };
    }

    return null;
  };

  const fetchCourse = async () => {
    if (!courseId) {
      Swal.fire({
        icon: 'warning',
        title: 'ID Pelatihan Tidak Ditemukan',
        text: 'Data sesi pelatihan tidak ditemukan. Silakan kembali ke katalog pelatihan.',
        confirmButtonColor: '#006A63'
      });
      onBack();
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/user/courses/${courseId}`);
      if (res.data?.data) {
        const fetchedData = res.data.data;
        setCourseData(fetchedData);
        const resolved = resolveActiveMateri(fetchedData, activeMateri);
        if (resolved) {
          setActiveMateri(resolved);
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Pelatihan',
        text: error.response?.data?.message || 'Terjadi gangguan saat mengambil data pelatihan.',
        confirmButtonColor: '#006A63'
      });
      onBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const handleSelectMateri = (materiWithModul) => {
    setActiveMateri(materiWithModul);
    if (materiWithModul?.materi_id) {
      localStorage.setItem('userActiveMateriId', materiWithModul.materi_id);
    }
    if (materiWithModul?.currentModulId) {
      localStorage.setItem('userModulId', materiWithModul.currentModulId);
    }
  };

  const handleGoNext = (nextMateri, nextModulId) => {
    if (!nextMateri) return;
    if (nextMateri.is_locked) {
      Swal.fire({
        icon: 'info',
        title: 'Materi Masih Terkunci',
        text: 'Materi selanjutnya belum dapat diakses. Selesaikan syarat materi/kuis terlebih dahulu.',
        confirmButtonColor: '#006A63'
      });
      return;
    }
    const newActive = { ...nextMateri, currentModulId: nextModulId };
    setActiveMateri(newActive);
    localStorage.setItem('userActiveMateriId', nextMateri.materi_id);
    localStorage.setItem('userModulId', nextModulId);
  };

  const handleMarkAsRead = async () => {
    if (!activeMateri) return;
    try {
      await api.post(`/user/courses/${courseId}/materi/${activeMateri.materi_id}/read`);
      
      // Ambil data kursus terbaru untuk sinkronisasi locking & progress
      const res = await api.get(`/user/courses/${courseId}`);
      const updatedCourse = res.data?.data;
      if (updatedCourse) {
        setCourseData(updatedCourse);
      }

      const allModuls = updatedCourse?.modul || courseData?.modul || [];
      const currentModulId = activeMateri.currentModulId;

      // Cari materi atau langkah selanjutnya
      const nextStep = findNextMateriInfo(allModuls, currentModulId, activeMateri.materi_id);

      if (nextStep?.type === 'same_modul_materi') {
        // Lanjut ke materi berikutnya yang ada di modul yang sama!
        const nextMat = nextStep.materi;
        const newActive = { ...nextMat, currentModulId: nextStep.modulId };
        setActiveMateri(newActive);
        localStorage.setItem('userActiveMateriId', nextMat.materi_id);
        localStorage.setItem('userModulId', nextStep.modulId);

        Swal.fire({
          icon: 'success',
          title: 'Materi Selesai!',
          text: `Melanjutkan ke materi berikutnya: "${nextMat.judul}"`,
          timer: 1800,
          showConfirmButton: false
        });
      } else if (nextStep?.type === 'modul_kuis') {
        // Materi terakhir di modul ini, arahkan ke kuis evaluasi modul
        const result = await Swal.fire({
          icon: 'success',
          title: 'Materi Modul Selesai!',
          html: `
            <div class="text-left text-sm text-gray-600 space-y-2 pt-1">
              <p>Selamat! Anda telah menyelesaikan seluruh materi pada <b>${nextStep.modul.judul}</b>.</p>
              <p class="text-xs text-teal-800 bg-teal-50 p-2.5 rounded border border-teal-200">
                Langkah berikutnya: Selesaikan <b>Kuis Evaluasi Modul</b> untuk mengukur pemahaman Anda dan membuka modul berikutnya.
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonColor: '#006A63',
          cancelButtonColor: '#6B7280',
          confirmButtonText: 'Mulai Kerjakan Kuis',
          cancelButtonText: 'Tetap di Halaman Ini'
        });

        if (result.isConfirmed) {
          localStorage.setItem('userModulId', nextStep.modulId);
          localStorage.setItem('userKuisId', nextStep.kuis.kuis_id);
          onNavigate('kuis');
        } else {
          setActiveMateri(prev => ({ ...prev, is_read: true }));
        }
      } else if (nextStep?.type === 'next_modul_materi') {
        // Kuis modul sudah selesai atau tidak ada kuis, lanjut ke modul berikutnya
        const nextMat = nextStep.materi;
        const newActive = { ...nextMat, currentModulId: nextStep.modulId };
        setActiveMateri(newActive);
        localStorage.setItem('userActiveMateriId', nextMat.materi_id);
        localStorage.setItem('userModulId', nextStep.modulId);

        Swal.fire({
          icon: 'success',
          title: 'Modul Selesai!',
          text: `Melanjutkan ke ${nextStep.modul.judul}: "${nextMat.judul}"`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Seluruh materi & modul selesai
        setActiveMateri(prev => ({ ...prev, is_read: true }));
        if (updatedCourse?.post_test) {
          const result = await Swal.fire({
            icon: 'success',
            title: '🎉 Selamat! Seluruh Silabus Selesai',
            text: 'Anda telah menyelesaikan seluruh materi dan evaluasi modul. Lanjutkan ke Post Test Akhir Pelatihan?',
            showCancelButton: true,
            confirmButtonColor: '#006A63',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Mulai Post Test',
            cancelButtonText: 'Nanti'
          });
          if (result.isConfirmed) {
            onNavigate('post-test');
          }
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Materi Selesai!',
            text: 'Progres belajar Anda telah tersimpan.',
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Progres',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan progres.',
        confirmButtonColor: '#006A63'
      });
    }
  };

  // Listener event postMessage / xAPI dari player H5P
  useEffect(() => {
    const handleH5PMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        const verb = data?.statement?.verb?.id || data?.verb || data?.context?.verb;
        const isCompleted = 
          (typeof verb === 'string' && (verb.includes('completed') || verb.includes('passed') || verb.includes('answered'))) ||
          data?.event === 'h5p-completed' ||
          data?.action === 'completed';

        if (isCompleted && activeMateri?.materi_id && !activeMateri.is_read && activeMateri.tipe === 'h5p') {
          handleMarkAsRead();
        }
      } catch (e) {
        // Data non-JSON diabaikan
      }
    };

    window.addEventListener('message', handleH5PMessage);
    return () => window.removeEventListener('message', handleH5PMessage);
  }, [activeMateri]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FBFC]">
        <div className="text-[#1D315F] font-bold">Memuat Detail Pelatihan...</div>
      </div>
    );
  }

  const nextStepInfo = activeMateri ? findNextMateriInfo(courseData?.modul, activeMateri.currentModulId, activeMateri.materi_id) : null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9FBFC]">
      <CourseDetailNavbar onNavigate={onNavigate} />
      <CourseHeader onBack={onBack} courseData={courseData} />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8">
          {courseData?.is_locked_review && (
            <div className="mb-6 p-4.5 bg-amber-50/90 border border-amber-300 rounded-xl flex items-start gap-3.5 shadow-xs">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900 mb-1 flex items-center gap-2">
                  <span>Materi Pembelajaran Sedang Ditinjau Admin BKPSDM</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Terkunci Sementara</span>
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Admin Komunitas baru saja memperbarui materi pembelajaran pada pelatihan ini. Seluruh materi dan kuis sementara terkunci dan akan dibuka kembali secara otomatis setelah mendapatkan persetujuan (approval) resmi dari Admin BKPSDM.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            <div className="lg:col-span-8 order-2 lg:order-1">
              <MainContent 
                activeMateri={activeMateri} 
                onMarkAsRead={handleMarkAsRead} 
                onNavigate={onNavigate}
                onNextMateri={handleGoNext}
                nextStepInfo={nextStepInfo}
              />
            </div>
            
            <div className="lg:col-span-4 order-1 lg:order-2">
              <Sidebar 
                courseData={courseData} 
                activeMateri={activeMateri}
                onSelectMateri={handleSelectMateri}
                onNavigate={onNavigate}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
