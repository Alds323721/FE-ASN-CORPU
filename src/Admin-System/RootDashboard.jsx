import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  HardDrive, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  FolderArchive,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import api from '../api/axios';
import StorageMeterCard from './components/StorageMeterCard';
import { systemToast, showErrorAlert } from './utils/systemAlerts';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass = "bg-teal-50 text-teal-600", actionLabel, onAction }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-500 text-xs sm:text-sm font-medium">{title}</h3>
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="mt-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{value}</h2>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        {actionLabel && (
          <button 
            type="button"
            onClick={onAction}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 shrink-0 ml-2"
          >
            {actionLabel} <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  </div>
);

const RootDashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const [dashRes, healthRes] = await Promise.all([
        api.get('/root/dashboard'),
        api.get('/root/health-check')
      ]);

      setData(dashRes.data?.data || null);
      setHealthData(healthRes.data || null);

      if (isManual) {
        systemToast({
          icon: 'success',
          title: 'Metrik sistem berhasil diperbarui.',
        });
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard root:', err);
      if (isManual) {
        showErrorAlert({
          title: 'Gagal Memperbarui Metrik',
          error: err,
        });
      }
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Memuat Metrik Infrastruktur Sistem...</p>
      </div>
    );
  }

  const server = data?.server || {};
  const db = data?.database || {};
  const storage = data?.storage || {};
  const backup = data?.backup || {};
  const logs = data?.logs || {};

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header section matching Admin BKPSDM */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Dasbor Admin Sistem</h1>
          <p className="text-sm text-gray-500">
            Monitoring performa server, integritas data, dan pemanfaatan sumber daya platform ASN-CORPU.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('root-backup-db')}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto shrink-0"
          >
            <Database className="w-4 h-4" />
            <span>Cadangkan Database</span>
          </button>
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-colors border border-gray-200 shadow-2xs"
            title="Segarkan Metrik"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Server Environment Banner */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-gray-800">
                Infrastruktur Server & Basis Data
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Normal (Online)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              PHP {server.php_version || '8.2'} • Laravel {server.laravel_version || '12'} • Host: {server.hostname || 'Localhost'} • Zona Waktu: WITA (UTC+8)
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-4 bg-gray-50 px-3.5 py-2 rounded-lg border border-gray-100">
          <div>
            <span className="text-gray-400">Total Bebas Disk: </span>
            <b className="text-gray-800">{storage.free_disk_formatted || '0 GB'}</b>
          </div>
          <span className="text-gray-300">|</span>
          <div>
            <span className="text-gray-400">Database: </span>
            <b className="text-gray-800">{db.size_mb || 0} MB</b>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Basis Data MySQL" 
          value={`${db.size_mb || 0} MB`}
          subtitle={`${db.table_count || 0} tabel (${db.server_version || 'MySQL'})`}
          icon={Database}
          colorClass="bg-teal-50 text-teal-600"
          actionLabel="Kelola DB"
          onAction={() => onNavigate('root-backup-db')}
        />

        <StatCard 
          title="Ruang Bebas Disk" 
          value={storage.free_disk_formatted || '0 GB'}
          subtitle={`Utilisasi ${storage.disk_used_percentage}% dari kuota ${storage.total_disk_formatted || '0 GB'}`}
          icon={HardDrive}
          colorClass="bg-emerald-50 text-emerald-600"
          actionLabel="Lihat E-File"
          onAction={() => onNavigate('root-e-file')}
        />

        <StatCard 
          title="Snapshot Cadangan" 
          value={`${backup.total_backups || 0} Arsip`}
          subtitle={backup.last_backup_time ? `Terakhir: ${new Date(backup.last_backup_time).toLocaleDateString('id-ID')}` : 'Belum ada arsip'}
          icon={FolderArchive}
          colorClass="bg-blue-50 text-blue-600"
          actionLabel="Unduh"
          onAction={() => onNavigate('root-backup-db')}
        />

        <StatCard 
          title="Log Audit Hari Ini" 
          value={`${logs.today_count || 0} Event`}
          subtitle={`${logs.errors_today || 0} Error • ${logs.warnings_today || 0} Warning`}
          icon={Activity}
          colorClass="bg-amber-50 text-amber-600"
          actionLabel="Audit Log"
          onAction={() => onNavigate('root-log-aktivitas')}
        />
      </div>

      {/* Storage Breakdown Widget */}
      <StorageMeterCard 
        storageData={storage} 
        onScanOrphans={() => onNavigate('root-e-file')}
      />

      {/* Health Check Details & Recent Critical Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Status Komponen Sistem */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Status Komponen Sistem
            </h3>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">HEALTH CHECK</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {healthData?.checks && Object.entries(healthData.checks).map(([key, item]) => (
              <div key={key} className="p-3 rounded-lg bg-gray-50/70 border border-gray-100 flex items-start gap-2.5">
                {item.status === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : item.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800 uppercase text-[11px]">{key.replace('_', ' ')}</span>
                    {item.latency && (
                      <span className="font-mono text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                        {item.latency}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-[11px] mt-0.5">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: 5 Log Kejadian Kritis Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Kejadian Kritis Terbaru (Audit Watch)
            </h3>
            <button
              onClick={() => onNavigate('root-log-aktivitas')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
            >
              Lihat Semua Log <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {logs.recent_critical && logs.recent_critical.length > 0 ? (
            <div className="divide-y divide-gray-100 text-xs">
              {logs.recent_critical.map((item) => (
                <div key={item.log_id} className="py-3 flex items-start justify-between gap-3 hover:bg-gray-50/50 rounded-lg px-2 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800">{item.module}</span>
                      <span className="text-gray-300">•</span>
                      <span className="font-mono text-[11px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{item.action}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        item.severity === 'danger' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs truncate max-w-xl">{item.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-gray-400 font-mono block">
                      {item.dibuat_pada ? new Date(item.dibuat_pada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {item.dibuat_pada ? new Date(item.dibuat_pada).toLocaleDateString('id-ID') : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400">
              <CheckCircle2 className="w-9 h-9 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-gray-700">Tidak ada kejadian kritis yang tercatat saat ini.</p>
              <p className="text-xs text-gray-400 mt-0.5">Seluruh parameter operasional sistem berjalan dengan aman.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RootDashboard;
