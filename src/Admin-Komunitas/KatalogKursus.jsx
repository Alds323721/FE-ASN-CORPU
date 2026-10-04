import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import logoImg from '../assets/logo-removebg-preview 1.png';
import AdminKomunitasProfile from '../components/AdminKomunitasProfile';
import { 
  Users, BookOpen, Award, TrendingUp, TrendingDown,
  LayoutDashboard, LogOut, Bell, Settings, Search, Menu, X,
  FileText, RotateCcw, ChevronDown, CheckCircle2,
  PlayCircle, Edit, Edit2, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Clock,
  BarChart2, Book, HelpCircle, GraduationCap, HeadphonesIcon, Check, Plus,
  Sparkles, Eye, Lock
} from 'lucide-react';

import AdminKomunitasSidebar from '../components/layout/AdminKomunitasSidebar';
import AdminKomunitasHeader from '../components/layout/AdminKomunitasHeader';

const CourseCard = ({ course, onNavigate }) => {
  const courseId = course.pembelajaran_id || course.id;
  const courseTitle = course.judul_pembelajaran || course.title || 'Pembelajaran';
  const category = course.kategori || course.category || 'Pengembangan Kompetensi';
  const jpl = course.jpl ?? 2;
  const modulesCount = course.modules_count ?? course.modules ?? (course.modul ? course.modul.length : 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
      {/* Cover Image */}
      <div className="h-40 bg-gray-100 relative w-full overflow-hidden shrink-0">
        <img 
          src={course.thumbnail_url || course.gambar_sampul_url || course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60'} 
          alt={courseTitle} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase shadow-sm ${
            course.status === 'dipublikasikan' ? 'bg-emerald-100 text-emerald-800' :
            course.status === 'menunggu_approval' ? 'bg-orange-100 text-orange-800' :
            course.status === 'ditolak' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-700'
          }`}>
            {(course.status || 'draft').replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        {/* Category & Community */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
            {category}
          </span>
          {course.komunitas?.nama_komunitas && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
              {course.komunitas.nama_komunitas}
            </span>
          )}
          {(course.komunitas?.rumpun_jabatan === 'UMUM' || course.komunitas?.is_umum) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 uppercase">
              Umum
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 leading-tight flex-1">
          {courseTitle}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 mt-auto">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{jpl} JPL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span>{modulesCount} Modul</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{course.total_peserta ?? course.peserta_count ?? 0} Peserta</span>
          </div>
        </div>

        {/* Action Button: Edit / Lihat Kursus */}
        <button 
          onClick={() => {
            localStorage.setItem('adminKomunitasCourseId', courseId);
            onNavigate('detail-kursus');
          }}
          className="w-full py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-auto"
          title={course.dapat_dikelola === false ? 'Buka detail kursus (mode baca)' : 'Buka detail kursus dan edit isi kursus'}
        >
          {course.dapat_dikelola === false ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          <span>{course.dapat_dikelola === false ? 'Lihat Kursus' : 'Edit Kursus'}</span>
        </button>
      </div>
    </div>
  );
};

const KatalogKursus = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Terbaru');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [categories, setCategories] = useState([
    'Semua Kategori',
    'Manajemen ASN',
    'Teknologi Informasi',
    'Pengembangan Kompetensi',
    'Pelayanan Publik'
  ]);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        const [resCourses, resCats] = await Promise.allSettled([
          api.get('/admin-komunitas/pembelajaran'),
          api.get('/kategori-kursus')
        ]);
        if (resCourses.status === 'fulfilled') {
          setCourses(resCourses.value.data?.data || resCourses.value.data || []);
        }
        if (resCats.status === 'fulfilled' && resCats.value.data?.data) {
          const catNames = resCats.value.data.data.map(c => c.nama_kategori);
          setCategories(['Semua Kategori', ...catNames]);
        }
      } catch (error) {
        console.error('Error fetching catalog data:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogData();
  }, []);

  // Filtering
  const filteredCourses = courses.filter((c) => {
    const title = (c.judul_pembelajaran || c.title || '').toLowerCase();
    const cat = (c.kategori || c.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesCategory = selectedCategory === 'Semua Kategori' || cat === selectedCategory.toLowerCase();
    const matchesSearch = !query || title.includes(query) || cat.includes(query);

    return matchesCategory && matchesSearch;
  });

  // Sorting
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'A-Z') {
      const titleA = (a.judul_pembelajaran || a.title || '').toLowerCase();
      const titleB = (b.judul_pembelajaran || b.title || '').toLowerCase();
      return titleA.localeCompare(titleB);
    }
    if (sortBy === 'Terpopuler') {
      const pA = a.total_peserta ?? a.peserta_count ?? 0;
      const pB = b.total_peserta ?? b.peserta_count ?? 0;
      return pB - pA;
    }
    // Default: Terbaru
    const idA = a.pembelajaran_id || a.id || 0;
    const idB = b.pembelajaran_id || b.id || 0;
    return idB - idA;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedCourses.length / itemsPerPage));
  const displayedCourses = sortedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <AdminKomunitasSidebar 
        activeMenu="katalog-kursus" 
        onNavigate={onNavigate}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminKomunitasHeader 
          setIsOpen={setIsSidebarOpen} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Katalog Kursus</h1>
                <p className="text-sm text-gray-500">Kelola dan tinjau seluruh katalog pembelajaran di komunitas Anda.</p>
              </div>
              <button 
                onClick={() => {
                  if (onNavigate) onNavigate('pelatihan-saya');
                }}
                className="bg-[#0F766E] hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" /> Tambah Kursus Baru
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Left Sidebar Filters */}
              <div className="w-full lg:w-64 shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
                {/* Categories */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Kategori</h3>
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <label 
                        key={cat} 
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(1);
                        }}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          selectedCategory === cat 
                            ? 'bg-[#0F766E] border-[#0F766E]' 
                            : 'border-gray-300 group-hover:border-[#0F766E]'
                        }`}>
                          {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-sm ${selectedCategory === cat ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Urutkan</h3>
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10 text-gray-600 cursor-pointer"
                    >
                      <option value="Terbaru">Terbaru</option>
                      <option value="Terpopuler">Terpopuler</option>
                      <option value="A-Z">A-Z</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Course Grid */}
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {loading ? (
                    <div className="col-span-full text-center py-16 text-gray-500 font-medium">Memuat katalog kursus...</div>
                  ) : displayedCourses.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-gray-500 font-medium">
                      Tidak ada kursus yang sesuai dengan filter atau pencarian Anda.
                    </div>
                  ) : (
                    displayedCourses.map((course) => (
                      <CourseCard 
                        key={course.pembelajaran_id || course.id} 
                        course={course} 
                        onNavigate={onNavigate}
                      />
                    ))
                  )}
                </div>

                {/* Pagination */}
                {sortedCourses.length > 0 && (
                  <div className="mt-auto bg-white p-4 sm:p-6 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                      Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, sortedCourses.length)} - {Math.min(currentPage * itemsPerPage, sortedCourses.length)} dari {sortedCourses.length} pembelajaran
                    </p>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-40 rounded-md transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button 
                          key={num}
                          onClick={() => setCurrentPage(num)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                            currentPage === num 
                              ? 'bg-[#0F766E] text-white shadow-sm' 
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 rounded-md transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default KatalogKursus;
