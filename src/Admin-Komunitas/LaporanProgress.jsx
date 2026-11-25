import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { 
  Users, BookOpen, Award, RotateCcw, ChevronDown, CheckCircle2,
  ChevronLeft, ChevronRight, Search, Download, Star, MessageSquare,
  Sparkles, ThumbsUp
} from 'lucide-react';
import AdminKomunitasSidebar from '../components/layout/AdminKomunitasSidebar';
import AdminKomunitasHeader from '../components/layout/AdminKomunitasHeader';

const StatCard = ({ title, value, subtitle, icon: Icon, iconBg, iconColor }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-1">{value}</h2>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </div>
);

const TablePagination = ({
  currentPage,
  lastPage,
  total,
  from,
  to,
  itemLabel,
  loading,
  onPageChange
}) => {
  if (!total || total <= 0) return null;

  const safeLastPage = Math.max(1, Number(lastPage) || 1);
  const safeCurrentPage = Math.min(Math.max(1, Number(currentPage) || 1), safeLastPage);

  const buildPageNumbers = (current, last) => {
    if (last <= 7) {
      return Array.from({ length: last }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, '...', last];
    }
    if (current >= last - 2) {
      return [1, '...', last - 3, last - 2, last - 1, last];
    }
    return [1, '...', current - 1, current, current + 1, '...', last];
  };

  const pages = buildPageNumbers(safeCurrentPage, safeLastPage);

  return (
    <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
      <p className="text-xs sm:text-sm text-gray-600">
        Menampilkan <span className="font-semibold text-gray-800">{from || 0}</span> -{' '}
        <span className="font-semibold text-gray-800">{to || 0}</span> dari{' '}
        <span className="font-semibold text-gray-800">{total.toLocaleString('id-ID')}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(safeCurrentPage - 1, 1))}
          disabled={safeCurrentPage <= 1 || loading}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 text-xs">...</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                safeCurrentPage === p
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-gray-700 bg-white hover:bg-gray-50 hover:text-teal-700 border border-gray-200'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeCurrentPage + 1, safeLastPage))}
          disabled={safeCurrentPage >= safeLastPage || loading}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const LaporanProgress = ({ onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('peserta'); // 'peserta' | 'ulasan'
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [pembelajaranList, setPembelajaranList] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    total_peserta: 0,
    rata_rata_progres: 0,
    lulus_post_test: 0,
    sertifikat_terbit: 0,
    total_ulasan: 0,
  });

  const [ulasanStats, setUlasanStats] = useState({
    total_ulasan: 0,
    rata_rata_rating: 0,
    persen_puas: 0,
    pelatihan_terulas: 0,
    distribusi: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  // State Tab Peserta
  const [pesertaList, setPesertaList] = useState([]);
  const [pesertaPage, setPesertaPage] = useState(1);
  const [pesertaPagination, setPesertaPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // State Tab Ulasan
  const [ulasanList, setUlasanList] = useState([]);
  const [ulasanPage, setUlasanPage] = useState(1);
  const [ulasanPagination, setUlasanPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [selectedCourseUlasan, setSelectedCourseUlasan] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [searchQueryUlasan, setSearchQueryUlasan] = useState('');

  // Fetch data peserta (Tab Peserta)
  const fetchPesertaLaporan = async (pageToFetch = pesertaPage) => {
    try {
      setLoading(true);
      const params = {
        tab: 'peserta',
        page: pageToFetch,
        per_page: 10,
      };
      if (selectedCourse !== 'all') params.pembelajaran_id = selectedCourse;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await api.get('/admin-komunitas/laporan-progress', { params });
      const data = response.data?.data;

      if (data) {
        if (data.stats) {
          setStats(data.stats);
        }
        setPesertaList(data.peserta || []);
        if (data.pembelajaran_list) {
          setPembelajaranList(data.pembelajaran_list);
        }
        if (data.pagination) {
          setPesertaPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching laporan peserta:', error);
      setPesertaList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data ulasan (Tab Ulasan)
  const fetchUlasanLaporan = async (pageToFetch = ulasanPage) => {
    try {
      setLoading(true);
      const params = {
        tab: 'ulasan',
        page: pageToFetch,
        per_page: 10,
      };
      if (selectedCourseUlasan !== 'all') params.pembelajaran_id = selectedCourseUlasan;
      if (selectedRating !== 'all') params.rating = selectedRating;
      if (searchQueryUlasan.trim()) params.search = searchQueryUlasan.trim();

      const response = await api.get('/admin-komunitas/laporan-progress', { params });
      const data = response.data?.data;

      if (data) {
        if (data.stats) {
          setUlasanStats(data.stats);
        }
        if (data.stats_peserta) {
          setStats((prev) => ({ ...prev, ...data.stats_peserta }));
        }
        setUlasanList(data.ulasan || []);
        if (data.pembelajaran_list) {
          setPembelajaranList(data.pembelajaran_list);
        }
        if (data.pagination) {
          setUlasanPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching laporan ulasan:', error);
      setUlasanList([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch berdasarkan tab aktif dan halaman
  useEffect(() => {
    if (activeTab === 'peserta') {
      fetchPesertaLaporan(pesertaPage);
    } else {
      fetchUlasanLaporan(ulasanPage);
    }
  }, [activeTab, pesertaPage, ulasanPage]);

  // Efek filter tab peserta
  useEffect(() => {
    if (activeTab === 'peserta') {
      if (pesertaPage === 1) {
        fetchPesertaLaporan(1);
      } else {
        setPesertaPage(1);
      }
    }
  }, [selectedCourse, selectedStatus]);

  // Debounced search tab peserta
  useEffect(() => {
    if (activeTab === 'peserta') {
      const timer = setTimeout(() => {
        if (pesertaPage === 1) {
          fetchPesertaLaporan(1);
        } else {
          setPesertaPage(1);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Efek filter tab ulasan
  useEffect(() => {
    if (activeTab === 'ulasan') {
      if (ulasanPage === 1) {
        fetchUlasanLaporan(1);
      } else {
        setUlasanPage(1);
      }
    }
  }, [selectedCourseUlasan, selectedRating]);

  // Debounced search tab ulasan
  useEffect(() => {
    if (activeTab === 'ulasan') {
      const timer = setTimeout(() => {
        if (ulasanPage === 1) {
          fetchUlasanLaporan(1);
        } else {
          setUlasanPage(1);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [searchQueryUlasan]);

  // Export CSV menyeluruh (per_page=all)
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);

      if (activeTab === 'peserta') {
        const params = {
          tab: 'peserta',
          per_page: 'all',
          export: true,
        };
        if (selectedCourse !== 'all') params.pembelajaran_id = selectedCourse;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await api.get('/admin-komunitas/laporan-progress', { params });
        const items = res.data?.data?.peserta || [];

        if (items.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Ekspor Kosong',
            text: 'Tidak ada data peserta yang cocok dengan filter saat ini.',
            confirmButtonColor: '#0F766E'
          });
          return;
        }

        const headers = ['No', 'Nama Peserta', 'NIP', 'Rumpun Jabatan', 'Unit Kerja', 'Judul Pelatihan', 'Progres (%)', 'Nilai Post Test', 'Status', 'Rating', 'Ulasan'];
        const rows = items.map((p, idx) => [
          idx + 1,
          `"${p.nama || ''}"`,
          `"${p.nip || ''}"`,
          `"${p.rumpun_jabatan || '-'}"`,
          `"${p.unit_kerja || ''}"`,
          `"${p.judul_pembelajaran || ''}"`,
          p.progres || 0,
          p.nilai_post_test !== null ? p.nilai_post_test : '-',
          p.status || '-',
          p.ulasan?.skor_rating ? `${p.ulasan.skor_rating}/5` : '-',
          `"${(p.ulasan?.teks_ulasan || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `laporan_progres_peserta_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const params = {
          tab: 'ulasan',
          per_page: 'all',
          export: true,
        };
        if (selectedCourseUlasan !== 'all') params.pembelajaran_id = selectedCourseUlasan;
        if (selectedRating !== 'all') params.rating = selectedRating;
        if (searchQueryUlasan.trim()) params.search = searchQueryUlasan.trim();

        const res = await api.get('/admin-komunitas/laporan-progress', { params });
        const items = res.data?.data?.ulasan || [];

        if (items.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Ekspor Kosong',
            text: 'Tidak ada data ulasan yang cocok dengan filter saat ini.',
            confirmButtonColor: '#0F766E'
          });
          return;
        }

        const headers = ['No', 'Nama Peserta', 'NIP', 'Rumpun Jabatan', 'Unit Kerja', 'Judul Pelatihan', 'Rating (1-5)', 'Teks Ulasan', 'Tanggal Dikirim'];
        const rows = items.map((u, idx) => [
          idx + 1,
          `"${u.nama || ''}"`,
          `"${u.nip || ''}"`,
          `"${u.rumpun_jabatan || '-'}"`,
          `"${u.unit_kerja || ''}"`,
          `"${u.judul_pembelajaran || ''}"`,
          u.skor_rating || 0,
          `"${(u.teks_ulasan || '').replace(/"/g, '""')}"`,
          `"${u.dikirim_pada ? new Date(u.dikirim_pada).toLocaleString('id-ID') : '-'}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `laporan_ulasan_rating_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Gagal ekspor CSV:', err);
      Swal.fire({
        icon: 'error',
        title: 'Ekspor Gagal',
        text: 'Terjadi kesalahan saat memproses ekspor data.',
        confirmButtonColor: '#0F766E'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'lulus':
      case 'selesai':
        return 'bg-green-100 text-green-700';
      case 'sedang_berjalan':
        return 'bg-blue-100 text-blue-700';
      case 'menunggu_post_test':
        return 'bg-amber-100 text-amber-800';
      case 'tidak_lulus':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'menunggu_post_test':
        return 'Menunggu Post Test';
      case 'sedang_berjalan':
        return 'Sedang Berjalan';
      case 'lulus':
        return 'Lulus';
      case 'tidak_lulus':
        return 'Tidak Lulus';
      case 'selesai':
        return 'Selesai';
      case 'terdaftar':
        return 'Terdaftar';
      default:
        return (status || 'Terdaftar').replaceAll('_', ' ');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      <AdminKomunitasSidebar 
        activeMenu="laporan-progress" 
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminKomunitasHeader setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Laporan Progress</h1>
                <p className="text-sm text-gray-500">Pantau detail perkembangan peserta dan evaluasi kepuasan pelatihan di komunitas Anda.</p>
              </div>
              <button 
                onClick={handleExportCSV}
                disabled={isExporting || loading}
                className="flex items-center gap-2 bg-[#0F766E] hover:bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Mengekspor...' : `Export ${activeTab === 'peserta' ? 'Progres' : 'Ulasan'} (CSV)`}</span>
              </button>
            </div>

            {/* Switcher Tab: Progres Peserta vs Ulasan & Rating */}
            <div className="flex border-b border-gray-200 mb-6 gap-2 sm:gap-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('peserta');
                }}
                className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer px-1 ${
                  activeTab === 'peserta'
                    ? 'text-teal-700 border-b-2 border-teal-700'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Laporan Progres Peserta</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-semibold">
                  {stats.total_peserta.toLocaleString()}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('ulasan');
                }}
                className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer px-1 ${
                  activeTab === 'ulasan'
                    ? 'text-teal-700 border-b-2 border-teal-700'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>Ulasan & Rating Pelatihan</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
                  {(stats.total_ulasan || ulasanStats.total_ulasan || 0).toLocaleString()}
                </span>
              </button>
            </div>

            {/* Stat Cards - Tab Peserta */}
            {activeTab === 'peserta' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <StatCard 
                  title="TOTAL PESERTA" 
                  value={stats.total_peserta.toLocaleString()} 
                  subtitle="Terdaftar di komunitas"
                  icon={Users}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                />
                <StatCard 
                  title="RATA-RATA PROGRES" 
                  value={`${stats.rata_rata_progres}%`} 
                  subtitle="Dari seluruh pelatihan"
                  icon={RotateCcw}
                  iconBg="bg-orange-50"
                  iconColor="text-orange-600"
                />
                <StatCard 
                  title="LULUS POST TEST" 
                  value={stats.lulus_post_test.toLocaleString()} 
                  subtitle="Peserta telah lulus"
                  icon={CheckCircle2}
                  iconBg="bg-teal-50"
                  iconColor="text-teal-600"
                />
                <StatCard 
                  title="SERTIFIKAT TERBIT" 
                  value={stats.sertifikat_terbit.toLocaleString()} 
                  subtitle="Telah diverifikasi"
                  icon={Award}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                />
              </div>
            )}

            {/* Stat Cards - Tab Ulasan */}
            {activeTab === 'ulasan' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <StatCard 
                  title="TOTAL ULASAN MASUK" 
                  value={ulasanStats.total_ulasan.toLocaleString()} 
                  subtitle="Dari peserta pelatihan"
                  icon={MessageSquare}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                />
                <StatCard 
                  title="RATA-RATA RATING" 
                  value={`${ulasanStats.rata_rata_rating} / 5`} 
                  subtitle="Skor kepuasan pelatihan"
                  icon={Star}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-500"
                />
                <StatCard 
                  title="KEPUASAN PESERTA" 
                  value={`${ulasanStats.persen_puas}%`} 
                  subtitle="Rating bintang 4 & 5"
                  icon={ThumbsUp}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                />
                <StatCard 
                  title="PELATIHAN TERULAS" 
                  value={ulasanStats.pelatihan_terulas.toLocaleString()} 
                  subtitle="Memiliki ulasan aktif"
                  icon={BookOpen}
                  iconBg="bg-teal-50"
                  iconColor="text-teal-600"
                />
              </div>
            )}

            {/* Content Table Container */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              {/* FILTERS - Tab Peserta */}
              {activeTab === 'peserta' && (
                <div className="p-4 sm:p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <select 
                      value={selectedCourse}
                      onChange={(e) => { setSelectedCourse(e.target.value); }}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10 text-gray-700 font-medium cursor-pointer"
                    >
                      <option value="all">Semua Pelatihan Komunitas</option>
                      {pembelajaranList.map(c => (
                        <option key={c.pembelajaran_id} value={c.pembelajaran_id}>
                          {c.judul_pembelajaran}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select 
                      value={selectedStatus}
                      onChange={(e) => { setSelectedStatus(e.target.value); }}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10 text-gray-700 font-medium cursor-pointer"
                    >
                      <option value="all">Semua Status Belajar</option>
                      <option value="sedang_berjalan">Sedang Berjalan</option>
                      <option value="menunggu_post_test">Menunggu Post Test</option>
                      <option value="lulus">Lulus</option>
                      <option value="tidak_lulus">Tidak Lulus</option>
                      <option value="selesai">Selesai</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); }}
                      placeholder="Cari Nama / NIP peserta..." 
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              )}

              {/* FILTERS - Tab Ulasan */}
              {activeTab === 'ulasan' && (
                <div className="p-4 sm:p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <select 
                      value={selectedCourseUlasan}
                      onChange={(e) => { setSelectedCourseUlasan(e.target.value); }}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10 text-gray-700 font-medium cursor-pointer"
                    >
                      <option value="all">Semua Pelatihan Komunitas</option>
                      {pembelajaranList.map(c => (
                        <option key={c.pembelajaran_id} value={c.pembelajaran_id}>
                          {c.judul_pembelajaran}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select 
                      value={selectedRating}
                      onChange={(e) => { setSelectedRating(e.target.value); }}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10 text-gray-700 font-medium cursor-pointer"
                    >
                      <option value="all">Semua Rating Bintang</option>
                      <option value="5">⭐⭐⭐⭐⭐ Bintang 5</option>
                      <option value="4">⭐⭐⭐⭐ Bintang 4</option>
                      <option value="3">⭐⭐⭐ Bintang 3</option>
                      <option value="2">⭐⭐ Bintang 2</option>
                      <option value="1">⭐ Bintang 1</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={searchQueryUlasan}
                      onChange={(e) => { setSearchQueryUlasan(e.target.value); }}
                      placeholder="Cari Peserta, Pelatihan, atau Ulasan..." 
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              )}

              {/* TABEL - Tab Peserta */}
              {activeTab === 'peserta' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 min-w-[850px]">
                    <thead className="bg-gray-50/70 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">NAMA PESERTA / NIP</th>
                        <th className="px-6 py-4">RUMPUN JABATAN</th>
                        <th className="px-6 py-4">JUDUL PELATIHAN</th>
                        <th className="px-6 py-4">PROGRES BELAJAR</th>
                        <th className="px-6 py-4 text-center">NILAI POST TEST</th>
                        <th className="px-6 py-4 text-center">STATUS</th>
                        <th className="px-6 py-4 text-center">ULASAN & RATING</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="w-7 h-7 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs font-medium text-gray-600">Memuat data progress peserta...</span>
                            </div>
                          </td>
                        </tr>
                      ) : pesertaList.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                            Tidak ada data peserta yang cocok dengan filter saat ini.
                          </td>
                        </tr>
                      ) : (
                        pesertaList.map((row) => (
                          <tr key={row.pendaftaran_id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                                  {(row.nama || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{row.nama}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">NIP. {row.nip} • {row.unit_kerja}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {row.rumpun_jabatan || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-800 font-medium">{row.judul_pembelajaran}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden w-28">
                                  <div 
                                    className={`h-full rounded-full ${
                                      row.progres === 100 
                                        ? 'bg-[#0F766E]' 
                                        : row.progres > 0 
                                        ? 'bg-orange-500' 
                                        : 'bg-gray-300'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, row.progres))}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-gray-700 w-10">{row.progres}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-gray-900">
                              {row.nilai_post_test !== null ? row.nilai_post_test : '-'}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(row.status)}`}>
                                {getStatusLabel(row.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {row.ulasan ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    Swal.fire({
                                      title: 'Ulasan Peserta',
                                      html: `
                                        <div class="text-left space-y-3">
                                          <div class="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                                            <p><strong>Peserta:</strong> ${row.nama}</p>
                                            <p><strong>NIP:</strong> ${row.nip}</p>
                                            <p><strong>Pelatihan:</strong> ${row.judul_pembelajaran}</p>
                                            <p><strong>Rating:</strong> ${row.ulasan.skor_rating} / 5</p>
                                          </div>
                                          <div class="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-gray-800 italic">
                                            "${row.ulasan.teks_ulasan || 'Peserta memberikan penilaian rating tanpa komentar teks.'}"
                                          </div>
                                        </div>
                                      `,
                                      icon: 'info',
                                      confirmButtonColor: '#0F766E',
                                      confirmButtonText: 'Tutup'
                                    });
                                  }}
                                  className="inline-flex flex-col items-center gap-1 group cursor-pointer"
                                >
                                  <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-900 group-hover:bg-amber-100 transition-colors">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span>{row.ulasan.skor_rating}.0</span>
                                    <MessageSquare className="w-3 h-3 text-amber-700 ml-0.5" />
                                  </div>
                                  <span className="text-[10px] text-gray-400 group-hover:text-teal-700 transition-colors">Lihat Ulasan</span>
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400 font-medium">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TABEL - Tab Ulasan */}
              {activeTab === 'ulasan' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 min-w-[850px]">
                    <thead className="bg-gray-50/70 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">PESERTA</th>
                        <th className="px-6 py-4">RUMPUN JABATAN</th>
                        <th className="px-6 py-4">JUDUL PELATIHAN</th>
                        <th className="px-6 py-4 text-center">RATING</th>
                        <th className="px-6 py-4">KOMENTAR / ULASAN</th>
                        <th className="px-6 py-4 text-center">TANGGAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="w-7 h-7 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs font-medium text-gray-600">Memuat data ulasan pelatihan...</span>
                            </div>
                          </td>
                        </tr>
                      ) : ulasanList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                            Belum ada ulasan yang sesuai dengan filter.
                          </td>
                        </tr>
                      ) : (
                        ulasanList.map((row) => (
                          <tr key={row.ulasan_id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                                  {(row.nama || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{row.nama}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">NIP. {row.nip} • {row.unit_kerja}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {row.rumpun_jabatan || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-800 font-medium">
                              {row.judul_pembelajaran}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-900">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{row.skor_rating}.0</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-md bg-gray-50/80 p-2.5 rounded-lg border border-gray-100 text-xs text-gray-700 italic">
                                "{row.teks_ulasan || 'Peserta memberikan penilaian rating tanpa ulasan teks.'}"
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-xs text-gray-500 whitespace-nowrap">
                              {row.dikirim_pada ? new Date(row.dikirim_pada).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PAGINATION SERVER-SIDE */}
              {activeTab === 'peserta' ? (
                <TablePagination
                  currentPage={pesertaPagination.current_page}
                  lastPage={pesertaPagination.last_page}
                  total={pesertaPagination.total}
                  from={pesertaPagination.from}
                  to={pesertaPagination.to}
                  itemLabel="peserta"
                  loading={loading}
                  onPageChange={(p) => setPesertaPage(p)}
                />
              ) : (
                <TablePagination
                  currentPage={ulasanPagination.current_page}
                  lastPage={ulasanPagination.last_page}
                  total={ulasanPagination.total}
                  from={ulasanPagination.from}
                  to={ulasanPagination.to}
                  itemLabel="ulasan"
                  loading={loading}
                  onPageChange={(p) => setUlasanPage(p)}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaporanProgress;
