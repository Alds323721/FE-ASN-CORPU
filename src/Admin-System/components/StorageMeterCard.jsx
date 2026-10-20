import React from 'react';
import { HardDrive, FolderArchive, FileText, Image, Database, ShieldAlert, ArrowRight } from 'lucide-react';

const StorageMeterCard = ({ storageData, onScanOrphans, isScanning }) => {
  if (!storageData) return null;

  const usedPercentage = storageData.disk_used_percentage || 0;
  const categories = storageData.categories || {};

  const categoryIcons = {
    sertifikat: FileText,
    materi: FileText,
    thumbnails: Image,
    komunitas: FolderArchive,
    modul: FolderArchive,
    backup: Database,
  };

  const categoryDots = {
    sertifikat: 'bg-emerald-500',
    materi: 'bg-teal-600',
    thumbnails: 'bg-amber-500',
    komunitas: 'bg-blue-500',
    modul: 'bg-indigo-500',
    backup: 'bg-purple-500',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Alokasi & Kapasitas Penyimpanan Server</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Terpakai <span className="text-gray-800 font-semibold">{storageData.total_used_formatted}</span> dari total kuota server {storageData.total_disk_formatted}
            </p>
          </div>
        </div>

        {onScanOrphans && (
          <button
            onClick={onScanOrphans}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors disabled:opacity-50"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isScanning ? 'Memindai File...' : 'Pindai Berkas Tanpa Relasi'}</span>
          </button>
        )}
      </div>

      {/* Progress Bar Meter */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-gray-600">Penggunaan Disk Server</span>
          <span className="font-bold text-teal-700 font-mono text-sm">{usedPercentage}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex p-0.5 border border-gray-100">
          <div
            className="h-full rounded-full transition-all duration-500 bg-teal-700"
            style={{ width: `${Math.min(100, Math.max(1, usedPercentage))}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
          <span>Ruang Bebas: <b className="text-emerald-600 font-semibold">{storageData.free_disk_formatted}</b></span>
          <span>Total Berkas: <b className="text-gray-700">{storageData.total_files} file</b></span>
        </div>
      </div>

      {/* Category Breakdown Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4 border-t border-gray-100">
        {Object.entries(categories).map(([key, cat]) => {
          const Icon = categoryIcons[key] || FolderArchive;
          const dotColor = categoryDots[key] || 'bg-gray-400';

          return (
            <div key={key} className="p-3 rounded-lg bg-gray-50/70 border border-gray-100 flex flex-col justify-between hover:bg-white hover:border-gray-200 transition-all">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                <span className="text-xs font-semibold text-gray-700 truncate">{cat.nama}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 font-mono">{cat.formatted}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{cat.files_count} file</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StorageMeterCard;
