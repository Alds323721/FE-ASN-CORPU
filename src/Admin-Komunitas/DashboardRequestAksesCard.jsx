import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import {
  UserCheck, Check, X, Clock, AlertCircle, Search, RefreshCw,
  CheckCheck, ChevronLeft, ChevronRight, FileText, Filter, Users, BookOpen
} from 'lucide-react';

const DashboardRequestAksesCard = ({ onStatsUpdated }) => {
  const onStatsUpdatedRef = useRef(onStatsUpdated);
  useEffect(() => {
    onStatsUpdatedRef.current = onStatsUpdated;
  }, [onStatsUpdated]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('menunggu');
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseOptions, setCourseOptions] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  // Pagination state (Maksimal 10 per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const [counts, setCounts] = useState({
    total: 0,
    menunggu: 0,
    disetujui: 0,
    ditolak: 0,
  });

  const fetchRequests = useCallback(async (page = 1, isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: page,
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (courseFilter !== 'all') params.pembelajaran_id = courseFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/admin-komunitas/request-akses', { params });
      if (res.data) {
        setRequests(res.data.data || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
          if (onStatsUpdatedRef.current) {
            onStatsUpdatedRef.current(res.data.counts);
          }
        }
        if (res.data.kursus_options) {
          setCourseOptions(res.data.kursus_options);
        }
        if (res.data.pagination) {
          setPagination(res.data.pagination);
          setCurrentPage(res.data.pagination.current_page || page);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard request akses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, courseFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
    fetchRequests(1);
  }, [statusFilter, courseFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchRequests(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.last_page || newPage === currentPage) return;
    setCurrentPage(newPage);
    fetchRequests(newPage);
  };

  const handleApprove = async (item) => {
    const nama = item.pengguna?.nama_lengkap || 'Peserta';
    const judul = item.pembelajaran?.judul_pembelajaran || 'Pelatihan';

    const result = await Swal.fire({
      icon: 'question',
      title: 'Setujui Akses Pelatihan?',
      html: `
        <div class="text-left text-sm text-gray-600 space-y-2">
          <p>Anda akan menyetujui permohonan akses untuk:</p>
          <div class="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 text-xs">
            <p><b>Peserta:</b> ${nama} (${item.pengguna?.nip || '-'})</p>
            <p class="mt-1"><b>Kursus:</b> ${judul}</p>
          </div>
          <p class="text-xs text-gray-500">
            Setelah disetujui, peserta dapat langsung mengakses seluruh modul, materi, dan evaluasi pembelajaran ini.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Ya, Setujui Akses',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingId(item.pendaftaran_id);
      await api.post(`/admin-komunitas/request-akses/${item.pendaftaran_id}/approve`);

      Swal.fire({
        icon: 'success',
        title: 'Akses Berhasil Disetujui!',
        text: `Peserta ${nama} telah diberikan hak akses ke kursus.`,
        timer: 1800,
        showConfirmButton: false,
      });

      fetchRequests(currentPage);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyetujui',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyetujui akses.',
        confirmButtonColor: '#0F766E',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item) => {
    const nama = item.pengguna?.nama_lengkap || 'Peserta';
    const judul = item.pembelajaran?.judul_pembelajaran || 'Pelatihan';

    const { value: catatan, isConfirmed } = await Swal.fire({
      icon: 'warning',
      title: 'Tolak Permintaan Akses?',
      html: `
        <div class="text-left text-sm text-gray-600 mb-2">
          <p class="mb-2">Tolak permohonan akses dari <b>${nama}</b> untuk kursus <b>"${judul}"</b>.</p>
          <p class="text-xs text-gray-500 mb-2">Silakan tuliskan alasan penolakan yang akan terbaca oleh peserta:</p>
        </div>
      `,
      input: 'textarea',
      inputPlaceholder: 'Contoh: Kuota unit kerja telah terpenuhi, atau silakan ikuti batch berikutnya...',
      inputAttributes: {
        'aria-label': 'Alasan penolakan',
        rows: 3,
      },
      showCancelButton: true,
      confirmButtonText: 'Tolak Permintaan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Alasan penolakan wajib diisi agar peserta memahami alasannya!';
        }
      },
    });

    if (!isConfirmed) return;

    try {
      setProcessingId(item.pendaftaran_id);
      await api.post(`/admin-komunitas/request-akses/${item.pendaftaran_id}/reject`, {
        catatan: catatan.trim(),
      });

      Swal.fire({
        icon: 'info',
        title: 'Permintaan Ditolak',
        text: `Permintaan akses ${nama} telah ditolak beserta catatan alasan.`,
        timer: 1800,
        showConfirmButton: false,
      });

      fetchRequests(currentPage);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menolak',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menolak akses.',
        confirmButtonColor: '#0F766E',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveAll = async () => {
    const pendingCount = counts.menunggu || 0;
    if (pendingCount === 0) return;

    const result = await Swal.fire({
      icon: 'question',
      title: 'Setujui Semua Permintaan Akses?',
      html: `
        <div class="text-left text-sm text-gray-600 space-y-2">
          <p>Apakah Anda yakin ingin menyetujui sekaligus <b>${pendingCount} peserta</b> yang sedang menunggu akses?</p>
          <p class="text-xs text-gray-500">
            Seluruh peserta yang berstatus <i>Menunggu</i> akan otomatis diberikan akses belajar ke masing-masing kursus yang dimohonkan.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: `Ya, Setujui Semua (${pendingCount})`,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.post('/admin-komunitas/request-akses/approve-all', {
        pembelajaran_id: courseFilter !== 'all' ? courseFilter : null,
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disetujui Semua!',
        text: res.data?.message || 'Seluruh permohonan akses pending telah disetujui.',
        timer: 2000,
        showConfirmButton: false,
      });

      fetchRequests(1);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyetujui semua permohonan.',
        confirmButtonColor: '#0F766E',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'disetujui':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3 h-3" /> Disetujui
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <X className="w-3 h-3" /> Ditolak
          </span>
        );
      case 'menunggu':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
            <Clock className="w-3 h-3" /> Menunggu
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      {/* Header Card */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-teal-50/40 via-white to-transparent">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Persetujuan Permintaan Akses Peserta
              </h2>
              {counts.menunggu > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  {counts.menunggu} Perlu Approval
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Validasi dan setujui permohonan akses dari peserta sebelum mereka dapat mempelajari modul kursus.
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => fetchRequests(currentPage, true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Muat ulang data permintaan akses"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0F766E]' : 'text-gray-500'}`} />
            <span>Refresh</span>
          </button>

          {counts.menunggu > 0 && (
            <button
              type="button"
              onClick={handleApproveAll}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F766E] hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Setujui Semua ({counts.menunggu})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 sm:px-6 sm:py-3.5 bg-gray-50/70 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('menunggu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'menunggu'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Menunggu</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'menunggu' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {counts.menunggu}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('disetujui')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'disetujui'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Disetujui</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'disetujui' ? 'bg-teal-800 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {counts.disetujui}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('ditolak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'ditolak'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Ditolak</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'ditolak' ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {counts.ditolak}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-gray-800 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Semua</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {counts.total}
            </span>
          </button>
        </div>

        {/* Search & Course Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {courseOptions.length > 0 && (
            <div className="relative">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full sm:w-48 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F766E] truncate"
              >
                <option value="all">Semua Pelatihan</option>
                {courseOptions.map((c) => (
                  <option key={c.pembelajaran_id} value={c.pembelajaran_id}>
                    {c.judul_pembelajaran}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari peserta, NIP, kursus..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0F766E] text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-3.5">Peserta</th>
              <th className="px-6 py-3.5">Pelatihan yang Diminta</th>
              <th className="px-6 py-3.5">Keterangan</th>
              <th className="px-6 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5 text-center">Tanggal Diajukan</th>
              <th className="px-6 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0F766E]" />
                    <span className="text-xs font-semibold">Memuat data permintaan akses...</span>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <UserCheck className="w-8 h-8 text-gray-300" />
                    <p className="text-xs font-bold text-gray-600">Tidak ada data permintaan akses</p>
                    <p className="text-[11px] text-gray-400">
                      {statusFilter === 'menunggu'
                        ? 'Saat ini belum ada permohonan akses baru dari peserta.'
                        : 'Tidak ditemukan data sesuai filter yang dipilih.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((item) => {
                const isItemProcessing = processingId === item.pendaftaran_id;
                const status = item.status_persetujuan || 'menunggu';

                return (
                  <tr key={item.pendaftaran_id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Peserta Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200">
                          {(item.pengguna?.nama_lengkap || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-xs truncate max-w-xs">
                            {item.pengguna?.nama_lengkap || 'Peserta ASN'}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            NIP: <span className="font-mono text-gray-700">{item.pengguna?.nip || '-'}</span>
                          </p>
                          {item.pengguna?.unit_kerja && (
                            <p className="text-[10px] text-gray-400 truncate max-w-xs">
                              {item.pengguna.unit_kerja}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Pelatihan Info */}
                    <td className="px-6 py-4">
                      <div className="min-w-0 max-w-xs">
                        <p className="font-semibold text-gray-900 text-xs leading-snug line-clamp-2">
                          {item.pembelajaran?.judul_pembelajaran || '-'}
                        </p>
                        {item.pembelajaran?.kategori && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/50">
                            {item.pembelajaran.kategori}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Keterangan */}
                    <td className="px-6 py-4 max-w-xs">
                      {status === 'ditolak' && item.catatan_persetujuan ? (
                        <div className="p-2 bg-red-50 text-red-700 rounded-lg border border-red-200 text-[11px]" title={item.catatan_persetujuan}>
                          <span className="font-semibold">Alasan Ditolak:</span> {item.catatan_persetujuan}
                        </div>
                      ) : status === 'disetujui' && item.disetujui_oleh ? (
                        <div className="text-xs text-emerald-700 font-medium">
                          Disetujui oleh: <span className="font-semibold">{item.disetujui_oleh.nama_lengkap}</span>
                        </div>
                      ) : item.catatan_request ? (
                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-[11px] text-gray-700 italic line-clamp-2" title={item.catatan_request}>
                          "{item.catatan_request}"
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(status)}
                    </td>

                    {/* Tanggal */}
                    <td className="px-6 py-4 text-center text-xs text-gray-500 whitespace-nowrap">
                      {item.terdaftar_pada ? new Date(item.terdaftar_pada).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : '-'}
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-center">
                      {status === 'menunggu' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            disabled={isItemProcessing}
                            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Setujui akses peserta ini"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(item)}
                            disabled={isItemProcessing}
                            className="px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Tolak permohonan akses ini"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      ) : status === 'ditolak' ? (
                        <button
                          type="button"
                          onClick={() => handleApprove(item)}
                          disabled={isItemProcessing}
                          className="px-2.5 py-1 text-teal-700 hover:bg-teal-50 border border-teal-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          title="Ubah keputusan dan setujui akses"
                        >
                          Beri Akses
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (Maksimal 10 data per halaman) */}
      <div className="p-4 sm:px-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div>
          Menampilkan <span className="font-bold text-gray-800">{pagination.from || 0}</span> sampai{' '}
          <span className="font-bold text-gray-800">{pagination.to || 0}</span> dari{' '}
          <span className="font-bold text-gray-800">{pagination.total || 0}</span> permintaan akses
          <span className="ml-2 text-gray-400 font-medium">(Maks. 10 per halaman)</span>
        </div>

        {pagination.last_page > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            {[...Array(pagination.last_page)].map((_, i) => {
              const pageNumber = i + 1;
              // Show window around current page
              if (
                pageNumber === 1 ||
                pageNumber === pagination.last_page ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === pageNumber
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                return <span key={pageNumber} className="text-gray-400 px-0.5">...</span>;
              }
              return null;
            })}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.last_page || loading}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardRequestAksesCard;
