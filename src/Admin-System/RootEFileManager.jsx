import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Search,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  FolderArchive,
  FileText,
  Image,
  ShieldAlert,
  CheckCircle2,
  X,
  FileCode,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import StorageMeterCard from './components/StorageMeterCard';
import {
  confirmDeleteFile,
  confirmCleanOrphans,
  showLoadingAlert,
  closeAlert,
  showSuccessAlert,
  showErrorAlert,
  systemToast
} from './utils/systemAlerts';

const RootEFileManager = () => {
  const [activeTab, setActiveTab] = useState('explorer'); // 'explorer' | 'orphans'
  const [storageSummary, setStorageSummary] = useState(null);

  // File Explorer State
  const [files, setFiles] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [category, setCategory] = useState('semua');
  const [search, setSearch] = useState('');
  const [extension, setExtension] = useState('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  // Orphan Scanner State
  const [orphanData, setOrphanData] = useState(null);
  const [isScanningOrphans, setIsScanningOrphans] = useState(false);
  const [isCleaningOrphans, setIsCleaningOrphans] = useState(false);

  // Preview Modal State
  const [previewFile, setPreviewFile] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  useEffect(() => {
    let active = true;
    let createdUrl = null;

    if (previewFile && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'].includes(previewFile.extension)) {
      setIsLoadingPreview(true);
      setPreviewError(null);

      api.get(`/root/e-file/download?path=${encodeURIComponent(previewFile.path)}&preview=true`, {
        responseType: 'blob',
      })
      .then((res) => {
        if (!active) return;
        const mimeType = previewFile.extension === 'pdf' ? 'application/pdf' : (res.data.type || 'image/jpeg');
        const blob = new Blob([res.data], { type: mimeType });
        createdUrl = window.URL.createObjectURL(blob);
        setPreviewBlobUrl(createdUrl);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to load preview:', err);
        setPreviewError('Gagal memuat pratinjau berkas: ' + (err.response?.data?.message || err.message));
      })
      .finally(() => {
        if (active) setIsLoadingPreview(false);
      });
    } else {
      setPreviewBlobUrl(null);
      setIsLoadingPreview(false);
      setPreviewError(null);
    }

    return () => {
      active = false;
      if (createdUrl) {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [previewFile]);

  const fetchStorageSummary = async () => {
    try {
      const res = await api.get('/root/e-file/summary');
      setStorageSummary(res.data?.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFiles = async (page = 1) => {
    try {
      setIsLoadingFiles(true);
      const params = {
        page,
        per_page: 15,
        category: category !== 'semua' ? category : undefined,
        search: search || undefined,
        extension: extension || undefined,
      };

      const res = await api.get('/root/e-file/files', { params });
      const data = res.data?.data || {};
      setFiles(data.data || []);
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const scanOrphans = async (silent = false) => {
    try {
      setIsScanningOrphans(true);
      const res = await api.get('/root/e-file/scan-orphans');
      const data = res.data?.data || null;
      setOrphanData(data);

      if (!silent) {
        systemToast({
          icon: 'success',
          title: `Pemindaian selesai: Ditemukan ${data?.orphan_count || 0} berkas tanpa relasi.`,
        });
      }
    } catch (err) {
      showErrorAlert({
        title: 'Gagal Memindai Berkas Tanpa Relasi',
        error: err,
      });
    } finally {
      setIsScanningOrphans(false);
    }
  };

  useEffect(() => {
    fetchStorageSummary();
    fetchFiles(1);
  }, [category, extension]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFiles(1);
  };

  const handleDownloadFile = async (path, filename) => {
    try {
      systemToast({
        icon: 'info',
        title: `Mengunduh berkas ${filename}...`,
      });

      const response = await api.get(`/root/e-file/download?path=${encodeURIComponent(path)}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
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

  const handleDeleteFile = async (file, fallbackName = 'Berkas') => {
    const fileObj = typeof file === 'string' ? { path: file, name: fallbackName } : file;
    const result = await confirmDeleteFile(fileObj);
    if (!result.isConfirmed) return;

    try {
      showLoadingAlert('Menghapus Berkas...', 'Sedang menghapus berkas fisik dari server storage.');
      await api.delete('/root/e-file/file', { 
        data: { path: fileObj.path },
        params: { path: fileObj.path }
      });
      closeAlert();

      systemToast({
        icon: 'success',
        title: `Berkas "${fileObj.name}" berhasil dihapus.`,
      });

      if (previewFile && previewFile.path === fileObj.path) {
        setPreviewFile(null);
      }

      if (activeTab === 'orphans') {
        scanOrphans(true);
      }

      const targetPage = (files.length === 1 && pagination.current_page > 1)
        ? pagination.current_page - 1
        : pagination.current_page;

      fetchFiles(targetPage);
      fetchStorageSummary();
    } catch (err) {
      closeAlert();
      showErrorAlert({
        title: 'Gagal Menghapus Berkas',
        error: err,
      });
    }
  };

  const handleCleanOrphans = async (all = true) => {
    const result = await confirmCleanOrphans(orphanData);
    if (!result.isConfirmed) return;

    try {
      setIsCleaningOrphans(true);
      showLoadingAlert(
        'Membersihkan Berkas Tanpa Relasi...',
        'Sedang menghapus berkas fisik tak berelasi dari disk server storage.'
      );

      const res = await api.post('/root/e-file/clean-orphans', { clean_all: all });
      closeAlert();

      showSuccessAlert({
        title: 'Pembersihan Selesai',
        text: res.data?.message || 'Seluruh berkas tanpa relasi berhasil dibersihkan dari server storage.',
      });

      scanOrphans(true);
      fetchStorageSummary();
    } catch (err) {
      closeAlert();
      showErrorAlert({
        title: 'Gagal Membersihkan Berkas',
        error: err,
      });
    } finally {
      setIsCleaningOrphans(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header section matching Admin BKPSDM */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Tata Kelola Berkas (E-File)</h1>
          <p className="text-sm text-gray-500">
            Pusat eksplorasi media digital, monitoring kuota penyimpanan, dan pembersihan berkas tanpa relasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => {
              setActiveTab('orphans');
              scanOrphans();
            }}
            disabled={isScanningOrphans}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto shrink-0 disabled:opacity-50"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Pindai Berkas Tanpa Relasi</span>
          </button>

          <button
            onClick={() => {
              fetchStorageSummary();
              fetchFiles(pagination.current_page);
            }}
            disabled={isLoadingFiles}
            className="p-2.5 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-colors border border-gray-200 shadow-2xs shrink-0"
            title="Muat Ulang Berkas"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Storage Meter Summary Widget */}
      <StorageMeterCard
        storageData={storageSummary}
        onScanOrphans={() => {
          setActiveTab('orphans');
          scanOrphans();
        }}
        isScanning={isScanningOrphans}
      />

      {/* Tab Navigation (Matching Admin BKPSDM) */}
      <div className="flex border-b border-gray-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'explorer'
            ? 'border-teal-700 text-teal-700 font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>Penjelajah Berkas (File Explorer)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('orphans');
            if (!orphanData) scanOrphans();
          }}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'orphans'
            ? 'border-teal-700 text-teal-700 font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Berkas Tanpa Relasi (Unlinked Files)</span>
          {orphanData?.orphan_count > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
              {orphanData.orphan_count}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: FILE EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          {/* Filters Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama berkas media..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="semua">Semua Kategori</option>
                  <option value="sertifikat">Sertifikat</option>
                  <option value="materi">Materi</option>
                  <option value="thumbnails">Thumbnails</option>
                  <option value="komunitas">Komunitas</option>
                  <option value="modul">Modul</option>
                  <option value="backup">Backup DB</option>
                </select>

                <select
                  value={extension}
                  onChange={(e) => setExtension(e.target.value)}
                  className="py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Semua Ekstensi</option>
                  <option value="pdf">PDF</option>
                  <option value="jpg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WEBP</option>
                  <option value="gz">GZ (Backup)</option>
                  <option value="mp4">MP4</option>
                </select>

                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  Cari
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCategory('semua');
                    setExtension('');
                    fetchFiles(1);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Files Table */}
          <div className="overflow-x-auto relative">
            {isLoadingFiles && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 text-sm font-medium text-teal-700">
                  <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  Menjelajahi direktori berkas...
                </div>
              </div>
            )}

            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NAMA BERKAS</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">LOKASI STORAGE</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">FORMAT</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">UKURAN</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">TERAKHIR DIUBAH</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.length === 0 && !isLoadingFiles ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <FolderArchive className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-700">Tidak ada berkas yang sesuai dengan kriteria.</p>
                    </td>
                  </tr>
                ) : (
                  files.map((file, idx) => {
                    const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(file.extension);
                    const isPdf = file.extension === 'pdf';

                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200/80 flex items-center justify-center shrink-0">
                              {isImg ? (
                                <Image className="w-4 h-4 text-amber-500" />
                              ) : isPdf ? (
                                <FileText className="w-4 h-4 text-rose-500" />
                              ) : (
                                <FileCode className="w-4 h-4 text-teal-700" />
                              )}
                            </div>
                            <span className="truncate max-w-xs font-mono text-xs text-gray-800" title={file.name}>
                              {file.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-gray-400 truncate max-w-xs" title={file.path}>
                          {file.path}
                        </td>

                        <td className="px-6 py-4 uppercase font-bold text-xs text-gray-600 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[10px]">
                            {file.extension}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap font-mono text-xs">
                          {file.size_formatted}
                        </td>

                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap font-mono text-xs">
                          {file.last_modified}
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            {(isImg || isPdf) && (
                              <button
                                onClick={() => setPreviewFile(file)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200"
                                title="Lihat Pratinjau (Preview)"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDownloadFile(file.path, file.name)}
                              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                              title="Unduh Berkas"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteFile(file)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                              title="Hapus Berkas"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (15 items per page) */}
          {pagination.total > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div>
                <span>
                  Menampilkan <b>{Math.min((pagination.current_page - 1) * 15 + 1, pagination.total)}</b> - <b>{Math.min(pagination.current_page * 15, pagination.total)}</b> dari <b>{pagination.total}</b> berkas
                </span>
                <span className="text-gray-400 ml-2 hidden sm:inline">(15 baris per halaman)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchFiles(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1 || isLoadingFiles}
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
                  onClick={() => fetchFiles(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page || isLoadingFiles}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs transition-colors shadow-2xs"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UNLINKED FILES SCANNER */}
      {activeTab === 'orphans' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-teal-700" />
                Pembersih Berkas Tanpa Relasi (Unlinked File Cleaner)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Mendeteksi file fisik di storage yang tidak lagi memiliki relasi di basis data (misal akibat kursus/materi terhapus).
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={scanOrphans}
                disabled={isScanningOrphans}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanningOrphans ? 'animate-spin' : ''}`} />
                <span>Pindai Ulang</span>
              </button>

              {orphanData?.orphan_count > 0 && (
                <button
                  onClick={() => handleCleanOrphans(true)}
                  disabled={isCleaningOrphans}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isCleaningOrphans ? 'Membersihkan...' : 'Bersihkan Semua Berkas Tanpa Relasi'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Scanner Summary Box */}
          {orphanData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                  {orphanData.orphan_count}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Berkas Tanpa Relasi</h4>
                  <p className="text-[11px] text-gray-500">File tanpa relasi di storage publik</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Ruang Dapat Dipulihkan</h4>
                  <p className="text-base font-bold text-emerald-700 font-mono">{orphanData.total_reclaimable_formatted}</p>
                </div>
              </div>
            </div>
          )}

          {/* Orphan List Table */}
          {isScanningOrphans ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <div className="w-7 h-7 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-medium">Memindai seluruh relasi tabel database & storage...</p>
            </div>
          ) : !orphanData || orphanData.orphan_count === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-gray-800">Penyimpanan Bersih!</h4>
              <p className="text-xs text-gray-500">
                Tidak ada berkas tanpa relasi yang ditemukan di storage sistem.
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Nama Berkas Tanpa Relasi</th>
                      <th className="py-2.5 px-4">Path Storage</th>
                      <th className="py-2.5 px-3">Ukuran</th>
                      <th className="py-2.5 px-3">Tanggal File</th>
                      <th className="py-2.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {orphanData.files.map((item, i) => {
                      const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(item.extension);
                      const isPdf = item.extension === 'pdf';

                      return (
                        <tr key={i} className="hover:bg-rose-50/30 transition-colors">
                          <td className="py-2.5 px-4 font-mono text-[11px] text-gray-800 font-medium">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-gray-400">
                            {item.path}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-rose-600 font-mono">
                            {item.size_formatted}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 font-mono text-[10px]">
                            {item.last_modified}
                          </td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {(isImg || isPdf) && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewFile(item)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
                                  title="Lihat Pratinjau Berkas"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Preview</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDownloadFile(item.path, item.name)}
                                className="p-1 rounded text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                                title="Unduh Berkas Ini"
                              >
                                <Download className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteFile(item)}
                                className="p-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                                title="Hapus Berkas Ini"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded uppercase text-[10px] font-bold bg-gray-100 text-gray-700 font-mono">
                    {previewFile.extension}
                  </span>
                  <h3 className="text-sm font-bold text-gray-800 truncate" title={previewFile.name}>
                    {previewFile.name}
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate font-mono">
                  {previewFile.size_formatted} • {previewFile.path}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewFile.path, previewFile.name)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
                  title="Unduh Berkas Ini"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteFile(previewFile)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Hapus Berkas Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button 
                  type="button"
                  onClick={() => setPreviewFile(null)} 
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Viewer */}
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-gray-950 min-h-[380px]">
              {isLoadingPreview ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                  <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Memuat pratinjau berkas...</span>
                </div>
              ) : previewError ? (
                <div className="text-center p-8 space-y-3">
                  <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
                  <p className="text-rose-400 text-xs font-medium">{previewError}</p>
                  <button
                    onClick={() => handleDownloadFile(previewFile.path, previewFile.name)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas Langsung</span>
                  </button>
                </div>
              ) : previewBlobUrl && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(previewFile.extension) ? (
                <img
                  src={previewBlobUrl}
                  alt={previewFile.name}
                  className="max-h-[70vh] object-contain rounded-lg shadow-xl"
                />
              ) : previewBlobUrl && previewFile.extension === 'pdf' ? (
                <iframe
                  src={previewBlobUrl}
                  title={previewFile.name}
                  className="w-full h-[70vh] rounded-lg border-0 bg-white"
                />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <FileCode className="w-12 h-12 mx-auto text-gray-600" />
                  <p className="text-gray-300 text-sm font-medium">Pratinjau visual langsung tidak didukung untuk tipe berkas ini.</p>
                  <p className="text-gray-500 text-xs font-mono">{previewFile.name}</p>
                  <button
                    onClick={() => handleDownloadFile(previewFile.path, previewFile.name)}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas untuk Membuka</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootEFileManager;
