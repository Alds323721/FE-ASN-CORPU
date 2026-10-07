import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import logoImg from '../assets/logo-removebg-preview 1.png';
import AdminKomunitasProfile from '../components/AdminKomunitasProfile';
import { 
  Users, BookOpen, Award, TrendingUp, TrendingDown,
  LayoutDashboard, LogOut, Bell, Settings, Search, Menu, X,
  FileText, RotateCcw, ChevronDown, CheckCircle2,
  PlayCircle, Edit, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Clock,
  BarChart2, Book, HelpCircle, GraduationCap, HeadphonesIcon
} from 'lucide-react';

import AdminKomunitasSidebar from '../components/layout/AdminKomunitasSidebar';
import AdminKomunitasHeader from '../components/layout/AdminKomunitasHeader';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, colorClass }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-500 text-xs sm:text-sm font-semibold tracking-wide uppercase">{title}</h3>
      <div className={`p-2 rounded-full ${colorClass}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
    </div>
    <div className="mt-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</h2>
      {trend ? (
        <div className="flex items-center gap-1 mt-2">
          {trend === 'up' ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />}
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trendValue}
          </span>
        </div>
      ) : (
        <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>
      )}
    </div>
  </div>
);

const LineChartMockup = ({ data = [] }) => {
  const chartData = data.length === 6 ? data : [
    { month: 'Mei', percent: 20 },
    { month: 'Jun', percent: 40 },
    { month: 'Jul', percent: 60 },
    { month: 'Agu', percent: 30 },
    { month: 'Sep', percent: 80 },
    { month: 'Okt', percent: 100 }
  ];

  // Calculate paths
  const getPath = () => {
    if (!chartData || chartData.length === 0) return '';
    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * 100;
      const y = 100 - (d.percent || 0);
      return `${x},${y}`;
    });
    
    // Create a smooth curve
    let path = `M 0,${100 - (chartData[0].percent || 0)}`;
    for (let i = 1; i < points.length; i++) {
      const [prevX, prevY] = points[i - 1].split(',');
      const [currX, currY] = points[i].split(',');
      const cp1X = parseFloat(prevX) + (parseFloat(currX) - parseFloat(prevX)) / 3;
      const cp2X = parseFloat(prevX) + 2 * (parseFloat(currX) - parseFloat(prevX)) / 3;
      path += ` C ${cp1X},${prevY} ${cp2X},${currY} ${currX},${currY}`;
    }
    return path;
  };

  return (
    <div className="relative w-full h-64 mt-6">
      <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-6">
        {[100, 75, 50, 25, 0].map((val, i) => (
          <div key={i} className="flex items-center w-full">
            <span className="text-[10px] sm:text-xs text-gray-400 w-8 sm:w-10 text-right pr-2">
              {val}%
            </span>
            <div className="flex-1 border-t border-gray-100 border-dashed"></div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 left-8 sm:left-10 bottom-6 right-0">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={getPath()} fill="none" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * 100;
            const y = 100 - (d.percent || 0);
            return <circle key={i} cx={x} cy={y} r="2.5" fill="#0F766E" className="transition-all duration-500 hover:r-4" />;
          })}
        </svg>
      </div>
      <div className="absolute bottom-0 left-8 sm:left-10 right-0 flex justify-between">
        {chartData.map((d, idx) => (
          <span key={idx} className="text-[10px] sm:text-xs text-gray-500 font-medium text-center w-8 -ml-4 first:ml-0 last:-ml-8">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
};

const AdminKomunitasDashboard = ({ onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [trenPenyelesaian, setTrenPenyelesaian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPeserta: 0,
    aktif: 0,
    rataProgres: 0,
    sertifikat: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin-komunitas/dashboard');
        const data = response.data.data;

        if (data) {
          setStats(data.stats || {
            totalPeserta: 0,
            aktif: 0,
            rataProgres: 0,
            sertifikat: 0
          });
          setCourses(data.kursus_terbaru || []);
          setActivities(data.aktivitas_terkini || []);
          setTrenPenyelesaian(data.tren_penyelesaian || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <AdminKomunitasSidebar onNavigate={onNavigate} onLogout={onLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full overflow-hidden">
        <AdminKomunitasHeader setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Admin Komunitas</h1>
            <p className="text-sm text-gray-500 mt-1">Pantau perkembangan pembelajaran dan peserta di komunitas Anda secara real-time.</p>
          </div>
          
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard 
              title="TOTAL PESERTA" 
              value={stats.totalPeserta} 
              subtitle="Terdaftar di komunitas"
              icon={Users}
              colorClass="bg-teal-50 text-teal-600"
            />
            <StatCard 
              title="PEMBELAJARAN AKTIF" 
              value={stats.aktif} 
              subtitle="Telah dipublikasikan"
              icon={FileText}
              colorClass="bg-indigo-50 text-indigo-600"
            />
            <StatCard 
              title="RATA-RATA PROGRES" 
              value={`${stats.rataProgres}%`} 
              subtitle="Dari seluruh peserta"
              icon={RotateCcw}
              colorClass="bg-amber-50 text-amber-600"
            />
            <StatCard 
              title="SERTIFIKAT TERBIT" 
              value={stats.sertifikat} 
              subtitle="Telah diverifikasi"
              icon={Award}
              colorClass="bg-emerald-50 text-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Chart Section */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Tren Penyelesaian Modul</h2>
                <span className="text-xs text-gray-500 font-medium">6 Bulan Terakhir</span>
              </div>
              <LineChartMockup data={trenPenyelesaian} />
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-6">Aktivitas Belajar Terkini</h2>
              <div className="flex-1 space-y-5">
                {activities.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs italic">
                    Belum ada aktivitas peserta terkini.
                  </div>
                ) : (
                  activities.map((item, idx) => (
                    <div key={idx} className="flex gap-3.5 items-start">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0 text-teal-700 font-bold text-xs">
                        {(item.name || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-800 leading-snug">
                          <span className="font-bold text-gray-900">{item.name}</span> {item.action}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button 
                onClick={() => onNavigate && onNavigate('laporan-progress')}
                className="mt-6 text-[#0F766E] font-semibold text-xs hover:underline w-full text-center"
              >
                Lihat Laporan Progress Lengkap
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Daftar Pembelajaran di Komunitas</h2>
                <p className="text-xs text-gray-500 mt-0.5">5 Pembelajaran terbaru yang dikelola oleh komunitas Anda</p>
              </div>
              <button 
                onClick={() => onNavigate && onNavigate('pelatihan-saya')}
                className="flex items-center justify-center gap-2 text-xs text-[#0F766E] font-bold border border-[#0F766E]/20 bg-teal-50/50 px-4 py-2 rounded-lg hover:bg-teal-100 w-full sm:w-auto transition-colors"
              >
                Kelola Semua Pelatihan
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Pembelajaran</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Total Peserta</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Progres Rata-Rata</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Memuat data pembelajaran...
                      </td>
                    </tr>
                  ) : courses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Belum ada data pembelajaran di komunitas Anda.
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => {
                      const statusColor = course.status === 'dipublikasikan' ? 'bg-emerald-100 text-emerald-700' : 
                                         course.status === 'ditolak' ? 'bg-red-100 text-red-700' :
                                         course.status === 'menunggu_approval' ? 'bg-orange-100 text-orange-700' :
                                         'bg-gray-100 text-gray-600';
                      return (
                        <tr key={course.pembelajaran_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200 shadow-2xs">
                                <img 
                                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop'} 
                                  alt={course.judul_pembelajaran} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate max-w-xs">{course.judul_pembelajaran}</p>
                                <div className="flex gap-3 mt-1 text-xs text-gray-500 font-medium">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Min. {course.nilai_kelulusan}%</span>
                                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.modules_count ?? course.modules ?? course.modul?.length ?? 0} Modul</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-medium text-gray-700">{course.kategori || '-'}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="font-bold text-gray-900">{course.total_peserta || 0} Peserta</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-[#0F766E]" 
                                  style={{ width: `${Math.min(100, Math.max(0, course.rata_rata_progres || 0))}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-gray-700">{course.rata_rata_progres || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColor}`}>
                              {(course.status || 'draft').replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => {
                                localStorage.setItem('adminKomunitasCourseId', course.pembelajaran_id);
                                if (onNavigate) onNavigate('detail-kursus');
                              }}
                              title="Kelola Kursus"
                              className="text-teal-700 hover:text-teal-900 transition-colors p-2 rounded-md hover:bg-teal-50"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
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

export default AdminKomunitasDashboard;
