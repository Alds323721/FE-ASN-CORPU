import { useState, useEffect } from 'react';
import api from '../api/axios';
import logoImg from '../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../assets/ASN-CORPU.png';
import hiasanImg from '../assets/Hiasan.png';
import ProfileDropdown from '../components/ProfileDropdown';
import LanguageDropdown from '../components/LanguageDropdown';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronDown,
  Clock,
  BookOpen,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Folder,
  Scale,
  CheckCircle2
} from 'lucide-react';

/* ── Navbar ─────────────────────────────────────────── */
const MyCoursesNavbar = ({ onNavigate }) => {
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
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.catalog')}</a>
         <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('my-courses'); }} className="text-[#006A63] border-b-2 border-[#006A63] pb-1">{t('nav.myCourses')}</a>
         <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('certificates'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.certificates')}</a>
         <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.helpCenter')}</a>

         {/* Right icons */}
         <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-6">
          <LanguageDropdown />
          <ProfileDropdown onLogout={() => onNavigate('landing')} />
        </div>
      </div>

      {/* Mobile toggle */}
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
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('certificates'); }} className="hover:text-[#006A63] transition-colors">{t('nav.certificates')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors">{t('nav.helpCenter')}</a>
        </div>
      )}
    </nav>
  );
};

/* ── Header ────────────────────────── */
const MyCoursesHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-[#1D315F] py-10 px-6 md:px-12 relative overflow-hidden" style={{ backgroundImage: `url(${hiasanImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-[#1D315F] opacity-55"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-white text-3xl md:text-4xl font-semibold">{t('myCourses.title')}</h1>
      </div>
    </div>
  );
};

/* ── Tabs ──────────────────────────── */
const Tabs = ({ activeTab, setActiveTab, stats }) => {
  const { t } = useLanguage();
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 mt-6 border-b border-gray-200">
      <div className="flex items-center gap-8 text-[15px] font-semibold">
        <button 
          onClick={() => setActiveTab('berjalan')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'berjalan' ? 'border-[#006A63] text-[#006A63]' : 'border-transparent text-gray-500 hover:text-[#1D315F]'}`}
        >
          {t('myCourses.inProgress')} ({stats?.berjalan || 0})
        </button>
        <button 
          onClick={() => setActiveTab('selesai')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'selesai' ? 'border-[#006A63] text-[#006A63]' : 'border-transparent text-gray-500 hover:text-[#1D315F]'}`}
        >
          {t('myCourses.completed')} ({stats?.selesai || 0})
        </button>
      </div>
    </div>
  );
};

/* ── Cards ──────────────────────────── */
const InProgressCard = ({ image, categoryIcon: Icon, category, title, jpl, modules, progress, onContinue }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
      <div className="h-44 relative">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-[#006A63] text-white px-3 py-1 text-[11px] font-bold rounded-sm shadow-sm tracking-wider">
          {t('common.free')}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-gray-500 text-[13px] font-semibold mb-3">
          <Icon className="w-4 h-4" /> {category}
        </div>
        <h3 className="font-bold text-[#1D315F] text-[17px] leading-snug mb-5 flex-1">{title}</h3>
        
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold bg-gray-100 px-3 py-1.5 rounded text-gray-600"><Clock className="w-3.5 h-3.5" /> {jpl} {t('common.hours')}</span>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold bg-gray-100 px-3 py-1.5 rounded text-gray-600"><BookOpen className="w-3.5 h-3.5" /> {modules} {t('common.modules')}</span>
        </div>
        
        <div className="mb-5">
          <div className="flex justify-between items-center text-[13px] font-semibold mb-2">
            <span className="text-[#1D315F]">{t('myCourses.learningProgress')}</span>
            <span className="text-[#006A63]">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#006A63] h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        
        <button 
          onClick={onContinue}
          className="w-full py-2.5 bg-[#006A63] text-white rounded-md text-[13px] font-bold hover:bg-[#00534D] transition-colors flex items-center justify-center gap-2">
          {t('dashboard.continueLearning')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const CompletedCard = ({ image, categoryIcon: Icon, category, title, jpl, completedDate }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
      <div className="h-44 relative">
        <img src={image} alt={title} className="w-full h-full object-cover grayscale opacity-90 mix-blend-multiply" />
        <div className="absolute top-3 left-3 bg-[#3FCDC1] text-white px-3 py-1.5 text-[11px] font-bold rounded-sm shadow-sm flex items-center gap-1.5 tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" /> {t('myCourses.completedTag')}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col bg-white">
        <div className="flex items-center gap-2 text-gray-500 text-[13px] font-semibold mb-3">
          <Icon className="w-4 h-4" /> {category}
        </div>
        <h3 className="font-bold text-[#1D315F] text-[17px] leading-snug mb-5 flex-1">{title}</h3>
        
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold bg-gray-100 px-3 py-1.5 rounded text-gray-600"><Clock className="w-3.5 h-3.5" /> {jpl} {t('common.hours')}</span>
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-100 pt-5 pb-5">
          <span className="text-[13px] font-semibold text-gray-500">{t('myCourses.completedOn')}</span>
          <span className="text-[13px] font-bold text-[#1D315F]">{completedDate}</span>
        </div>
        
        <button className="w-full py-2.5 border border-[#1D315F] text-[#1D315F] bg-white rounded-md text-[13px] font-bold hover:bg-gray-50 transition-colors">
          {t('common.viewDetails')}
        </button>
      </div>
    </div>
  );
};

/* ── Main Section ───────────────────────────── */
const MyCoursesContent = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('berjalan');
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/user/my-courses', { params: { status: activeTab } });
        if (response.data?.data) {
          setCourses(response.data.data.courses);
          setStats(response.data.data.stats);
        }
      } catch (error) {
        console.error('Error fetching my courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [activeTab]);

  return (
    <section className="bg-[#F9FBFC] min-h-[500px]">
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {loading ? (
          <div className="text-center py-10 font-bold text-gray-500">{t('common.loading')}</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-10 font-bold text-gray-500">{t('myCourses.empty')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c, i) => {
              if (activeTab === 'berjalan') {
                return (
                  <InProgressCard 
                    key={i} 
                    {...c}
                    categoryIcon={Folder} 
                    onContinue={() => {
                      localStorage.setItem('userCourseId', c.pembelajaran_id);
                      onNavigate('course-detail');
                    }}
                  />
                );
              } else {
                return (
                  <CompletedCard 
                    key={i} 
                    {...c}
                    categoryIcon={Scale}
                    completedDate={c.terdaftar_pada ? new Date(c.terdaftar_pada).toLocaleDateString() : '-'}
                  />
                );
              }
            })}
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
    <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
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

/* ── Main Export ─────────────────────────────────────── */
export default function MyCourses({ onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <MyCoursesNavbar onNavigate={onNavigate} />
      <main className="flex-grow">
        <MyCoursesHeader />
        <MyCoursesContent onNavigate={onNavigate} />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
