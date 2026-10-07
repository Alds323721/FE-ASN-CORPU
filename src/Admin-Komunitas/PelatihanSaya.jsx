import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import logoImg from '../assets/logo-removebg-preview 1.png';
import AdminKomunitasProfile from '../components/AdminKomunitasProfile';
import { 
  Users, BookOpen, Award, TrendingUp, TrendingDown,
  LayoutDashboard, LogOut, Bell, Settings, Search, Menu, X,
  FileText, RotateCcw, ChevronDown, CheckCircle2,
  PlayCircle, Edit, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Clock,
  BarChart2, Book, HelpCircle, GraduationCap, HeadphonesIcon, Plus, MoreVertical, Trash2,
  Upload, Image as ImageIcon
} from 'lucide-react';

import AdminKomunitasSidebar from '../components/layout/AdminKomunitasSidebar';
import AdminKomunitasHeader from '../components/layout/AdminKomunitasHeader';
import { validateThumbnailFile } from '../utils/imageValidation';

const PelatihanSaya = ({ onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Aktif');
  const [toastMessage, setToastMessage] = useState('');

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [komunitasList, setKomunitasList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    komunitas_id: '',
    judul_pembelajaran: '',
    kategori_id: '',
    kategori: 'Pengembangan Kompetensi',
    capaian_pembelajaran: '',
    nilai_kelulusan: 70
  });
  const [courseThumbnailFile, setCourseThumbnailFile] = useState(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState('');

  const handleCourseThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = validateThumbnailFile(file, e.target, () => {
      setCourseThumbnailFile(null);
      setCourseThumbnailPreview('');
    });
    if (!isValid) return;

    setCourseThumbnailFile(file);
    setCourseThumbnailPreview(URL.createObjectURL(file));
  };

  const handleRemoveCourseThumbnail = () => {
    setCourseThumbnailFile(null);
    setCourseThumbnailPreview('');
  };

  const tabs = ['Aktif', 'Draft', 'Menunggu Approval', 'Ditolak'];

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin-komunitas/pembelajaran');
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKomunitas = async () => {
    try {
      const response = await api.get('/admin-komunitas/komunitas-saya');
      setKomunitasList(response.data.data);
      if (response.data.data.length > 0) {
        setFormData(prev => ({ ...prev, komunitas_id: response.data.data[0].komunitas_id }));
      }
    } catch (error) {
      console.error('Error fetching komunitas:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/kategori-kursus');
      const cats = response.data?.data || [];
      setCategories(cats);
      if (cats.length > 0) {
        setFormData(prev => ({
          ...prev,
          kategori_id: prev.kategori_id || cats[0].kategori_id,
          kategori: prev.kategori || cats[0].nama_kategori
        }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchKomunitas();
    fetchCategories();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (courseThumbnailFile && !validateThumbnailFile(courseThumbnailFile, null, () => {
      setCourseThumbnailFile(null);
      setCourseThumbnailPreview('');
    })) {
      return;
    }

    try {
      const data = new FormData();
      data.append('komunitas_id', formData.komunitas_id);
      data.append('judul_pembelajaran', formData.judul_pembelajaran);
      if (formData.kategori_id) {
        data.append('kategori_id', formData.kategori_id);
      }
      data.append('kategori', formData.kategori);
      data.append('capaian_pembelajaran', formData.capaian_pembelajaran);
      data.append('nilai_kelulusan', formData.nilai_kelulusan);
      data.append('deskripsi', '');
      if (courseThumbnailFile) {
        data.append('thumbnail', courseThumbnailFile);
      }

      const response = await api.post('/admin-komunitas/pembelajaran', data);
      
      setToastMessage('Draf pembelajaran berhasil dibuat!');
      setShowCreateModal(false);
      setCourseThumbnailFile(null);
      setCourseThumbnailPreview('');
      
      setTimeout(() => {
        setToastMessage('');
        localStorage.setItem('adminKomunitasCourseId', response.data.data.pembelajaran_id);
        if (onNavigate) onNavigate('detail-kursus');
      }, 1500);
    } catch (error) {
      console.error('Error creating course:', error);
      const errThumbnail = error.response?.data?.errors?.thumbnail?.[0];
      const errMsg = errThumbnail || error.response?.data?.message || 'Gagal membuat pembelajaran';

      if (errThumbnail || (errMsg && errMsg.toLowerCase().includes('2mb'))) {
        Swal.fire({
          icon: 'warning',
          title: 'Ukuran Foto Melebihi 2MB!',
          html: `
            <div class="text-left text-xs sm:text-sm text-gray-600 space-y-2 pt-1">
              <p class="bg-red-50 text-red-800 p-2.5 rounded-lg border border-red-200">
                ${errMsg}
              </p>
              <p>Harap <b>mengompres foto thumbnail kursus</b> Anda terlebih dahulu agar berukuran di bawah 2MB sebelum menyimpannya.</p>
            </div>
          `,
          confirmButtonColor: '#0F766E',
          confirmButtonText: 'Saya Mengerti, Kompres Dulu'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Membuat Pelatihan',
          text: errMsg,
          confirmButtonColor: '#0F766E'
        });
      }
    }
  };

  const handleDeleteCourse = async (courseId, title) => {
    const result = await Swal.fire({
      title: 'Hapus Pelatihan?',
      text: `Apakah Anda yakin ingin menghapus "${title}"? Seluruh modul, materi, kuis, dan data terkait akan dihapus secara permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus Permanen',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/admin-komunitas/pembelajaran/${courseId}`);
      setCourses(prev => prev.filter(c => c.pembelajaran_id !== courseId));
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dihapus',
        text: 'Pelatihan beserta seluruh kontennya berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus pelatihan.'
      });
    }
  };

  const getFilteredCourses = () => {
    if (activeTab === 'Aktif') return courses.filter(c => c.status === 'dipublikasikan');
    if (activeTab === 'Draft') return courses.filter(c => c.status === 'draft');
    if (activeTab === 'Menunggu Approval') return courses.filter(c => c.status === 'menunggu_approval');
    if (activeTab === 'Ditolak') return courses.filter(c => c.status === 'ditolak');
    return courses;
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans relative">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-down border border-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}
      
      <AdminKomunitasSidebar 
        activeMenu="pelatihan-saya" 
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminKomunitasHeader setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Manajemen Pelatihan</h1>
                <p className="text-sm text-gray-500">Kelola konten pelatihan dan pantau progres peserta di komunitas Anda.</p>
              </div>
              <button 
                onClick={() => {
                  setCourseThumbnailFile(null);
                  setCourseThumbnailPreview('');
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 bg-[#0F766E] hover:bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Buat Pelatihan Baru
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6 overflow-x-auto">
              <nav className="flex space-x-8 min-w-max" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer
                      ${activeTab === tab
                        ? 'border-[#0F766E] text-[#0F766E]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full py-12 text-center text-gray-500">Memuat data pelatihan...</div>
              ) : filteredCourses.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  Belum ada pelatihan untuk status {activeTab}.
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div key={course.pembelajaran_id} className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                    {/* Card Cover / Thumbnail */}
                    <div className="h-44 bg-gray-100 relative w-full overflow-hidden shrink-0">
                      <img 
                        src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'} 
                        alt={course.judul_pembelajaran} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {course.dapat_dikelola !== false && (
                          <button 
                            onClick={() => handleDeleteCourse(course.pembelajaran_id, course.judul_pembelajaran)}
                            title="Hapus Pelatihan"
                            className="bg-white/90 hover:bg-white text-gray-500 hover:text-red-600 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-white/95 text-blue-700 shadow-xs backdrop-blur-xs">
                          {course.kategori || 'Pengembangan Kompetensi'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {course.komunitas?.rumpun_jabatan === 'UMUM' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 uppercase">
                            Umum
                          </span>
                        )}
                        {course.status === 'dipublikasikan' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                            Aktif
                          </span>
                        )}
                        {course.status === 'draft' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                            Draft
                          </span>
                        )}
                        {course.status === 'ditolak' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                            Ditolak
                          </span>
                        )}
                        {course.status === 'menunggu_approval' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
                            Menunggu Approval
                          </span>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="mb-4 flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                          {course.judul_pembelajaran}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{course.nilai_kelulusan} Min. Lulus</span>
                          </div>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            <span>{course.modules_count ?? course.modules ?? course.modul?.length ?? 0} Modul</span>
                          </div>
                        </div>

                        {/* Rejection Note Preview */}
                        {course.status === 'ditolak' && course.validasi?.catatan && (
                          <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                            <span className="font-bold block text-red-800 mb-0.5">Catatan Penolakan:</span>
                            <p className="line-clamp-2 italic">"{course.validasi.catatan}"</p>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-teal-700" />
                          </div>
                          <span className="text-xs font-semibold text-gray-900">{course.total_peserta ?? course.peserta_count ?? 0} Peserta</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-gray-500 mb-0.5">Rata-rata Progres</p>
                          <p className="text-xs font-bold text-teal-600">{course.avg_progres ?? 0}%</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto">
                        <button 
                          onClick={() => {
                            localStorage.setItem('adminKomunitasCourseId', course.pembelajaran_id);
                            if (onNavigate) onNavigate('detail-kursus');
                          }}
                          className="flex-1 px-3 py-2 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors text-center flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{course.dapat_dikelola === false ? 'Lihat Detail (Hanya Baca)' : course.status === 'dipublikasikan' ? 'Kelola / Edit' : course.status === 'draft' || course.status === 'ditolak' ? 'Edit Konten' : 'Lihat Detail'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </main>
      </div>

      {/* Modal Buat Pelatihan */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Buat Pelatihan Baru</h2>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setCourseThumbnailFile(null);
                  setCourseThumbnailPreview('');
                }} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Komunitas Penyelenggara</label>
                <select 
                  required
                  value={formData.komunitas_id}
                  onChange={e => setFormData({...formData, komunitas_id: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                >
                  <option value="" disabled>Pilih Komunitas</option>
                  {komunitasList.map(k => (
                    <option key={k.komunitas_id} value={k.komunitas_id}>
                      {k.nama_komunitas}{k.is_umum ? ' (Umum – semua rumpun)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Pelatihan</label>
                <input 
                  type="text" 
                  required
                  value={formData.judul_pembelajaran}
                  onChange={e => setFormData({...formData, judul_pembelajaran: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  placeholder="Contoh: Etika Birokrasi Modern"
                />
              </div>

              {/* Upload Thumbnail Kursus */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Thumbnail / Banner Kursus <span className="text-gray-400 text-xs font-normal">(Opsional, Maks 2MB)</span>
                </label>
                {courseThumbnailPreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 h-36 bg-gray-50 flex items-center justify-center">
                    <img 
                      src={courseThumbnailPreview} 
                      alt="Preview Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCourseThumbnail}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-colors cursor-pointer"
                      title="Hapus Thumbnail"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-teal-600 hover:bg-teal-50/30 transition-all text-center">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs font-semibold text-gray-700">Unggah Gambar Thumbnail</span>
                    <span className="text-[11px] text-gray-500 mt-0.5">Format: JPG, PNG, WEBP (Maksimal 2MB)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleCourseThumbnailChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                <select 
                  required
                  value={formData.kategori_id || formData.kategori}
                  onChange={e => {
                    const selectedVal = e.target.value;
                    const catObj = categories.find(c => String(c.kategori_id) === String(selectedVal) || c.nama_kategori === selectedVal);
                    setFormData({
                      ...formData,
                      kategori_id: catObj ? catObj.kategori_id : '',
                      kategori: catObj ? catObj.nama_kategori : selectedVal
                    });
                  }}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                >
                  {categories.length > 0 ? (
                    categories.map(c => (
                      <option key={c.kategori_id} value={c.kategori_id}>
                        {c.nama_kategori}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Pengembangan Kompetensi">Pengembangan Kompetensi</option>
                      <option value="Manajemen ASN">Manajemen ASN</option>
                      <option value="Teknologi Informasi">Teknologi Informasi</option>
                      <option value="Pelayanan Publik">Pelayanan Publik</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Capaian Pembelajaran (Target)</label>
                <textarea 
                  required
                  rows="3"
                  value={formData.capaian_pembelajaran}
                  onChange={e => setFormData({...formData, capaian_pembelajaran: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  placeholder="Apa yang akan didapatkan peserta..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nilai Kelulusan (0-100)</label>
                <input 
                  type="number" 
                  required
                  min="0" max="100"
                  value={formData.nilai_kelulusan}
                  onChange={e => setFormData({...formData, nilai_kelulusan: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setCourseThumbnailFile(null);
                    setCourseThumbnailPreview('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg font-semibold text-sm cursor-pointer shadow-xs"
                >
                  Simpan Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PelatihanSaya;
