import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import api from '../api/axios';
import logoImg from '../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../assets/ASN-CORPU.png';
import hiasanImg from '../assets/Hiasan.png';
import ProfileDropdown from '../components/ProfileDropdown';
import LanguageDropdown from '../components/LanguageDropdown';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  ChevronDown,
  Clock,
  BookOpen,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  Lock
} from 'lucide-react';

/* ── Navbar ─────────────────────────────────────────── */
const CatalogNavbar = ({ onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logoImg} alt="Logo BKPSDM" className="w-8 h-8 object-contain" />
        <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-8 h-8 object-contain" />
        <span className="font-semibold text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-[#1D315F] font-semibold text-sm">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.dashboard')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('community'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.community')}</a>
        <a href="#" className="text-[#006A63] border-b-2 border-[#006A63] pb-1">{t('nav.catalog')}</a>
         <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('my-courses'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.myCourses')}</a>
         <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('certificates'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.certificates')}</a>
         <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.helpCenter')}</a>

         {/* Right icons */}
         <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-6">
          <LanguageDropdown />
          <ProfileDropdown onNavigate={onNavigate} />
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="md:hidden flex items-center gap-3">
        <LanguageDropdown />
        <ProfileDropdown onNavigate={onNavigate} />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#1D315F] hover:text-[#006A63] focus:outline-none">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-md md:hidden flex flex-col py-4 px-6 gap-4 text-[#1D315F] font-semibold text-sm z-50">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="hover:text-[#006A63] transition-colors">{t('nav.dashboard')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('community'); }} className="hover:text-[#006A63] transition-colors">{t('nav.community')}</a>
          <a href="#" className="text-[#006A63]">{t('nav.catalog')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('my-courses'); }} className="hover:text-[#006A63] transition-colors">{t('nav.myCourses')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('certificates'); }} className="hover:text-[#006A63] transition-colors">{t('nav.certificates')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors">{t('nav.helpCenter')}</a>
        </div>
      )}
    </nav>
  );
};

/* ── Dashboard Header Banner ────────────────────────── */
const CatalogHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-[#1D315F] py-8 px-6 md:px-12 relative overflow-hidden" style={{ backgroundImage: `url(${hiasanImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-[#1D315F] opacity-55"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-white text-3xl md:text-4xl font-semibold">{t('nav.catalog')}</h1>
      </div>
    </div>
  );
};

/* ── Catalog Course Card ────────────────────────── */
const CatalogCard = ({ id, image, category, title, description, jpl, modules, isEnrolled, onEnroll, onNavigate, nama_komunitas, is_locked_review }) => {
  const { t } = useLanguage();

  const handleShowLockedAlert = () => {
    Swal.fire({
      icon: 'info',
      title: 'Pembelajaran Terkunci',
      html: `
        <div class="text-left text-sm text-gray-600 space-y-3">
          <p>Materi pada pembelajaran <b>"${title}"</b> sedang dalam proses pembaruan oleh <b>Admin Komunitas</b>.</p>
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium">
            🔒 Status: <b>Menunggu Persetujuan (Approval) Admin BKPSDM</b>
          </div>
          <p class="text-xs text-gray-500">
            Katalog pembelajaran otomatis dikunci dan akan dibuka kembali untuk pendaftaran serta akses belajar setelah Admin Komunitas berhasil memperoleh approval resmi dari Admin BKPSDM.
          </p>
        </div>
      `,
      confirmButtonColor: '#006A63',
      confirmButtonText: 'Saya Mengerti'
    });
  };

  return (
    <div className={`bg-white border rounded-lg overflow-hidden flex flex-col transition-all relative ${
      is_locked_review 
        ? 'border-gray-200 bg-white shadow-xs' 
        : 'border-[#BBC9C7] hover:shadow-lg hover:-translate-y-1'
    }`}>
      <div className="h-44 relative overflow-hidden">
        <img 
          src={image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60'} 
          alt={title} 
          className={`w-full h-full object-cover transition-transform duration-300 ${is_locked_review ? 'opacity-80 grayscale-[25%]' : 'hover:scale-105'}`} 
        />
        
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#1D315F] text-[11px] font-bold px-3 py-1 rounded shadow-sm">
          {category}
        </div>

        {/* Lock Badge seperti pada Komunitas beda jabatan */}
        {is_locked_review && (
          <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-gray-200 text-[10px] font-semibold px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Sedang Ditinjau BKPSDM</span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {nama_komunitas && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#006A63] uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span className="truncate">{nama_komunitas}</span>
          </div>
        )}

        <h3 className={`font-bold text-[17px] leading-snug mb-2 flex items-center gap-1.5 ${is_locked_review ? 'text-gray-700' : 'text-[#1D315F]'}`}>
          {is_locked_review && <Lock className="w-4 h-4 text-gray-400 shrink-0 inline" />}
          <span className="line-clamp-2">{title}</span>
        </h3>

        <p className="text-[12px] text-gray-500 line-clamp-3 mb-5 flex-1">{description}</p>
        
        <div className="flex items-center gap-5 text-[12px] text-[#1D315F] mb-6">
          <span className="flex items-center gap-1 font-semibold"><Clock className="w-4 h-4 text-gray-500" /> {jpl} {t('common.hours')}</span>
          <span className="flex items-center gap-1 font-semibold"><BookOpen className="w-4 h-4 text-gray-500" /> {modules} {t('common.modules')}</span>
        </div>
        
        {is_locked_review ? (
          <div>
            <button
              type="button"
              onClick={handleShowLockedAlert}
              className="w-full py-2.5 bg-gray-200 text-gray-500 border border-gray-300 rounded-md text-[13px] font-bold cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-none hover:bg-gray-250 transition-colors"
              title="Klik untuk melihat status peninjauan materi oleh Admin BKPSDM"
            >
              <Lock className="w-4 h-4 text-gray-400" />
              <span>Terkunci (Ditinjau BKPSDM)</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-1.5 font-medium">
              Tidak dapat diakses sementara (menunggu approval)
            </p>
          </div>
        ) : isEnrolled ? (
          <button
            onClick={() => {
              if (id) localStorage.setItem('userCourseId', id);
              onNavigate('course-detail');
            }}
            className="w-full py-2.5 border-2 border-[#006A63] text-[#006A63] bg-white rounded-md text-[13px] font-bold hover:bg-[#EFF5F3] transition-colors cursor-pointer"
          >
            {t('catalog.viewCurriculum')}
          </button>
        ) : (
          <button
            onClick={() => onEnroll(id)}
            className="w-full py-2.5 bg-[#006A63] text-white rounded-md text-[13px] font-bold hover:bg-[#00534D] transition-colors cursor-pointer"
          >
            {t('catalog.enrollNow')}
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Main Catalog Section ────────────────────────────── */
const CatalogContent = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [hasJoinedCommunity, setHasJoinedCommunity] = useState(true);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [selectedKomunitasId, setSelectedKomunitasId] = useState(() => localStorage.getItem('filterKomunitasId') || '');
  const [category, setCategory] = useState('Semua Kategori');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('terbaru');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchKatalog = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        kategori: category,
        sort: sort
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      
      if (selectedKomunitasId && selectedKomunitasId !== 'all') {
        params.komunitas_id = selectedKomunitasId;
      }

      const response = await api.get('/user/katalog', { params });
      const hasJoined = response.data?.has_joined_community !== false;
      setHasJoinedCommunity(hasJoined);
      if (response.data?.joined_communities) {
        setJoinedCommunities(response.data.joined_communities);
      }

      if (response.data?.data) {
        setCourses(response.data.data.data || []);
        setCurrentPage(response.data.data.current_page || 1);
        setTotalPages(response.data.data.last_page || 1);
        setTotalItems(response.data.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching katalog:', error);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, sort, currentPage, selectedKomunitasId]);

  useEffect(() => {
    fetchKatalog();
  }, [fetchKatalog]);

  const handleClearKomunitasFilter = () => {
    localStorage.removeItem('filterKomunitasId');
    setSelectedKomunitasId('');
    setCurrentPage(1);
  };

  const handleSelectKomunitas = (kId) => {
    if (kId && kId !== 'all') {
      localStorage.setItem('filterKomunitasId', kId);
      setSelectedKomunitasId(kId);
    } else {
      localStorage.removeItem('filterKomunitasId');
      setSelectedKomunitasId('');
    }
    setCurrentPage(1);
  };

  const activeKomunitas = joinedCommunities.find(k => String(k.komunitas_id) === String(selectedKomunitasId));

  const handleEnroll = async (id) => {
    try {
      setEnrolling(true);
      const res = await api.post(`/user/katalog/${id}/enroll`);
      Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil!',
        text: res.data?.message || 'Anda telah berhasil mendaftar ke pelatihan ini.',
        confirmButtonColor: '#006A63'
      });
      fetchKatalog(); // refresh to update isEnrolled status
    } catch (error) {
      if (error.response?.status === 403) {
        Swal.fire({
          icon: 'warning',
          title: 'Perlu Bergabung Komunitas',
          text: error.response?.data?.message || 'Anda harus bergabung ke komunitas penyelenggara terlebih dahulu sebelum mendaftar pelatihan ini.',
          showCancelButton: true,
          confirmButtonText: 'Buka Menu Komunitas',
          cancelButtonText: 'Tutup',
          confirmButtonColor: '#006A63'
        }).then((result) => {
          if (result.isConfirmed) {
            onNavigate('community');
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Mendaftar',
          text: error.response?.data?.message || 'Gagal mendaftar ke pelatihan',
          confirmButtonColor: '#006A63'
        });
      }
    } finally {
      setEnrolling(false);
    }
  };

  const [categories, setCategories] = useState([
    { value: 'Semua Kategori', label: t('catalog.allCategories') },
    { value: 'Manajemen ASN', label: t('catalog.catAsn') },
    { value: 'Teknologi Informasi', label: t('catalog.catIt') },
    { value: 'Pengembangan Kompetensi', label: 'Pengembangan Kompetensi' },
    { value: 'Pelayanan Publik', label: t('catalog.catPublic') }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/kategori-kursus');
        if (res.data?.data && res.data.data.length > 0) {
          const dynamicCats = [
            { value: 'Semua Kategori', label: t('catalog.allCategories') },
            ...res.data.data.map(cat => ({
              value: cat.nama_kategori,
              label: cat.nama_kategori
            }))
          ];
          setCategories(dynamicCats);
        }
      } catch (err) {
        console.error('Error fetching categories in catalog:', err);
      }
    };
    fetchCategories();
  }, [t]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Sidebar Filters */}
      <aside className="md:col-span-3 space-y-6">
        <div className="bg-white border border-[#BBC9C7] rounded-lg p-5">
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={t('catalog.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#006A63]"
            />
          </div>

          {/* Filter Komunitas Belajar Saya */}
          {joinedCommunities.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="font-bold text-base text-[#1D315F] mb-3">Komunitas Belajar Saya</h3>
              <select
                value={selectedKomunitasId}
                onChange={(e) => handleSelectKomunitas(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 text-xs font-semibold text-[#1D315F] bg-white focus:outline-none focus:border-[#006A63] cursor-pointer"
              >
                <option value="">Semua Komunitas Saya ({joinedCommunities.length})</option>
                {joinedCommunities.map((k) => (
                  <option key={k.komunitas_id} value={k.komunitas_id}>
                    {k.nama_komunitas}
                  </option>
                ))}
              </select>
            </div>
          )}

          <h3 className="font-bold text-xl text-[#1D315F] mb-4 pb-4 border-b border-gray-100">{t('catalog.category')}</h3>
          <div className="space-y-4">
            {categories.map((c, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer" onClick={() => { setCategory(c.value); setCurrentPage(1); }}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${category === c.value ? 'bg-[#006A63] border-[#006A63]' : 'bg-white border-gray-300'}`}>
                  {category === c.value && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-[14px] font-semibold text-[#1D315F]">{c.label}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="md:col-span-9">
        {/* Banner Filter Komunitas Aktif */}
        {activeKomunitas && (
          <div className="mb-6 p-4 bg-teal-50/70 border border-teal-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#006A63] shrink-0" />
              <div>
                <p className="text-xs text-teal-800 font-semibold uppercase tracking-wider">Menampilkan Pembelajaran Komunitas</p>
                <p className="text-base font-bold text-[#1D315F]">{activeKomunitas.nama_komunitas}</p>
              </div>
            </div>
            <button
              onClick={handleClearKomunitasFilter}
              className="text-xs font-bold text-[#006A63] hover:text-[#00534D] underline cursor-pointer"
            >
              Tampilkan Semua Komunitas Saya
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-[#BBC9C7]">
          <p className="text-[14px] font-medium text-gray-500 mb-4 sm:mb-0">
            {t('catalog.showing')} <span className="font-bold text-[#1D315F]">{courses.length}</span> {t('catalog.of')} <span className="font-bold text-[#1D315F]">{totalItems}</span> {t('catalog.courses')}
          </p>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1D315F]">
            {t('catalog.sortBy')}
            <select 
              className="border border-gray-300 px-3 py-1.5 rounded bg-white cursor-pointer ml-1 outline-none"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
            >
              <option value="terbaru">{t('catalog.newest')}</option>
              <option value="abjad">{t('catalog.alphabetical')}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 font-bold">{t('catalog.loading')}</div>
        ) : !hasJoinedCommunity ? (
          <div className="bg-white border border-[#BBC9C7] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-sm my-6">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-[#006A63] mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1D315F] mb-2">Belum Bergabung dengan Komunitas Belajar</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Katalog pembelajaran diselenggarakan oleh komunitas belajar masing-masing. Anda harus memilih dan bergabung ke komunitas belajar terlebih dahulu agar dapat mengakses dan mendaftar pelatihan yang tersedia.
            </p>
            <button
              onClick={() => onNavigate('community')}
              className="px-6 py-3 bg-[#006A63] hover:bg-[#00534D] text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm text-sm cursor-pointer"
            >
              <Users className="w-4 h-4" /> Pilih & Gabung Komunitas Sekarang
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center text-gray-500 font-bold">{t('catalog.empty')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {courses.map((c) => (
              <CatalogCard
                key={c.id}
                {...c}
                onEnroll={() => handleEnroll(c.id)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded border border-gray-300 text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-600">{t('catalog.page')} {currentPage} {t('catalog.of')} {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded border border-gray-300 text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

/* ── Footer ─────────────────────────────────────────── */
const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();
  return (
  <footer className="bg-[#EAEFF4] pt-16 pb-8 border-t border-[#BBC9C7]">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
      <div className="md:col-span-5 pr-8">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-6">
          <img src={logoImg} alt="Logo BKPSDM" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
          <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
          <span className="font-semibold text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
        </div>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-6 font-medium">
          {t('footer.tagline')}
        </p>
        <p className="text-[11px] text-gray-500 font-semibold">
          {t('footer.copyright')}
        </p>
      </div>
      <div className="md:col-span-3">
        <h4 className="font-bold text-[#1D315F] text-[15px] mb-6">{t('footer.quickLinks')}</h4>
        <ul className="text-[13px] text-[#1D315F] space-y-3 font-semibold">
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('catalog'); }} className="hover:text-[#006A63] transition-colors">{t('footer.courses')}</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('community'); }} className="hover:text-[#006A63] transition-colors">{t('footer.community')}</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('help-center'); }} className="hover:text-[#006A63] transition-colors">{t('footer.help')}</a></li>
        </ul>
      </div>
      <div className="md:col-span-4">
        <h4 className="font-bold text-[#1D315F] text-[15px] mb-6">{t('footer.contactUs')}</h4>
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

/* ── Main Export ───────────────────────────────────── */
export default function CourseCatalog({ onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9FBFC]">
      <CatalogNavbar onNavigate={onNavigate} />
      <main className="flex-grow">
        <CatalogHeader />
        <CatalogContent onNavigate={onNavigate} />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
