import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  RefreshCw, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  User,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import api from '../api/axios';
import LogDetailModal from './components/LogDetailModal';
import {
  confirmPruneLogs,
  showLoadingAlert,
  closeAlert,
  showSuccessAlert,
  showErrorAlert,
  systemToast
} from './utils/systemAlerts';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, iconColorClass }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 sm:p-4 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColorClass}`} />
    </div>
    <div className="min-w-0">
      <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1 truncate">{title}</h3>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{value}</h2>
      {subtitle && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
    </div>
  </div>
);

const RootLogAktivitas = () => {
  const [logs, setLogs] = useState([]);
  const [statistik, setStatistik] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter State
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Prune Modal State
  const [showPruneModal, setShowPruneModal] = useState(false);
  const [pruneDays, setPruneDays] = useState('90');
  const [isPruning, setIsPruning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        per_page: 20,
        search: search || undefined,
        module: module || undefined,
        severity: severity || undefined,
        status: status || undefined,
      };

      const [logRes, statRes] = await Promise.all([
        api.get('/root/log-aktivitas', { params }),
        api.get('/root/log-aktivitas/statistik')
      ]);

      const logPagination = logRes.data?.data || {};
      setLogs(logPagination.data || []);
      setPagination({
        current_page: logPagination.current_page || 1,
        last_page: logPagination.last_page || 1,
        total: logPagination.total || 0,
      });

      setStatistik(statRes.data?.data || null);
    } catch (err) {
      console.error('Gagal memuat log aktivitas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, module, severity, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setModule('');
    setSeverity('');
    setStatus('');
    setPage(1);
    systemToast({
      icon: 'info',
      title: 'Filter pencarian log telah direset.',
    });
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      systemToast({
        icon: 'info',
        title: 'Mengekspor berkas audit log ke CSV...',
      });

      const params = new URLSearchParams({
        search: search || '',
        module: module || '',
        severity: severity || '',
        status: status || '',
      });

      const response = await api.get(`/root/log-aktivitas/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_trail_asn_corpu_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      systemToast({
        icon: 'success',
        title: 'Berkas CSV audit trail berhasil diunduh.',
      });
    } catch (err) {
      showErrorAlert({
        title: 'Gagal Mengekspor Log',
        error: err,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePruneSubmit = async (e) => {
    e.preventDefault();
    const result = await confirmPruneLogs(pruneDays);
    if (!result.isConfirmed) return;

    try {
      setIsPruning(true);
      showLoadingAlert(
        'Memangkas Log Audit...',
        `Sedang memproses pemangkasan catatan aktivitas yang berusia lebih dari ${pruneDays} hari.`
      );

      const res = await api.post('/root/log-aktivitas/prune', { days: parseInt(pruneDays, 10) });
      closeAlert();

      showSuccessAlert({
        title: 'Pemangkasan Berhasil',
        text: res.data?.message || 'Pembersihan retensi log audit berhasil dilakukan.',
      });

      setShowPruneModal(false);
      fetchLogs();
    } catch (err) {
      closeAlert();
      showErrorAlert({
        title: 'Gagal Memangkas Log',
        error: err,
      });
    } finally {
      setIsPruning(false);
    }
  };

  const severityBadges = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header section matching Admin BKPSDM */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Audit Trail & Log Aktivitas</h1>
          <p className="text-sm text-gray-500">
            Pencatatan transparan seluruh mutasi data, otentikasi, dan kejadian sistem untuk kepatuhan SPBE & audit keamanan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto shrink-0 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? 'Mengekspor...' : 'Ekspor CSV'}</span>
          </button>

          <button
            onClick={() => setShowPruneModal(true)}
            className="px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shrink-0"
            title="Pangkas Retensi Log Lama"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-2.5 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-colors border border-gray-200 shadow-2xs shrink-0"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats section matching Admin BKPSDM */}
      {statistik && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Catatan Log"
            value={(statistik.total_all || 0).toLocaleString('id-ID')}
            subtitle={`Hari ini: ${(statistik.total_today || 0).toLocaleString('id-ID')} event`}
            icon={Activity}
            colorClass="bg-teal-50"
            iconColorClass="text-teal-700"
          />
          <StatCard
            title="Tingkat INFO"
            value={(statistik.severity?.info || 0).toLocaleString('id-ID')}
            subtitle="Operasional normal sistem"
            icon={CheckCircle2}
            colorClass="bg-blue-50"
            iconColorClass="text-blue-600"
          />
          <StatCard
            title="Tingkat WARNING"
            value={(statistik.severity?.warning || 0).toLocaleString('id-ID')}
            subtitle="Pencadangan, unduhan data"
            icon={AlertTriangle}
            colorClass="bg-amber-50"
            iconColorClass="text-amber-600"
          />
          <StatCard
            title="Tingkat DANGER"
            value={(statistik.severity?.danger || 0).toLocaleString('id-ID')}
            subtitle={`Gagal otentikasi: ${statistik.failed_auth_today || 0} hari ini`}
            icon={ShieldAlert}
            colorClass="bg-rose-50"
            iconColorClass="text-rose-600"
          />
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari NIP, nama pengguna, aksi, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Semua Modul</option>
                <option value="AUTENTIKASI">AUTENTIKASI</option>
                <option value="PENGGUNA">PENGGUNA</option>
                <option value="PEMBELAJARAN">PEMBELAJARAN</option>
                <option value="BACKUP">BACKUP</option>
                <option value="E_FILE">E_FILE</option>
                <option value="AUDIT_TRAIL">AUDIT_TRAIL</option>
                <option value="UMUM">UMUM</option>
              </select>

              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Semua Tingkat</option>
                <option value="info">INFO</option>
                <option value="warning">WARNING</option>
                <option value="danger">DANGER</option>
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Semua Status</option>
                <option value="sukses">Sukses</option>
                <option value="gagal">Gagal</option>
              </select>

              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                Terapkan
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Table markup */}
        <div className="overflow-x-auto relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 text-sm font-medium text-teal-700">
                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                Memuat data log...
              </div>
            </div>
          )}

          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">WAKTU (WITA)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PENGGUNA & NIP</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">MODUL & AKSI</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">DESKRIPSI AKTIVITAS</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">TINGKAT</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP ADDRESS</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <ShieldCheck className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Tidak ada catatan log yang sesuai dengan filter.</p>
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.log_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                      {item.dibuat_pada || '-'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 text-sm truncate max-w-[170px]">
                        {item.nama_pengguna || 'Sistem / Tamu'}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        {item.nip ? `NIP: ${item.nip}` : item.peran || '-'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-gray-800 text-xs block">{item.module}</span>
                      <span className="text-gray-400 text-[11px] font-mono">
                        {item.action} ({item.method || 'GET'})
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-600 line-clamp-2 max-w-sm" title={item.description}>
                        {item.description || '-'}
                      </p>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${severityBadges[item.severity] || 'bg-gray-100 text-gray-700'}`}>
                        {item.severity?.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {item.ip_address || '-'}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedLog(item);
                          setShowDetailModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200"
                        title="Lihat Detail & State Diff"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Rinci</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar matching Admin BKPSDM */}
        {pagination.total > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span>
              Menampilkan halaman <b>{pagination.current_page}</b> dari <b>{pagination.last_page}</b> ({pagination.total} total catatan log)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1 || isLoading}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-teal-700 text-white font-bold rounded-lg text-xs shadow-xs">
                {pagination.current_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={pagination.current_page >= pagination.last_page || isLoading}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail JSON State Diff */}
      <LogDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        logData={selectedLog}
      />

      {/* Modal Pemangkasan Retensi (Prune) */}
      {showPruneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Pemeliharaan Retensi Log</h3>
                  <p className="text-xs text-gray-500">Hapus arsip log audit yang telah melampaui batas hari.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPruneModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Trash2 className="hidden" />
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            <form onSubmit={handlePruneSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Batas Usia Arsip Retensi:
                </label>
                <select
                  value={pruneDays}
                  onChange={(e) => setPruneDays(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="30">Lebih dari 30 Hari</option>
                  <option value="60">Lebih dari 60 Hari</option>
                  <option value="90">Lebih dari 90 Hari (Standar Kuartal)</option>
                  <option value="180">Lebih dari 180 Hari (6 Bulan)</option>
                  <option value="365">Lebih dari 365 Hari (1 Tahun)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
                ⚠️ <b>Perhatian:</b> Tindakan ini akan menghapus log secara permanen dari basis data guna mengoptimalkan kapasitas server.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPruneModal(false)}
                  disabled={isPruning}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold border border-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPruning}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {isPruning ? 'Memangkas...' : 'Pangkas Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootLogAktivitas;
