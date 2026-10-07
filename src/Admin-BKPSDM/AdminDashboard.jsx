import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminLoadingSkeleton from '../components/AdminLoadingSkeleton';
import AdminBkpsdmProfile from '../components/AdminBkpsdmProfile';
import { logout } from '../utils/auth';
import { 
  Users, BookOpen, MessageSquare, Award, CheckCircle, 
  TrendingUp, TrendingDown, ArrowRight, LayoutDashboard,
  ShieldCheck, BarChart3, HelpCircle, LogOut, Bell, Settings,
  Search, ChevronRight, Clock, Book, Menu, X, Layers, RefreshCw
} from 'lucide-react';

const AdminSidebar = ({ activeMenu = 'admin', onNavigate, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'admin', label: 'Dasbor', icon: LayoutDashboard },
    { id: 'user-management', label: 'Manajemen Pengguna', icon: Users },
    { id: 'community-management', label: 'Manajemen Komunitas', icon: Users },
    { id: 'category-management', label: 'Kategori Kursus', icon: Layers },
    { id: 'course-validation', label: 'Validasi Kursus', icon: ShieldCheck },
    { id: 'monitoring-reports', label: 'Monitoring & Laporan', icon: BarChart3 },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div className={`w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <AdminBkpsdmProfile onNavigate={onNavigate} variant="sidebar" />
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onNavigate) onNavigate(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-teal-700 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="text-left truncate leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors">
            Bantuan Teknis
          </button>
          <button 
            onClick={() => {
              if (typeof onLogout === 'function') {
                onLogout();
              } else {
                logout(() => {
                  if (typeof onNavigate === 'function') {
                    onNavigate('portal');
                  } else {
                    window.location.href = '/';
                  }
                });
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
};

const AdminHeader = ({ setIsOpen, onNavigate }) => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-40 sm:w-64 md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
            placeholder="Cari..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AdminBkpsdmProfile onNavigate={onNavigate} variant="header" />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, colorClass }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-500 text-xs sm:text-sm font-medium">{title}</h3>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
    </div>
    <div className="mt-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{value}</h2>
      {trend ? (
        <div className="flex items-center gap-1 mt-1">
          {trend === 'up' ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-teal-500" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />}
          <span className={`text-[10px] sm:text-xs font-medium ${trend === 'up' ? 'text-teal-600' : 'text-red-600'}`}>
            {trendValue}
          </span>
        </div>
      ) : (
        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  </div>
);

const DynamicChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-48 sm:h-64 flex items-center justify-center text-gray-400">Belum ada data trend.</div>;
  }

  const maxVal = Math.max(...data.map(d => d.jumlah), 10); // set minimum max scale to 10
  
  return (
    <div className="relative w-full h-48 sm:h-64 mt-6">
      {/* Y-Axis lines */}
      <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-6">
        {[maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0].map((val, i) => (
          <div key={i} className="flex items-center w-full">
            <span className="text-[10px] sm:text-xs text-gray-400 w-8 sm:w-10 text-right pr-2">
              {Math.round(val).toLocaleString()}
            </span>
            <div className="flex-1 border-t border-gray-100 border-dashed"></div>
          </div>
        ))}
      </div>
      
      {/* Bars */}
      <div className="absolute inset-0 left-8 sm:left-10 bottom-6 right-0 flex items-end justify-around px-2 sm:px-4">
        {data.map((item, idx) => {
          const heightPct = (item.jumlah / maxVal) * 100;
          return (
            <div key={idx} className="flex flex-col items-center group relative w-full px-1 sm:px-4">
              {/* Tooltip */}
              <div className="absolute -top-8 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {item.jumlah} Sertifikat
              </div>
              <div 
                className="w-full max-w-[2rem] sm:max-w-[3rem] bg-teal-500 rounded-t-sm hover:bg-teal-400 transition-all duration-300 relative"
                style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? '4px' : '0' }}
              >
              </div>
            </div>
          );
        })}
      </div>
      
      {/* X-Axis Labels */}
      <div className="absolute bottom-0 left-8 sm:left-10 right-0 flex justify-around px-2 sm:px-4">
        {data.map((item, idx) => (
          <span key={idx} className="text-[10px] sm:text-xs text-gray-400 w-full text-center truncate">
            {item.bulan}
          </span>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = ({ onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [pendingCoursesCount, setPendingCoursesCount] = useState(0);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const [dashboardRes, approvalRes, komunitasRes] = await Promise.all([
        api.get('/admin-bkpsdm/dashboard'),
        api.get('/admin-bkpsdm/approval'),
        api.get('/admin-bkpsdm/komunitas')
      ]);
      
      const approvalList = approvalRes.data?.data || [];
      setStats(dashboardRes.data?.data?.statistik || {});
      setTrendData(dashboardRes.data?.data?.trend_sertifikat || []);
      setPendingCoursesCount(approvalList.length);
      setRecentCourses(approvalList.slice(0, 5));
      setCommunities((komunitasRes.data?.data || []).slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Auto-refresh interval (polling setiap 15 detik agar realtime)
    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 15000);

    // Refresh ketika user kembali ke tab browser
    const handleFocus = () => {
      fetchDashboard(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading) return <AdminLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebar activeMenu="admin" onNavigate={onNavigate} onLogout={onLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full overflow-hidden">
        <AdminHeader setIsOpen={setIsSidebarOpen} onNavigate={onNavigate} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Dasbor Admin BKPSDM</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard 
              title="Total Peserta" 
              value={(stats?.total_peserta || 0).toLocaleString()} 
              trend="up"
              trendValue="↑ Aktif bulan ini"
              icon={Users}
              colorClass="bg-teal-50 text-teal-600"
            />
            <StatCard 
              title="Pengguna Aktif" 
              value={(stats?.user_aktif || 0).toLocaleString()} 
              subtitle="Baru saja masuk"
              icon={BookOpen}
              colorClass="bg-teal-50 text-teal-600"
            />
            <StatCard 
              title="Total Komunitas" 
              value={(stats?.total_komunitas || 0).toLocaleString()} 
              trend="up"
              trendValue="↑ Diperbarui"
              icon={MessageSquare}
              colorClass="bg-teal-50 text-teal-600"
            />
            <StatCard 
              title="Sertifikat Diterbitkan" 
              value={(stats?.sertifikat_terverifikasi || 0).toLocaleString()} 
              subtitle="Penyelesaian terverifikasi"
              icon={Award}
              colorClass="bg-teal-50 text-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-800">Tren Penerbitan Sertifikat</h2>
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">6 Bulan Terakhir</span>
              </div>
              <DynamicChart data={trendData} />
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">Aktivitas Komunitas</h2>
              <div className="space-y-3 sm:space-y-4">
                {communities.length > 0 ? communities.map((comm, idx) => {
                  const colors = ['emerald', 'amber', 'rose'];
                  const color = colors[idx % colors.length];
                  const Icon = idx === 0 ? TrendingUp : (idx === 1 ? ArrowRight : TrendingDown);
                  const percentages = [98, 65, 24];
                  const p = percentages[idx % percentages.length];
                  
                  return (
                    <div key={comm.komunitas_id || idx} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-${color}-100 flex items-center justify-center shrink-0`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${color}-600`} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{comm.nama_komunitas}</h4>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate">{idx === 0 ? 'Interaksi Tinggi' : (idx === 1 ? 'Interaksi Sedang' : 'Interaksi Rendah')}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-${color}-600 text-sm sm:text-base ml-2`}>{p}%</span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-gray-500">Tidak ada data komunitas.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800">Pengajuan Kursus Terbaru</h2>
                <p className="text-xs text-gray-500 mt-0.5">Daftar kursus dari komunitas yang menunggu validasi admin</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fetchDashboard(true)}
                  disabled={isRefreshing}
                  title="Segarkan data pengajuan"
                  className="p-1.5 text-gray-400 hover:text-teal-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-700' : ''}`} />
                </button>
                <div className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  pendingCoursesCount > 0 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {pendingCoursesCount > 0 ? (
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{pendingCoursesCount} Menunggu Tinjauan</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul Kursus</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Komunitas</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Diajukan</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">JPL / Modul</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentCourses.length > 0 ? recentCourses.map((course) => (
                    <tr key={course.pembelajaran_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm">{course.judul_pembelajaran}</p>
                        {course.kategori && (
                          <span className="inline-block mt-1 text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                            {course.kategori}
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <p className="text-xs sm:text-sm text-gray-700 font-medium">
                          {course.komunitas?.nama_komunitas || `Komunitas #${course.komunitas_id}`}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <p className="text-xs sm:text-sm text-gray-600">
                          {course.dibuat_pada || course.created_at
                            ? new Date(course.dibuat_pada || course.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '-'}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-medium">
                            <Clock className="w-3 h-3 text-gray-500" /> {course.total_jp || 0} JPL
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-medium">
                            {course.moduls?.length ?? 0} Modul
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <button 
                          onClick={() => {
                            localStorage.setItem('reviewCourseData', JSON.stringify(course));
                            if (onNavigate) onNavigate('course-review');
                          }}
                          className="bg-teal-700 hover:bg-teal-800 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
                        >
                          Validasi
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-xs text-gray-500">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                        <p className="font-semibold text-gray-700 text-sm">Tidak ada pengajuan kursus yang menunggu tinjauan</p>
                        <p className="text-gray-400 mt-0.5">Semua kursus yang diajukan telah selesai divalidasi.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
