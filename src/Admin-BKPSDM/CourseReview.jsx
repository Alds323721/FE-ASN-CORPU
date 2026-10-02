import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});
import AdminBkpsdmProfile from '../components/AdminBkpsdmProfile';
import {
  Users, LayoutDashboard, ShieldCheck, BarChart3, LogOut, Bell, Settings,
  Search, ChevronRight, Menu, X, ArrowLeft, BookOpen, FileText, HelpCircle,
  Eye, File, Clock, PlayCircle, Layers, Sparkles, Star, MessageSquare, Package
} from 'lucide-react';

const AdminSidebar = ({ activeMenu = 'course-validation', onNavigate, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'admin', label: 'Dasbor', icon: LayoutDashboard },
    { id: 'user-management', label: 'Manajemen Pengguna', icon: Users },
    { id: 'community-management', label: 'Manajemen Komunitas', icon: Users },
    { id: 'category-management', label: 'Kategori Kursus', icon: Layers },
    { id: 'course-validation', label: 'Validasi Kursus', icon: ShieldCheck },
    { id: 'monitoring-reports', label: 'Monitoring & Laporan', icon: BarChart3 },
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
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors">
            Bantuan Teknis
          </button>
          <button
            onClick={() => onNavigate && onNavigate('landing')}
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
            placeholder="Cari course..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AdminBkpsdmProfile onNavigate={onNavigate} variant="header" />
      </div>
    </div>
  );
};

const CourseReview = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [course, setCourse] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showMateriModal, setShowMateriModal] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async (id) => {
      try {
        setLoadingDetails(true);
        const response = await api.get(`/admin-bkpsdm/approval/${id}`);
        const cData = response.data?.data;
        setCourse(cData);
      } catch (error) {
        console.error('Failed to fetch course details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };

    const data = localStorage.getItem('reviewCourseData');
    if (data) {
      const parsedData = JSON.parse(data);
      setCourse(parsedData);
      fetchCourseDetails(parsedData.pembelajaran_id);
    } else {
      if (onNavigate) onNavigate('course-validation');
    }
  }, [onNavigate]);

  const handleAction = async (status) => {
    try {
      const payload = {
        status_validasi: status,
        catatan: note
      };
      await api.post(`/admin-bkpsdm/approval/${course.pembelajaran_id}`, payload);
      Toast.fire({
        icon: 'success',
        title: `Validasi berhasil disimpan: ${status}`
      });
      if (onNavigate) onNavigate('course-validation');
    } catch (error) {
      console.error('Validation failed', error);
      Toast.fire({
        icon: 'error',
        title: error.response?.data?.message || 'Gagal menyimpan validasi'
      });
    }
  };

  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebar activeMenu="course-validation" onNavigate={onNavigate} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full overflow-hidden">
        <AdminHeader setIsOpen={setIsSidebarOpen} onNavigate={onNavigate} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto relative">

          <button
            onClick={() => onNavigate && onNavigate('course-validation')}
            className="flex items-center gap-2 text-gray-600 hover:text-teal-700 font-medium text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Validasi Kursus
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1D315F] mb-2">Tinjauan & Validasi Kursus</h1>
              <p className="text-sm text-gray-500">Tinjau detail konten pembelajaran sebelum dipublikasikan.</p>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-orange-50 border border-orange-200 text-orange-700">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              {course.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1 space-y-6">

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 text-lg mb-6">Informasi Utama Kursus</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">JUDUL KURSUS</p>
                    <p className="font-bold text-gray-800">{course.judul_pembelajaran}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">KOMUNITAS PENYELENGGARA</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800">
                        {course.komunitas?.nama_komunitas || (course.komunitas_id ? `Komunitas #${course.komunitas_id}` : '-')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kategori</p>
                    <span className="inline-block bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded text-sm font-semibold">
                      {course.kategori || 'Pengembangan Kompetensi'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nilai Kelulusan</p>
                    <div className="flex items-center gap-3">
                      <div className="border border-gray-200 rounded px-3 py-1 flex items-baseline gap-1">
                        <span className="font-bold text-gray-800">{course.nilai_kelulusan}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jam Pelajaran (JP)</p>
                    <div className="flex items-center gap-2">
                      <div className="border border-gray-200 rounded px-3 py-1 flex items-baseline gap-1 bg-gray-50">
                        <span className="font-bold text-gray-800">
                          {(() => {
                            if (course.total_jp !== undefined && course.total_jp !== null) {
                              return Number(course.total_jp);
                            }
                            const jpList = course.pembelajaran_jp || course.pembelajaranJp;
                            if (Array.isArray(jpList) && jpList.length > 0) {
                              const val = jpList[0].jp_dihitung_sistem ?? jpList[0].jp_final;
                              if (val !== undefined && val !== null) return Number(val);
                            }
                            const moduls = course.moduls || course.modul;
                            if (Array.isArray(moduls) && moduls.length > 0) {
                              return moduls.reduce((acc, m) => acc + (parseFloat(m.jp_modul) || 0), 0);
                            }
                            return 0;
                          })()}
                        </span>
                        <span className="text-xs font-semibold text-gray-500">JP</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pengaju Kursus</p>
                    <div className="flex flex-col">
                      <p className="font-bold text-gray-800 text-sm">
                        {course.perancang?.nama_lengkap || (course.dirancang_oleh_pengguna_id ? `User #${course.dirancang_oleh_pengguna_id}` : '-')}
                      </p>
                      {course.perancang?.nip && (
                        <p className="text-xs text-gray-400">NIP: {course.perancang.nip}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 text-lg mb-6">Deskripsi & Capaian</h3>
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-1">Deskripsi:</p>
                  <p className="text-sm text-gray-600">{course.deskripsi || '-'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-1">Capaian Pembelajaran:</p>
                  <p className="text-sm text-gray-600">{course.capaian_pembelajaran || '-'}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">Modul & Materi</h4>
                    <p className="text-xs text-gray-500">Lihat rincian modul, topik, dan bahan ajar.</p>
                  </div>
                  <button
                    onClick={() => setShowMateriModal(true)}
                    className="flex items-center gap-2 bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Lihat Detail Materi
                  </button>
                </div>
              </div>

              {/* Ulasan & Rating Peserta Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base">Ulasan & Rating Peserta</h3>
                      <p className="text-xs text-gray-500">Penilaian kepuasan mutu dari peserta yang telah mengikuti pelatihan ini.</p>
                    </div>
                  </div>
                  {course.statistik_ulasan?.total > 0 && (
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-bold flex items-center gap-1">
                      ⭐ {course.statistik_ulasan.rata_rata} ({course.statistik_ulasan.total} Ulasan)
                    </span>
                  )}
                </div>

                {course.statistik_ulasan && course.statistik_ulasan.total > 0 ? (
                  <div className="space-y-3 mt-4">
                    {course.statistik_ulasan.daftar.slice(0, 5).map((rev) => (
                      <div key={rev.ulasan_id} className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-gray-800 text-xs">{rev.nama_peserta}</span>
                            <span className="text-[11px] text-gray-400 ml-2">NIP. {rev.nip}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= rev.skor_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 italic bg-white p-2.5 rounded-lg border border-gray-100">
                          "{rev.teks_ulasan || 'Tanpa komentar teks'}"
                        </p>
                      </div>
                    ))}
                    {course.statistik_ulasan.total > 5 && (
                      <p className="text-xs text-center text-teal-700 font-semibold pt-1">
                        + {course.statistik_ulasan.total - 5} ulasan lainnya dapat dilihat di menu Monitoring & Laporan
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50/70 rounded-xl border border-dashed border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                      Pelatihan ini belum memiliki ulasan dari peserta (kursus baru atau belum ada peserta yang menyelesaikan).
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-full flex flex-col">
                <h3 className="font-bold text-gray-800 text-lg mb-3">Surat Pernyataan</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Dokumen pertanggungjawaban keaslian dan validitas materi dari penyelenggara.
                </p>

                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center flex-1 bg-gray-50/50 mb-6">
                  <File className="w-10 h-10 text-gray-400 mb-4" />
                  <p className="font-bold text-gray-800 text-sm mb-1 break-all">
                    {course.surat_pernyataan_url ? course.surat_pernyataan_url.split('/').pop() : 'Tidak ada lampiran'}
                  </p>
                </div>

                <a
                  href={course.surat_pernyataan_url ? (course.surat_pernyataan_url.startsWith('/storage/') ? `http://localhost:8000${course.surat_pernyataan_url}` : course.surat_pernyataan_url) : '#'}
                  target={course.surat_pernyataan_url ? "_blank" : "_self"}
                  rel="noreferrer"
                  className={`w-full bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${course.surat_pernyataan_url ? 'hover:bg-gray-50 text-gray-700' : 'text-gray-400 cursor-not-allowed opacity-50'}`}
                  onClick={(e) => {
                    if (!course.surat_pernyataan_url) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Eye className="w-4 h-4" /> 
                  Lihat Dokumen Lengkap
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowRejectModal(true)}
              className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-red-600 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Minta Revisi (Tolak)
            </button>
            <button
              onClick={() => handleAction('disetujui')}
              className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              Setujui & Publikasikan
            </button>
          </div>

          {/* Reject Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Catatan Revisi</h2>
                  <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pesan Revisi / Alasan Penolakan</label>
                    <textarea
                      required
                      rows={4}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                      placeholder="Masukkan catatan perbaikan..."
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Batal</button>
                    <button onClick={() => handleAction('ditolak')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Kirim & Tolak</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Materi Modal */}
          {showMateriModal && (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl">
                <div className="p-6 border-b border-gray-100 flex flex-col gap-4 shrink-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Detail Materi Pembelajaran</h2>
                      <p className="text-sm text-gray-500 mt-1">{course.judul_pembelajaran}</p>
                    </div>
                    <button onClick={() => setShowMateriModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {(() => {
                    const jpList = Array.isArray(course.pembelajaran_jp)
                      ? course.pembelajaran_jp
                      : Array.isArray(course.pembelajaranJp)
                      ? course.pembelajaranJp
                      : (course.pembelajaran_jp || course.pembelajaranJp)
                      ? [course.pembelajaran_jp || course.pembelajaranJp]
                      : [];
                    if (jpList.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-2">
                        {jpList.map((jp, jpIdx) => (
                          <span key={jp.pembelajaran_jp_id || jpIdx} className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                            {jp.kategori_jp || jp.jenis_pelatihan || 'Pelatihan'}: {jp.jp_final ?? jp.jp_dihitung_sistem ?? jp.jumlah_jp ?? 0} JP
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                  {course.moduls && course.moduls.length > 0 ? (
                    <div className="space-y-6">
                      {course.moduls.map((modul, index) => {
                        const materiList = Array.isArray(modul.materis)
                          ? modul.materis
                          : Array.isArray(modul.materi)
                          ? modul.materi
                          : [];

                        const kuisList = Array.isArray(modul.kuis)
                          ? modul.kuis
                          : modul.kuis
                          ? [modul.kuis]
                          : [];

                        return (
                          <div key={modul.modul_id || index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            {/* Header Modul */}
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                                <h3 className="font-bold text-gray-800 text-lg">Modul {modul.urutan || index + 1}: {modul.judul_modul}</h3>
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                                    <Clock className="w-3.5 h-3.5" />
                                    {modul.durasi_total_menit} Menit
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {modul.jp_modul} JP
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{modul.gambaran_umum}</p>
                              {modul.info_tatap_muka && (
                                <div className="mt-3 inline-flex items-start gap-2 bg-amber-50 text-amber-800 p-2.5 rounded-lg text-xs font-medium w-full">
                                  <Users className="w-4 h-4 shrink-0 mt-0.5" />
                                  <p>Info Tatap Muka: {modul.info_tatap_muka}</p>
                                </div>
                              )}
                            </div>

                            {/* Daftar Materi & Kuis */}
                            <div className="p-0">
                              {(materiList.length > 0 || kuisList.length > 0) ? (
                                <div className="divide-y divide-gray-100">
                                  {materiList.map((materi, mIdx) => (
                                    <div key={`materi-${materi.materi_id || mIdx}`} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${materi.tipe_materi === 'pdf' ? 'bg-red-50 text-red-600' : materi.tipe_materi === 'h5p' ? 'bg-purple-50 text-purple-600' : materi.tipe_materi === 'scorm' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {materi.tipe_materi === 'pdf' ? <FileText className="w-5 h-5" /> : materi.tipe_materi === 'h5p' ? <Sparkles className="w-5 h-5" /> : materi.tipe_materi === 'scorm' ? <Package className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-semibold text-gray-800 text-sm truncate">{materi.judul_materi}</h4>
                                          {materi.tipe_materi === 'h5p' && (
                                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-full">H5P Interaktif</span>
                                          )}
                                          {materi.tipe_materi === 'scorm' && (
                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-full">SCORM Interaktif</span>
                                          )}
                                          {materi.apakah_wajib ? (
                                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase tracking-wider">Wajib</span>
                                          ) : (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase tracking-wider">Opsional</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {materi.durasi_menit} Menit</span>
                                          <span className="flex items-center gap-1.5"><File className="w-3.5 h-3.5" /> {materi.tipe_materi === 'h5p' ? 'VIDEO INTERAKTIF (H5P)' : materi.tipe_materi === 'scorm' ? 'VIDEO INTERAKTIF (SCORM)' : (materi.tipe_materi || '').replace('_', ' ').toUpperCase()}</span>
                                        </div>
                                      </div>
                                      <a href={materi.tautan_atau_berkas?.startsWith('/storage/') ? `http://localhost:8000${materi.tautan_atau_berkas}` : materi.tautan_atau_berkas} target="_blank" rel="noreferrer" className="w-full sm:w-auto mt-3 sm:mt-0 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shrink-0">
                                        <Eye className="w-4 h-4" /> Lihat
                                      </a>
                                    </div>
                                  ))}
                                  {kuisList.map((k, kIdx) => (
                                    <div key={`kuis-${k.kuis_id || kIdx}`} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-purple-50 text-purple-600">
                                        <HelpCircle className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-semibold text-gray-800 text-sm truncate">{k.judul_kuis}</h4>
                                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase tracking-wider">Kuis</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {k.durasi_menit} Menit</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-8 text-center text-gray-500">
                                  <p className="text-sm">Belum ada materi atau kuis untuk modul ini.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Post Test */}
                      {(() => {
                        const postTestList = Array.isArray(course.post_tests)
                          ? course.post_tests
                          : Array.isArray(course.postTests)
                          ? course.postTests
                          : (course.post_test || course.postTest)
                          ? [course.post_test || course.postTest]
                          : [];

                        if (postTestList.length === 0) return null;

                        return (
                          <div className="bg-white border border-orange-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-orange-100 bg-orange-50/50">
                              <h3 className="font-bold text-orange-800 text-lg mb-2">Evaluasi Akhir (Post Test)</h3>
                              <p className="text-sm text-orange-700">Evaluasi yang harus diselesaikan setelah semua modul selesai.</p>
                            </div>
                            <div className="divide-y divide-gray-100 p-0">
                              {postTestList.map((pt, ptIdx) => (
                                <div key={`pt-${pt.post_test_id || ptIdx}`} className="p-4 hover:bg-orange-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-orange-100 text-orange-600">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-gray-800 text-sm truncate">{pt.judul_post_test}</h4>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {pt.durasi_menit} Menit</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Modul & Materi Kosong</h3>
                      <p className="text-sm text-gray-500 max-w-sm">Kursus ini belum memiliki modul atau materi yang terdaftar pada sistem.</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end shrink-0">
                  <button onClick={() => setShowMateriModal(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors w-full sm:w-auto">
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CourseReview;
