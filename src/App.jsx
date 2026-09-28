import { useState, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
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
import { isAuthenticated, getUserRole, getUserRoles, getActiveRole, setActiveRole, logout } from './utils/auth'

function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname;

    // Jika tidak ada token yang valid, langsung arahkan ke landing
    if (!isAuthenticated()) {
      if (path !== '/') {
        window.history.replaceState({}, '', '/');
      }
      return 'landing';
    }

    const activeRole = getActiveRole();
    const userRoles = getUserRoles();

    // Rute khusus Admin BKPSDM (path /admin/*)
    if (path.startsWith('/admin') && path !== '/admin-komunitas') {
      // Verifikasi apakah user memang memiliki peran admin_bkpsdm yang sah dari Admin-BKPSDM
      if (!userRoles.includes('admin_bkpsdm')) {
        window.history.replaceState({}, '', '/');
        return userRoles.includes('admin_komunitas') ? 'admin-komunitas' : 'dashboard';
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
    if (path === '/admin-komunitas') {
      // Verifikasi apakah user memang memiliki peran admin_komunitas yang sah dari Admin-BKPSDM
      if (!userRoles.includes('admin_komunitas')) {
        window.history.replaceState({}, '', '/');
        return userRoles.includes('admin_bkpsdm') ? 'admin' : 'dashboard';
      }
      if (activeRole !== 'admin_komunitas') {
        setActiveRole('admin_komunitas');
      }
      return 'admin-komunitas';
    }

    // Rute Admin Komunitas yang tersimpan di localStorage
    const adminKomunitasRoutes = ['admin-komunitas', 'pelatihan-saya', 'laporan-progress', 'katalog-kursus', 'detail-kursus', 'bank-soal', 'pusat-bantuan'];
    const adminBkpsdmRoutes = ['admin', 'user-management', 'community-management', 'category-management', 'course-validation', 'course-review', 'monitoring-reports'];

    const savedRoute = localStorage.getItem('current_route');

    if (savedRoute) {
      // Validasi savedRoute sesuai role aktual
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

  const adminKomunitasRoutes = ['admin-komunitas', 'pelatihan-saya', 'laporan-progress', 'katalog-kursus', 'detail-kursus', 'bank-soal', 'pusat-bantuan'];
  const adminBkpsdmRoutes = ['admin', 'user-management', 'community-management', 'category-management', 'course-validation', 'course-review', 'monitoring-reports'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = () => {
    logout();
    setCurrentRoute('landing');
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
    if (targetRoute === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (targetRoute === 'user-management') {
      window.history.pushState({}, '', '/admin/user-management');
    } else if (targetRoute === 'community-management') {
      window.history.pushState({}, '', '/admin/community-management');
    } else if (targetRoute === 'course-validation') {
      window.history.pushState({}, '', '/admin/course-validation');
    } else if (targetRoute === 'course-review') {
      window.history.pushState({}, '', '/admin/course-validation/review');
    } else if (targetRoute === 'monitoring-reports') {
      window.history.pushState({}, '', '/admin/monitoring-reports');
    } else if (targetRoute === 'admin-komunitas') {
      window.history.pushState({}, '', '/admin-komunitas');
    }
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
      return <LandingPage onLogin={() => {
        setShowLoginSuccess(true);
        setTimeout(() => setShowLoginSuccess(false), 3000);
        const activeRole = getActiveRole();
        const userRoles = getUserRoles();
        if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) handleNavigate('admin');
        else if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) handleNavigate('admin-komunitas');
        else handleNavigate('dashboard');
      }} onNavigate={handleNavigate} />;
    }

    const activeRole = getActiveRole();
    const userRoles = getUserRoles();

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

    return <LandingPage onLogin={() => {
      setShowLoginSuccess(true);
      setTimeout(() => setShowLoginSuccess(false), 3000);

      const activeRole = getActiveRole();
      const userRoles = getUserRoles();

      // Arahkan ke halaman yang sesuai berdasarkan peran aktif yang sah
      if (activeRole === 'admin_bkpsdm' && userRoles.includes('admin_bkpsdm')) {
        handleNavigate('admin');
      } else if (activeRole === 'admin_komunitas' && userRoles.includes('admin_komunitas')) {
        handleNavigate('admin-komunitas');
      } else {
        // default: peserta
        handleNavigate('dashboard');
      }
    }} onNavigate={handleNavigate} />
  }

  return (
    <>
      {showLoginSuccess && (
        <div className="fixed top-6 right-6 z-[99999] bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-xl flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="text-green-800 font-bold text-sm">Login Berhasil</h4>
            <p className="text-green-600 text-xs mt-1 font-semibold">Selamat datang kembali di platform!</p>
          </div>
        </div>
      )}
      {renderRoute()}
    </>
  )
}

export default App
