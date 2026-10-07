import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import logoImg from '../assets/logo-removebg-preview 1.png';
import AdminKomunitasProfile from '../components/AdminKomunitasProfile';
import { 
  Users, BookOpen, Award, TrendingUp, TrendingDown,
  LayoutDashboard, LogOut, Bell, Settings, Search, Menu, X,
  FileText, RotateCcw, ChevronDown, CheckCircle2,
  PlayCircle, Edit, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Clock,
  BarChart2, Book, HelpCircle, GraduationCap, HeadphonesIcon, Download, Eye,
  Star, MessageSquare
} from 'lucide-react';
import AdminKomunitasSidebar from '../components/layout/AdminKomunitasSidebar';
import AdminKomunitasHeader from '../components/layout/AdminKomunitasHeader';

const StatCard = ({ title, value, subtitle, trend, trendLabel, icon: Icon, iconBg, iconColor }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{value}</h2>
      {trend ? (
        <p className="text-sm">
          <span className="text-green-600 font-semibold">{trend}</span>{' '}
          <span className="text-gray-500">{trendLabel}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  </div>
);

const LaporanProgress = ({ onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pesertaList, setPesertaList] = useState([]);
  const [pembelajaranList, setPembelajaranList] = useState([]);
  const [stats, setStats] = useState({
    total_peserta: 0,
    rata_rata_progres: 0,
    lulus_post_test: 0,
    sertifikat_terbit: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCourse !== 'all') params.pembelajaran_id = selectedCourse;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await api.get('/admin-komunitas/laporan-progress', { params });
      const data = response.data?.data;

      if (data) {
        setStats(data.stats || {
          total_peserta: 0,
          rata_rata_progres: 0,
          lulus_post_test: 0,
          sertifikat_terbit: 0,
        });
        setPesertaList(data.peserta || []);
        if (data.pembelajaran_list) {
          setPembelajaranList(data.pembelajaran_list);
        }
      }
    } catch (error) {
      console.error('Error fetching laporan progress:', error);
      setPesertaList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, [selectedCourse, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLaporan();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(pesertaList.length / itemsPerPage));
  const displayedPeserta = pesertaList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export CSV
  const handleExportCSV = () => {
    if (pesertaList.length === 0) {
      alert('Tidak ada data yang dapat diekspor.');
      return;
    }

    const headers = ['No', 'Nama Peserta', 'NIP', 'Rumpun Jabatan', 'Unit Kerja', 'Judul Pelatihan', 'Progres (%)', 'Nilai Post Test', 'Status', 'Rating', 'Ulasan'];
    const rows = pesertaList.map((p, idx) => [
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
    link.setAttribute('download', `laporan_progress_komunitas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'lulus':
      case 'selesai':
        return 'bg-green-100 text-green-700';
      case 'sedang_berjalan':
        return 'bg-blue-100 text-blue-700';
      case 'menunggu_post_test':
        return 'bg-amber-100 text-amber-700';
      case 'tidak_lulus':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Laporan Progress</h1>
                <p className="text-sm text-gray-500">Pantau detail perkembangan peserta dalam berbagai pelatihan di komunitas Anda.</p>
              </div>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-[#0F766E] hover:bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export Laporan (CSV)
              </button>
            </div>

            {/* Stat Cards */}
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

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Filters */}
              <div className="p-4 sm:p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Course Filter */}
                <div className="relative">
                  <select 
                    value={selectedCourse}
                    onChange={(e) => { setSelectedCourse(e.target.value); setCurrentPage(1); }}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10 text-gray-700 font-medium"
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

                {/* Status Filter */}
                <div className="relative">
                  <select 
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10 text-gray-700 font-medium"
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

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Cari Nama / NIP peserta..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Table */}
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
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">Memuat data progress...</td>
                      </tr>
                    ) : displayedPeserta.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          Tidak ada data peserta yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      displayedPeserta.map((row) => (
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
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-10">{row.progres}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-900">
                            {row.nilai_post_test !== null ? row.nilai_post_test : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full capitalize ${getStatusBadge(row.status)}`}>
                              {(row.status || 'terdaftar').replace('_', ' ')}
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
                                          <p><strong>Rating:</strong> ⭐ ${row.ulasan.skor_rating} / 5</p>
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
                                className="inline-flex flex-col items-center gap-1 group"
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
              
              {/* Pagination */}
              <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Menampilkan {displayedPeserta.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                  {Math.min(currentPage * itemsPerPage, pesertaList.length)} dari {pesertaList.length} peserta
                </p>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => { if (currentPage > 1) setCurrentPage(currentPage - 1); }}
                    disabled={currentPage === 1}
                    className={`p-2 border rounded-md transition-colors ${
                      currentPage === 1 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold px-2 text-gray-700">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button 
                    onClick={() => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                    disabled={currentPage === totalPages}
                    className={`p-2 border rounded-md transition-colors ${
                      currentPage === totalPages ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaporanProgress;
