import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import AdminLoadingSkeleton from '../components/AdminLoadingSkeleton';
import AdminBkpsdmProfile from '../components/AdminBkpsdmProfile';
import { logout } from '../utils/auth';
import {
  Users, LayoutDashboard, ShieldCheck, BarChart3, LogOut, Bell, Settings,
  Search, ChevronRight, Menu, X, Download, TrendingUp, Award, CheckCircle,
  Calendar, ChevronLeft, Layers, Star, MessageSquare, ThumbsUp, BookOpen, Filter,
  QrCode, ExternalLink, Smartphone, Laptop, Tablet
} from 'lucide-react';

const AdminSidebar = ({ activeMenu = 'monitoring-reports', onNavigate, onLogout, isOpen, setIsOpen }) => {
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
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
            placeholder="Cari laporan..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AdminBkpsdmProfile onNavigate={onNavigate} variant="header" />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, colorClass, iconColorClass }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-full ${colorClass} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColorClass}`} />
      </div>
    </div>
    <div>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
      <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
    </div>
  </div>
);

const MonitoringReports = ({ onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTabReport, setActiveTabReport] = useState('peserta'); // 'peserta' | 'ulasan' | 'validasi'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [komunitasList, setKomunitasList] = useState([]);
  const [selectedKomunitas, setSelectedKomunitas] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination Peserta State (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pesertaStats, setPesertaStats] = useState({
    total_peserta: 0,
    progres_rata_rata: 0,
    sertifikat_terbit: 0,
    tingkat_kelulusan: 0,
  });

  // Ulasan State
  const [ulasanList, setUlasanList] = useState([]);
  const [ulasanStats, setUlasanStats] = useState({
    total_ulasan: 0,
    rata_rata_rating: 0,
    persen_puas: 0,
    distribusi: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('');
  const [loadingUlasan, setLoadingUlasan] = useState(false);

  // Validasi QR State
  const [validasiList, setValidasiList] = useState([]);
  const [validasiStats, setValidasiStats] = useState({
    total_validasi: 0,
    sertifikat_unik: 0,
    validasi_hari_ini: 0
  });
  const [loadingValidasi, setLoadingValidasi] = useState(false);
  const [validasiPagination, setValidasiPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  const fetchKomunitas = async () => {
    try {
      const res = await api.get('/admin-bkpsdm/komunitas');
      setKomunitasList(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch communities:', e);
    }
  };

  const fetchReports = async (page = currentPage) => {
    try {
      setTableLoading(true);
      const params = {
        page: page,
        per_page: 10,
      };
      if (selectedKomunitas) params.komunitas_id = selectedKomunitas;
      if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();

      const response = await api.get('/admin-bkpsdm/laporan/peserta', { params });
      const rawData = response.data.data || [];

      setReports(rawData.map((user, idx) => ({
        id: user.pendaftaran_id || user.pengguna_id || idx,
        name: user.nama_lengkap,
        nip: user.nip || '-',
        unitKerja: user.unit_kerja || user.instansi || '-',
        course: user.judul_pembelajaran || 'Belum terdaftar',
        community: user.nama_komunitas || 'BKPSDM',
        progress: user.progres ?? 0,
        status: user.status_pendaftaran === 'lulus' ? 'Lulus' : (user.progres > 0 ? 'Sedang Berjalan' : 'Belum Mulai'),
        hasCertificate: !!user.has_sertifikat,
        certificateId: user.sertifikat?.sertifikat_id,
        certificateUrl: user.sertifikat?.download_url,
        ulasan: user.ulasan || null
      })));

      if (response.data?.meta) {
        setPaginationMeta(response.data.meta);
      }
      if (response.data?.stats) {
        setPesertaStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const fetchUlasanReports = async () => {
    try {
      setLoadingUlasan(true);
      const params = {};
      if (selectedKomunitas) params.komunitas_id = selectedKomunitas;
      if (selectedRatingFilter) params.skor_rating = selectedRatingFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/admin-bkpsdm/laporan/ulasan', { params });
      if (res.data?.data) {
        setUlasanList(res.data.data.ulasan || []);
        setUlasanStats(res.data.data.stats || {
          total_ulasan: 0,
          rata_rata_rating: 0,
          persen_puas: 0,
          distribusi: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      }
    } catch (err) {
      console.error('Failed to fetch ulasan reports:', err);
    } finally {
      setLoadingUlasan(false);
    }
  };

  const fetchValidasiReports = async (page = 1) => {
    try {
      setLoadingValidasi(true);
      const params = { page, per_page: 15 };
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/admin-bkpsdm/riwayat-validasi-sertifikat', { params });
      if (res.data?.data) {
        setValidasiList(res.data.data.data || []);
        setValidasiPagination({
          current_page: res.data.data.current_page || 1,
          last_page: res.data.data.last_page || 1,
          total: res.data.data.total || 0
        });
      }
      if (res.data?.stats) {
        setValidasiStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch validasi reports:', err);
    } finally {
      setLoadingValidasi(false);
    }
  };

  useEffect(() => {
    fetchKomunitas();
    fetchValidasiReports(1);
  }, []);

  // Fetch data saat currentPage berubah
  useEffect(() => {
    if (activeTabReport === 'peserta') {
      fetchReports(currentPage);
    }
  }, [currentPage]);

  // Fetch data saat tab atau filter komunitas berganti
  useEffect(() => {
    if (activeTabReport === 'peserta') {
      if (currentPage === 1) {
        fetchReports(1);
      } else {
        setCurrentPage(1);
      }
    } else if (activeTabReport === 'ulasan') {
      fetchUlasanReports();
    } else if (activeTabReport === 'validasi') {
      fetchValidasiReports(1);
    }
  }, [activeTabReport, selectedKomunitas]);

  useEffect(() => {
    if (activeTabReport === 'ulasan') {
      fetchUlasanReports();
    }
  }, [selectedRatingFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeTabReport === 'peserta') {
      if (currentPage === 1) {
        fetchReports(1);
      } else {
        setCurrentPage(1);
      }
    } else if (activeTabReport === 'ulasan') {
      fetchUlasanReports();
    } else if (activeTabReport === 'validasi') {
      fetchValidasiReports(1);
    }
  };

  const getPageNumbers = () => {
    const totalPages = paginationMeta.last_page || 1;
    const current = currentPage;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (selectedKomunitas) params.komunitas_id = selectedKomunitas;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/admin-bkpsdm/laporan/peserta/export', {
        params,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'laporan_peserta.csv');
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      console.error(e);
      alert('Gagal mengekspor laporan');
    }
  };

  const handleViewCertificate = async (report) => {
    const certId = report?.certificateId || report?.sertifikat_id || report;
    if (!certId) return;
    try {
      const response = await api.get(`/admin-bkpsdm/sertifikat/${certId}/download`, {
        responseType: 'blob'
      });
      const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileUrl, '_blank');
    } catch (err) {
      console.error('Failed to download certificate:', err);
      alert('Gagal mengunduh sertifikat.');
    }
  };

  const handleShowReviewModal = (personName, nip, course, ulasan) => {
    if (!ulasan) return;
    Swal.fire({
      title: 'Ulasan & Evaluasi Peserta',
      html: `
        <div class="text-left space-y-3.5">
          <div class="p-3.5 bg-gray-50 rounded-xl text-xs space-y-1.5 border border-gray-100">
            <p><strong>Nama Peserta:</strong> ${personName}</p>
            <p><strong>NIP:</strong> ${nip}</p>
            <p><strong>Pelatihan:</strong> ${course}</p>
            <div class="flex items-center gap-1.5 pt-1">
              <strong>Penilaian:</strong>
              <span class="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold">⭐ ${ulasan.skor_rating || 5} / 5</span>
            </div>
          </div>
          <div class="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-gray-800 italic leading-relaxed">
            "${ulasan.teks_ulasan || 'Peserta memberikan penilaian rating tanpa catatan ulasan teks.'}"
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Tutup'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Lulus':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 border border-green-200 text-green-700">Lulus</span>;
      case 'Sedang Berjalan':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 border border-orange-200 text-orange-700">Sedang Berjalan</span>;
      case 'Belum Mulai':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 border border-red-200 text-red-700">Belum Mulai</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700">{status}</span>;
    }
  };

  const getProgressBarColor = (progress) => {
    if (progress === 100) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-orange-400';
    return 'bg-red-500';
  };

  // Dynamic calculations
  const totalPesertaAktif = (pesertaStats.total_peserta ?? paginationMeta.total) || reports.length;
  const avgProgres = pesertaStats.progres_rata_rata !== undefined
    ? `${pesertaStats.progres_rata_rata}%`
    : (reports.length > 0 ? `${Math.round(reports.reduce((acc, r) => acc + (r.progress || 0), 0) / reports.length)}%` : '0%');
  const sertifikatTerbitCount = pesertaStats.sertifikat_terbit ?? reports.filter(r => r.hasCertificate).length;
  const tingkatKelulusan = pesertaStats.tingkat_kelulusan !== undefined
    ? `${pesertaStats.tingkat_kelulusan}%`
    : (reports.length > 0 ? `${Math.round((reports.filter(r => r.status === 'Lulus').length / reports.length) * 100)}%` : '0%');

  if (loading && reports.length === 0) return <AdminLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebar activeMenu="monitoring-reports" onNavigate={onNavigate} onLogout={onLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full overflow-hidden">
        <AdminHeader setIsOpen={setIsSidebarOpen} onNavigate={onNavigate} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">

          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1D315F] mb-2">Monitoring & Laporan</h1>
            <p className="text-sm text-gray-500">Pantau aktivitas belajar, progres peserta, evaluasi mutu, dan ulasan kepuasan pelatihan ASN.</p>
          </div>

          {/* Switcher Tab: Peserta vs Ulasan vs Validasi QR */}
          <div className="flex border-b border-gray-200 mb-6 gap-4 sm:gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTabReport('peserta')}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTabReport === 'peserta'
                  ? 'text-teal-700 border-b-2 border-teal-700'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Laporan Progres Peserta</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-semibold">
                {totalPesertaAktif}
              </span>
            </button>
            <button
              onClick={() => setActiveTabReport('ulasan')}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTabReport === 'ulasan'
                  ? 'text-teal-700 border-b-2 border-teal-700'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>Ulasan & Evaluasi Mutu Pelatihan</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
                {ulasanStats.total_ulasan || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTabReport('validasi')}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTabReport === 'validasi'
                  ? 'text-teal-700 border-b-2 border-teal-700'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Audit Validasi & Scan QR</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {validasiStats.total_validasi || 0}
              </span>
            </button>
          </div>

          {/* Stat Cards - Peserta Tab */}
          {activeTabReport === 'peserta' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                title="TOTAL PESERTA AKTIF"
                value={totalPesertaAktif}
                icon={Users}
                colorClass="bg-blue-50"
                iconColorClass="text-blue-500"
              />
              <StatCard
                title="PROGRES RATA-RATA"
                value={avgProgres}
                icon={TrendingUp}
                colorClass="bg-orange-50"
                iconColorClass="text-orange-500"
              />
              <StatCard
                title="SERTIFIKAT TERBIT"
                value={sertifikatTerbitCount}
                icon={Award}
                colorClass="bg-green-50"
                iconColorClass="text-green-500"
              />
              <StatCard
                title="TINGKAT KELULUSAN (%)"
                value={tingkatKelulusan}
                icon={CheckCircle}
                colorClass="bg-teal-50"
                iconColorClass="text-teal-600"
              />
            </div>
          )}

          {/* Stat Cards - Ulasan Tab */}
          {activeTabReport === 'ulasan' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                title="TOTAL ULASAN MASUK"
                value={ulasanStats.total_ulasan}
                icon={MessageSquare}
                colorClass="bg-amber-50"
                iconColorClass="text-amber-500"
              />
              <StatCard
                title="RATA-RATA KEPUASAN"
                value={ulasanStats.rata_rata_rating ? `⭐ ${ulasanStats.rata_rata_rating}` : '0.0'}
                icon={Star}
                colorClass="bg-yellow-50"
                iconColorClass="text-yellow-600"
              />
              <StatCard
                title="INDEKS PUAS (>= 4★)"
                value={`${ulasanStats.persen_puas || 0}%`}
                icon={ThumbsUp}
                colorClass="bg-green-50"
                iconColorClass="text-green-600"
              />
              <StatCard
                title="PELATIHAN TERULAS"
                value={new Set(ulasanList.map(u => u.pembelajaran?.pembelajaran_id)).size}
                icon={BookOpen}
                colorClass="bg-teal-50"
                iconColorClass="text-teal-600"
              />
            </div>
          )}

          {/* Stat Cards - Validasi Tab */}
          {activeTabReport === 'validasi' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                title="TOTAL PEMINDAIAN (SCAN)"
                value={validasiStats.total_validasi}
                icon={QrCode}
                colorClass="bg-blue-50"
                iconColorClass="text-blue-600"
              />
              <StatCard
                title="SERTIFIKAT TERVALIDASI"
                value={validasiStats.sertifikat_unik}
                icon={ShieldCheck}
                colorClass="bg-green-50"
                iconColorClass="text-green-600"
              />
              <StatCard
                title="VERIFIKASI HARI INI"
                value={validasiStats.validasi_hari_ini}
                icon={Calendar}
                colorClass="bg-amber-50"
                iconColorClass="text-amber-600"
              />
              <StatCard
                title="STATUS ARSIP"
                value="100% Otentik"
                icon={CheckCircle}
                colorClass="bg-teal-50"
                iconColorClass="text-teal-600"
              />
            </div>
          )}

          {/* Main Card Container */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                {activeTabReport !== 'validasi' && (
                  <select
                    value={selectedKomunitas}
                    onChange={(e) => setSelectedKomunitas(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white w-full sm:w-auto"
                  >
                    <option value="">Semua Komunitas</option>
                    {komunitasList.map(k => (
                      <option key={k.komunitas_id} value={k.komunitas_id}>{k.nama_komunitas}</option>
                    ))}
                  </select>
                )}

                {activeTabReport === 'ulasan' && (
                  <select
                    value={selectedRatingFilter}
                    onChange={(e) => setSelectedRatingFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white w-full sm:w-auto"
                  >
                    <option value="">Semua Rating</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                    <option value="3">⭐⭐⭐ (3 Bintang)</option>
                    <option value="2">⭐⭐ (2 Bintang)</option>
                    <option value="1">⭐ (1 Bintang)</option>
                  </select>
                )}

                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      activeTabReport === 'peserta'
                        ? "Cari Nama / NIP..."
                        : activeTabReport === 'ulasan'
                          ? "Cari Peserta / Pelatihan / Kata Kunci..."
                          : "Cari No. Sertifikat / Nama / NIP / IP..."
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shrink-0 w-full sm:w-auto"
                >
                  Cari
                </button>
              </form>

              {activeTabReport === 'peserta' && (
                <button onClick={handleExport} className="bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 w-full lg:w-auto justify-center">
                  <Download className="w-4 h-4" />
                  Ekspor Laporan
                </button>
              )}
            </div>

            {/* Table: Laporan Peserta */}
            {activeTabReport === 'peserta' && (
              <div className="overflow-x-auto relative">
                {tableLoading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 text-sm font-medium text-teal-700">
                      <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      Memuat data...
                    </div>
                  </div>
                )}
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">NAMA PESERTA / NIP</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PEMBELAJARAN</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">KOMUNITAS</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PROGRES (%)</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">STATUS POST TEST</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">SERTIFIKAT</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">RATING & ULASAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800 mb-0.5">{report.name}</p>
                          <p className="text-sm text-gray-500">{report.nip} • {report.unitKerja}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800 text-sm">{report.course}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-700 text-sm">{report.community}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className={`${getProgressBarColor(report.progress)} h-2 rounded-full`} style={{ width: `${report.progress}%` }}></div>
                            </div>
                            <span className="font-bold text-gray-800 text-sm">{report.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-4">
                          {report.hasCertificate ? (
                            <button
                              onClick={() => handleViewCertificate(report)}
                              className="text-teal-700 hover:text-teal-800 font-bold text-sm flex items-center gap-1.5 transition-colors"
                            >
                              <Award className="w-4 h-4" />
                              Lihat Sertifikat
                            </button>
                          ) : (
                            <span className="text-gray-400 font-bold">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {report.ulasan ? (
                            <button
                              type="button"
                              onClick={() => handleShowReviewModal(report.name, report.nip, report.course, report.ulasan)}
                              className="inline-flex flex-col items-center gap-1 group"
                              title="Klik untuk melihat detail ulasan"
                            >
                              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-900 group-hover:bg-amber-100 transition-colors">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{report.ulasan.skor_rating}.0</span>
                                <MessageSquare className="w-3 h-3 text-amber-700 ml-0.5" />
                              </div>
                              <span className="text-[10px] text-gray-400 group-hover:text-teal-700 transition-colors">Lihat Ulasan</span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          {searchTerm ? 'Tidak ada laporan peserta yang sesuai dengan pencarian.' : 'Tidak ada laporan peserta.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {paginationMeta.total > 0 && (
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50">
                    <div className="text-sm text-gray-500 text-center md:text-left">
                      Menampilkan <span className="font-semibold text-gray-700">{paginationMeta.from || 0}</span> - <span className="font-semibold text-gray-700">{paginationMeta.to || 0}</span> dari <span className="font-semibold text-gray-700">{paginationMeta.total?.toLocaleString('id-ID') || 0}</span> data peserta
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage <= 1 || tableLoading}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-white hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>

                      {getPageNumbers().map((pageItem, idx) => (
                        pageItem === '...' ? (
                          <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 text-sm select-none">...</span>
                        ) : (
                          <button
                            key={pageItem}
                            onClick={() => setCurrentPage(pageItem)}
                            disabled={tableLoading}
                            className={`min-w-8 h-8 px-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${currentPage === pageItem
                                ? 'bg-teal-700 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-white hover:text-teal-700 border border-gray-200'
                              }`}
                          >
                            {pageItem}
                          </button>
                        )
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationMeta.last_page))}
                        disabled={currentPage >= paginationMeta.last_page || tableLoading}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-white hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                        <span className="hidden sm:inline">Berikutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Table: Ulasan & Feedback Mutu Pelatihan */}
            {activeTabReport === 'ulasan' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PESERTA</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PELATIHAN & KOMUNITAS</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PENILAIAN RATING</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">ULASAN / FEEDBACK PESERTA</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">TANGGAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadingUlasan ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          Memuat data ulasan mutu pelatihan...
                        </td>
                      </tr>
                    ) : ulasanList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="max-w-md mx-auto text-center space-y-2">
                            <Star className="w-8 h-8 text-amber-400 mx-auto fill-amber-50" />
                            <p className="font-bold text-gray-800 text-sm">Belum Ada Ulasan Peserta</p>
                            <p className="text-xs text-gray-500">Data ulasan akan tampil di sini saat peserta telah menyelesaikan pelatihan dan mengisi ulasan kepuasan.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      ulasanList.map((rev) => (
                        <tr key={rev.ulasan_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                                {(rev.peserta?.nama_lengkap || 'P').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 mb-0.5">{rev.peserta?.nama_lengkap || 'Peserta'}</p>
                                <p className="text-xs text-gray-500">{rev.peserta?.nip || '-'} • {rev.peserta?.unit_kerja || 'Pemerintah Kabupaten Buleleng'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-800 text-sm">{rev.pembelajaran?.judul_pembelajaran || '-'}</p>
                            <span className="inline-block mt-1 text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium">
                              {rev.pembelajaran?.nama_komunitas || 'Komunitas BKPSDM'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${s <= rev.skor_rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                    }`}
                                />
                              ))}
                              <span className="text-xs font-bold text-amber-900 ml-1">
                                {rev.skor_rating}.0
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <div className="p-3 bg-gray-50/80 rounded-lg border border-gray-100 text-xs text-gray-800 italic">
                              "{rev.teks_ulasan || 'Peserta memberikan penilaian rating tanpa komentar teks.'}"
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                            {rev.dikirim_pada
                              ? new Date(rev.dikirim_pada).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                              : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table: Riwayat Validasi & Scan QR Sertifikat */}
            {activeTabReport === 'validasi' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">WAKTU PEMINDAIAN</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">NOMOR SERTIFIKAT</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PENERIMA</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PELATIHAN</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PERANGKAT & IP</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">STATUS</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadingValidasi ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          Memuat data riwayat validasi sertifikat...
                        </td>
                      </tr>
                    ) : validasiList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          <div className="max-w-md mx-auto text-center space-y-2">
                            <QrCode className="w-8 h-8 text-emerald-500 mx-auto" />
                            <p className="font-bold text-gray-800 text-sm">Belum Ada Riwayat Pemindaian QR</p>
                            <p className="text-xs text-gray-500">Setiap kali QR Code pada sertifikat di-scan atau diverifikasi via tautan publik, data log pemindaian otomatis tersimpan di sini.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      validasiList.map((log) => {
                        const recipientName = log.sertifikat?.nama_lengkap_snapshot || log.sertifikat?.pendaftaran?.pengguna?.nama_lengkap || '-';
                        const recipientNip = log.sertifikat?.nip_snapshot || log.sertifikat?.pendaftaran?.pengguna?.nip || '-';
                        const courseTitle = log.sertifikat?.pendaftaran?.pembelajaran?.judul_pembelajaran || '-';
                        const isMobile = log.perangkat === 'Mobile';
                        const isTablet = log.perangkat === 'Tablet';

                        return (
                          <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                              <p className="font-bold text-gray-800">
                                {log.scanned_at ? new Date(log.scanned_at).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                }) : '-'}
                              </p>
                              <p className="text-gray-400">
                                {log.scanned_at ? new Date(log.scanned_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                }) + ' WITA' : '-'}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 inline-block">
                                {log.nomor_sertifikat}
                              </span>
                              {log.sertifikat?.verification_code && (
                                <p className="text-[10px] text-gray-400 font-mono mt-1 truncate max-w-[180px]" title={log.sertifikat.verification_code}>
                                  Kode: {log.sertifikat.verification_code.substring(0, 16)}...
                                </p>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-bold text-gray-800 text-sm mb-0.5">{recipientName}</p>
                              <p className="text-xs text-gray-500 font-mono">NIP. {recipientNip}</p>
                            </td>

                            <td className="px-6 py-4 max-w-xs">
                              <p className="font-bold text-gray-800 text-sm line-clamp-2">{courseTitle}</p>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 mb-1">
                                {isMobile ? (
                                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                                ) : isTablet ? (
                                  <Tablet className="w-3.5 h-3.5 text-purple-600" />
                                ) : (
                                  <Laptop className="w-3.5 h-3.5 text-gray-600" />
                                )}
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isMobile ? 'bg-blue-50 text-blue-700' : isTablet ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                  {log.perangkat || 'Desktop'}
                                </span>
                              </div>
                              <p className="text-xs font-mono text-gray-400">{log.ip_address || '-'}</p>
                            </td>

                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 border border-green-200 text-green-700">
                                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                Sah & Valid
                              </span>
                            </td>

                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={`/validasi-sertifikat/${log.sertifikat?.verification_code || encodeURIComponent(log.nomor_sertifikat)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg border border-teal-200 transition-colors"
                                  title="Buka Halaman Verifikasi Publik"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Cek Verifikasi</span>
                                </a>
                                {log.sertifikat_id && (
                                  <button
                                    onClick={() => handleViewCertificate({ certificateId: log.sertifikat_id })}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-teal-800 bg-white hover:bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-colors"
                                    title="Unduh Berkas PDF Asli"
                                  >
                                    <Award className="w-3.5 h-3.5 text-teal-700" />
                                    <span>Unduh PDF</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {validasiPagination.last_page > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <span className="text-xs text-gray-500 font-medium">
                      Menampilkan halaman <strong className="text-gray-800">{validasiPagination.current_page}</strong> dari <strong className="text-gray-800">{validasiPagination.last_page}</strong> ({validasiPagination.total} total log scan)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={validasiPagination.current_page <= 1}
                        onClick={() => fetchValidasiReports(validasiPagination.current_page - 1)}
                        className="px-3 py-1.5 border border-gray-200 rounded text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white bg-white text-gray-700 transition-colors"
                      >
                        Sebelumnya
                      </button>
                      <button
                        disabled={validasiPagination.current_page >= validasiPagination.last_page}
                        onClick={() => fetchValidasiReports(validasiPagination.current_page + 1)}
                        className="px-3 py-1.5 border border-gray-200 rounded text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white bg-white text-gray-700 transition-colors"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default MonitoringReports;
