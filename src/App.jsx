import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import './index.css'
import PortalPage from './pages/PortalPage'
import LandingPage from './pages/LandingPage'
import UserDashboard from './pages/UserDashboard'
import CourseCatalog from './pages/CourseCatalog'
import MyCourses from './pages/MyCourses'
import Community from './pages/Community'
import CourseDetail from './pages/CourseDetail'
import PostTest from './pages/PostTest'
import Kuis from './pages/Kuis'
import TestResult from './pages/TestResult'
import HelpCenter from './pages/HelpCenter'
import Certificates from './pages/Certificates'
import PublicCertificateVerification from './pages/PublicCertificateVerification'
import LoadingSkeleton from './components/LoadingSkeleton'
import AdminLoadingSkeleton from './components/AdminLoadingSkeleton'
import AdminDashboard from './Admin-BKPSDM/AdminDashboard'
import UserManagement from './Admin-BKPSDM/UserManagement'
import CommunityManagement from './Admin-BKPSDM/CommunityManagement'
import CourseValidation from './Admin-BKPSDM/CourseValidation'
import CourseReview from './Admin-BKPSDM/CourseReview'
import MonitoringReports from './Admin-BKPSDM/MonitoringReports'
import CategoryManagement from './Admin-BKPSDM/CategoryManagement'
import AdminKomunitasDashboard from './Admin-Komunitas/AdminKomunitasDashboard'
import AdminKomunitasSkeleton from './Admin-Komunitas/AdminKomunitasSkeleton'
import PelatihanSaya from './Admin-Komunitas/PelatihanSaya'
import LaporanProgress from './Admin-Komunitas/LaporanProgress'
import KatalogKursus from './Admin-Komunitas/KatalogKursus'
import DetailKursus from './Admin-Komunitas/DetailKursus'
import BankSoal from './Admin-Komunitas/BankSoal'
import PusatBantuan from './Admin-Komunitas/PusatBantuan'
import { isAuthenticated, getUserRole, getUserRoles, getActiveRole, setActiveRole, logout, clearAuth, checkNewTabTimeout } from './utils/auth'

const routePaths = {
  'portal': '/',
  'lms': '/LMS',
  'admin': '/admin',
  'user-management': '/admin/user-management',
  'community-management': '/admin/community-management',
  'category-management': '/admin/category-management',
  'course-validation': '/admin/course-validation',
  'course-review': '/admin/course-validation/review',
  'monitoring-reports': '/admin/monitoring-reports',
  'admin-komunitas': '/admin-komunitas',
  'pelatihan-saya': '/admin-komunitas/pelatihan-saya',
  'laporan-progress': '/admin-komunitas/laporan-progress',
  'katalog-kursus': '/admin-komunitas/katalog-kursus',
  'detail-kursus': '/admin-komunitas/detail-kursus',
  'bank-soal': '/admin-komunitas/bank-soal',
  'pusat-bantuan': '/admin-komunitas/pusat-bantuan',
  'dashboard': '/dashboard',
  'catalog': '/catalog',
  'pelatihan': '/catalog',
  'my-courses': '/my-courses',
  'certificates': '/certificates',
  'community': '/community',
  'course-detail': '/course-detail',
  'post-test': '/post-test',
  'kuis': '/kuis',
  'test-result': '/test-result',
  'help-center': '/help-center',
  'validasi-sertifikat': '/validasi-sertifikat',
};

function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname;

    // Rute Publik Validasi Sertifikat (Bisa diakses siapa saja tanpa login saat scan QR Code)
    if (path.startsWith('/validasi-sertifikat') || path.startsWith('/verify-certificate')) {
      return 'validasi-sertifikat';
    }

    // Keamanan: Cek apakah tab baru dibuka lebih dari 5 menit setelah login
    if (checkNewTabTimeout()) {
      clearAuth();
      sessionStorage.setItem('session_timeout_alert', 'true');
      window.history.replaceState({ route: 'portal' }, '', '/');
      return 'portal';
    }

    // Root portal '/'
    if (path === '/' || path === '') {
      return 'portal';
    }

    // Jika belum login dan mengakses rute selain portal atau /LMS, arahkan ke portal
    if (!isAuthenticated()) {
      if (path.toLowerCase() === '/lms' || path.toLowerCase() === '/lms/') {
        return 'lms';
      }
      window.history.replaceState({ route: 'portal' }, '', '/');
      return 'portal';
    }

    const activeRole = getActiveRole();
    const userRoles = getUserRoles();

    // Rute LMS khusus (/LMS atau /lms) saat sudah login
    if (path.toLowerCase() === '/lms' || path.toLowerCase() === '/lms/') {
      let defaultRoute = 'dashboard';
      if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) defaultRoute = 'admin';
      else if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) defaultRoute = 'admin-komunitas';
      const targetPath = routePaths[defaultRoute] || '/dashboard';
      window.history.replaceState({ route: defaultRoute }, '', targetPath);
      return defaultRoute;
    }

    // Rute khusus Admin Komunitas (path /admin-komunitas atau /admin-komunitas/*)
    if (path === '/admin-komunitas' || path.startsWith('/admin-komunitas/')) {
      if (!userRoles.includes('admin_komunitas')) {
        const fallbackRoute = userRoles.includes('admin_bkpsdm') ? 'admin' : 'dashboard';
        const fallbackPath = routePaths[fallbackRoute] || '/dashboard';
        window.history.replaceState({ route: fallbackRoute }, '', fallbackPath);
        return fallbackRoute;
      }
      if (activeRole !== 'admin_komunitas') {
        setActiveRole('admin_komunitas');
      }
      if (path === '/admin-komunitas/pelatihan-saya') return 'pelatihan-saya';
      if (path === '/admin-komunitas/laporan-progress') return 'laporan-progress';
      if (path === '/admin-komunitas/katalog-kursus') return 'katalog-kursus';
      if (path === '/admin-komunitas/detail-kursus') return 'detail-kursus';
      if (path === '/admin-komunitas/bank-soal') return 'bank-soal';
      if (path === '/admin-komunitas/pusat-bantuan') return 'pusat-bantuan';
      return 'admin-komunitas';
    }

    // Rute khusus Admin BKPSDM (path /admin atau /admin/*)
    if (path === '/admin' || path.startsWith('/admin/')) {
      if (!userRoles.includes('admin_bkpsdm')) {
        const fallbackRoute = userRoles.includes('admin_komunitas') ? 'admin-komunitas' : 'dashboard';
        const fallbackPath = routePaths[fallbackRoute] || '/dashboard';
        window.history.replaceState({ route: fallbackRoute }, '', fallbackPath);
        return fallbackRoute;
      }
      if (activeRole !== 'admin_bkpsdm') {
        setActiveRole('admin_bkpsdm');
      }
      if (path === '/admin/user-management') return 'user-management';
      if (path === '/admin/community-management') return 'community-management';
      if (path === '/admin/category-management') return 'category-management';
      if (path === '/admin/course-validation/review') return 'course-review';
      if (path === '/admin/course-validation') return 'course-validation';
      if (path === '/admin/monitoring-reports') return 'monitoring-reports';
      return 'admin';
    }

    // Rute peserta berdasarkan path URL
    if (path === '/dashboard') return 'dashboard';
    if (path === '/catalog' || path === '/pelatihan') return 'catalog';
    if (path === '/my-courses') return 'my-courses';
    if (path === '/certificates') return 'certificates';
    if (path === '/community') return 'community';
    if (path === '/course-detail') return 'course-detail';
    if (path === '/post-test') return 'post-test';
    if (path === '/kuis') return 'kuis';
    if (path === '/test-result') return 'test-result';
    if (path === '/help-center') return 'help-center';

    // Rute yang tersimpan di localStorage
    const adminKomunitasRoutes = ['admin-komunitas', 'pelatihan-saya', 'laporan-progress', 'katalog-kursus', 'detail-kursus', 'bank-soal', 'pusat-bantuan'];
    const adminBkpsdmRoutes = ['admin', 'user-management', 'community-management', 'category-management', 'course-validation', 'course-review', 'monitoring-reports'];

    const savedRoute = localStorage.getItem('current_route');

    if (savedRoute) {
      if (adminBkpsdmRoutes.includes(savedRoute) && userRoles.includes('admin_bkpsdm') && activeRole === 'admin_bkpsdm') return savedRoute;
      if (adminKomunitasRoutes.includes(savedRoute) && userRoles.includes('admin_komunitas') && activeRole === 'admin_komunitas') return savedRoute;
      if (!adminBkpsdmRoutes.includes(savedRoute) && !adminKomunitasRoutes.includes(savedRoute) && savedRoute !== 'landing') return savedRoute;
    }

    if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) return 'admin';
    if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) return 'admin-komunitas';
    return 'dashboard';
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)
  const [sessionTimeoutAlert, setSessionTimeoutAlert] = useState(false)

  const adminKomunitasRoutes = ['admin-komunitas', 'pelatihan-saya', 'laporan-progress', 'katalog-kursus', 'detail-kursus', 'bank-soal', 'pusat-bantuan'];
  const adminBkpsdmRoutes = ['admin', 'user-management', 'community-management', 'category-management', 'course-validation', 'course-review', 'monitoring-reports'];

  useEffect(() => {
    // Tampilkan notifikasi jika tab baru dibuka setelah batas sesi kedaluwarsa
    if (sessionStorage.getItem('session_timeout_alert')) {
      sessionStorage.removeItem('session_timeout_alert');
      setSessionTimeoutAlert(true);
      const alertTimer = setTimeout(() => {
        setSessionTimeoutAlert(false);
      }, 7000);
    }

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    // Logika Keamanan: Cegah tombol Back browser kembali ke halaman login saat sudah login
    const handlePopState = (event) => {
      const path = window.location.pathname;
      if (path.startsWith('/validasi-sertifikat') || path.startsWith('/verify-certificate')) {
        setCurrentRoute('validasi-sertifikat');
        return;
      }

      if (path === '/' || path === '') {
        setCurrentRoute('portal');
        return;
      }

      if (path.toLowerCase() === '/lms' || path.toLowerCase() === '/lms/') {
        if (!isAuthenticated()) {
          setCurrentRoute('lms');
          return;
        }
      }

      if (isAuthenticated()) {
        const path = window.location.pathname;
        const activeRole = getActiveRole();
        const userRoles = getUserRoles();

        let defaultRoute = 'dashboard';
        if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) {
          defaultRoute = 'admin';
        } else if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) {
          defaultRoute = 'admin-komunitas';
        }
        const defaultPath = routePaths[defaultRoute] || '/dashboard';

        // Jika tombol Back ditekan menuju root '/', halaman login, atau state kosong:
        if (path === '/' || !event.state || event.state?.route === 'portal') {
          setCurrentRoute('portal');
        } else if (event.state?.route === 'lms') {
          window.history.pushState({ route: defaultRoute }, '', defaultPath);
          setCurrentRoute(defaultRoute);
          localStorage.setItem('current_route', defaultRoute);
        } else if (event.state?.route) {
          // Navigasi back/forward antar halaman internal yang valid
          setCurrentRoute(event.state.route);
          localStorage.setItem('current_route', event.state.route);
        }
      } else {
        if (path.toLowerCase() === '/lms') {
          setCurrentRoute('lms');
        } else {
          setCurrentRoute('portal');
        }
      }
    };

    // Sinkronisasi pembersihan sesi antar tab
    const handleStorageChange = (event) => {
      if (event.key === 'access_token' && !event.newValue && isAuthenticated()) {
        handleLogout();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [])

  const handleLogout = () => {
    logout(() => {
      window.history.replaceState({ route: 'portal' }, '', '/');
      setCurrentRoute('portal');
    });
  };

  const handleLoginSuccess = () => {
    setShowLoginSuccess(true);
    setSessionTimeoutAlert(false);
    sessionStorage.setItem('tab_session_initialized', 'true');
    setTimeout(() => setShowLoginSuccess(false), 3000);

    const activeRole = getActiveRole();
    const userRoles = getUserRoles();

    let target = 'dashboard';
    if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) {
      target = 'admin';
    } else if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) {
      target = 'admin-komunitas';
    }

    const targetPath = routePaths[target] || '/dashboard';

    // Gantikan riwayat browser agar tombol back tidak mengarah ke form login
    window.history.replaceState({ route: target }, '', targetPath);
    window.history.pushState({ route: target }, '', targetPath);

    handleNavigate(target);
  };

  const handleNavigate = (route) => {
    if (route === 'logout') {
      handleLogout();
      return;
    }

    if (route === 'portal') {
      setIsTransitioning(false);
      setCurrentRoute('portal');
      window.history.pushState({ route: 'portal' }, '', '/');
      window.scrollTo(0, 0);
      return;
    }

    const activeRole = getActiveRole();
    const userRoles = getUserRoles();
    let targetRoute = route;

    if (route === 'lms' || route === 'landing') {
      if (isAuthenticated()) {
        let defaultRoute = 'dashboard';
        if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) defaultRoute = 'admin';
        else if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) defaultRoute = 'admin-komunitas';
        targetRoute = defaultRoute;
      } else {
        setIsTransitioning(false);
        setCurrentRoute('lms');
        window.history.pushState({ route: 'lms' }, '', '/LMS');
        window.scrollTo(0, 0);
        return;
      }
    }

    if (route === 'validasi-sertifikat') {
      setIsTransitioning(false);
      setCurrentRoute('validasi-sertifikat');
      window.scrollTo(0, 0);
      return;
    }

    // Proteksi: jika belum login, arahkan ke portal
    if (!isAuthenticated()) {
      handleLogout();
      setIsTransitioning(false);
      window.scrollTo(0, 0);
      return;
    }

    // Proteksi rute berbasis peran (Role-Based Access Control)
    if (adminBkpsdmRoutes.includes(route)) {
      if (!userRoles.includes('admin_bkpsdm')) {
        targetRoute = userRoles.includes('admin_komunitas') ? 'admin-komunitas' : 'dashboard';
      } else if (activeRole !== 'admin_bkpsdm') {
        setActiveRole('admin_bkpsdm');
      }
    } else if (adminKomunitasRoutes.includes(route)) {
      if (!userRoles.includes('admin_komunitas')) {
        targetRoute = userRoles.includes('admin_bkpsdm') ? 'admin' : 'dashboard';
      } else if (activeRole !== 'admin_komunitas') {
        setActiveRole('admin_komunitas');
      }
    }

    setIsTransitioning(true)
    setCurrentRoute(targetRoute)
    localStorage.setItem('current_route', targetRoute);

    const targetPath = routePaths[targetRoute] || '/dashboard';
    window.history.pushState({ route: targetRoute }, '', targetPath);

    setIsTransitioning(false)
    window.scrollTo(0, 0)
  }

  if (isLoading || isTransitioning) {
    if (currentRoute === 'admin-komunitas' || currentRoute === 'pelatihan-saya' || currentRoute === 'laporan-progress' || currentRoute === 'katalog-kursus' || currentRoute === 'detail-kursus' || currentRoute === 'bank-soal' || currentRoute === 'pusat-bantuan') {
      return <AdminKomunitasSkeleton />
    }
    if (currentRoute === 'admin' || currentRoute === 'user-management' || currentRoute === 'community-management' || currentRoute === 'category-management' || currentRoute === 'course-validation' || currentRoute === 'course-review' || currentRoute === 'monitoring-reports') {
      return <AdminLoadingSkeleton />
    }
    return <LoadingSkeleton />
  }

  const renderRoute = () => {
    // Rute Publik Validasi Sertifikat dapat diakses siapa pun tanpa login
    if (currentRoute === 'validasi-sertifikat') {
      const path = window.location.pathname;
      const pathParts = path.split('/');
      let initialCode = '';
      if (pathParts.length > 2 && (pathParts[1] === 'validasi-sertifikat' || pathParts[1] === 'verify-certificate')) {
        initialCode = decodeURIComponent(pathParts.slice(2).join('/'));
      }
      return <PublicCertificateVerification initialCode={initialCode} onNavigate={handleNavigate} />;
    }

    // Rute Portal Utama (Agregator Sistem BKPSDM)
    if (currentRoute === 'portal') {
      return (
        <PortalPage
          onNavigateLMS={() => {
            if (isAuthenticated()) {
              const activeRole = getActiveRole();
              const userRoles = getUserRoles();
              let target = 'dashboard';
              if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) target = 'admin';
              else if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) target = 'admin-komunitas';
              handleNavigate(target);
            } else {
              handleNavigate('lms');
            }
          }}
          onNavigate={handleNavigate}
        />
      );
    }

    // Jika tidak terautentikasi dan mencoba render selain portal atau lms, arahkan ke LandingPage LMS
    if (!isAuthenticated() && currentRoute !== 'lms' && currentRoute !== 'landing') {
      return <LandingPage onLogin={handleLoginSuccess} onNavigate={handleNavigate} />;
    }

    const activeRole = getActiveRole();
    const userRoles = getUserRoles();

    // KEAMANAN: Jika user sudah login dan mengakses rute 'lms' atau 'landing', langsung arahkan ke Dashboard
    if (isAuthenticated() && (currentRoute === 'lms' || currentRoute === 'landing')) {
      if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) {
        return <AdminDashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
      }
      if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) {
        return <AdminKomunitasDashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
      }
      return <UserDashboard onLogout={handleLogout} onNavigate={handleNavigate} />;
    }

    // Guard: Mencoba render rute BKPSDM tanpa wewenang sah dari Admin-BKPSDM
    if (adminBkpsdmRoutes.includes(currentRoute) && !userRoles.includes('admin_bkpsdm')) {
      return <UserDashboard onLogout={handleLogout} onNavigate={handleNavigate} />;
    }

    // Guard: Mencoba render rute Komunitas tanpa wewenang sah dari Admin-BKPSDM
    if (adminKomunitasRoutes.includes(currentRoute) && !userRoles.includes('admin_komunitas')) {
      return <UserDashboard onLogout={handleLogout} onNavigate={handleNavigate} />;
    }

    if (currentRoute === 'admin-komunitas') {
      return <AdminKomunitasDashboard onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'pelatihan-saya') {
      return <PelatihanSaya onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'laporan-progress') {
      return <LaporanProgress onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'katalog-kursus') {
      return <KatalogKursus onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'detail-kursus') {
      return <DetailKursus onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'bank-soal') {
      return <BankSoal onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'pusat-bantuan') {
      return <PusatBantuan onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'admin') {
      return <AdminDashboard onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'user-management') {
      return <UserManagement onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'community-management') {
      return <CommunityManagement onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'category-management') {
      return <CategoryManagement onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'course-validation') {
      return <CourseValidation onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'course-review') {
      return <CourseReview onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'monitoring-reports') {
      return <MonitoringReports onNavigate={handleNavigate} onLogout={handleLogout} />
    }

    if (currentRoute === 'dashboard') {
      return <UserDashboard onLogout={handleLogout} onNavigate={handleNavigate} />
    }

    if (currentRoute === 'catalog' || currentRoute === 'pelatihan') {
      return <CourseCatalog onNavigate={handleNavigate} />
    }

    if (currentRoute === 'my-courses') {
      return <MyCourses onNavigate={handleNavigate} />
    }

    if (currentRoute === 'certificates') {
      return <Certificates onNavigate={handleNavigate} />
    }

    if (currentRoute === 'community') {
      return <Community onNavigate={handleNavigate} />
    }

    if (currentRoute === 'course-detail') {
      return <CourseDetail onNavigate={handleNavigate} onBack={() => handleNavigate('my-courses')} fromPage="dashboard" />
    }

    if (currentRoute === 'post-test') {
      return <PostTest onNavigate={handleNavigate} onBack={() => handleNavigate('course-detail')} />
    }

    if (currentRoute === 'kuis') {
      return <Kuis onNavigate={handleNavigate} onBack={() => handleNavigate('course-detail')} />
    }

    if (currentRoute === 'test-result') {
      return <TestResult onNavigate={handleNavigate} />
    }

    if (currentRoute === 'help-center') {
      return <HelpCenter onNavigate={handleNavigate} />
    }

    if (currentRoute === 'lms' || currentRoute === 'landing') {
      return <LandingPage onLogin={handleLoginSuccess} onNavigate={handleNavigate} />;
    }

    return (
      <PortalPage
        onNavigateLMS={() => handleNavigate(isAuthenticated() ? 'dashboard' : 'lms')}
        onNavigate={handleNavigate}
      />
    );
  };

  return (
    <>
      {showLoginSuccess && (
        <div className="fixed top-6 right-6 z-[99999] bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-xl flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="text-green-800 font-bold text-sm">Login Berhasil</h4>
            <p className="text-green-600 text-xs mt-1 font-semibold">Selamat datang kembali di platform Buleleng ASN CORPU!</p>
          </div>
        </div>
      )}
      {sessionTimeoutAlert && (
        <div className="fixed top-6 right-6 z-[99999] bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-xl flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-300 max-w-md">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="text-amber-800 font-bold text-sm">Sesi Berakhir Demi Keamanan</h4>
            <p className="text-amber-700 text-xs mt-1 leading-relaxed">
              Tab baru dibuka lebih dari 5 menit setelah waktu login Anda. Demi faktor keamanan akun, Anda dipersilakan untuk login ulang.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSessionTimeoutAlert(false)}
            className="text-amber-500 hover:text-amber-700 text-xs font-bold ml-2 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
      {renderRoute()}
    </>
  )
}

export default App
