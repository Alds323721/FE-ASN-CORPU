import { useState, useEffect } from 'react';
import api from '../api/axios';
import logoImg from '../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../assets/ASN-CORPU.png';
import hiasanImg from '../assets/Hiasan.png';
import ProfileDropdown from '../components/ProfileDropdown';
import LanguageDropdown from '../components/LanguageDropdown';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { getStorageUrl } from '../utils/url';
import {
  ChevronDown,
  Clock,
  BookOpen,
  CheckCircle2,
  Award,
  PlayCircle,
  FileDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  BookMarked,
  ArrowRight,
  Folder,
  LayoutGrid,
  User,
  Briefcase,
  Building2,
  CreditCard
} from 'lucide-react';

const getCourseImage = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop';
  return getStorageUrl(url);
};

/* ── Navbar ─────────────────────────────────────────── */
const DashboardNavbar = ({ onLogout, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logoImg} alt="Logo BKPSDM" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <span className="font-semibold text-base sm:text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-[#1D315F] font-semibold text-sm">
        <a href="#" className="text-[#006A63] border-b-2 border-[#006A63] pb-1">{t('nav.dashboard')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('community'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.community')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.catalog')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('my-courses'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.myCourses')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('certificates'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.certificates')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.helpCenter')}</a>

        {/* Right icons */}
        <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-6">
          <LanguageDropdown />
          <ProfileDropdown onLogout={onLogout} />
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="md:hidden flex items-center gap-3">
        <LanguageDropdown />
        <ProfileDropdown onLogout={onLogout} />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#1D315F] hover:text-[#006A63] focus:outline-none">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-md md:hidden flex flex-col py-4 px-6 gap-4 text-[#1D315F] font-semibold text-sm z-50">
          <a href="#" className="text-[#006A63]">{t('nav.dashboard')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('community'); }} className="hover:text-[#006A63] transition-colors">{t('nav.community')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="hover:text-[#006A63] transition-colors">{t('nav.catalog')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('my-courses'); }} className="hover:text-[#006A63] transition-colors">{t('nav.myCourses')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('certificates'); }} className="hover:text-[#006A63] transition-colors">{t('nav.certificates')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors">{t('nav.helpCenter')}</a>
        </div>
      )}
    </nav>
  );
};

/* ── Dashboard Header Banner ────────────────────────── */
const DashboardHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-[#1D315F] py-8 px-6 md:px-12 relative overflow-hidden" style={{ backgroundImage: `url(${hiasanImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-[#1D315F] opacity-55"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-white text-3xl md:text-4xl font-semibold">{t('nav.dashboard')}</h1>
      </div>
    </div>
  );
};

/* ── Welcome & Stats ────────────────────────────────── */
const WelcomeSection = ({ statsData, userData }) => {
  const { t } = useLanguage();
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const user = userData || localUser;

  const namaLengkap = user?.nama_lengkap || 'Peserta ASN';
  const nip = user?.nip || '-';
  const jabatan = user?.jabatan || 'Aparatur Sipil Negara';
  const unitKerja = user?.unit_kerja || 'Pemerintah Kabupaten Buleleng';

  const stats = [
    { label: t('dashboard.activeTraining'), value: statsData?.aktif || 0, icon: BookMarked, color: '#3FCDC1' },
    { label: t('dashboard.completedTraining'), value: statsData?.selesai || 0, icon: CheckCircle2, color: '#10B981' },
    { label: t('dashboard.totalJp'), value: statsData?.total_jpl || 0, icon: Clock, color: '#F59E0B' },
    { label: t('dashboard.totalCertificates'), value: statsData?.sertifikat || 0, icon: Award, color: '#3FCDC1' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Kartu Profil Pegawai ASN */}
      <div className="bg-white border border-[#BBC9C7] rounded-xl p-5 sm:p-6 mb-6 md:mb-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Kolom Kiri: Sapaan & Nama Pegawai */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#1D315F] to-[#006A63] text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm flex-shrink-0">
              {namaLengkap.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#006A63] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider inline-flex items-center gap-1">
                  <User className="w-3 h-3 text-[#006A63]" />
                  Pegawai ASN
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1D315F] leading-tight">
                {t('dashboard.welcome')} {namaLengkap}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {t('dashboard.bannerDesc')}
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Kepegawaian (NIP, Jabatan, Unit Kerja) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6 text-xs">
            {/* NIP */}
            <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/60 flex flex-col justify-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-[#006A63]" />
                NIP
              </span>
              <span className="font-bold text-xs sm:text-[13px] text-[#1D315F] tracking-wide truncate" title={nip}>
                {nip}
              </span>
            </div>

            {/* Jabatan */}
            <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/60 flex flex-col justify-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-[#006A63]" />
                Jabatan
              </span>
              <span className="font-bold text-xs sm:text-[13px] text-[#1D315F] truncate" title={jabatan}>
                {jabatan}
              </span>
            </div>

            {/* Unit Kerja */}
            <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/60 flex flex-col justify-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-[#006A63]" />
                Unit Kerja
              </span>
              <span className="font-bold text-xs sm:text-[13px] text-[#1D315F] truncate" title={unitKerja}>
                {unitKerja}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Statistik Pelatihan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-5 flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1 md:mb-2 font-medium">{s.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-[#1D315F]">{s.value}</p>
            </div>
            <div className="p-1.5 md:p-2 rounded-full" style={{ backgroundColor: `${s.color}15` }}>
              <s.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: s.color }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── Current Course + Activity ──────────────────────── */
const CurrentCourseSection = ({ onNavigate, currentCourse, activitiesData }) => {
  const { t } = useLanguage();
  const defaultActivities = [
    { icon: CheckCircle2, color: '#10B981', title: t('dashboard.noActivity'), time: '' }
  ];

  const activities = activitiesData?.length > 0 ? activitiesData.map(a => ({
    icon: a.type === 'selesai' || a.type === 'lulus' ? CheckCircle2 : PlayCircle,
    color: a.type === 'selesai' || a.type === 'lulus' ? '#10B981' : '#3FCDC1',
    title: a.title,
    time: a.time
  })) : defaultActivities;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 md:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Current Course Card */}
        <div className="lg:col-span-2 bg-white border border-[#BBC9C7] rounded-lg overflow-hidden flex flex-col shadow-sm">
          {currentCourse ? (
            <>
              <div className="h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-100 relative">
                <img
                  src={getCourseImage(currentCourse.image || currentCourse.thumbnail_url)}
                  alt={currentCourse.judul}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop';
                  }}
                />
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-2">
                  <Folder className="w-3.5 h-3.5 text-gray-400" />
                  <span>{currentCourse.kategori}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1D315F] mb-3 leading-snug">
                  {currentCourse.judul}
                </h3>

                <div className="flex items-center gap-5 text-xs text-gray-500 mb-5 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {currentCourse.jpl} JPL
                  </span>
                  <span className="flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-gray-400" />
                    {currentCourse.total_modul} Modul
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                    <span className="text-[#1D315F]">{t('dashboard.progress')}</span>
                    <span className="text-[#3FCDC1]">{currentCourse.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3FCDC1] rounded-full transition-all duration-500"
                      style={{ width: `${currentCourse.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* SELANJUTNYA Box */}
                <div className="border border-gray-200 rounded-lg p-3.5 sm:p-4 mb-5 bg-gray-50/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    SELANJUTNYA
                  </p>
                  <p className="text-sm font-bold text-[#1D315F] truncate">
                    {currentCourse.next_module || 'Lanjutkan Modul'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    localStorage.setItem('userCourseId', currentCourse.pembelajaran_id);
                    onNavigate('course-detail');
                  }}
                  className="w-full py-3 bg-[#1D315F] hover:bg-[#162847] text-white text-sm sm:text-base font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mt-auto shadow-sm cursor-pointer"
                >
                  <span>{t('dashboard.continueLearning')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500 bg-gray-50">
              <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
              <p className="font-semibold text-gray-700">{t('dashboard.emptyTraining')}</p>
              <p className="text-xs mt-1">{t('dashboard.emptyTrainingSub')}</p>
              <button onClick={() => onNavigate('catalog')} className="mt-4 px-4 py-2 bg-[#006A63] text-white text-sm font-bold rounded-md hover:bg-[#00534D]">
                {t('dashboard.viewCatalog')}
              </button>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white border border-[#BBC9C7] rounded-lg p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1D315F] mb-4 sm:mb-5">{t('dashboard.recentActivity')}</h3>
            <div className="flex flex-col gap-4 sm:gap-5">
              {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <a.icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: a.color }} />
                  <div>
                    <p className="text-xs sm:text-[13px] font-bold text-[#1D315F] leading-snug">{a.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigate('my-courses')}
            className="w-full mt-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            Lihat Semua
          </button>
        </div>
      </div>
    </section>
  );
};

/* ── Rekomendasi Pelatihan ──────────────────────────── */
const RecommendationCard = ({ image, title, jpl, modules, onNavigate }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
      <div className="h-40 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-[#1D315F] text-[14px] leading-snug line-clamp-2 mb-4 flex-1">{title}</h3>
        <div className="flex items-center gap-5 text-[11px] text-gray-500 mb-4">
          <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-gray-400" /> {jpl} {t('common.hours')}</span>
          <span className="flex items-center gap-1 font-medium"><BookOpen className="w-3.5 h-3.5 text-gray-400" /> {modules} {t('common.modules')}</span>
        </div>
        <button
          onClick={() => onNavigate('catalog')}
          className="w-full py-2.5 border border-[#006A63] text-[#006A63] bg-white rounded-md text-[13px] font-bold hover:bg-[#006A63] hover:text-white transition-colors"
        >
          {t('common.viewDetails')}
        </button>
      </div>
    </div>
  );
};

const Recommendations = ({ onNavigate, coursesData }) => {
  const { t } = useLanguage();
  const courses = coursesData?.length > 0 ? coursesData : [];

  if (courses.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 md:pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#1D315F]">{t('dashboard.recommendations')}</h2>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="text-[#3FCDC1] text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline">
          {t('dashboard.viewCatalog')} <ChevronRight className="w-4 h-4" />
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {courses.map((c, i) => <RecommendationCard key={i} {...c} onNavigate={onNavigate} />)}
      </div>
    </section>
  );
};

/* ── Main Export ─────────────────────────────────────── */
export default function UserDashboard({ onLogout, onNavigate }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/user/dashboard');
        const data = response.data?.data;
        setDashboardData(data);
        if (data?.user) {
          const currentLocal = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...currentLocal, ...data.user }));
        }
      } catch (error) {
        console.error('Error fetching user dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-[#1D315F] font-bold">Memuat Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <DashboardNavbar onLogout={onLogout} onNavigate={onNavigate} />
      <main className="flex-grow bg-[#F9FAFB]">
        <DashboardHeader />
        <WelcomeSection statsData={dashboardData?.stats} userData={dashboardData?.user} />
        <CurrentCourseSection
          onNavigate={onNavigate}
          currentCourse={dashboardData?.current_course}
          activitiesData={dashboardData?.activities}
        />
        <Recommendations onNavigate={onNavigate} coursesData={dashboardData?.rekomendasi} />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
