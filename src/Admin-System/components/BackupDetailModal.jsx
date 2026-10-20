import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Database, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  HardDrive, 
  Clock, 
  User, 
  ShieldCheck 
} from 'lucide-react';

const BackupDetailModal = ({ isOpen, onClose, backupItem, onDownload, onDelete }) => {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !backupItem) return null;

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Detail Snapshot Cadangan</h3>
              <p className="text-xs text-gray-500">
                ID Cadangan: <span className="font-mono font-semibold text-gray-700">#{backupItem.backup_id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-600">
          {/* File Name & Status */}
          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nama Berkas Snapshot</span>
              {backupItem.status === 'sukses' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Sukses
                </span>
              ) : backupItem.status === 'berjalan' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  Berjalan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  Gagal
                </span>
              )}
            </div>
            <p className="font-mono text-sm font-bold text-gray-900 break-all select-all">
              {backupItem.nama_file}
            </p>
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-1">
              <span className="text-[11px] text-gray-400 block font-medium">Ukuran Arsip</span>
              <p className="font-bold text-gray-800 font-mono text-sm">
                {formatBytes(backupItem.ukuran_bytes)}
                <span className="text-[11px] text-gray-400 font-sans font-normal ml-1.5">
                  ({(backupItem.ukuran_bytes || 0).toLocaleString('id-ID')} bytes)
                </span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-1">
              <span className="text-[11px] text-gray-400 block font-medium">Tipe Cadangan</span>
              <p className="font-bold text-teal-800 uppercase font-mono text-sm">
                {backupItem.tipe_backup || 'MANUAL'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-1">
              <span className="text-[11px] text-gray-400 block font-medium">Waktu Pembuatan</span>
              <div className="flex items-center gap-1.5 text-gray-700 font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {backupItem.dibuat_pada ? new Date(backupItem.dibuat_pada).toLocaleString('id-ID') : '-'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-1">
              <span className="text-[11px] text-gray-400 block font-medium">Pembuat Cadangan</span>
              <div className="flex items-center gap-1.5 text-gray-700 text-xs">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold truncate">
                  {backupItem.dibuat_oleh?.nama_lengkap || 'Sistem Terjadwal (Cron)'}
                </span>
              </div>
            </div>
          </div>

          {/* Checksum Hash SHA-256 */}
          <div className="p-4 rounded-xl border border-gray-100 bg-teal-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-teal-800 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Integritas Berkas (SHA-256 Checksum)</span>
              </div>

              {backupItem.checksum_hash && (
                <button
                  type="button"
                  onClick={() => handleCopy(backupItem.checksum_hash)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors shadow-2xs"
                >
                  {copiedHash ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin Hash</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="font-mono text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-teal-100 break-all select-all">
              {backupItem.checksum_hash || 'Tidak tersedia hash integritas.'}
            </div>
          </div>

          {/* File Storage Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
            <span className="text-gray-500 font-medium">Status Berkas Fisik:</span>
            {backupItem.file_exists ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Tersedia di Direktori Cadangan Server
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Berkas fisik tidak ditemukan di disk
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onDelete) onDelete(backupItem);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Cadangan</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onDownload) onDownload(backupItem);
              }}
              disabled={!backupItem.file_exists}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas (.sql.gz)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupDetailModal;
