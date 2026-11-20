import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import JSZip from 'jszip';
import AdminLoadingSkeleton from '../components/AdminLoadingSkeleton';
import AdminBkpsdmProfile from '../components/AdminBkpsdmProfile';
import { logout } from '../utils/auth';
import {
  Users, LayoutDashboard, ShieldCheck, BarChart3, LogOut, Bell, Settings,
  Search, ChevronRight, Menu, X, Download, TrendingUp, Award, CheckCircle,
  Calendar, ChevronLeft, Layers, Star, MessageSquare, ThumbsUp, BookOpen, Filter,
  QrCode, ExternalLink, Smartphone, Laptop, Tablet, FileArchive, Check,
  Upload, AlertCircle, FileCheck, RefreshCw, FileText, Send, UserCheck, UserX,
  Eye, EyeOff, Headphones, Clock, HelpCircle
} from 'lucide-react';

const EXPORT_KPK_BATCH_SIZE = 20;
const REVIEW_AND_AUDIT_PER_PAGE = 15;

const buildPageNumbers = (currentPage, totalPages) => {
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let previousPage;

  for (let i = 1; i <= safeTotal; i++) {
    if (i === 1 || i === safeTotal || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (const page of range) {
    if (previousPage) {
      if (page - previousPage === 2) {
        rangeWithDots.push(previousPage + 1);
      } else if (page - previousPage !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(page);
    previousPage = page;
  }

  return rangeWithDots;
};

const TablePagination = ({
  currentPage,
  lastPage,
  total,
  from,
  to,
  itemLabel,
  loading,
  onPageChange,
}) => {
  if (!total || total <= 0) return null;

  const safeLastPage = Math.max(1, Number(lastPage) || 1);
  const safeCurrentPage = Math.min(Math.max(1, Number(currentPage) || 1), safeLastPage);
  const pages = buildPageNumbers(safeCurrentPage, safeLastPage);

  return (
    <nav
      aria-label={`Navigasi halaman ${itemLabel}`}
      className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/70"
    >
      <div className="text-xs sm:text-sm text-gray-600 text-center md:text-left">
        Menampilkan <span className="font-semibold text-gray-800">{from || 0}</span> -{' '}
        <span className="font-semibold text-gray-800">{to || 0}</span> dari{' '}
        <span className="font-semibold text-gray-800">{total.toLocaleString('id-ID')}</span> {itemLabel}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(safeCurrentPage - 1, 1))}
          disabled={safeCurrentPage <= 1 || loading}
          aria-label={`Halaman ${itemLabel} sebelumnya`}
          className="min-h-11 lg:min-h-8 px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {pages.map((pageItem, idx) =>
          pageItem === '...' ? (
            <span key={`dots-${idx}`} className="px-2 py-1 text-gray-600 text-sm select-none">
              ...
            </span>
          ) : (
            <button
              key={pageItem}
              type="button"
              onClick={() => onPageChange(pageItem)}
              disabled={loading}
              aria-label={`Halaman ${pageItem}`}
              aria-current={safeCurrentPage === pageItem ? 'page' : undefined}
              className={`min-h-11 min-w-11 lg:min-h-8 lg:min-w-8 px-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                safeCurrentPage === pageItem
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-gray-700 bg-white hover:bg-gray-50 hover:text-teal-700 border border-gray-200'
              }`}
            >
              {pageItem}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeCurrentPage + 1, safeLastPage))}
          disabled={safeCurrentPage >= safeLastPage || loading}
          aria-label={`Halaman ${itemLabel} berikutnya`}
          className="min-h-11 lg:min-h-8 px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

const AdminSidebar = ({ activeMenu = 'monitoring-reports', onNavigate, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'admin', label: 'Dasbor', icon: LayoutDashboard },
    { id: 'user-management', label: 'Manajemen Pengguna', icon: Users },
    { id: 'community-management', label: 'Manajemen Komunitas', icon: Users },
    { id: 'category-management', label: 'Kategori Kursus', icon: Layers },
    { id: 'course-validation', label: 'Validasi Kursus', icon: ShieldCheck },
    { id: 'monitoring-reports', label: 'Monitoring & Laporan', icon: BarChart3 },
    { id: 'faq-management', label: 'Kelola FAQ', icon: HelpCircle },
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

  // State Ekspor Sertifikat Khusus Kursus KPK
  const [isExportKpkModalOpen, setIsExportKpkModalOpen] = useState(false);
  const [kpkCoursesList, setKpkCoursesList] = useState([]);
  const [selectedKpkCourse, setSelectedKpkCourse] = useState('all');
  const [exportKpkFormat, setExportKpkFormat] = useState('nip'); // 'nip' | 'nip_sign'
  const [exportKpkScope, setExportKpkScope] = useState('pending_tte'); // 'pending_tte' | 'all'
  const [exportKpkBatchMode, setExportKpkBatchMode] = useState('batch'); // 'batch' (per 20) | 'all'
  const [exportKpkBatchNumber, setExportKpkBatchNumber] = useState(1);
  const [isExportingKpkZip, setIsExportingKpkZip] = useState(false);
  const [loadingKpkCourses, setLoadingKpkCourses] = useState(false);

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
    pelatihan_terulas: 0,
    distribusi: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('');
  const [loadingUlasan, setLoadingUlasan] = useState(false);
  const [exportingUlasan, setExportingUlasan] = useState(false);
  const [ulasanError, setUlasanError] = useState('');
  const [ulasanPagination, setUlasanPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: REVIEW_AND_AUDIT_PER_PAGE,
    total: 0,
    from: 0,
    to: 0,
  });

  // Validasi QR State
  const [validasiList, setValidasiList] = useState([]);
  const [validasiStats, setValidasiStats] = useState({
    total_validasi: 0,
    sertifikat_unik: 0,
    validasi_hari_ini: 0
  });
  const [loadingValidasi, setLoadingValidasi] = useState(false);
  const [validasiError, setValidasiError] = useState('');
  const [validasiPagination, setValidasiPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: REVIEW_AND_AUDIT_PER_PAGE,
    total: 0,
    from: 0,
    to: 0,
  });

  // Laporan Teknis State
  const [teknisList, setTeknisList] = useState([]);
  const [teknisStats, setTeknisStats] = useState({
    total_aduan: 0,
    terbuka: 0,
    diproses: 0,
    selesai: 0,
    dari_peserta: 0,
    dari_admin_komunitas: 0,
  });
  const [loadingTeknis, setLoadingTeknis] = useState(false);
  const [teknisError, setTeknisError] = useState('');
  const [teknisPagination, setTeknisPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [selectedTiketDetail, setSelectedTiketDetail] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

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
        id: user.pendaftaran_id
          ? `pendaftaran-${user.pendaftaran_id}`
          : (user.pengguna_id ? `pengguna-${user.pengguna_id}-${idx}` : `row-${idx}`),
        pendaftaranId: user.pendaftaran_id,
        penggunaId: user.pengguna_id,
        pembelajaranId: user.pembelajaran_id || user.pembelajaran?.pembelajaran_id,
        name: user.nama_lengkap,
        nip: user.nip || '-',
        unitKerja: user.unit_kerja || user.instansi || '-',
        course: user.judul_pembelajaran || 'Belum terdaftar',
        community: (!user.nama_komunitas || user.nama_komunitas === 'BKPSDM' || user.nama_komunitas === '-') ? '-' : user.nama_komunitas,
        progress: user.progres ?? 0,
        status: user.status_pendaftaran === 'lulus' || user.status_pendaftaran === 'selesai'
          ? 'Lulus'
          : (user.status_pendaftaran === 'menunggu_post_test'
            ? 'Menunggu Post Test'
            : (user.progres > 0 ? 'Sedang Berjalan' : 'Belum Mulai')),
        hasCertificate: !!user.has_sertifikat,
        certificateId: user.sertifikat?.sertifikat_id,
        certificateUrl: user.sertifikat?.download_url,
        statusTte: user.sertifikat?.status_tte || 'draft_ready',
        isKpk: !!user.is_kpk,
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

  const fetchUlasanReports = async (page = 1) => {
    try {
      setLoadingUlasan(true);
      setUlasanError('');
      const params = {
        page,
        per_page: REVIEW_AND_AUDIT_PER_PAGE,
      };
      if (selectedKomunitas) params.komunitas_id = selectedKomunitas;
      if (selectedRatingFilter) params.skor_rating = selectedRatingFilter;
      if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/admin-bkpsdm/laporan/ulasan', { params });
      const payload = res.data?.data;
      if (payload) {
        const rows = payload.ulasan || [];
        const meta = payload.meta;
        setUlasanList(rows);
        setUlasanStats(payload.stats || {
          total_ulasan: 0,
          rata_rata_rating: 0,
          persen_puas: 0,
          pelatihan_terulas: 0,
          distribusi: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
        if (meta) {
          setUlasanPagination({
            current_page: Number(meta.current_page || 1),
            last_page: Number(meta.last_page || 1),
            per_page: Number(meta.per_page || REVIEW_AND_AUDIT_PER_PAGE),
            total: Number(meta.total || 0),
            from: Number(meta.from || 0),
            to: Number(meta.to || 0),
          });
        } else {
          setUlasanPagination({
            current_page: 1,
            last_page: 1,
            per_page: REVIEW_AND_AUDIT_PER_PAGE,
            total: rows.length,
            from: rows.length > 0 ? 1 : 0,
            to: rows.length,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch ulasan reports:', err);
      setUlasanError(err?.response?.data?.message || 'Gagal memuat data ulasan mutu pelatihan.');
    } finally {
      setLoadingUlasan(false);
    }
  };

  const fetchValidasiReports = async (page = 1) => {
    try {
      setLoadingValidasi(true);
      setValidasiError('');
      const params = { page, per_page: REVIEW_AND_AUDIT_PER_PAGE };
      if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/admin-bkpsdm/riwayat-validasi-sertifikat', { params });
      const payload = res.data?.data;
      if (payload) {
        const rows = payload.data || [];
        const curPage = Number(payload.current_page || 1);
        const perPage = Number(payload.per_page || REVIEW_AND_AUDIT_PER_PAGE);
        const total = Number(payload.total || 0);
        const computedFrom = total > 0 && rows.length > 0 ? (curPage - 1) * perPage + 1 : 0;
        const computedTo = total > 0 && rows.length > 0 ? (curPage - 1) * perPage + rows.length : 0;

        setValidasiList(rows);
        setValidasiPagination({
          current_page: curPage,
          last_page: Number(payload.last_page || 1),
          per_page: perPage,
          total,
          from: payload.from ?? computedFrom,
          to: payload.to ?? computedTo,
        });
      }
      if (res.data?.stats) {
        setValidasiStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch validasi reports:', err);
      setValidasiError(err?.response?.data?.message || 'Gagal memuat riwayat validasi & scan QR.');
    } finally {
      setLoadingValidasi(false);
    }
  };

  const fetchTeknisReports = async (page = 1) => {
    try {
      setLoadingTeknis(true);
      setTeknisError('');
      const params = {
        page,
        per_page: 10,
      };
      if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedStatusFilter) params.status = selectedStatusFilter;
      if (selectedRoleFilter) params.role = selectedRoleFilter;

      const res = await api.get('/admin-bkpsdm/laporan/teknis', { params });
      const payload = res.data?.data;
      if (payload) {
        const rows = payload.data || [];
        const curPage = Number(payload.current_page || 1);
        const perPage = Number(payload.per_page || 10);
        const total = Number(payload.total || 0);
        const computedFrom = total > 0 && rows.length > 0 ? (curPage - 1) * perPage + 1 : 0;
        const computedTo = total > 0 && rows.length > 0 ? (curPage - 1) * perPage + rows.length : 0;

        setTeknisList(rows);
        setTeknisPagination({
          current_page: curPage,
          last_page: Number(payload.last_page || 1),
          per_page: perPage,
          total,
          from: payload.from ?? computedFrom,
          to: payload.to ?? computedTo,
        });
      }
      if (res.data?.stats) {
        setTeknisStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch teknis reports:', err);
      setTeknisError(err?.response?.data?.message || 'Gagal memuat laporan aduan teknis.');
    } finally {
      setLoadingTeknis(false);
    }
  };

  const handleUpdateStatusTiket = async (tiketId, newStatus) => {
    try {
      setUpdatingStatusId(tiketId);
      await api.put(`/admin-bkpsdm/laporan/teknis/${tiketId}/status`, {
        status: newStatus,
      });

      // Update state lokal seketika
      setTeknisList((prev) =>
        prev.map((t) =>
          t.help_tiket_id === tiketId
            ? {
                ...t,
                status: newStatus,
                diselesaikan_pada: newStatus === 'selesai' ? new Date().toISOString() : null,
              }
            : t
        )
      );

      if (selectedTiketDetail && selectedTiketDetail.help_tiket_id === tiketId) {
        setSelectedTiketDetail((prev) => ({
          ...prev,
          status: newStatus,
          diselesaikan_pada: newStatus === 'selesai' ? new Date().toISOString() : null,
        }));
      }

      Swal.fire({
        icon: 'success',
        title: 'Status Berhasil Diperbarui',
        text: `Status tiket aduan berhasil diubah menjadi ${newStatus}.`,
        timer: 1800,
        showConfirmButton: false,
      });

      fetchTeknisReports(teknisPagination.current_page);
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memperbarui Status',
        text: err?.response?.data?.message || 'Terjadi kesalahan sistem saat memperbarui status tiket.',
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  useEffect(() => {
    fetchKomunitas();
    fetchValidasiReports(1);
    fetchTeknisReports(1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedTiketDetail) {
        setSelectedTiketDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTiketDetail]);

  useEffect(() => {
    if (activeTabReport === 'peserta') {
      fetchReports(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (activeTabReport === 'peserta') {
      if (currentPage === 1) {
        fetchReports(1);
      } else {
        setCurrentPage(1);
      }
    } else if (activeTabReport === 'ulasan') {
      fetchUlasanReports(1);
    } else if (activeTabReport === 'validasi') {
      fetchValidasiReports(1);
    } else if (activeTabReport === 'teknis') {
      fetchTeknisReports(1);
    }
  }, [activeTabReport, selectedKomunitas]);

  useEffect(() => {
    if (activeTabReport === 'ulasan') {
      fetchUlasanReports(1);
    }
  }, [selectedRatingFilter]);

  useEffect(() => {
    if (activeTabReport === 'teknis') {
      fetchTeknisReports(1);
    }
  }, [selectedStatusFilter, selectedRoleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeTabReport === 'peserta') {
      if (currentPage === 1) {
        fetchReports(1);
      } else {
        setCurrentPage(1);
      }
    } else if (activeTabReport === 'ulasan') {
      fetchUlasanReports(1);
    } else if (activeTabReport === 'validasi') {
      fetchValidasiReports(1);
    } else if (activeTabReport === 'teknis') {
      fetchTeknisReports(1);
    }
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

  const handleExportUlasan = async () => {
    if (exportingUlasan) return;
    try {
      setExportingUlasan(true);
      const params = {};
      if (selectedKomunitas) params.komunitas_id = selectedKomunitas;
      if (selectedRatingFilter) params.skor_rating = selectedRatingFilter;
      if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();

      const response = await api.get('/admin-bkpsdm/laporan/ulasan/export', {
        params,
        responseType: 'blob'
      });

      let filename = `laporan_ulasan_${new Date().toISOString().slice(0, 10)}.csv`;
      const disposition = response.headers?.['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Failed to export ulasan:', e);
      Swal.fire({
        title: 'Gagal Mengekspor Ulasan',
        text: 'Terjadi kesalahan saat mengekspor data ulasan ke CSV.',
        icon: 'error',
        confirmButtonColor: '#0F766E'
      });
    } finally {
      setExportingUlasan(false);
    }
  };

  const handleViewCertificate = async (report) => {
    const certId = report?.certificateId || report?.sertifikat_id || report;
    if (!certId) return;
    try {
      const params = {
        _t: Date.now()
      };
      if (report?.pembelajaranId) {
        params.pembelajaran_id = report.pembelajaranId;
      }
      if (report?.pendaftaranId) {
        params.pendaftaran_id = report.pendaftaranId;
      }

      const response = await api.get(`/admin-bkpsdm/sertifikat/${certId}/download`, {
        params,
        responseType: 'blob'
      });

      let filename = '';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      if (!filename) {
        if (report?.isKpk && report?.nip && report.nip !== '-') {
          filename = `${report.nip}.pdf`;
        } else {
          const cleanName = (report?.name || 'Peserta').replace(/\s+/g, '_');
          filename = `Sertifikat_${cleanName}.pdf`;
        }
      }

      const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(fileUrl), 1000);
    } catch (err) {
      console.error('Failed to download certificate:', err);
      Swal.fire({
        title: 'Gagal Mengunduh',
        text: 'Terjadi kesalahan saat mengunduh sertifikat.',
        icon: 'error',
        confirmButtonColor: '#0F766E'
      });
    }
  };

  const handleOpenPreviewCertificate = async (report) => {
    const certId = report?.certificateId || report?.sertifikat_id;
    if (!certId) return;

    let initialFilename = '';
    if (report?.isKpk && report?.nip && report.nip !== '-') {
      initialFilename = `${report.nip}.pdf`;
    } else {
      const cleanName = (report?.name || 'Peserta').replace(/\s+/g, '_');
      initialFilename = `Sertifikat_${cleanName}.pdf`;
    }

    setIsPreviewCertModalOpen(true);
    setPreviewCertData({
      report,
      filename: initialFilename,
      blobUrl: null,
      loading: true,
      error: null,
    });

    try {
      const params = {
        preview: 1,
        disposition: 'inline',
        _t: Date.now()
      };
      if (report?.pembelajaranId) {
        params.pembelajaran_id = report.pembelajaranId;
      }
      if (report?.pendaftaranId) {
        params.pendaftaran_id = report.pendaftaranId;
      }

      const response = await api.get(`/admin-bkpsdm/sertifikat/${certId}/download`, {
        params,
        responseType: 'blob'
      });

      let filename = initialFilename;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);

      setPreviewCertData(prev => ({
        ...prev,
        blobUrl,
        filename,
        loading: false,
      }));
    } catch (err) {
      console.error('Failed to load certificate preview:', err);
      setPreviewCertData(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat berkas sertifikat dari server. Pastikan berkas sertifikat tersedia di storage.',
      }));
    }
  };

  const handleClosePreviewModal = () => {
    if (previewCertData?.blobUrl) {
      window.URL.revokeObjectURL(previewCertData.blobUrl);
    }
    setIsPreviewCertModalOpen(false);
    setPreviewCertData(null);
  };

  const handleDownloadFromPreview = () => {
    if (!previewCertData?.blobUrl) return;
    const link = document.createElement('a');
    link.href = previewCertData.blobUrl;
    link.setAttribute('download', previewCertData.filename || 'Sertifikat.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchKpkCourses = async () => {
    try {
      setLoadingKpkCourses(true);
      const res = await api.get('/admin-bkpsdm/laporan/sertifikat/kpk-courses');
      setKpkCoursesList(res.data?.data || []);
    } catch (err) {
      console.error('Gagal mengambil daftar kursus KPK:', err);
    } finally {
      setLoadingKpkCourses(false);
    }
  };

  // Helper kalkulasi status kuota TTE dan pembagian batch ekspor KPK
  const selectedKpkCourseData = selectedKpkCourse === 'all'
    ? {
        total_lulus: kpkCoursesList.reduce((acc, c) => acc + (c.total_lulus || 0), 0),
        total_pending_tte: kpkCoursesList.reduce((acc, c) => acc + (c.total_pending_tte || 0), 0),
        total_signed_tte: kpkCoursesList.reduce((acc, c) => acc + (c.total_signed_tte || 0), 0),
      }
    : kpkCoursesList.find((c) => String(c.pembelajaran_id) === String(selectedKpkCourse)) || {
        total_lulus: 0,
        total_pending_tte: 0,
        total_signed_tte: 0,
      };

  const isKpkPendingEmpty = (selectedKpkCourseData.total_pending_tte || 0) === 0;

  const targetExportCount = exportKpkScope === 'pending_tte'
    ? (selectedKpkCourseData.total_pending_tte || 0)
    : (selectedKpkCourseData.total_lulus || 0);

  const totalBatches = Math.max(1, Math.ceil(targetExportCount / EXPORT_KPK_BATCH_SIZE));
  const safeBatchNumber = Math.min(Math.max(1, exportKpkBatchNumber), totalBatches);
  const selectedBatchCount = Math.min(
    EXPORT_KPK_BATCH_SIZE,
    Math.max(0, targetExportCount - (safeBatchNumber - 1) * EXPORT_KPK_BATCH_SIZE)
  );

  useEffect(() => {
    if (!isExportKpkModalOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isExportingKpkZip) {
        setIsExportKpkModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExportKpkModalOpen, isExportingKpkZip]);

  const handleOpenExportKpkModal = () => {
    setIsExportKpkModalOpen(true);
    setExportKpkScope('pending_tte');
    setExportKpkBatchMode('batch');
    setExportKpkBatchNumber(1);
    fetchKpkCourses();
  };

  const handleDownloadKpkZip = async () => {
    try {
      setIsExportingKpkZip(true);
      const isBatchMode = totalBatches > 1 && exportKpkBatchMode === 'batch';
      const params = {
        format: exportKpkFormat,
        scope: exportKpkScope,
        batch_size: EXPORT_KPK_BATCH_SIZE,
        batch_number: isBatchMode ? safeBatchNumber : 'all',
      };
      if (selectedKpkCourse && selectedKpkCourse !== 'all') {
        params.pembelajaran_id = selectedKpkCourse;
      }

      const response = await api.get('/admin-bkpsdm/laporan/sertifikat/export-kpk-zip', {
        params,
        responseType: 'blob',
        timeout: 300000
      });

      let filename = '';
      const disposition = response.headers['content-disposition'];
      if (disposition) {
        const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;\n]+)/i);
        if (utf8Match && utf8Match[1]) {
          try {
            filename = decodeURIComponent(utf8Match[1].trim().replace(/['"]/g, ''));
          } catch {
            filename = utf8Match[1].trim().replace(/['"]/g, '');
          }
        } else {
          const match = disposition.match(/filename\s*=\s*((['"]).*?\2|[^;\n]*)/i);
          if (match && match[1]) {
            filename = match[1].trim().replace(/['"]/g, '');
          }
        }
      }
      if (!filename) {
        filename = isBatchMode
          ? `Sertifikat_KPK_Batch_${safeBatchNumber}_dari_${totalBatches}_${new Date().toISOString().slice(0, 10)}.zip`
          : `Sertifikat_KPK_${new Date().toISOString().slice(0, 10)}.zip`;
      }

      const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(fileUrl), 1000);

      setIsExportKpkModalOpen(false);
      fetchReports(currentPage);

      const exportedCountHeader = response.headers['x-total-exported'];
      const batchNumberHeader = response.headers['x-batch-number'];
      const totalBatchesHeader = response.headers['x-total-batches'];
      const batchLabel = isBatchMode
        ? ` (Batch ${batchNumberHeader || safeBatchNumber} dari ${totalBatchesHeader || totalBatches})`
        : '';
      const countLabel = exportedCountHeader ? ` Sebanyak ${exportedCountHeader} berkas PDF dikemas` : ' Berkas PDF di dalamnya dinamai';

      Swal.fire({
        title: 'Ekspor Berhasil',
        text: `Arsip ZIP sertifikat KPK${batchLabel} (${filename}) berhasil diunduh.${countLabel} sesuai NIP peserta.`,
        icon: 'success',
        confirmButtonColor: '#0F766E'
      });
    } catch (err) {
      console.error('Gagal mengunduh ZIP sertifikat KPK:', err);
      let errorMsg = err.code === 'ECONNABORTED'
        ? 'Waktu pengemasan arsip ZIP melebihi batas tunggu. Silakan coba unduh ulang atau gunakan mode per batch.'
        : 'Terjadi kesalahan saat memproses arsip ZIP sertifikat KPK.';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errorMsg = json.message;
        } catch {}
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      Swal.fire({
        title: 'Ekspor Gagal',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#0F766E'
      });
    } finally {
      setIsExportingKpkZip(false);
    }
  };

  // State Import Sertifikat TTE B-Sign
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [coursesForImport, setCoursesForImport] = useState([]);
  const [loadingImportCourses, setLoadingImportCourses] = useState(false);
  const [selectedImportCourse, setSelectedImportCourse] = useState('');
  const [selectedUploadFiles, setSelectedUploadFiles] = useState([]);
  const [isUploadingImport, setIsUploadingImport] = useState(false);

  // State Ekstraksi ZIP & Pencocokan NIP Peserta di Sisi Peramban (Browser)
  const [courseParticipants, setCourseParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [isExtractingZip, setIsExtractingZip] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 });
  const [extractedPdfList, setExtractedPdfList] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // State Summary Report Hasil Import
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [importSummaryResult, setImportSummaryResult] = useState(null);

  // State Modal Preview Sertifikat Ber-TTE
  const [isPreviewCertModalOpen, setIsPreviewCertModalOpen] = useState(false);
  const [previewCertData, setPreviewCertData] = useState(null);

  const fetchCourseParticipants = async (courseId) => {
    if (!courseId) {
      setCourseParticipants([]);
      return [];
    }
    try {
      setLoadingParticipants(true);
      const res = await api.get(`/admin-bkpsdm/laporan/sertifikat/courses/${courseId}/participants`);
      const participants = res.data?.data?.participants || [];
      setCourseParticipants(participants);
      return participants;
    } catch (err) {
      console.error('Gagal mengambil daftar peserta pelatihan:', err);
      setCourseParticipants([]);
      return [];
    } finally {
      setLoadingParticipants(false);
    }
  };

  const fetchCoursesForImport = async (preferredCourseId = null) => {
    try {
      setLoadingImportCourses(true);
      const res = await api.get('/admin-bkpsdm/laporan/sertifikat/courses-for-import');
      const list = (res.data?.data || []).filter((c) => c.is_kpk !== false);
      setCoursesForImport(list);
      if (list.length > 0) {
        const matched = preferredCourseId ? list.find(c => String(c.pembelajaran_id) === String(preferredCourseId)) : null;
        const initialCourseId = matched ? matched.pembelajaran_id : list[0].pembelajaran_id;
        setSelectedImportCourse(initialCourseId);
        await fetchCourseParticipants(initialCourseId);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar kursus untuk impor:', err);
    } finally {
      setLoadingImportCourses(false);
    }
  };

  const handleSelectImportCourse = async (courseId) => {
    setSelectedImportCourse(courseId);
    const newParticipants = await fetchCourseParticipants(courseId);
    if (extractedPdfList.length > 0) {
      const updated = matchFilesWithParticipants(extractedPdfList, newParticipants);
      setExtractedPdfList(updated);
    }
  };

  const extractNipFromFilename = (filename) => {
    const cleanName = filename.replace(/\.[^/.]+$/, '').trim();
    // 1. Pola standar: [NIP] atau [NIP]_sign (8 sampai 21 digit, kompatibel mundur dengan _signed)
    const matchStrict = cleanName.match(/^([0-9]{8,21})(?:_(?:sign|signed))*\s*(?:\(\d+\)|_\d+)?$/i);
    if (matchStrict) return matchStrict[1];

    // 2. Pola batas digit numerik (aman terhadap pemisah underscore '_')
    const matchBoundary = cleanName.match(/(?:^|\D)([0-9]{8,21})(?!\d)/);
    if (matchBoundary) return matchBoundary[1];

    // 3. Fallback digit berurutan
    const matchDigits = cleanName.match(/([0-9]{8,21})/);
    return matchDigits ? matchDigits[1] : null;
  };

  const matchFilesWithParticipants = (pdfEntries, participants) => {
    const participantMap = new Map();
    participants.forEach((p) => {
      const clean = (p.clean_nip || p.nip || '').replace(/[^0-9]/g, '');
      if (clean) participantMap.set(clean, p);
    });

    return pdfEntries.map((entry) => {
      const detectedNip = entry.extracted_nip || extractNipFromFilename(entry.filename);
      const cleanDetectedNip = detectedNip ? detectedNip.replace(/[^0-9]/g, '') : null;
      const matched = cleanDetectedNip ? participantMap.get(cleanDetectedNip) : null;

      return {
        ...entry,
        extracted_nip: detectedNip,
        is_matched: !!matched,
        participant: matched || null,
        error_reason: !matched
          ? (detectedNip ? 'NIP tidak terdaftar pada peserta pelatihan ini' : 'Nomor NIP tidak terdeteksi dari nama berkas')
          : null,
      };
    });
  };

  const handleProcessFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const zipFile = files.find((f) => f.name.toLowerCase().endsWith('.zip'));

    if (zipFile) {
      try {
        setIsExtractingZip(true);
        setExtractedPdfList([]);
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(zipFile);

        const pdfKeys = Object.keys(loadedZip.files).filter((path) => {
          const item = loadedZip.files[path];
          const lower = path.toLowerCase();
          return !item.dir && lower.endsWith('.pdf') && !lower.includes('__macosx') && !lower.split('/').pop().startsWith('.');
        });

        if (pdfKeys.length === 0) {
          Swal.fire({
            title: 'Tidak Ada Berkas PDF',
            text: 'Arsip ZIP yang dipilih tidak memuat berkas berekstensi .pdf di dalamnya.',
            icon: 'warning',
            confirmButtonColor: '#0F766E'
          });
          return;
        }

        setExtractionProgress({ current: 0, total: pdfKeys.length });
        const extracted = [];

        for (let i = 0; i < pdfKeys.length; i++) {
          const key = pdfKeys[i];
          const zipEntry = loadedZip.files[key];
          const blob = await zipEntry.async('blob');
          const rawFilename = key.split('/').pop().split('\\').pop();
          const cleanFilename = rawFilename.trim().replace(/[\r\n"']/g, '');
          const pdfFile = new File([blob], cleanFilename, { type: 'application/pdf' });
          const detectedNip = extractNipFromFilename(cleanFilename);

          extracted.push({
            file: pdfFile,
            filename: cleanFilename,
            extracted_nip: detectedNip,
          });

          setExtractionProgress({ current: i + 1, total: pdfKeys.length });
        }

        const matchedResults = matchFilesWithParticipants(extracted, courseParticipants);
        setExtractedPdfList(matchedResults);
      } catch (err) {
        console.error('Gagal mengekstrak berkas ZIP di browser:', err);
        Swal.fire({
          title: 'Ekstraksi ZIP Gagal',
          text: 'Gagal mengekstrak berkas ZIP di peramban. Pastikan berkas arsip valid atau gunakan berkas PDF langsung.',
          icon: 'error',
          confirmButtonColor: '#0F766E'
        });
      } finally {
        setIsExtractingZip(false);
      }
    } else {
      const pdfFiles = files.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
      if (pdfFiles.length === 0) {
        Swal.fire({
          title: 'Format Berkas Tidak Sesuai',
          text: 'Silakan pilih berkas arsip .ZIP atau kumpulan berkas .PDF.',
          icon: 'warning',
          confirmButtonColor: '#0F766E'
        });
        return;
      }

      const pdfEntries = pdfFiles.map((f) => ({
        file: f,
        filename: f.name,
        extracted_nip: extractNipFromFilename(f.name),
      }));

      const matchedResults = matchFilesWithParticipants(pdfEntries, courseParticipants);
      setExtractedPdfList(matchedResults);
    }
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
    setSelectedUploadFiles([]);
    setExtractedPdfList([]);
    const preferredId = (selectedKpkCourse && selectedKpkCourse !== 'all') ? selectedKpkCourse : null;
    fetchCoursesForImport(preferredId);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFiles(files);
    }
    // Reset file input agar memilih ulang berkas yang sama tetap memicu event onChange
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFiles(files);
    }
  };

  const handleSubmitImport = async (e) => {
    e.preventDefault();
    if (!selectedImportCourse) {
      Swal.fire({
        title: 'Pilih Pelatihan',
        text: 'Silakan pilih pelatihan target terlebih dahulu.',
        icon: 'warning',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    const matchedItems = extractedPdfList.filter((item) => item.is_matched);

    if (matchedItems.length === 0) {
      Swal.fire({
        title: 'Tidak Ada Berkas yang Cocok',
        text: 'Tidak ada berkas PDF yang sesuai dengan NIP peserta terdaftar pada pelatihan ini.',
        icon: 'warning',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Kirim Sertifikat ke Peserta?',
      text: `Sistem akan mengirimkan ${matchedItems.length} berkas sertifikat yang cocok dengan NIP peserta langsung ke akun masing-masing peserta.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Kirim ke ${matchedItems.length} Peserta`,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#6B7280',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setIsUploadingImport(true);
      const formData = new FormData();
      formData.append('pembelajaran_id', selectedImportCourse);

      matchedItems.forEach((item) => {
        formData.append('files[]', item.file, item.filename);
      });

      const res = await api.post('/admin-bkpsdm/laporan/sertifikat/import-tte', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsImportModalOpen(false);
      setExtractedPdfList([]);
      setImportSummaryResult(res.data);
      setIsSummaryModalOpen(true);

      // Refresh data tabel laporan peserta
      fetchReports(currentPage);
    } catch (err) {
      console.error('Gagal mengirim berkas sertifikat TTE:', err);
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat mengunggah berkas TTE.';
      Swal.fire({
        title: 'Pengiriman Gagal',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#0F766E'
      });
    } finally {
      setIsUploadingImport(false);
    }
  };

  const handleDownloadFailureCsv = () => {
    if (!importSummaryResult?.failures || importSummaryResult.failures.length === 0) return;

    const headers = ['Nama Berkas', 'NIP Terdeteksi', 'Kode Kesalahan', 'Alasan'];
    const rows = importSummaryResult.failures.map(f => [
      `"${(f.filename || '').replace(/"/g, '""')}"`,
      `"${(f.extracted_nip || '-').replace(/"/g, '""')}"`,
      `"${(f.error_code || '').replace(/"/g, '""')}"`,
      `"${(f.reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Daftar_Gagal_Import_TTE_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <span class="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold">Skor: ${ulasan.skor_rating || 5} / 5</span>
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
      case 'Selesai':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 border border-green-200 text-green-700">Lulus</span>;
      case 'Menunggu Post Test':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800">Menunggu Post Test</span>;
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
            <button
              onClick={() => setActiveTabReport('teknis')}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTabReport === 'teknis'
                  ? 'text-teal-700 border-b-2 border-teal-700'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              <Headphones className="w-4 h-4 text-teal-600" />
              <span>Laporan Teknis</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-teal-100 text-teal-800 font-bold">
                {teknisStats.total_aduan || 0}
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
                value={ulasanStats.rata_rata_rating ? `${ulasanStats.rata_rata_rating} / 5` : '0.0'}
                icon={Star}
                colorClass="bg-yellow-50"
                iconColorClass="text-yellow-600"
              />
              <StatCard
                title="INDEKS PUAS (>= Skor 4)"
                value={`${ulasanStats.persen_puas || 0}%`}
                icon={ThumbsUp}
                colorClass="bg-green-50"
                iconColorClass="text-green-600"
              />
              <StatCard
                title="PELATIHAN TERULAS"
                value={ulasanStats.pelatihan_terulas ?? new Set(ulasanList.map(u => u.pembelajaran?.pembelajaran_id).filter(Boolean)).size}
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

          {/* Stat Cards - Teknis Tab */}
          {activeTabReport === 'teknis' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                title="TOTAL ADUAN TEKNIS"
                value={teknisStats.total_aduan || 0}
                icon={Headphones}
                colorClass="bg-teal-50"
                iconColorClass="text-teal-600"
              />
              <StatCard
                title="ADUAN TERBUKA"
                value={teknisStats.terbuka || 0}
                icon={AlertCircle}
                colorClass="bg-amber-50"
                iconColorClass="text-amber-600"
              />
              <StatCard
                title="SEDANG DIPROSES"
                value={teknisStats.diproses || 0}
                icon={RefreshCw}
                colorClass="bg-blue-50"
                iconColorClass="text-blue-600"
              />
              <StatCard
                title="SELESAI DITANGANI"
                value={teknisStats.selesai || 0}
                icon={CheckCircle}
                colorClass="bg-emerald-50"
                iconColorClass="text-emerald-600"
              />
            </div>
          )}

          {/* Main Card Container */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                {activeTabReport !== 'validasi' && activeTabReport !== 'teknis' && (
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
                    <option value="5">5 Bintang</option>
                    <option value="4">4 Bintang</option>
                    <option value="3">3 Bintang</option>
                    <option value="2">2 Bintang</option>
                    <option value="1">1 Bintang</option>
                  </select>
                )}

                {activeTabReport === 'teknis' && (
                  <>
                    <select
                      value={selectedRoleFilter}
                      onChange={(e) => setSelectedRoleFilter(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white w-full sm:w-auto"
                    >
                      <option value="">Semua Pelapor</option>
                      <option value="peserta">Peserta</option>
                      <option value="admin_komunitas">Admin Komunitas</option>
                    </select>

                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white w-full sm:w-auto"
                    >
                      <option value="">Semua Status</option>
                      <option value="terbuka">Terbuka (Menunggu)</option>
                      <option value="diproses">Sedang Diproses</option>
                      <option value="selesai">Selesai</option>
                    </select>
                  </>
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
                          : activeTabReport === 'validasi'
                            ? "Cari No. Sertifikat / Nama / NIP / IP..."
                            : "Cari Subjek / Aduan / Nama / NIP..."
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

              {activeTabReport === 'teknis' && (
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatusFilter('');
                      setSelectedRoleFilter('');
                      fetchTeknisReports(1);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    title="Reset Filter & Muat Ulang"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Filter</span>
                  </button>
                </div>
              )}

              {activeTabReport === 'ulasan' && (
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleExportUlasan}
                    disabled={exportingUlasan || loadingUlasan}
                    className="bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 justify-center w-full sm:w-auto cursor-pointer"
                    title="Ekspor data ulasan peserta sesuai filter aktif ke berkas CSV"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>{exportingUlasan ? 'Mengekspor...' : 'Ekspor CSV'}</span>
                  </button>
                </div>
              )}

              {activeTabReport === 'peserta' && (
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  <button
                    onClick={handleExport}
                    className="bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 justify-center flex-1 sm:flex-initial"
                    title="Ekspor rekap tabular seluruh data peserta ke berkas CSV"
                  >
                    <Download className="w-4 h-4" />
                    Ekspor CSV
                  </button>
                  <button
                    onClick={handleOpenExportKpkModal}
                    className="bg-teal-700 text-white hover:bg-teal-800 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 justify-center shadow-sm flex-1 sm:flex-initial"
                    title="Ekspor seluruh berkas sertifikat khusus kursus KPK dalam arsip ZIP berbasis NIP"
                  >
                    <FileArchive className="w-4 h-4 text-teal-200" />
                    Export Sertifikat KPK (.ZIP)
                  </button>
                  <button
                    onClick={handleOpenImportModal}
                    className="bg-emerald-700 text-white hover:bg-emerald-800 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 justify-center shadow-sm flex-1 sm:flex-initial"
                    title="Impor kumpulan berkas sertifikat ber-TTE B-Sign (ZIP atau Multi-PDF)"
                  >
                    <Upload className="w-4 h-4 text-emerald-200" />
                    Import Sertifikat TTE
                  </button>
                </div>
              )}
            </div>

            {/* Table: Laporan Peserta */}
            {activeTabReport === 'peserta' && (
              <>
              <div className="overflow-x-auto relative">
                {tableLoading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 text-sm font-medium text-teal-700">
                      <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      Memuat data...
                    </div>
                  </div>
                )}
                <table className="w-full text-left border-collapse min-w-[1240px]">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">NAMA PESERTA / NIP</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PEMBELAJARAN</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">KOMUNITAS</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PROGRES (%)</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">STATUS POST TEST</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">SERTIFIKAT</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">RATING & ULASAN</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">PREVIEW SERTIFIKAT</th>
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {report.isKpk && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0" title="Kategori Kursus Antikorupsi (KPK)">
                                KPK
                              </span>
                            )}
                            <p className="font-bold text-gray-800 text-sm">{report.course}</p>
                          </div>
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
                            <div className="flex flex-col items-start gap-1">
                              {/* Badge Status TTE */}
                              {report.statusTte === 'signed' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Ber-TTE Resmi
                                </span>
                              ) : report.statusTte === 'exported_for_tte' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  Menunggu TTE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                  Draft Siap
                                </span>
                              )}

                              <button
                                onClick={() => handleViewCertificate(report)}
                                className="text-teal-700 hover:text-teal-800 font-bold text-xs flex items-center gap-1.5 transition-colors mt-0.5"
                                title={report.isKpk ? `Unduh Sertifikat Berbasis NIP: ${report.nip}.pdf` : 'Unduh Sertifikat'}
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>{report.isKpk ? 'Sertifikat (NIP)' : 'Lihat Sertifikat'}</span>
                              </button>
                            </div>
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
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {report.hasCertificate && (report.statusTte === 'signed' || !report.isKpk) ? (
                            <button
                              type="button"
                              onClick={() => handleOpenPreviewCertificate(report)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-xs"
                              title={report.isKpk ? `Pratinjau Sertifikat Ber-TTE Resmi (${report.nip}.pdf)` : 'Pratinjau Sertifikat'}
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Preview</span>
                            </button>
                          ) : report.hasCertificate && report.statusTte !== 'signed' ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                              title="Sertifikat masih dalam proses / menunggu TTE B-Sign BSrE"
                            >
                              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                              <span>Belum TTE</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 font-bold">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                          {searchTerm ? 'Tidak ada laporan peserta yang sesuai dengan pencarian.' : 'Tidak ada laporan peserta.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <TablePagination
                currentPage={currentPage}
                lastPage={paginationMeta.last_page}
                total={paginationMeta.total}
                from={paginationMeta.from}
                to={paginationMeta.to}
                itemLabel="data peserta"
                loading={tableLoading}
                onPageChange={setCurrentPage}
              />
            </>
            )}

            {/* Table: Ulasan & Feedback Mutu Pelatihan */}
            {activeTabReport === 'ulasan' && (
              <>
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
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-600" role="status">
                            Memuat data ulasan mutu pelatihan...
                          </td>
                        </tr>
                      ) : ulasanError ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div role="alert" className="max-w-md mx-auto space-y-2">
                              <AlertCircle className="w-8 h-8 text-red-700 mx-auto" aria-hidden="true" />
                              <p className="font-bold text-gray-800 text-sm">Gagal Memuat Ulasan</p>
                              <p className="text-xs text-gray-600">{ulasanError}</p>
                              <button
                                type="button"
                                onClick={() => fetchUlasanReports(ulasanPagination.current_page || 1)}
                                className="mt-1 min-h-11 lg:min-h-9 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                              >
                                Coba Lagi
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : ulasanList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-600">
                            <div className="max-w-md mx-auto text-center space-y-2">
                              <Star className="w-8 h-8 text-amber-500 mx-auto fill-amber-50" aria-hidden="true" />
                              <p className="font-bold text-gray-800 text-sm">Belum Ada Ulasan Peserta</p>
                              <p className="text-xs text-gray-600">Data ulasan akan tampil di sini saat peserta telah menyelesaikan pelatihan dan mengisi ulasan kepuasan.</p>
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
                                  <p className="text-xs text-gray-600">{rev.peserta?.nip || '-'} • {rev.peserta?.unit_kerja || 'Pemerintah Kabupaten Buleleng'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-gray-800 text-sm">{rev.pembelajaran?.judul_pembelajaran || '-'}</p>
                              <span className="inline-block mt-1 text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium">
                                {(!rev.pembelajaran?.nama_komunitas || rev.pembelajaran?.nama_komunitas === 'BKPSDM' || rev.pembelajaran?.nama_komunitas === 'Komunitas BKPSDM') ? '-' : rev.pembelajaran.nama_komunitas}
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
                            <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
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

                <TablePagination
                  currentPage={ulasanPagination.current_page}
                  lastPage={ulasanPagination.last_page}
                  total={ulasanPagination.total}
                  from={ulasanPagination.from}
                  to={ulasanPagination.to}
                  itemLabel="ulasan"
                  loading={loadingUlasan}
                  onPageChange={(page) => fetchUlasanReports(page)}
                />
              </>
            )}

            {/* Table: Riwayat Validasi & Scan QR Sertifikat */}
            {activeTabReport === 'validasi' && (
              <>
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
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-600" role="status">
                            Memuat data riwayat validasi sertifikat...
                          </td>
                        </tr>
                      ) : validasiError ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div role="alert" className="max-w-md mx-auto space-y-2">
                              <AlertCircle className="w-8 h-8 text-red-700 mx-auto" aria-hidden="true" />
                              <p className="font-bold text-gray-800 text-sm">Gagal Memuat Riwayat Validasi</p>
                              <p className="text-xs text-gray-600">{validasiError}</p>
                              <button
                                type="button"
                                onClick={() => fetchValidasiReports(validasiPagination.current_page || 1)}
                                className="mt-1 min-h-11 lg:min-h-9 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                              >
                                Coba Lagi
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : validasiList.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-600">
                            <div className="max-w-md mx-auto text-center space-y-2">
                              <QrCode className="w-8 h-8 text-emerald-600 mx-auto" aria-hidden="true" />
                              <p className="font-bold text-gray-800 text-sm">Belum Ada Riwayat Pemindaian QR</p>
                              <p className="text-xs text-gray-600">Setiap kali QR Code pada sertifikat di-scan atau diverifikasi via tautan publik, data log pemindaian otomatis tersimpan di sini.</p>
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
                                <p className="text-gray-600">
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
                                  <p className="text-[11px] text-gray-600 font-mono mt-1 truncate max-w-[180px]" title={log.sertifikat.verification_code}>
                                    Kode: {log.sertifikat.verification_code.substring(0, 16)}...
                                  </p>
                                )}
                              </td>

                              <td className="px-6 py-4">
                                <p className="font-bold text-gray-800 text-sm mb-0.5">{recipientName}</p>
                                <p className="text-xs text-gray-600 font-mono">NIP. {recipientNip}</p>
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
                                <p className="text-xs font-mono text-gray-600">{log.ip_address || '-'}</p>
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
                                      type="button"
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
                </div>

                <TablePagination
                  currentPage={validasiPagination.current_page}
                  lastPage={validasiPagination.last_page}
                  total={validasiPagination.total}
                  from={validasiPagination.from}
                  to={validasiPagination.to}
                  itemLabel="log scan"
                  loading={loadingValidasi}
                  onPageChange={(page) => fetchValidasiReports(page)}
                />
              </>
            )}

            {/* Table: Laporan Aduan Teknis (Peserta & Admin Komunitas) */}
            {activeTabReport === 'teknis' && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead>
                      <tr className="bg-white border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-16 text-center">NO</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PELAPOR</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">TIPE PELAPOR</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">SUBJEK & KENDALA</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">WAKTU ADUAN</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">STATUS</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">PENANGAN</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingTeknis ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-gray-600" role="status">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
                              <span>Memuat data laporan aduan teknis...</span>
                            </div>
                          </td>
                        </tr>
                      ) : teknisError ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center">
                            <div role="alert" className="max-w-md mx-auto space-y-2">
                              <AlertCircle className="w-8 h-8 text-red-600 mx-auto" aria-hidden="true" />
                              <p className="font-bold text-gray-800 text-sm">Gagal Memuat Aduan Teknis</p>
                              <p className="text-xs text-gray-600">{teknisError}</p>
                              <button
                                type="button"
                                onClick={() => fetchTeknisReports(teknisPagination.current_page || 1)}
                                className="mt-1 min-h-11 lg:min-h-9 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                              >
                                Coba Lagi
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : teknisList.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-gray-600">
                            <div className="max-w-md mx-auto text-center space-y-2">
                              <Headphones className="w-8 h-8 text-teal-600 mx-auto" aria-hidden="true" />
                              <p className="font-bold text-gray-800 text-sm">Tidak Ada Aduan Teknis</p>
                              <p className="text-xs text-gray-600">
                                {searchTerm || selectedStatusFilter || selectedRoleFilter
                                  ? 'Tidak ditemukan aduan teknis yang sesuai dengan kriteria filter pencarian Anda.'
                                  : 'Belum ada aduan atau tiket kendala teknis yang dikirimkan oleh Peserta maupun Admin Komunitas.'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        teknisList.map((tiket, idx) => {
                          const rowNumber = (teknisPagination.current_page - 1) * teknisPagination.per_page + idx + 1;
                          const pelapor = tiket.pelapor || {};
                          const isAdmin = pelapor.tipe_pelapor === 'admin_komunitas';

                          return (
                            <tr key={tiket.help_tiket_id} className="hover:bg-gray-50/50 transition-colors">
                              {/* NO */}
                              <td className="px-6 py-4 text-xs font-semibold text-gray-500 text-center">
                                {rowNumber}
                              </td>

                              {/* PELAPOR */}
                              <td className="px-6 py-4">
                                <p className="font-bold text-gray-900 text-sm mb-0.5">{pelapor.nama_lengkap}</p>
                                <p className="text-xs text-gray-500 font-mono">NIP. {pelapor.nip}</p>
                                <p className="text-xs text-gray-400 truncate max-w-[200px]" title={pelapor.unit_kerja}>
                                  {pelapor.unit_kerja}
                                </p>
                              </td>

                              {/* TIPE PELAPOR */}
                              <td className="px-6 py-4">
                                {isAdmin ? (
                                  <div className="flex flex-col items-start gap-1">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                      Admin Komunitas
                                    </span>
                                    {pelapor.nama_komunitas && pelapor.nama_komunitas !== '-' && (
                                      <span className="text-[11px] text-gray-500 font-medium truncate max-w-[150px]" title={pelapor.nama_komunitas}>
                                        {pelapor.nama_komunitas}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    Peserta
                                  </span>
                                )}
                              </td>

                              {/* SUBJEK & KENDALA */}
                              <td className="px-6 py-4 max-w-xs sm:max-w-sm">
                                <p className="font-bold text-gray-900 text-sm mb-1 line-clamp-1" title={tiket.subjek}>
                                  {tiket.subjek}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed" title={tiket.deskripsi}>
                                  {tiket.deskripsi}
                                </p>
                              </td>

                              {/* WAKTU ADUAN */}
                              <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                                <p className="font-bold text-gray-800">
                                  {tiket.dibuat_pada ? new Date(tiket.dibuat_pada).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  }) : '-'}
                                </p>
                                <p className="text-gray-500">
                                  {tiket.dibuat_pada ? new Date(tiket.dibuat_pada).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }) + ' WITA' : '-'}
                                </p>
                              </td>

                              {/* STATUS */}
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                {tiket.status === 'selesai' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    Selesai
                                  </span>
                                ) : tiket.status === 'diproses' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                    Diproses
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                    Terbuka
                                  </span>
                                )}
                              </td>

                              {/* PENANGAN */}
                              <td className="px-6 py-4 text-xs text-gray-600">
                                {tiket.penangan ? (
                                  <div>
                                    <p className="font-semibold text-gray-800">{tiket.penangan.nama_lengkap}</p>
                                    <p className="text-[11px] text-gray-400 font-mono">NIP. {tiket.penangan.nip}</p>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Belum ditangani</span>
                                )}
                              </td>

                              {/* AKSI */}
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => setSelectedTiketDetail(tiket)}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
                                  title="Lihat Detail & Tindak Lanjut"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Detail</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  currentPage={teknisPagination.current_page}
                  lastPage={teknisPagination.last_page}
                  total={teknisPagination.total}
                  from={teknisPagination.from}
                  to={teknisPagination.to}
                  itemLabel="aduan teknis"
                  loading={loadingTeknis}
                  onPageChange={(page) => fetchTeknisReports(page)}
                />
              </>
            )}

          </div>

        </div>
      </div>

      {/* Modal Ekspor Sertifikat Khusus Kursus KPK */}
      {isExportKpkModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-kpk-modal-title"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-teal-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FileArchive className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="export-kpk-modal-title" className="text-base font-bold text-gray-900">Ekspor Sertifikat Kursus KPK</h3>
                  <p className="text-xs text-gray-600">Unduh seluruh berkas PDF dalam format NIP (.ZIP)</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Tutup modal ekspor sertifikat KPK"
                onClick={() => !isExportingKpkZip && setIsExportKpkModalOpen(false)}
                disabled={isExportingKpkZip}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Pilihan Pelatihan KPK */}
              <div>
                <label htmlFor="export-kpk-course-select" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pilih Kursus KPK
                </label>
                {loadingKpkCourses ? (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Memuat daftar pelatihan KPK...</span>
                  </div>
                ) : (
                  <select
                    id="export-kpk-course-select"
                    value={selectedKpkCourse}
                    onChange={(e) => {
                      setSelectedKpkCourse(e.target.value);
                      setExportKpkBatchNumber(1);
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    <option value="all">
                      Semua Kursus KPK ({kpkCoursesList.reduce((acc, c) => acc + (c.total_pending_tte || 0), 0)} Belum TTE / {kpkCoursesList.reduce((acc, c) => acc + (c.total_lulus || 0), 0)} Total Lulus)
                    </option>
                    {kpkCoursesList.map((course) => (
                      <option key={course.pembelajaran_id} value={course.pembelajaran_id}>
                        {course.judul_pembelajaran} ({course.total_pending_tte || 0} Belum TTE, {course.total_signed_tte || 0} Selesai Ber-TTE)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Cakupan Berkas (Proteksi Anti-Repetisi) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Cakupan Berkas (Proteksi Anti-Repetisi)
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      exportKpkScope === 'pending_tte'
                        ? 'border-emerald-600 bg-emerald-50/50 text-gray-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportKpkScope"
                      value="pending_tte"
                      checked={exportKpkScope === 'pending_tte'}
                      onChange={() => {
                        setExportKpkScope('pending_tte');
                        setExportKpkBatchNumber(1);
                      }}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-800">Hanya yang Belum Ber-TTE (Menunggu B-Sign)</p>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          Rekomendasi
                        </span>
                      </div>
                      <p className="text-gray-600 mt-0.5">
                        Menyaring hanya peserta yang membutuhkan TTE. Berkas yang sudah ber-TTE resmi otomatis dilewati agar tidak terjadi pengajuan repetitif ke B-Sign.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      exportKpkScope === 'all'
                        ? 'border-amber-600 bg-amber-50/50 text-gray-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportKpkScope"
                      value="all"
                      checked={exportKpkScope === 'all'}
                      onChange={() => {
                        setExportKpkScope('all');
                        setExportKpkBatchNumber(1);
                      }}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs flex-1">
                      <p className="font-bold text-gray-800">Semua Peserta Lulus (Termasuk yang Sudah Ber-TTE)</p>
                      <p className="text-gray-600 mt-0.5">
                        Mengemas seluruh berkas sertifikat untuk kebutuhan arsip/cadangan. Jangan diajukan ulang ke B-Sign jika sertifikat sudah ber-TTE.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Pilihan Format Nama File */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Format Penamaan Berkas PDF di Dalam ZIP
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      exportKpkFormat === 'nip'
                        ? 'border-teal-600 bg-teal-50/50 text-gray-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportKpkFormat"
                      value="nip"
                      checked={exportKpkFormat === 'nip'}
                      onChange={() => setExportKpkFormat('nip')}
                      className="mt-0.5 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-gray-800">[NIP].pdf (Standar)</p>
                      <p className="text-gray-600 mt-0.5">Contoh: <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[11px]">199001012020121001.pdf</code></p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      exportKpkFormat === 'nip_sign'
                        ? 'border-teal-600 bg-teal-50/50 text-gray-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportKpkFormat"
                      value="nip_sign"
                      checked={exportKpkFormat === 'nip_sign'}
                      onChange={() => setExportKpkFormat('nip_sign')}
                      className="mt-0.5 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-gray-800">[NIP]_sign.pdf (Format TTE B-Sign BSrE)</p>
                      <p className="text-gray-600 mt-0.5">Contoh: <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[11px]">199001012020121001_sign.pdf</code></p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Opsi Pembagian Batch Ekspor (Aturan per 20 Sertifikat) */}
              {targetExportCount > EXPORT_KPK_BATCH_SIZE ? (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Aturan Ekspor per {EXPORT_KPK_BATCH_SIZE} Sertifikat (Ringan)
                    </label>
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                      Total: {targetExportCount} Berkas ({totalBatches} Batch)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`p-3 rounded-xl border transition-colors ${
                        exportKpkBatchMode === 'batch'
                          ? 'border-teal-600 bg-teal-50/50 text-gray-900'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="exportKpkBatchMode"
                          value="batch"
                          checked={exportKpkBatchMode === 'batch'}
                          onChange={() => setExportKpkBatchMode('batch')}
                          className="mt-0.5 text-teal-600 focus:ring-teal-500"
                        />
                        <div className="text-xs flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-gray-800">Ekspor per Batch {EXPORT_KPK_BATCH_SIZE} Berkas</p>
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              Rekomendasi B-Sign
                            </span>
                          </div>
                          <p className="text-gray-600 mt-0.5">
                            Membatasi per {EXPORT_KPK_BATCH_SIZE} sertifikat agar beban server ringan dan praktis untuk proses batch signing di aplikasi B-Sign.
                          </p>
                        </div>
                      </label>

                      {exportKpkBatchMode === 'batch' && (
                        <div className="mt-3 pt-2.5 border-t border-teal-100 pl-6">
                          <p className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                            Pilih Batch Berkas yang Ingin Diunduh:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-0.5">
                            {Array.from({ length: totalBatches }, (_, i) => {
                              const bNum = i + 1;
                              const startIdx = (bNum - 1) * EXPORT_KPK_BATCH_SIZE + 1;
                              const endIdx = Math.min(bNum * EXPORT_KPK_BATCH_SIZE, targetExportCount);
                              const count = endIdx - startIdx + 1;
                              const isSelected = safeBatchNumber === bNum;

                              return (
                                <button
                                  key={bNum}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() => setExportKpkBatchNumber(bNum)}
                                  className={`min-h-[44px] py-2 px-2.5 rounded-lg text-xs font-semibold border text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                                    isSelected
                                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400 hover:bg-teal-50/50'
                                  }`}
                                >
                                  <div>Batch {bNum}</div>
                                  <div className={`text-[10px] font-normal ${isSelected ? 'text-teal-100' : 'text-gray-600'}`}>
                                    {startIdx}-{endIdx} ({count} berkas)
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        exportKpkBatchMode === 'all'
                          ? 'border-amber-600 bg-amber-50/50 text-gray-900'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="exportKpkBatchMode"
                        value="all"
                        checked={exportKpkBatchMode === 'all'}
                        onChange={() => setExportKpkBatchMode('all')}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div className="text-xs flex-1">
                        <p className="font-bold text-gray-800">Ekspor Sekaligus Seluruh Berkas ({targetExportCount} Berkas)</p>
                        <p className="text-gray-600 mt-0.5">
                          Mengemas seluruh {targetExportCount} sertifikat dalam 1 arsip ZIP sekaligus tanpa pembagian batch.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : targetExportCount > 0 ? (
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                    <span>Total target: <strong>{targetExportCount} berkas</strong> (&le; {EXPORT_KPK_BATCH_SIZE}, otomatis 1 batch ringkas).</span>
                  </div>
                  <span className="text-[10px] font-bold bg-teal-200/80 text-teal-900 px-2 py-0.5 rounded-full shrink-0">
                    Aturan {EXPORT_KPK_BATCH_SIZE}/Batch
                  </span>
                </div>
              ) : null}

              {/* Status Banner Proteksi Anti-Repetisi */}
              {exportKpkScope === 'pending_tte' && isKpkPendingEmpty && !loadingKpkCourses ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-emerald-900">Seluruh Sertifikat Telah Ber-TTE Resmi</p>
                    <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                      Semua peserta lulus pada kursus KPK yang dipilih ({selectedKpkCourseData.total_signed_tte} peserta) telah memiliki sertifikat resmi ber-TTE B-Sign. Tidak ada berkas baru yang perlu diajukan kembali ke B-Sign.
                    </p>
                  </div>
                </div>
              ) : exportKpkScope === 'pending_tte' && !isKpkPendingEmpty ? (
                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-teal-900">Proteksi Anti-Repetisi Aktif</p>
                    <p className="text-teal-800 text-[11px] mt-0.5 leading-relaxed">
                      Sistem hanya akan mengemas <strong>{selectedKpkCourseData.total_pending_tte} berkas</strong> yang belum ber-TTE. Sebanyak <strong>{selectedKpkCourseData.total_signed_tte} berkas</strong> yang telah ditandatangani resmi otomatis dilewati dari arsip ZIP.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-amber-900">Mode Ekspor Seluruh Berkas</p>
                    <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                      Arsip ZIP akan memuat seluruh berkas ({selectedKpkCourseData.total_lulus} berkas), termasuk yang telah sah ber-TTE. Harap tidak mengajukan ulang berkas yang sudah sah ke B-Sign.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsExportKpkModalOpen(false)}
                disabled={isExportingKpkZip}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-white hover:text-gray-800 transition-colors disabled:opacity-40"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDownloadKpkZip}
                disabled={
                  isExportingKpkZip ||
                  loadingKpkCourses ||
                  kpkCoursesList.length === 0 ||
                  (exportKpkScope === 'pending_tte' && isKpkPendingEmpty)
                }
                className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingKpkZip ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mengemas ZIP...</span>
                  </>
                ) : exportKpkScope === 'pending_tte' && isKpkPendingEmpty ? (
                  <>
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Semua Sudah Ber-TTE</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {totalBatches > 1 && exportKpkBatchMode === 'batch'
                        ? `Unduh Batch ${safeBatchNumber} (${selectedBatchCount} Berkas .ZIP)`
                        : `Unduh ${targetExportCount} Berkas .ZIP`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Unggah Berkas Sertifikat TTE (B-Sign) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Unggah Sertifikat TTE B-Sign</h3>
                  <p className="text-xs text-emerald-100 font-medium">Impor berkas sertifikat yang telah ditandatangani elektronik</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isUploadingImport && setIsImportModalOpen(false)}
                disabled={isUploadingImport}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitImport} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Pilihan Pelatihan Target */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Pilih Pelatihan Target (Khusus KPK) <span className="text-rose-500">*</span>
                  </label>
                  {loadingParticipants && (
                    <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                      <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      Memuat data peserta...
                    </span>
                  )}
                </div>
                {loadingImportCourses ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    Memuat daftar pelatihan KPK...
                  </div>
                ) : coursesForImport.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    Belum ada pelatihan KPK yang memiliki data kelulusan peserta.
                  </div>
                ) : (
                  <select
                    value={selectedImportCourse}
                    onChange={(e) => handleSelectImportCourse(e.target.value)}
                    disabled={isUploadingImport || isExtractingZip}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-800 font-medium disabled:bg-gray-100"
                  >
                    {coursesForImport.map((c) => (
                      <option key={c.pembelajaran_id} value={c.pembelajaran_id}>
                        {c.judul_pembelajaran} ({c.total_lulus} Peserta Lulus) [KPK]
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>
                    {courseParticipants.length > 0
                      ? `Terdapat ${courseParticipants.length} data peserta lulus yang siap diverifikasi dengan NIP berkas.`
                      : 'Memuat data NIP peserta pelatihan ini...'}
                  </span>
                </p>
              </div>

              {/* Sedang Mengekstrak ZIP */}
              {isExtractingZip && (
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 animate-pulse">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Mengekstrak Berkas ZIP di Browser...
                    </h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      {extractionProgress.total > 0
                        ? `Memproses ${extractionProgress.current} dari ${extractionProgress.total} berkas PDF...`
                        : 'Membaca struktur direktori arsip...'}
                    </p>
                  </div>
                  {extractionProgress.total > 0 && (
                    <div className="w-full max-w-xs mx-auto bg-emerald-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 transition-all duration-200"
                        style={{ width: `${Math.round((extractionProgress.current / extractionProgress.total) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {/* Dropzone Upload */}
              {!isExtractingZip && extractedPdfList.length === 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Berkas ZIP / Kumpulan PDF Hasil TTE <span className="text-rose-500">*</span>
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('tteFileInput')?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-emerald-600 bg-emerald-50/60 scale-[1.01]'
                        : 'border-gray-300 hover:border-emerald-500 bg-gray-50/70 hover:bg-emerald-50/20'
                    }`}
                  >
                    <input
                      id="tteFileInput"
                      type="file"
                      multiple
                      accept=".zip,.pdf,application/pdf,application/zip,application/x-zip-compressed"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploadingImport || isExtractingZip}
                    />
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100/70 flex items-center justify-center text-emerald-700 mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                      Pilih atau Tarik Berkas .ZIP ke Sini
                    </p>
                    <p className="text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed">
                      Sistem akan langsung mengekstrak arsip <strong>.ZIP</strong> di peramban, mengenali nomor NIP pada nama berkas, dan memvalidasinya terhadap data peserta pelatihan target.
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-mono">
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200">[NIP]_sign.pdf</span>
                      <span>atau</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200">[NIP].pdf</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hasil Ekstraksi & Pencocokan NIP */}
              {!isExtractingZip && extractedPdfList.length > 0 && (
                <div className="space-y-4">
                  {/* Stat Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total PDF</p>
                      <p className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">{extractedPdfList.length}</p>
                      <p className="text-[10px] text-gray-500">berkas diekstrak</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                      <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Cocok dg Peserta</p>
                      <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">
                        {extractedPdfList.filter((item) => item.is_matched).length}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium">siap dikirim</p>
                    </div>

                    <div className={`border rounded-xl p-3 text-center ${
                      extractedPdfList.some((item) => !item.is_matched)
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <p className={`text-[11px] font-semibold uppercase tracking-wider ${
                        extractedPdfList.some((item) => !item.is_matched) ? 'text-amber-700' : 'text-gray-500'
                      }`}>
                        Tidak Cocok
                      </p>
                      <p className={`text-xl sm:text-2xl font-black mt-0.5 ${
                        extractedPdfList.some((item) => !item.is_matched) ? 'text-amber-800' : 'text-gray-800'
                      }`}>
                        {extractedPdfList.filter((item) => !item.is_matched).length}
                      </p>
                      <p className={`text-[10px] ${
                        extractedPdfList.some((item) => !item.is_matched) ? 'text-amber-600' : 'text-gray-500'
                      }`}>
                        dilewati / bukan peserta
                      </p>
                    </div>
                  </div>

                  {/* Header & Reset Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Pratinjau Hasil Ekstraksi & Pencocokan NIP
                    </span>
                    <button
                      type="button"
                      onClick={() => setExtractedPdfList([])}
                      disabled={isUploadingImport}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Ganti Berkas / Ekstrak Ulang</span>
                    </button>
                  </div>

                  {/* Table of Extracted Files */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2">Nama Berkas</th>
                          <th className="px-3 py-2">NIP Terdeteksi</th>
                          <th className="px-3 py-2">Nama Peserta Terdaftar</th>
                          <th className="px-3 py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {extractedPdfList.map((item, idx) => (
                          <tr key={idx} className={item.is_matched ? 'hover:bg-emerald-50/40' : 'bg-amber-50/20 hover:bg-amber-50/40'}>
                            <td className="px-3 py-2 font-mono text-[11px] text-gray-900 truncate max-w-[140px]" title={item.filename}>
                              <div className="flex items-center gap-1.5">
                                <FileText className={`w-3.5 h-3.5 shrink-0 ${item.is_matched ? 'text-emerald-600' : 'text-gray-400'}`} />
                                <span className="truncate">{item.filename}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 font-mono text-[11px] text-gray-800">
                              {item.extracted_nip || '-'}
                            </td>
                            <td className="px-3 py-2">
                              {item.participant ? (
                                <div className="leading-tight">
                                  <div className="font-semibold text-gray-900 text-xs">{item.participant.nama_lengkap}</div>
                                  <div className="text-[10px] text-emerald-600 font-medium">Status: {item.participant.status_pendaftaran}</div>
                                </div>
                              ) : (
                                <span className="text-amber-700 italic text-[11px]">NIP Tidak Terdaftar</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {item.is_matched ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Cocok (Siap Kirim)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  Dilewati
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Catatan pengiriman */}
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Hanya berkas dengan status <strong>Cocok (Siap Kirim)</strong> yang akan diunggah dan dikirimkan ke akun peserta. Berkas yang tidak cocok otomatis dilewati.
                  </p>
                </div>
              )}

              {/* Informative Guidance */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Mekanisme Keamanan & Validasi Otomatis:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-[11px] leading-relaxed pl-1">
                  <li>Validasi struktur PDF (%PDF- & %%EOF) dan proteksi path sanitization (anti Zip-Slip).</li>
                  <li>Draft PDF internal akan otomatis dibersihkan dan digantikan berkas resmi ber-TTE.</li>
                  <li>Membuka langsung akses unduh sertifikat bagi peserta tanpa masa tunggu pending cooldown 3 hari.</li>
                </ul>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  disabled={isUploadingImport}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-white hover:text-gray-800 transition-colors disabled:opacity-40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isUploadingImport ||
                    isExtractingZip ||
                    extractedPdfList.filter((item) => item.is_matched).length === 0
                  }
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengirim Berkas ke Peserta...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {extractedPdfList.filter((item) => item.is_matched).length > 0
                          ? `Kirim File ke ${extractedPdfList.filter((item) => item.is_matched).length} Peserta`
                          : 'Kirim File ke Peserta'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ringkasan Hasil Impor TTE */}
      {isSummaryModalOpen && importSummaryResult && (() => {
        const totalFilesCount = importSummaryResult.total_files ?? importSummaryResult.summary?.total_diproses ?? 0;
        const successFilesCount = importSummaryResult.success_count ?? importSummaryResult.summary?.total_berhasil ?? 0;
        const failedFilesCount = importSummaryResult.failed_count ?? importSummaryResult.summary?.total_gagal ?? (importSummaryResult.failures?.length || 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 to-slate-800 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Ringkasan Hasil Impor TTE</h3>
                    <p className="text-xs text-gray-200 font-medium">Laporan verifikasi dan pemrosesan berkas sertifikat B-Sign</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSummaryModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Berkas</p>
                    <p className="text-2xl font-black text-gray-900">{totalFilesCount}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">diperiksa dari unggahan</p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-center">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Berhasil Diperbarui</p>
                    <p className="text-2xl font-black text-emerald-800">{successFilesCount}</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">status TTE: signed</p>
                  </div>
                  <div className={`border rounded-xl p-3.5 text-center ${
                    failedFilesCount > 0
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                      failedFilesCount > 0 ? 'text-amber-700' : 'text-gray-500'
                    }`}>
                      Gagal / Dilewati
                    </p>
                    <p className={`text-2xl font-black ${
                      failedFilesCount > 0 ? 'text-amber-800' : 'text-gray-800'
                    }`}>
                      {failedFilesCount}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${
                      failedFilesCount > 0 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      tidak cocok / berkas rusak
                    </p>
                  </div>
                </div>

                {/* Status Banner */}
                {failedFilesCount === 0 ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Seluruh berkas sertifikat berhasil diverifikasi dan disinkronkan ke akun peserta pelatihan.</span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Perhatian: </span>
                      <span>Terdapat {failedFilesCount} berkas yang gagal diproses. Berkas yang gagal tidak memengaruhi berkas yang telah berhasil diimpor.</span>
                    </div>
                  </div>
                )}

              {/* Detail Failure Table */}
              {importSummaryResult.failures && importSummaryResult.failures.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Daftar Berkas Gagal ({importSummaryResult.failures.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleDownloadFailureCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Laporan Gagal (.CSV)</span>
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2">Nama Berkas</th>
                          <th className="px-3 py-2">NIP Terdeteksi</th>
                          <th className="px-3 py-2">Kode Masalah</th>
                          <th className="px-3 py-2">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {importSummaryResult.failures.map((f, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/80">
                            <td className="px-3 py-2 font-mono text-[11px] text-gray-900 truncate max-w-[140px]" title={f.filename}>
                              {f.filename}
                            </td>
                            <td className="px-3 py-2 font-mono text-[11px]">{f.extracted_nip || '-'}</td>
                            <td className="px-3 py-2">
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
                                {f.error_code}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600">{f.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Modal Preview Sertifikat Ber-TTE */}
      {isPreviewCertModalOpen && previewCertData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                  <FileCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      Pratinjau Sertifikat — {previewCertData.report?.name || 'Peserta'}
                    </h3>
                    {previewCertData.report?.statusTte === 'signed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-emerald-300" />
                        Ber-TTE Resmi BSrE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
                        Sertifikat Terbit
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 truncate mt-0.5 font-medium">
                    NIP: {previewCertData.report?.nip || '-'} • Kursus: {previewCertData.report?.course || '-'}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                {previewCertData.blobUrl && (
                  <>
                    <a
                      href={previewCertData.blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                      title="Buka sertifikat di tab browser baru"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tab Baru</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleDownloadFromPreview}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                      title="Unduh salinan berkas PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Unduh PDF</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleClosePreviewModal}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Tutup pratinjau"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / PDF Viewer */}
            <div className="flex-1 bg-gray-100 p-2 sm:p-4 overflow-hidden flex flex-col justify-center items-center relative min-h-[500px]">
              {previewCertData.loading ? (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-gray-700">Memuat pratinjau dokumen sertifikat...</p>
                  <p className="text-xs text-gray-500">Mengambil berkas PDF resmi dari penyimpanan sistem</p>
                </div>
              ) : previewCertData.error ? (
                <div className="p-6 bg-white border border-rose-200 rounded-2xl max-w-md text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Gagal Memuat Pratinjau</h4>
                    <p className="text-xs text-gray-600 mt-1">{previewCertData.error}</p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPreviewCertificate(previewCertData.report)}
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Coba Lagi</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClosePreviewModal}
                      className="px-3.5 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              ) : previewCertData.blobUrl ? (
                <iframe
                  src={`${previewCertData.blobUrl}#toolbar=1&navpanes=0`}
                  title={`Sertifikat ${previewCertData.report?.name || ''}`}
                  className="w-full h-full min-h-[70vh] rounded-xl border border-gray-300 shadow-inner bg-white"
                />
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {previewCertData.report?.statusTte === 'signed'
                    ? 'Dokumen resmi ber-TTE B-Sign BSrE BSSN • Berkas telah dikirimkan ke akun peserta'
                    : 'Dokumen Sertifikat Digital LMS Buleleng ASN CORPU'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClosePreviewModal}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Aduan Teknis */}
      {selectedTiketDetail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-tiket-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTiketDetail(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100/80 flex items-center justify-center text-teal-700 shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="modal-tiket-title" className="font-bold text-gray-900 text-base leading-snug">
                    Detail Aduan & Tiket Kendala
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    ID: {selectedTiketDetail.help_tiket_id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTiketDetail(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Tutup detail aduan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {/* Status & Asal Pelapor Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Status Saat Ini:</span>
                  {selectedTiketDetail.status === 'selesai' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Selesai Ditangani
                    </span>
                  ) : selectedTiketDetail.status === 'diproses' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Sedang Diproses
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Terbuka (Menunggu Tindak Lanjut)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500">Tipe Pelapor:</span>
                  {selectedTiketDetail.pelapor?.tipe_pelapor === 'admin_komunitas' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                      Admin Komunitas
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      Peserta
                    </span>
                  )}
                </div>
              </div>

              {/* Identitas Pelapor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-gray-100 bg-white">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Nama Pelapor</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {selectedTiketDetail.pelapor?.nama_lengkap || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">NIP</p>
                  <p className="text-sm font-mono font-semibold text-gray-700 mt-0.5">
                    {selectedTiketDetail.pelapor?.nip || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Unit Kerja / Instansi</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">
                    {selectedTiketDetail.pelapor?.unit_kerja || '-'}
                  </p>
                </div>
                {selectedTiketDetail.pelapor?.tipe_pelapor === 'admin_komunitas' && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Komunitas</p>
                    <p className="text-sm font-semibold text-purple-700 mt-0.5">
                      {selectedTiketDetail.pelapor?.nama_komunitas || '-'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 font-medium">Waktu Pengiriman</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">
                    {selectedTiketDetail.dibuat_pada
                      ? new Date(selectedTiketDetail.dibuat_pada).toLocaleString('id-ID', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        }) + ' WITA'
                      : '-'}
                  </p>
                </div>
                {selectedTiketDetail.penangan && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Ditangani Oleh</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">
                      {selectedTiketDetail.penangan.nama_lengkap} (NIP. {selectedTiketDetail.penangan.nip})
                    </p>
                  </div>
                )}
              </div>

              {/* Subjek & Isi Deskripsi */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Subjek Kendala
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200/70 text-sm font-bold text-gray-900">
                  {selectedTiketDetail.subjek}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Deskripsi Lengkap Masalah
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200/70 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedTiketDetail.deskripsi}
                </div>
              </div>

              {/* Quick Status Action Buttons */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-600 mb-2.5">
                  Tindak Lanjut & Pembaruan Status:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={updatingStatusId === selectedTiketDetail.help_tiket_id || selectedTiketDetail.status === 'terbuka'}
                    onClick={() => handleUpdateStatusTiket(selectedTiketDetail.help_tiket_id, 'terbuka')}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Buka Kembali (Terbuka)
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatusId === selectedTiketDetail.help_tiket_id || selectedTiketDetail.status === 'diproses'}
                    onClick={() => handleUpdateStatusTiket(selectedTiketDetail.help_tiket_id, 'diproses')}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Tandai Sedang Diproses
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatusId === selectedTiketDetail.help_tiket_id || selectedTiketDetail.status === 'selesai'}
                    onClick={() => handleUpdateStatusTiket(selectedTiketDetail.help_tiket_id, 'selesai')}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Tandai Selesai
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTiketDetail(null)}
                className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringReports;
