import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminLoadingSkeleton from '../components/AdminLoadingSkeleton';
import AdminBkpsdmProfile from '../components/AdminBkpsdmProfile';
import { logout } from '../utils/auth';
import { 
  Users, LayoutDashboard, ShieldCheck, BarChart3, LogOut, Bell, Settings,
  Search, ChevronRight, Menu, X, CheckCircle, ClipboardList, 
  ChevronLeft, FileWarning, Clock, Layers
} from 'lucide-react';

const AdminSidebar = ({ activeMenu = 'course-validation', onNavigate, onLogout, isOpen, setIsOpen }) => {
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

const AdminHeader = ({ setIsOpen, searchTerm, setSearchTerm, onNavigate }) => {
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
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
            placeholder="Cari course..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AdminBkpsdmProfile onNavigate={onNavigate} variant="header" />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, subtitleColor, icon: Icon, colorClass, iconColorClass }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColorClass}`} />
      </div>
    </div>
    <div>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
      <div className="flex items-baseline gap-2 mb-1">
        <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
      </div>
      <p className={`text-sm ${subtitleColor ? subtitleColor : 'text-gray-500'}`}>{subtitle}</p>
    </div>
  </div>
);

const CourseValidation = ({ onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/admin-bkpsdm/approval');
        setCourses(response.data.data);
      } catch (error) {
        console.error('Failed to fetch approval courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'menunggu_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 border border-orange-200 text-orange-700">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            Menunggu
          </span>
        );
      case 'ditolak':
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 border border-red-200 text-red-700">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            Revisi
          </span>
        );
      case 'dipublikasikan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 border border-green-200 text-green-700">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Divalidasi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
            {status}
          </span>
        );
    }
  };

  const filteredCourses = courses.filter(c => 
    (c.judul_pembelajaran && c.judul_pembelajaran.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.kategori && c.kategori.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.komunitas?.nama_komunitas && c.komunitas.nama_komunitas.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.perancang?.nama_lengkap && c.perancang.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.komunitas_id && c.komunitas_id.toString().includes(searchTerm)) ||
    (c.dirancang_oleh_pengguna_id && c.dirancang_oleh_pengguna_id.toString().includes(searchTerm))
  );

  if (loading) return <AdminLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebar activeMenu="course-validation" onNavigate={onNavigate} onLogout={onLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full overflow-hidden">
        <AdminHeader setIsOpen={setIsSidebarOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onNavigate={onNavigate} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          
          {/* Header section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1D315F] mb-2">Validasi Kursus</h1>
            <p className="text-sm text-gray-500">Tinjau dan validasi konten pembelajaran yang diajukan oleh Admin Komunitas.</p>
          </div>
          
          {/* Stats section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard 
              title="MENUNGGU TINJAUAN" 
              value={courses.filter(c => c.status === 'menunggu_approval').length} 
              subtitle="Menunggu aksi admin"
              icon={Clock}
              colorClass="bg-orange-50"
              iconColorClass="text-orange-500"
            />
            <StatCard 
              title="BARU DIVALIDASI" 
              value={courses.filter(c => c.status === 'dipublikasikan').length} 
              subtitle="Sepanjang waktu"
              subtitleColor="text-green-500 font-medium"
              icon={CheckCircle}
              colorClass="bg-green-50"
              iconColorClass="text-green-500"
            />
            <StatCard 
              title="PERLU REVISI" 
              value={courses.filter(c => c.status === 'draft' || c.status === 'ditolak').length} 
              subtitle="Dikembalikan ke pengaju"
              icon={FileWarning}
              colorClass="bg-red-50"
              iconColorClass="text-red-500"
            />
          </div>

          {/* Table section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="font-bold text-gray-800">Pengajuan Kursus</h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari course..."
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 w-full md:w-auto"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">JUDUL KURSUS</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">KOMUNITAS</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PENGAJU</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">TANGGAL DIAJUKAN</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCourses.map((course) => (
                    <tr key={course.pembelajaran_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 mb-1">{course.judul_pembelajaran}</p>
                        <div className="flex items-center gap-2">
                          <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded text-xs font-semibold">
                            {course.kategori || 'Pengembangan Kompetensi'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {course.komunitas?.nama_komunitas || (course.komunitas_id ? `Komunitas #${course.komunitas_id}` : '-')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {course.perancang?.nama_lengkap || (course.dirancang_oleh_pengguna_id ? `User #${course.dirancang_oleh_pengguna_id}` : '-')}
                        </p>
                        {course.perancang?.nip && (
                          <p className="text-xs text-gray-400">NIP: {course.perancang.nip}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-700">{new Date(course.dibuat_pada).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(course.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            localStorage.setItem('reviewCourseId', course.pembelajaran_id);
                            localStorage.setItem('reviewCourseData', JSON.stringify(course));
                            if (onNavigate) onNavigate('course-review');
                          }}
                          className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Tinjau
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? 'Tidak ada course yang sesuai dengan pencarian.' : 'Tidak ada course yang menunggu approval.'}
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

export default CourseValidation;
