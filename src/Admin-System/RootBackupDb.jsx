import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Trash2, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  FileCode,
  HardDrive,
  Server,
  Layers,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../api/axios';
import BackupDetailModal from './components/BackupDetailModal';
import {
  confirmGenerateBackup,
  confirmDeleteBackup,
  showLoadingAlert,
  closeAlert,
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
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{value}</h2>
      {subtitle && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
    </div>
  </div>
);

const RootBackupDb = () => {
  const [backups, setBackups] = useState([]);
  const [dbInfo, setDbInfo] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedHash, setCopiedHash] = useState(null);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchBackups = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/root/backup-db?page=${page}`);
      const data = res.data?.data || {};
      setBackups(data.data || []);
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      });
      setDbInfo(res.data?.db_info || null);
    } catch (err) {
      console.error('Gagal mengambil daftar backup:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleGenerateBackup = async () => {
    const result = await confirmGenerateBackup(dbInfo);
    if (!result.isConfirmed) return;

    try {
      setIsGenerating(true);
      showLoadingAlert(
        'Mengekstrak Basis Data...',
        'Sedang mengekspor seluruh tabel dan skema ke dalam berkas snapshot .sql.gz terkompresi.'
      );

      const res = await api.post('/root/backup-db/generate');
      closeAlert();
      systemToast({
        icon: 'success',
        title: res.data?.message || 'Cadangan basis data berhasil dibuat!',
      });
      fetchBackups(1);
    } catch (err) {
      closeAlert();
      showErrorAlert({
        title: 'Gagal Membuat Cadangan',
        error: err,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (backupItem) => {
    try {
      systemToast({
        icon: 'info',
        title: `Mengunduh berkas ${backupItem.nama_file}...`,
      });

      const response = await api.get(`/root/backup-db/${backupItem.backup_id}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/gzip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupItem.nama_file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showErrorAlert({
        title: 'Gagal Mengunduh Berkas',
        error: err,
      });
    }
  };

  const handleDelete = async (backupItem) => {
    const result = await confirmDeleteBackup(backupItem);
    if (!result.isConfirmed) return;

    try {
      showLoadingAlert('Menghapus Berkas...', 'Sedang menghapus berkas snapshot dari storage server.');
      await api.delete(`/root/backup-db/${backupItem.backup_id}`);
      closeAlert();

      systemToast({
        icon: 'success',
        title: 'Berkas cadangan berhasil dihapus.',
      });

      if (showDetailModal) setShowDetailModal(false);
      fetchBackups(pagination.current_page);
    } catch (err) {
      closeAlert();
      showErrorAlert({
        title: 'Gagal Menghapus Berkas',
        error: err,
      });
    }
  };

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    systemToast({
      icon: 'success',
      title: 'Hash SHA-256 disalin ke papan klip!',
    });
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header section matching Admin BKPSDM */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Cadangan Basis Data (Backup DB)</h1>
          <p className="text-sm text-gray-500">
            Pembuatan snapshot database SQL terkompresi dengan verifikasi hash integritas SHA-256 untuk disaster recovery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleGenerateBackup}
            disabled={isGenerating}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto shrink-0 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mengekstrak Basis Data...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Buat Cadangan Sekarang</span>
              </>
            )}
          </button>

          <button
            onClick={() => fetchBackups(pagination.current_page)}
            disabled={isLoading}
            className="p-2.5 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-colors border border-gray-200 shadow-2xs shrink-0"
            title="Refresh Riwayat"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats section matching Admin BKPSDM */}
      {dbInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Nama Basis Data"
            value={dbInfo.database_name}
            subtitle={`Driver: ${dbInfo.driver?.toUpperCase()} (${dbInfo.host}:${dbInfo.port})`}
            icon={Database}
            colorClass="bg-teal-50"
            iconColorClass="text-teal-700"
          />
          <StatCard
            title="Ukuran Data & Indeks"
            value={`${dbInfo.size_mb} MB`}
            subtitle={`Total: ${dbInfo.table_count} Tabel terdaftar`}
            icon={Layers}
            colorClass="bg-blue-50"
            iconColorClass="text-blue-600"
          />
          <StatCard
            title="Versi RDBMS SQL"
            value={dbInfo.server_version || 'MySQL'}
            subtitle="Database Server Engine"
            icon={Server}
            colorClass="bg-purple-50"
            iconColorClass="text-purple-600"
          />
          <StatCard
            title="Sisa Ruang Disk"
            value={`${dbInfo.free_disk_gb} GB`}
            subtitle={`Kapasitas total: ${dbInfo.total_disk_gb} GB`}
            icon={HardDrive}
            colorClass="bg-emerald-50"
            iconColorClass="text-emerald-600"
          />
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">Riwayat Berkas Snapshot Cadangan</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar seluruh berkas .sql.gz yang tersimpan di direktori penyimpanan cadangan server.
            </p>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Total {pagination.total} berkas cadangan
          </span>
        </div>

        {/* Table markup */}
        <div className="overflow-x-auto relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 text-sm font-medium text-teal-700">
                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                Memuat riwayat cadangan...
              </div>
            </div>
          )}

          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NAMA BERKAS SNAPSHOT</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">UKURAN</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">TIPE</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">WAKTU PEMBUATAN</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">INTEGRITAS (SHA-256)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {backups.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Database className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Belum ada berkas cadangan database yang dibuat.</p>
                  </td>
                </tr>
              ) : (
                backups.map((item) => (
                  <tr key={item.backup_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 font-mono text-xs">{item.nama_file}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {item.dibuat_oleh ? `Oleh: ${item.dibuat_oleh.nama_lengkap}` : 'Otomatis Sistem'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-800 text-xs whitespace-nowrap font-mono">
                      {formatBytes(item.ukuran_bytes)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 uppercase">
                        {item.tipe_backup}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === 'sukses' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Sukses
                        </span>
                      ) : item.status === 'berjalan' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                          Berjalan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200" title={item.pesan_error}>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          Gagal
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                      {item.dibuat_pada ? new Date(item.dibuat_pada).toLocaleString('id-ID') : '-'}
                    </td>

                    <td className="px-6 py-4">
                      {item.checksum_hash ? (
                        <div className="flex items-center gap-1.5 font-mono text-xs text-gray-600">
                          <span className="truncate max-w-[130px]" title={item.checksum_hash}>
                            {item.checksum_hash}
                          </span>
                          <button
                            onClick={() => handleCopyHash(item.checksum_hash)}
                            className="p-1 text-gray-400 hover:text-teal-700 rounded transition-colors"
                            title="Salin Hash SHA-256"
                          >
                            {copiedHash === item.checksum_hash ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBackup(item);
                            setShowDetailModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors border border-gray-200 hover:border-teal-200"
                          title="Lihat Detail Snapshot"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>

                        <button
                          onClick={() => handleDownload(item)}
                          disabled={!item.file_exists}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={item.file_exists ? 'Unduh Berkas (.sql.gz)' : 'Berkas fisik tidak ditemukan'}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh</span>
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                          title="Hapus Berkas Cadangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (15 items per page) */}
        {pagination.total > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              <span>
                Menampilkan <b>{Math.min((pagination.current_page - 1) * 15 + 1, pagination.total)}</b> - <b>{Math.min(pagination.current_page * 15, pagination.total)}</b> dari <b>{pagination.total}</b> snapshot
              </span>
              <span className="text-gray-400 ml-2 hidden sm:inline">(15 baris per halaman)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchBackups(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1 || isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1">
                <span className="px-3 py-1.5 bg-teal-700 text-white font-bold rounded-lg text-xs shadow-xs font-mono">
                  {pagination.current_page}
                </span>
                <span className="text-gray-400 text-xs px-1">/</span>
                <span className="text-gray-600 font-mono text-xs px-1">
                  {pagination.last_page || 1}
                </span>
              </div>

              <button
                type="button"
                onClick={() => fetchBackups(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.last_page || isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs transition-colors shadow-2xs"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Snapshot Cadangan */}
      <BackupDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        backupItem={selectedBackup}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default RootBackupDb;
