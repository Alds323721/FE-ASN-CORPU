import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../api/axios';
import logoImg from '../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../assets/ASN-CORPU.png';
import hiasanImg from '../assets/Hiasan.png';
import ProfileDropdown from '../components/ProfileDropdown';
import LanguageDropdown from '../components/LanguageDropdown';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronDown, Menu, X,
  Mail, Phone, MapPin, Users, BookOpen,
  ArrowRight, ChevronLeft, ChevronRight, Check, Lock
} from 'lucide-react';

/* ── Navbar ───────────────────────────────────── */
const CommunityNavbar = ({ onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logoImg} alt="Logo BKPSDM" className="w-8 h-8 object-contain" />
        <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-8 h-8 object-contain" />
        <span className="font-semibold text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-8 text-[#1D315F] font-semibold text-sm">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.dashboard')}</a>
        <a href="#" className="text-[#006A63] border-b-2 border-[#006A63] pb-1">{t('nav.community')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.catalog')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('my-courses'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.myCourses')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('certificates'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.certificates')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.helpCenter')}</a>
        <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-6">
          <LanguageDropdown />
          <ProfileDropdown onNavigate={onNavigate} />
        </div>
      </div>

      {/* Mobile button */}
      <div className="md:hidden flex items-center gap-3">
        <LanguageDropdown />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#1D315F]">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-md md:hidden flex flex-col py-4 px-6 gap-4 text-[#1D315F] font-semibold text-sm z-50">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="hover:text-[#006A63]">{t('nav.dashboard')}</a>
          <a href="#" className="text-[#006A63]">{t('nav.community')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="hover:text-[#006A63]">{t('nav.catalog')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('my-courses'); }} className="hover:text-[#006A63]">{t('nav.myCourses')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('certificates'); }} className="hover:text-[#006A63]">{t('nav.certificates')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63]">{t('nav.helpCenter')}</a>
        </div>
      )}
    </nav>
  );
};

/* ── Page Header ──────────────────────────────── */
const PageHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-[#1D315F] py-10 px-6 md:px-12 relative overflow-hidden" style={{ backgroundImage: `url(${hiasanImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-[#1D315F] opacity-55"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-white text-3xl md:text-4xl font-semibold">{t('community.title')}</h1>
      </div>
    </div>
  );
};

/* ── Community Card ───────────────────────────── */
const CommunityCard = ({ id, image, thumbnail_url, category, title, description, members, courses, isJoined, canJoin = true, is_umum = false, onJoin, onNavigate }) => {
  const { t, language } = useLanguage();
  const isRestricted = !is_umum && (!isJoined && !canJoin);

  return (
    <div className={`bg-white border rounded-lg overflow-hidden flex flex-col transition-all duration-200 ${isRestricted
        ? 'border-gray-200 bg-gray-50/60'
        : 'border-[#BBC9C7] hover:shadow-lg hover:-translate-y-1'
      }`}>
      <div className="h-44 relative overflow-hidden">
        <img
          src={thumbnail_url || image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop'}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-300 ${isRestricted ? 'opacity-80 grayscale-[25%]' : 'hover:scale-105'}`}
        />
        {is_umum ? (
          <div className="absolute top-3 left-3 bg-teal-600/95 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded shadow-sm">
            {t('community.general')}
          </div>
        ) : (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#1D315F] text-[11px] font-bold px-3 py-1 rounded shadow-sm">
            {category}
          </div>
        )}
        {isRestricted && (
          <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-gray-200 text-[10px] font-semibold px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Beda Rumpun</span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className={`font-bold text-[20px] leading-snug mb-3 ${isRestricted ? 'text-gray-700' : 'text-[#1D315F]'}`}>
          {title}
        </h3>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-5 flex-1 line-clamp-3">{description}</p>

        <div className="flex items-center gap-6 text-[13px] text-gray-600 font-semibold mb-6 border-t border-gray-100 pt-5">
          <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[#006A63]" /> {members.toLocaleString(language === 'EN' ? 'en-US' : 'id-ID')} {t('community.members')}</span>
          <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#006A63]" /> {courses} {t('community.courses')}</span>
        </div>

        {isJoined ? (
          <button
            onClick={() => onNavigate('catalog')}
            className="w-full py-2.5 border-2 border-[#006A63] text-[#006A63] bg-white rounded-md text-[13px] font-bold hover:bg-[#EFF5F3] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {t('community.viewCommunity')} <ArrowRight className="w-4 h-4" />
          </button>
        ) : isRestricted ? (
          <div>
            <button
              type="button"
              disabled
              className="w-full py-2.5 bg-gray-200 text-gray-500 border border-gray-300 rounded-md text-[13px] font-bold cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-none"
              title={`Komunitas ini khusus untuk pegawai rumpun jabatan ${category}`}
            >
              <Lock className="w-4 h-4 text-gray-400" />
              <span>Khusus Rumpun {category}</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-1.5 font-medium">
              Tidak dapat dipilih (beda rumpun jabatan)
            </p>
          </div>
        ) : (
          <button
            onClick={() => onJoin(id)}
            className="w-full py-2.5 bg-[#006A63] text-white rounded-md text-[13px] font-bold hover:bg-[#00534D] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {t('community.joinCommunity')} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Main Content ─────────────────────────────── */
const CommunityContent = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('Semua Kategori');
  const [communities, setCommunities] = useState([]);
  const [userRumpun, setUserRumpun] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}').rumpun_jabatan || '';
    } catch {
      return '';
    }
  });
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'Semua Kategori', label: t('catalog.allCategories') },
    { value: 'JPT', label: 'JPT' },
    { value: 'JA', label: 'JA' },
    { value: 'JF', label: 'JF' },
    { value: 'JP', label: 'JP' },
    { value: 'UMUM', label: t('community.general') }
  ];

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await api.get('/user/komunitas');
        if (res.data?.data) {
          setCommunities(res.data.data);
        }
        if (res.data?.user_rumpun_jabatan) {
          setUserRumpun(res.data.user_rumpun_jabatan);
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  const handleJoin = async (id, canJoin = true) => {
    if (!canJoin) {
      Swal.fire({
        icon: 'warning',
        title: 'Tidak Dapat Memilih',
        text: 'Anda hanya dapat memilih komunitas yang sesuai dengan rumpun jabatan Anda.',
        confirmButtonColor: '#006A63'
      });
      return;
    }
    try {
      const res = await api.post(`/user/komunitas/${id}/join`);
      setCommunities(prev => prev.map(c =>
        c.id === id ? { ...c, is_joined: true, members: c.is_umum ? c.members : c.members + 1 } : c
      ));
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res.data?.message || 'Berhasil bergabung dengan komunitas!',
        confirmButtonColor: '#006A63'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Bergabung',
        text: error.response?.data?.message || 'Gagal bergabung dengan komunitas',
        confirmButtonColor: '#006A63'
      });
    }
  };

  const handleNavigateToCatalog = (komunitasId) => {
    // Navigate ke catalog dengan mengirim ID komunitas
    localStorage.setItem('filterKomunitasId', komunitasId);
    onNavigate('catalog');
  };

  const filteredCommunities = communities.filter(c =>
    activeCategory === 'Semua Kategori' || c.category === activeCategory
  );

  return (
    <section className="bg-[#F9FBFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Sidebar */}
        <aside className="md:col-span-3">
          <div className="bg-white border border-[#BBC9C7] rounded-lg p-5">
            <h3 className="font-bold text-[#1D315F] text-[17px] mb-5">{t('community.jobFamily')}</h3>
            <div className="space-y-4">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${activeCategory === cat.value ? 'bg-[#006A63] border-[#006A63]' : 'bg-white border-gray-300'}`}>
                    {activeCategory === cat.value && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-[14px] font-semibold transition-colors ${activeCategory === cat.value ? 'text-[#006A63]' : 'text-[#1D315F]'}`}>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="md:col-span-9">
          {/* User Rumpun Jabatan Banner */}
          {userRumpun && (
            <div className="mb-6 bg-teal-50/70 border border-teal-200 rounded-lg p-3.5 sm:p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-[#006A63] flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] sm:text-[14px] font-bold text-[#1D315F]">
                  Rumpun Jabatan Anda: <span className="text-[#006A63] bg-white border border-teal-300 px-2 py-0.5 rounded text-[12px] font-extrabold ml-1">{userRumpun}</span>
                </div>
                <p className="text-[12px] text-gray-600 mt-0.5 leading-snug">
                  Komunitas rumpun lain terkunci. Komunitas Umum terbuka untuk semua rumpun jabatan.
                </p>
              </div>
            </div>
          )}

          {/* Top bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <p className="text-[14px] font-medium text-gray-500 mb-3 sm:mb-0">
              {t('community.showing')} <span className="font-bold text-[#1D315F]">{filteredCommunities.length}</span> {t('catalog.of')} <span className="font-bold text-[#1D315F]">{communities.length}</span> {t('community.communities')}
            </p>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1D315F]">
              {t('catalog.sortBy')}
              <div className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded bg-white cursor-pointer ml-1">
                {t('catalog.newest')} <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 font-bold text-[#1D315F]">{t('community.loading')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredCommunities.map((c) => (
                <CommunityCard
                  key={c.id}
                  {...c}
                  canJoin={c.can_join}
                  isJoined={c.is_joined}
                  onJoin={() => handleJoin(c.id, c.can_join)}
                  onNavigate={() => handleNavigateToCatalog(c.id)}
                />
              ))}
              {filteredCommunities.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10 font-semibold">{t('community.empty')}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};


/* ── Export ───────────────────────────────────── */
export default function Community({ onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <CommunityNavbar onNavigate={onNavigate} />
      <main className="flex-grow">
        <PageHeader />
        <CommunityContent onNavigate={onNavigate} />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
