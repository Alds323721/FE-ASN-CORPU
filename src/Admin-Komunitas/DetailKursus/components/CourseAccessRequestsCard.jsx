import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Swal from 'sweetalert2';
import {
  Users, Check, X, Clock, AlertCircle, Search, RefreshCw, CheckCheck,
  ShieldCheck, ShieldAlert, FileText, UserCheck, MessageSquare, Lock
} from 'lucide-react';

const CourseAccessRequestsCard = ({ course, isReadOnly, onRequestsUpdated }) => {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ total: 0, menunggu: 0, disetujui: 0, ditolak: 0 });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('menunggu');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    if (!course?.pembelajaran_id) return;
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}/request-akses`, { params });
      if (res.data) {
        setRequests(res.data.data || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [course?.pembelajaran_id, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleApprove = async (requestItem) => {
    const nama = requestItem.pengguna?.nama_lengkap || 'Peserta';
    const result = await Swal.fire({
      icon: 'question',
      title: 'Setujui Akses Kursus?',
      html: `Apakah Anda yakin ingin menyetujui permohonan akses pelatihan untuk <b>${nama}</b>?<br/><span class="text-xs text-gray-500">Setelah disetujui, peserta dapat langsung membuka seluruh modul dan materi kursus ini.</span>`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Setujui Akses',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#6B7280'
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingId(requestItem.pendaftaran_id);
      await api.post(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}/request-akses/${requestItem.pendaftaran_id}/approve`);
      
      Swal.fire({
        icon: 'success',
        title: 'Akses Disetujui!',
        text: `Peserta ${nama} telah diberikan hak akses ke kursus ini.`,
        timer: 1800,
        showConfirmButton: false
      });

      fetchRequests();
      if (onRequestsUpdated) onRequestsUpdated();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyetujui',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyetujui akses.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestItem) => {
    const nama = requestItem.pengguna?.nama_lengkap || 'Peserta';
    const { value: catatan, isConfirmed } = await Swal.fire({
      icon: 'warning',
      title: 'Tolak Permintaan Akses?',
      html: `Masukkan alasan penolakan permohonan akses untuk <b>${nama}</b>:`,
      input: 'textarea',
      inputPlaceholder: 'Tuliskan alasan penolakan (misal: Pelatihan ini khusus unit kerja tertentu)...',
      inputAttributes: {
        'aria-label': 'Alasan penolakan',
        rows: 3
      },
      showCancelButton: true,
      confirmButtonText: 'Tolak Permintaan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Harap berikan alasan penolakan untuk peserta!';
        }
      }
    });

    if (!isConfirmed) return;

    try {
      setProcessingId(requestItem.pendaftaran_id);
      await api.post(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}/request-akses/${requestItem.pendaftaran_id}/reject`, {
        catatan: catatan.trim()
      });

      Swal.fire({
        icon: 'info',
        title: 'Permintaan Ditolak',
        text: `Permintaan akses ${nama} telah ditolak beserta catatan alasan.`,
        timer: 1800,
        showConfirmButton: false
      });

      fetchRequests();
      if (onRequestsUpdated) onRequestsUpdated();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menolak',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menolak akses.'
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
      html: `Apakah Anda yakin ingin menyetujui sekaligus <b>${pendingCount} peserta</b> yang sedang menunggu akses?`,
      showCancelButton: true,
      confirmButtonText: `Ya, Setujui Semua (${pendingCount})`,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#6B7280'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.post(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}/request-akses/approve-all`);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disetujui Semua!',
        text: res.data?.message || 'Seluruh permohonan akses pending telah disetujui.',
        timer: 2000,
        showConfirmButton: false
      });
      fetchRequests();
      if (onRequestsUpdated) onRequestsUpdated();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyetujui semua permohonan.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200/60 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 text-base">Permintaan Akses Peserta</h2>
              {counts.menunggu > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  {counts.menunggu} Menunggu
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {course.butuh_persetujuan 
                ? 'Validasi dan berikan izin bagi peserta sebelum mereka dapat mempelajari materi kursus ini.'
                : 'Kursus ini saat ini berstatus terbuka langsung. Anda dapat mengubahnya ke mode Request Akses pada Informasi Dasar.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnly && counts.menunggu > 0 && (
            <button
              onClick={handleApproveAll}
              disabled={loading}
              className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Setujui Semua ({counts.menunggu})</span>
            </button>
          )}
          <button
            onClick={fetchRequests}
            disabled={loading}
            title="Muat Ulang"
            className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Notice jika kursus tidak butuh persetujuan */}
        {!course.butuh_persetujuan && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <b>Informasi:</b> Kursus ini saat ini diatur dalam mode <b>Terbuka Langsung</b>. Semua peserta di komunitas dapat mendaftar dan langsung mengakses materi.
              Jika Anda ingin peserta harus meminta persetujuan terlebih dahulu, aktifkan opsi <i>"Perlu Permintaan Akses"</i> di bagian <b>Informasi Dasar Kursus</b> di atas.
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start">
            {[
              { id: 'menunggu', label: 'Menunggu', count: counts.menunggu },
              { id: 'disetujui', label: 'Disetujui', count: counts.disetujui },
              { id: 'ditolak', label: 'Ditolak', count: counts.ditolak },
              { id: 'all', label: 'Semua', count: counts.total },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === tab.id ? 'bg-teal-100 text-teal-800' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NIP peserta..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Requests List */}
        {loading && requests.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span className="text-xs">Memuat daftar permohonan akses...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
              <UserCheck className="w-6 h-6 text-gray-300" />
            </div>
            <h4 className="text-sm font-bold text-gray-800 mb-1">
              {statusFilter === 'menunggu' 
                ? 'Tidak Ada Permintaan yang Menunggu' 
                : 'Belum Ada Permintaan Akses'}
            </h4>
            <p className="text-xs text-gray-500 max-w-sm">
              {statusFilter === 'menunggu'
                ? 'Seluruh permohonan akses peserta pada kursus ini telah divalidasi.'
                : 'Belum ada peserta yang mengajukan permohonan akses dengan filter yang dipilih.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => {
              const p = req.pengguna || {};
              const isPending = req.status_persetujuan === 'menunggu';
              const isApproved = req.status_persetujuan === 'disetujui';
              const isRejected = req.status_persetujuan === 'ditolak';

              return (
                <div
                  key={req.pendaftaran_id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPending 
                      ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300' 
                      : isRejected
                        ? 'bg-red-50/20 border-red-200/80 hover:border-red-300'
                        : 'bg-white border-gray-200 hover:border-teal-200'
                  }`}
                >
                  {/* Left: User Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs ${
                      isPending ? 'bg-amber-100 text-amber-800' :
                      isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {(p.nama_lengkap || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                          {p.nama_lengkap || 'Peserta'}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isPending ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {isPending ? '⏳ Menunggu Persetujuan' : isApproved ? '✓ Disetujui' : '✕ Ditolak'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>NIP: <b className="text-gray-700">{p.nip || '-'}</b></span>
                        {p.unit_kerja && (
                          <span className="truncate max-w-xs" title={p.unit_kerja}>
                            Unit: <span className="text-gray-700">{p.unit_kerja}</span>
                          </span>
                        )}
                        {p.jabatan && (
                          <span className="truncate max-w-xs" title={p.jabatan}>
                            Jabatan: <span className="text-gray-700">{p.jabatan}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3" />
                          {req.terdaftar_pada ? new Date(req.terdaftar_pada).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : '-'}
                        </span>
                      </div>

                      {/* Catatan Request dari Peserta */}
                      {req.catatan_request && (
                        <div className="mt-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 text-gray-700 flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-gray-800">Alasan/Catatan Peserta: </span>
                            <span>{req.catatan_request}</span>
                          </div>
                        </div>
                      )}

                      {/* Catatan Penolakan / Info Persetujuan */}
                      {isRejected && req.catatan_persetujuan && (
                        <div className="mt-2 text-xs bg-red-50 p-2.5 rounded-lg border border-red-200 text-red-800 flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">Alasan Penolakan: </span>
                            <span>{req.catatan_persetujuan}</span>
                          </div>
                        </div>
                      )}

                      {isApproved && req.disetujui_oleh && (
                        <p className="mt-1 text-[11px] text-gray-400">
                          Disetujui oleh: <span className="text-gray-600 font-medium">{req.disetujui_oleh.nama_lengkap}</span>
                          {req.disetujui_pada && (
                            <> pada {new Date(req.disetujui_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  {!isReadOnly && (
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleReject(req)}
                            disabled={processingId === req.pendaftaran_id}
                            className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                          <button
                            onClick={() => handleApprove(req)}
                            disabled={processingId === req.pendaftaran_id}
                            className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui Akses</span>
                          </button>
                        </>
                      )}

                      {isRejected && (
                        <button
                          onClick={() => handleApprove(req)}
                          disabled={processingId === req.pendaftaran_id}
                          className="px-3 py-1.5 border border-teal-200 text-[#0F766E] hover:bg-teal-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Ubah Jadi Disetujui</span>
                        </button>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => handleReject(req)}
                          disabled={processingId === req.pendaftaran_id}
                          className="px-2.5 py-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded text-xs transition-colors cursor-pointer"
                          title="Cabut hak akses peserta ini"
                        >
                          Cabut Akses
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseAccessRequestsCard;
