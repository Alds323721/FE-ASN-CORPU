import React, { useState } from 'react';
import { X, Copy, Check, Clock, User, Globe, AlertCircle, FileCode } from 'lucide-react';

const LogDetailModal = ({ isOpen, onClose, logData }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !logData) return null;

  const handleCopyJson = () => {
    const payload = JSON.stringify(logData, null, 2);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityBadges = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const statusBadges = {
    sukses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gagal: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
              #{logData.log_id}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Detail Log Audit Trail</h3>
              <p className="text-xs text-gray-500">
                Modul <span className="font-semibold text-gray-700">{logData.module}</span> • {logData.action}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-teal-700 hover:bg-gray-50 transition-colors border border-gray-200"
              title="Salin Data JSON Log"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Status & Severity Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <span className={`px-2.5 py-0.5 rounded-full font-semibold border text-xs ${statusBadges[logData.status] || 'bg-gray-100'}`}>
              Status: {logData.status?.toUpperCase()}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full font-semibold border text-xs ${severityBadges[logData.severity] || 'bg-gray-100'}`}>
              Tingkat: {logData.severity?.toUpperCase()}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {logData.dibuat_pada}
            </span>
          </div>

          {/* User & Request Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-2">
              <p className="font-bold text-gray-700 flex items-center gap-1.5 text-xs">
                <User className="w-4 h-4 text-teal-700" />
                Informasi Pengguna
              </p>
              <div className="space-y-1 text-gray-600">
                <p>NIP: <span className="font-semibold text-gray-800 font-mono">{logData.nip || '-'}</span></p>
                <p>Nama: <span className="font-semibold text-gray-800">{logData.nama_pengguna || 'Sistem Otomatis / Tamu'}</span></p>
                <p>Peran: <span className="text-gray-700">{logData.peran || '-'}</span></p>
                <p>Unit Kerja: <span className="text-gray-700">{logData.unit_kerja || '-'}</span></p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-2">
              <p className="font-bold text-gray-700 flex items-center gap-1.5 text-xs">
                <Globe className="w-4 h-4 text-teal-700" />
                Informasi Jaringan & Request
              </p>
              <div className="space-y-1 text-gray-600">
                <p>IP Address: <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-xs text-gray-800 font-mono">{logData.ip_address || '-'}</code></p>
                <p>Method: <span className="font-bold text-teal-700 font-mono">{logData.method || '-'}</span></p>
                <p className="truncate" title={logData.url}>URL: <span className="text-gray-700 font-mono text-[11px]">{logData.url || '-'}</span></p>
                <p className="truncate text-[10px] text-gray-400" title={logData.user_agent}>
                  UA: {logData.user_agent || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Deskripsi Kejadian */}
          <div>
            <label className="font-bold text-gray-700 block mb-1.5 text-xs">Deskripsi Aktivitas</label>
            <div className="p-3.5 rounded-lg bg-gray-50 text-gray-800 border border-gray-100 font-sans leading-relaxed text-xs">
              {logData.description || 'Tidak ada deskripsi rinci.'}
            </div>
          </div>

          {/* State Diff: Old vs New Data */}
          {(logData.old_data || logData.new_data) && (
            <div className="space-y-2 pt-2">
              <label className="font-bold text-gray-800 block text-xs">
                Visualisasi Perubahan Data (State Diff)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Data Sebelum (Old) */}
                <div className="rounded-xl border border-rose-200 overflow-hidden">
                  <div className="bg-rose-50 px-3.5 py-2 border-b border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-between">
                    <span>Sebelum Perubahan (Old Data)</span>
                  </div>
                  <pre className="p-3 bg-white text-gray-800 font-mono text-[11px] overflow-x-auto max-h-56 leading-normal">
                    {logData.old_data ? JSON.stringify(logData.old_data, null, 2) : '(Tidak ada data sebelumnya)'}
                  </pre>
                </div>

                {/* Data Sesudah (New) */}
                <div className="rounded-xl border border-emerald-200 overflow-hidden">
                  <div className="bg-emerald-50 px-3.5 py-2 border-b border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-between">
                    <span>Sesudah Perubahan (New Data)</span>
                  </div>
                  <pre className="p-3 bg-white text-gray-800 font-mono text-[11px] overflow-x-auto max-h-56 leading-normal">
                    {logData.new_data ? JSON.stringify(logData.new_data, null, 2) : '(Tidak ada data baru)'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;
