import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import './index.css'
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
};

function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    // Keamanan: Cek apakah tab baru dibuka lebih dari 5 menit setelah login
    if (checkNewTabTimeout()) {
      clearAuth();
      sessionStorage.setItem('session_timeout_alert', 'true');
      window.history.replaceState({ route: 'landing' }, '', '/');
      return 'landing';
    }

    const path = window.location.pathname;

    // Jika tidak ada token yang valid, langsung arahkan ke landing
    if (!isAuthenticated()) {
      if (path !== '/') {
        window.history.replaceState({ route: 'landing' }, '', '/');
      }
      return 'landing';
    }

    const activeRole = getActiveRole();
    const userRoles = getUserRoles();

    // Jika user sudah terautentikasi dan berada di '/', langsung ganti path ke dashboard
    if (path === '/') {
      let defaultRoute = 'dashboard';
      if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) defaultRoute = 'admin';
      else if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) defaultRoute = 'admin-komunitas';
      const targetPath = routePaths[defaultRoute] || '/dashboard';
      window.history.replaceState({ route: defaultRoute }, '', targetPath);
      return defaultRoute;
    }

    // Rute khusus Admin BKPSDM (path /admin/*)
    if (path.startsWith('/admin') && path !== '/admin-komunitas') {
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

    // Rute khusus Admin Komunitas (path /admin-komunitas)
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
        // Kunci dan pertahankan di halaman dashboard aktif
        if (path === '/' || !event.state || event.state?.route === 'landing') {
          window.history.pushState({ route: defaultRoute }, '', defaultPath);
          setCurrentRoute(defaultRoute);
          localStorage.setItem('current_route', defaultRoute);
        } else if (event.state?.route) {
          // Navigasi back/forward antar halaman internal yang valid
          setCurrentRoute(event.state.route);
          localStorage.setItem('current_route', event.state.route);
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
    logout();
    window.history.replaceState({ route: 'landing' }, '', '/');
    setCurrentRoute('landing');
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

    // Gantikan riwayat '/' (halaman login) agar tombol back browser TIDAK BISA kembali ke login
    window.history.replaceState({ route: target }, '', targetPath);
    window.history.pushState({ route: target }, '', targetPath);

    handleNavigate(target);
  };

  const handleNavigate = (route) => {
    if (route === 'landing') {
      handleLogout();
      setIsTransitioning(false);
      window.scrollTo(0, 0);
      return;
    }

    // Proteksi: jika belum login, cegah navigasi ke halaman terproteksi
    if (!isAuthenticated()) {
      handleLogout();
      setIsTransitioning(false);
      window.scrollTo(0, 0);
      return;
    }

    const activeRole = getActiveRole();
    const userRoles = getUserRoles();
    let targetRoute = route;

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
    if (currentRoute === 'admin' || currentRoute === 'user-management' || currentRoute === 'community-management' || currentRoute === 'course-validation' || currentRoute === 'course-review' || currentRoute === 'monitoring-reports') {
      return <AdminLoadingSkeleton />
    }
    return <LoadingSkeleton />
  }

  const renderRoute = () => {
    // Jika tidak terautentikasi dan mencoba render selain landing, arahkan ke LandingPage
    if (!isAuthenticated() && currentRoute !== 'landing') {
      return <LandingPage onLogin={handleLoginSuccess} onNavigate={handleNavigate} />;
    }

    const activeRole = getActiveRole();
    const userRoles = getUserRoles();

    // KEAMANAN: Jika user sudah login, JANGAN PERNAH render LandingPage / form login
    if (isAuthenticated() && currentRoute === 'landing') {
      if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) {
        return <AdminDashboard onNavigate={handleNavigate} />;
      }
      if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) {
        return <AdminKomunitasDashboard onNavigate={handleNavigate} />;
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
      return <AdminKomunitasDashboard onNavigate={handleNavigate} />
    }

    if (currentRoute === 'pelatihan-saya') {
      return <PelatihanSaya onNavigate={handleNavigate} />
    }

    if (currentRoute === 'laporan-progress') {
      return <LaporanProgress onNavigate={handleNavigate} />
    }

    if (currentRoute === 'katalog-kursus') {
      return <KatalogKursus onNavigate={handleNavigate} />
    }

    if (currentRoute === 'detail-kursus') {
      return <DetailKursus onNavigate={handleNavigate} />
    }

    if (currentRoute === 'bank-soal') {
      return <BankSoal onNavigate={handleNavigate} />
    }

    if (currentRoute === 'pusat-bantuan') {
      return <PusatBantuan onNavigate={handleNavigate} />
    }

    if (currentRoute === 'admin') {
      return <AdminDashboard onNavigate={handleNavigate} />
    }

    if (currentRoute === 'user-management') {
      return <UserManagement onNavigate={handleNavigate} />
    }

    if (currentRoute === 'community-management') {
      return <CommunityManagement onNavigate={handleNavigate} />
    }

    if (currentRoute === 'category-management') {
      return <CategoryManagement onNavigate={handleNavigate} />
    }

    if (currentRoute === 'course-validation') {
      return <CourseValidation onNavigate={handleNavigate} />
    }

    if (currentRoute === 'course-review') {
      return <CourseReview onNavigate={handleNavigate} />
    }

    if (currentRoute === 'monitoring-reports') {
      return <MonitoringReports onNavigate={handleNavigate} />
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

    return <LandingPage onLogin={handleLoginSuccess} onNavigate={handleNavigate} />
  }

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
