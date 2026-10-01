import React, { useState, useEffect } from 'react';
import AdminKomunitasSkeleton from './AdminKomunitasSkeleton';
import api from '../api/axios';
import Swal from 'sweetalert2';
import logoImg from '../assets/logo-removebg-preview 1.png';
import AdminKomunitasProfile from '../components/AdminKomunitasProfile';
import {
  Users, BookOpen, Award, TrendingUp, TrendingDown,
  LayoutDashboard, LogOut, Bell, Settings, Search, Menu, X,
  FileText, RotateCcw, ChevronDown, CheckCircle2,
  PlayCircle, Edit, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Clock,
  BarChart2, Book, HelpCircle, GraduationCap, HeadphonesIcon,
  ArrowLeft, Upload, Plus, AlertCircle, File, Eye, Trash2, Edit2, Download,
  ExternalLink, Video, Check, Image as ImageIcon, Grid, Sparkles, RefreshCw,
  Star, MessageSquare, ThumbsUp
} from 'lucide-react';
import { generateCrosswordLayout } from '../utils/crosswordGenerator';
import CrosswordBoard from '../components/CrosswordBoard';
import DragDropQuiz from '../components/DragDropQuiz';

const AdminSidebar = ({ activeMenu = 'katalog-kursus', onNavigate, isOpen, setIsOpen }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [communityName, setCommunityName] = useState('Dinas Kesehatan');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
      }
      api.get('/admin-komunitas/komunitas-saya').then(res => {
        if (res.data?.data?.length > 0) {
          const own = res.data.data.find(k => !k.is_umum) || res.data.data[0];
          setCommunityName(own.nama_komunitas);
        }
      }).catch(() => { });
    } catch (e) { }
  }, []);

  const menuItems = [
    { id: 'admin-komunitas', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pelatihan-saya', label: 'Pelatihan Saya', icon: GraduationCap },
    { id: 'laporan-progress', label: 'Laporan Progress', icon: BarChart2 },
    { id: 'katalog-kursus', label: 'Katalog Kursus', icon: Book },
    { id: 'pusat-bantuan', label: 'Pusat Bantuan', icon: HelpCircle },
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
        {/* Logo Section */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight text-[#1D315F]">Buleleng ASN Corpu</h1>
              <p className="text-[10px] text-gray-500 font-medium">E-Learning System</p>
            </div>
          </div>

          <AdminKomunitasProfile currentUser={currentUser} communityName={communityName} onNavigate={onNavigate} />
        </div>

        <div className="flex-1 py-2 px-4 space-y-1 overflow-y-auto">
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
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="text-left truncate leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-2 mt-auto">
          <button
            onClick={() => onNavigate && onNavigate('pusat-bantuan')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-teal-600 text-teal-700 rounded-lg text-sm font-semibold hover:bg-teal-50 transition-colors"
          >
            <HeadphonesIcon className="w-4 h-4" /> Bantuan Teknis
          </button>
          <button
            onClick={() => onNavigate && onNavigate('landing')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
};

const Header = ({ setIsOpen }) => (
  <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
    <div className="flex items-center gap-4 flex-1">
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="relative w-full max-w-md hidden sm:block">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari modul atau materi..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        />
      </div>
    </div>
  </header>
);

const DetailKursus = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [postTest, setPostTest] = useState(null);
  const [openModuleIds, setOpenModuleIds] = useState({});
  const [loading, setLoading] = useState(true);

  // Course Thumbnail State
  const [courseThumbnailFile, setCourseThumbnailFile] = useState(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState('');
  const [savingBasicInfo, setSavingBasicInfo] = useState(false);

  // Modal State: Tambah & Edit Modul
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleForm, setModuleForm] = useState({ judul_modul: '', deskripsi: '', jp_modul: '' });
  const [moduleThumbnailFile, setModuleThumbnailFile] = useState(null);
  const [moduleThumbnailPreview, setModuleThumbnailPreview] = useState('');

  // Modal State: Tambah Materi
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    judul_materi: '',
    tipe_materi: 'pdf',
    durasi_menit: 15,
    tautan_atau_berkas_embed: '',
    file_pdf: null
  });

  // Modal State: Edit Materi
  const [showEditMaterialModal, setShowEditMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editMaterialForm, setEditMaterialForm] = useState({
    judul_materi: '',
    tipe_materi: 'pdf',
    durasi_menit: 15,
    tautan_atau_berkas_embed: '',
    file_pdf: null,
    apakah_wajib: true
  });

  // Modal State: Kuis & Pre-Test Modul
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [targetQuizModule, setTargetQuizModule] = useState(null);
  const [targetQuizType, setTargetQuizType] = useState('evaluasi_modul'); // 'evaluasi_modul' | 'pre_test'
  const [targetQuizMateri, setTargetQuizMateri] = useState(null);
  const [quizForm, setQuizForm] = useState({
    judul_kuis: '',
    durasi_menit: 15,
    nilai_kelulusan: 70,
    maks_percobaan: 3,
    soal: []
  });
  const [newQuizItem, setNewQuizItem] = useState({
    teks_soal: '',
    kunci_jawaban: 'A',
    opsiA: '',
    opsiB: '',
    opsiC: '',
    opsiD: ''
  });
  const [quizActiveTab, setQuizActiveTab] = useState('pilihan_ganda'); // 'pilihan_ganda' | 'tts'
  const [ttsInputWords, setTtsInputWords] = useState([]);
  const [newTtsItem, setNewTtsItem] = useState({ word: '', clue: '' });
  const [ttsLayout, setTtsLayout] = useState(null);
  const [newDragDropItem, setNewDragDropItem] = useState({
    teks_soal: '',
    distractors: '',
    bobot_nilai: 1
  });

  // Surat Pernyataan State
  const [suratFile, setSuratFile] = useState(null);
  const [isUploadingSurat, setIsUploadingSurat] = useState(false);
  const [categories, setCategories] = useState([]);

  // Ulasan & Rating Peserta State
  const [reviewsData, setReviewsData] = useState({
    statistik: {
      total_ulasan: 0,
      rata_rata: 0,
      distribusi: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    },
    ulasan: []
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [selectedReviewStar, setSelectedReviewStar] = useState('all');

  const fetchCourseData = async () => {
    const id = localStorage.getItem('adminKomunitasCourseId');
    if (!id) {
      if (onNavigate) onNavigate('katalog-kursus');
      return;
    }
    try {
      setLoading(true);
      const [resCourse, resModul, resPostTest, resKategori, resUlasan] = await Promise.allSettled([
        api.get(`/admin-komunitas/pembelajaran/${id}`),
        api.get(`/admin-komunitas/pembelajaran/${id}/modul`),
        api.get(`/admin-komunitas/pembelajaran/${id}/post-test`),
        api.get('/kategori-kursus'),
        api.get(`/admin-komunitas/pembelajaran/${id}/ulasan`)
      ]);

      if (resKategori && resKategori.status === 'fulfilled') {
        setCategories(resKategori.value.data?.data || []);
      }

      if (resCourse.status === 'fulfilled') {
        const cData = resCourse.value.data.data;
        if (cData) {
          if (!cData.kategori) {
            cData.kategori = 'Pengembangan Kompetensi';
          }
          if (cData.deskripsi === '-') {
            cData.deskripsi = '';
          }
        }
        setCourse(cData);
        setCourseThumbnailPreview(cData?.thumbnail_url || '');
        setCourseThumbnailFile(null);
      }
      if (resModul.status === 'fulfilled') {
        const modData = resModul.value.data.data || [];
        setModules(modData);
        if (modData.length > 0) {
          setOpenModuleIds(prev => ({ ...prev, [modData[0].modul_id]: true }));
        }
      }
      if (resPostTest.status === 'fulfilled') {
        setPostTest(resPostTest.value.data.data);
      }
      if (resUlasan && resUlasan.status === 'fulfilled') {
        setReviewsData(resUlasan.value.data?.data || {
          statistik: { total_ulasan: 0, rata_rata: 0, distribusi: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
          ulasan: []
        });
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshReviews = async () => {
    const id = localStorage.getItem('adminKomunitasCourseId') || course?.pembelajaran_id;
    if (!id) return;
    try {
      setLoadingReviews(true);
      const res = await api.get(`/admin-komunitas/pembelajaran/${id}/ulasan`);
      if (res.data?.data) {
        setReviewsData(res.data.data);
      }
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  const toggleModuleOpen = (modulId) => {
    setOpenModuleIds(prev => ({
      ...prev,
      [modulId]: !prev[modulId]
    }));
  };

  const handleCourseThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'File Terlalu Besar',
        text: 'Ukuran file thumbnail maksimal 2MB.',
        confirmButtonColor: '#0F766E'
      });
      e.target.value = '';
      return;
    }

    setCourseThumbnailFile(file);
    setCourseThumbnailPreview(URL.createObjectURL(file));
  };

  const handleRemoveCourseThumbnail = () => {
    setCourseThumbnailFile(null);
    setCourseThumbnailPreview(course?.thumbnail_url || '');
  };

  // --- Informasi Dasar & Aksi Kursus ---
  const handleUpdateBasicInfo = async () => {
    if (!course) return;
    const wasPublished = course.status === 'dipublikasikan';
    try {
      setSavingBasicInfo(true);
      
      let res;
      const cleanDeskripsi = (course.deskripsi && course.deskripsi !== '-') ? course.deskripsi : '';

      if (courseThumbnailFile) {
        const data = new FormData();
        data.append('judul_pembelajaran', course.judul_pembelajaran || '');
        data.append('deskripsi', cleanDeskripsi);
        if (course.kategori_id) {
          data.append('kategori_id', course.kategori_id);
        }
        data.append('kategori', course.kategori || 'Pengembangan Kompetensi');
        data.append('capaian_pembelajaran', course.capaian_pembelajaran || '');
        data.append('nilai_kelulusan', course.nilai_kelulusan ?? 70);
        data.append('komunitas_id', course.komunitas_id);
        data.append('thumbnail', courseThumbnailFile);

        res = await api.post(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}`, data);
      } else {
        const payload = {
          judul_pembelajaran: course.judul_pembelajaran,
          deskripsi: cleanDeskripsi,
          kategori_id: course.kategori_id || null,
          kategori: course.kategori || 'Pengembangan Kompetensi',
          capaian_pembelajaran: course.capaian_pembelajaran || '',
          nilai_kelulusan: course.nilai_kelulusan ?? 70,
          komunitas_id: course.komunitas_id
        };
        res = await api.put(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}`, payload);
      }

      if (res.data?.data) {
        const updatedCourse = res.data.data;
        if (updatedCourse.deskripsi === '-') updatedCourse.deskripsi = '';
        setCourse(updatedCourse);
        if (updatedCourse.thumbnail_url) {
          setCourseThumbnailPreview(updatedCourse.thumbnail_url);
        }
        setCourseThumbnailFile(null);
      }

      if (wasPublished) {
        Swal.fire({
          icon: 'info',
          title: 'Status: Menunggu Approval',
          html: 'Perubahan informasi dasar kursus berhasil disimpan!<br/><span class="text-xs text-gray-600">Kursus otomatis berstatus <b>Menunggu Approval Admin BKPSDM</b> dan tetap tampil terkunci di katalog peserta sampai disetujui kembali.</span>',
          confirmButtonColor: '#0F766E'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Tersimpan!',
          text: 'Perubahan informasi dasar & thumbnail berhasil disimpan.',
          timer: 1500,
          showConfirmButton: false
        });
      }
      fetchCourseData();
    } catch (error) {
      console.error('Error updating course:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: error.response?.data?.message || 'Gagal menyimpan perubahan.'
      });
    } finally {
      setSavingBasicInfo(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    const result = await Swal.fire({
      title: 'Hapus Pelatihan?',
      text: `Apakah Anda yakin ingin menghapus pelatihan "${course.judul_pembelajaran}"? Seluruh modul, materi, kuis, dan data terkait akan dihapus secara total dan permanen.`,
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
      await api.delete(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}`);
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil Dihapus',
        text: 'Pelatihan telah dihapus secara total.',
        timer: 1500,
        showConfirmButton: false
      });
      localStorage.removeItem('adminKomunitasCourseId');
      if (onNavigate) onNavigate('pelatihan-saya');
    } catch (error) {
      console.error('Error deleting course:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus pelatihan.'
      });
    }
  };

  // --- Modul Handlers ---
  const handleOpenAddModuleModal = () => {
    setIsEditingModule(false);
    setEditingModuleId(null);
    setModuleForm({ judul_modul: '', deskripsi: '', jp_modul: '' });
    setModuleThumbnailFile(null);
    setModuleThumbnailPreview('');
    setShowAddModuleModal(true);
  };

  const handleOpenEditModuleModal = (modul) => {
    setIsEditingModule(true);
    setEditingModuleId(modul.modul_id);
    setModuleForm({
      judul_modul: modul.judul_modul || '',
      deskripsi: modul.deskripsi || modul.gambaran_umum || '',
      jp_modul: modul.jp_modul !== null && modul.jp_modul !== undefined ? modul.jp_modul : ''
    });
    setModuleThumbnailFile(null);
    setModuleThumbnailPreview(modul.thumbnail_url || '');
    setShowAddModuleModal(true);
  };

  const handleModuleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'File Terlalu Besar',
        text: 'Ukuran file thumbnail maksimal 2MB.',
        confirmButtonColor: '#0F766E'
      });
      e.target.value = '';
      return;
    }

    setModuleThumbnailFile(file);
    setModuleThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleForm.judul_modul.trim()) return;

    const desc = moduleForm.deskripsi?.trim() || `Gambaran umum modul ${moduleForm.judul_modul}`;
    const data = new FormData();
    data.append('judul_modul', moduleForm.judul_modul);
    data.append('gambaran_umum', desc);
    data.append('deskripsi', desc);
    data.append('evaluasi_deskripsi', 'Evaluasi pemahaman materi modul');
    if (moduleForm.jp_modul !== undefined && moduleForm.jp_modul !== '') {
      data.append('jp_modul', moduleForm.jp_modul);
    }
    if (moduleThumbnailFile) {
      data.append('thumbnail', moduleThumbnailFile);
    }

    try {
      if (isEditingModule && editingModuleId) {
        await api.post(`/admin-komunitas/modul/${editingModuleId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Diperbarui',
          text: 'Modul berhasil diperbarui!',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        const res = await api.post(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}/modul`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const newId = res.data?.data?.modul_id;
        if (newId) {
          setOpenModuleIds(prev => ({ ...prev, [newId]: true }));
        }
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Ditambahkan',
          text: 'Modul baru berhasil ditambahkan!',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setShowAddModuleModal(false);
      setModuleForm({ judul_modul: '', deskripsi: '', jp_modul: '' });
      setModuleThumbnailFile(null);
      setModuleThumbnailPreview('');
      fetchCourseData();
    } catch (error) {
      console.error('Error saving module:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: error.response?.data?.message || 'Gagal menyimpan modul.'
      });
    }
  };

  const handleDeleteModule = async (modulId, judulModul) => {
    const result = await Swal.fire({
      title: 'Hapus Modul?',
      text: `Apakah Anda yakin ingin menghapus modul "${judulModul}" beserta seluruh materi dan kuisnya?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/admin-komunitas/modul/${modulId}`);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dihapus',
        text: 'Modul berhasil dihapus!',
        timer: 1500,
        showConfirmButton: false
      });
      fetchCourseData();
    } catch (error) {
      console.error('Error deleting module:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: error.response?.data?.message || 'Gagal menghapus modul.'
      });
    }
  };

  // --- Materi Handlers ---
  const handleOpenAddMaterialModal = (modulId) => {
    setTargetModuleId(modulId);
    setMaterialForm({
      judul_materi: '',
      tipe_materi: 'pdf',
      durasi_menit: 15,
      tautan_atau_berkas_embed: '',
      file_pdf: null
    });
    setShowAddMaterialModal(true);
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.judul_materi.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Judul Diperlukan',
        text: 'Silakan isi judul materi terlebih dahulu.',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('judul_materi', materialForm.judul_materi);
      formData.append('tipe_materi', materialForm.tipe_materi);
      formData.append('durasi_menit', materialForm.durasi_menit);

      if (materialForm.tipe_materi === 'pdf') {
        if (!materialForm.file_pdf) {
          Swal.fire({
            icon: 'warning',
            title: 'File PDF Belum Dipilih',
            text: 'Silakan pilih file PDF yang ingin diunggah.',
            confirmButtonColor: '#0F766E'
          });
          return;
        }
        formData.append('file_pdf', materialForm.file_pdf);
      } else {
        if (!materialForm.tautan_atau_berkas_embed.trim()) {
          Swal.fire({
            icon: 'warning',
            title: materialForm.tipe_materi === 'h5p' ? 'Tautan H5P Diperlukan' : 'Tautan Video Diperlukan',
            text: materialForm.tipe_materi === 'h5p' ? 'Silakan masukkan tautan atau embed H5P.' : 'Silakan masukkan tautan video YouTube.',
            confirmButtonColor: '#0F766E'
          });
          return;
        }
        formData.append('tautan_atau_berkas_embed', materialForm.tautan_atau_berkas_embed);
      }

      await api.post(`/admin-komunitas/modul/${targetModuleId}/materi`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await Swal.fire({
        icon: 'success',
        title: 'Materi Berhasil Diunggah!',
        text: 'Materi pembelajaran baru berhasil ditambahkan ke modul.',
        confirmButtonColor: '#0F766E',
        timer: 2000,
        showConfirmButton: true
      });
      setShowAddMaterialModal(false);
      fetchCourseData();
    } catch (error) {
      console.error('Error creating material:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengunggah Materi',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengunggah materi.',
        confirmButtonColor: '#0F766E'
      });
    }
  };

  const handleDeleteMaterial = async (materiId, judulMateri) => {
    const result = await Swal.fire({
      title: 'Hapus Materi?',
      text: `Apakah Anda yakin ingin menghapus materi "${judulMateri}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/admin-komunitas/materi/${materiId}`);
      Swal.fire({
        icon: 'success',
        title: 'Materi Berhasil Dihapus',
        text: 'Materi telah dihapus dari modul.',
        timer: 1500,
        showConfirmButton: false
      });
      fetchCourseData();
    } catch (error) {
      console.error('Error deleting material:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus Materi',
        text: error.response?.data?.message || 'Gagal menghapus materi.',
        confirmButtonColor: '#0F766E'
      });
    }
  };

  const handleOpenEditMaterialModal = (materi, modulId) => {
    setTargetModuleId(modulId);
    setEditingMaterial(materi);
    setEditMaterialForm({
      judul_materi: materi.judul_materi || '',
      tipe_materi: materi.tipe_materi || 'pdf',
      durasi_menit: materi.durasi_menit || 15,
      tautan_atau_berkas_embed: materi.tipe_materi !== 'pdf' ? (materi.tautan_atau_berkas || '') : '',
      file_pdf: null,
      apakah_wajib: materi.apakah_wajib !== undefined ? Boolean(materi.apakah_wajib) : true
    });
    setShowEditMaterialModal(true);
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    if (!editMaterialForm.judul_materi.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Judul Diperlukan',
        text: 'Silakan isi judul materi terlebih dahulu.',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    if (course?.status === 'dipublikasikan') {
      const confirmResult = await Swal.fire({
        title: 'Pembaruan Materi Katalog',
        html: `
          <div class="text-left text-sm text-gray-600 space-y-2">
            <p>Perubahan pada materi pembelajaran ini akan mengubah status kursus menjadi <b>Menunggu Approval Admin BKPSDM</b>.</p>
            <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
              🔒 Pada katalog peserta, kursus otomatis terkunci dan berubah menjadi abu-abu sampai diverifikasi serta disetujui kembali oleh Admin BKPSDM.
            </div>
            <p class="text-xs text-gray-500">Apakah Anda yakin ingin menyimpan perubahan materi ini?</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0F766E',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Simpan & Ajukan Approval',
        cancelButtonText: 'Batal'
      });

      if (!confirmResult.isConfirmed) return;
    }

    try {
      const formData = new FormData();
      formData.append('judul_materi', editMaterialForm.judul_materi);
      formData.append('tipe_materi', editMaterialForm.tipe_materi);
      formData.append('durasi_menit', editMaterialForm.durasi_menit);
      formData.append('apakah_wajib', editMaterialForm.apakah_wajib ? '1' : '0');

      if (editMaterialForm.tipe_materi === 'pdf') {
        if (editMaterialForm.file_pdf) {
          formData.append('file_pdf', editMaterialForm.file_pdf);
        }
      } else {
        if (!editMaterialForm.tautan_atau_berkas_embed.trim()) {
          Swal.fire({
            icon: 'warning',
            title: editMaterialForm.tipe_materi === 'h5p' ? 'Tautan H5P Diperlukan' : 'Tautan Video Diperlukan',
            text: editMaterialForm.tipe_materi === 'h5p' ? 'Silakan masukkan tautan atau embed H5P.' : 'Silakan masukkan tautan video YouTube.',
            confirmButtonColor: '#0F766E'
          });
          return;
        }
        formData.append('tautan_atau_berkas_embed', editMaterialForm.tautan_atau_berkas_embed);
      }

      await api.post(`/admin-komunitas/materi/${editingMaterial.materi_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await Swal.fire({
        icon: 'success',
        title: 'Materi Berhasil Diperbarui!',
        html: `
          <div class="text-sm text-gray-600 space-y-2">
            <p>Materi berhasil disimpan.</p>
            ${course?.status === 'dipublikasikan' ? '<p class="text-xs text-amber-700 font-medium">Status kursus kini <b>Menunggu Approval Admin BKPSDM</b> dan otomatis terkunci (abu-abu) di katalog peserta sampai disetujui kembali.</p>' : ''}
          </div>
        `,
        confirmButtonColor: '#0F766E',
        timer: 2500,
        showConfirmButton: true
      });

      setShowEditMaterialModal(false);
      setEditingMaterial(null);
      fetchCourseData();
    } catch (error) {
      console.error('Error updating material:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memperbarui Materi',
        text: error.response?.data?.message || 'Terjadi kesalahan saat memperbarui materi.',
        confirmButtonColor: '#0F766E'
      });
    }
  };

  // --- Helper Kuis ---
  const getModulQuiz = (m) => {
    if (!m) return null;
    if (Array.isArray(m.kuis)) {
      return m.kuis.find(k => k.tipe_kuis === 'evaluasi_modul' || !k.tipe_kuis) || (m.kuis.length > 0 ? m.kuis[0] : null);
    }
    if (Array.isArray(m.semua_kuis)) {
      const q = m.semua_kuis.find(k => k.tipe_kuis === 'evaluasi_modul' || !k.tipe_kuis);
      if (q) return q;
    }
    return m.kuis || null;
  };

  // --- Kuis Handlers ---
  const syncTtsLayoutToQuizForm = (layout, wordSource) => {
    if (!layout || layout.placedWords.length === 0) return;

    const ttsSoalItems = layout.placedWords.map(w => ({
      tipe_soal: 'tts',
      teks_soal: w.clue,
      kunci_jawaban: w.word,
      arah: w.direction,
      nomor_urut: w.number,
      baris_mulai: w.row,
      kolom_mulai: w.col,
      pilihan_jawaban_json: null,
      bobot_nilai: 1
    }));

    setQuizForm(prev => {
      const pgOnly = prev.soal.filter(s => s.tipe_soal !== 'tts');
      return {
        ...prev,
        soal: [...pgOnly, ...ttsSoalItems],
        grid_config_json: {
          rows: layout.rows,
          cols: layout.cols
        }
      };
    });
  };

  const handleOpenQuizModal = (modul, type = 'evaluasi_modul', materi = null) => {
    const freshModul = modules.find(m => m.modul_id === modul?.modul_id) || modul;
    setTargetQuizModule(freshModul);
    setTargetQuizType(type);
    setTargetQuizMateri(materi);
    setQuizActiveTab('pilihan_ganda');

    const existingQuiz = type === 'pre_test' ? (materi?.pre_test || null) : getModulQuiz(freshModul);

    if (existingQuiz && existingQuiz.kuis_id) {
      const allSoal = (existingQuiz.soal_kuis || []).map(s => {
        let opts = s.pilihan_jawaban_json;
        if (typeof opts === 'string') {
          try { opts = JSON.parse(opts); } catch (e) { opts = {}; }
        }
        return {
          soal_kuis_id: s.soal_kuis_id,
          tipe_soal: s.tipe_soal || 'pilihan_ganda',
          teks_soal: s.teks_soal || '',
          kunci_jawaban: s.kunci_jawaban || 'A',
          pilihan_jawaban_json: opts || {},
          arah: s.arah || null,
          nomor_urut: s.nomor_urut || null,
          baris_mulai: s.baris_mulai || null,
          kolom_mulai: s.kolom_mulai || null,
          bobot_nilai: s.bobot_nilai ?? 1
        };
      });

      const ttsSoal = allSoal.filter(s => s.tipe_soal === 'tts');
      const initialTts = ttsSoal.map((s, idx) => ({
        id: s.soal_kuis_id ? `tts-${s.soal_kuis_id}` : `tts-init-${idx}`,
        word: s.kunci_jawaban || '',
        clue: s.teks_soal || ''
      }));

      setTtsInputWords(initialTts);

      setQuizForm({
        judul_kuis: existingQuiz.judul_kuis || (type === 'pre_test' ? `Pre-Test: ${materi?.judul_materi}` : `Kuis ${modul.judul_modul}`),
        durasi_menit: existingQuiz.durasi_menit || 15,
        nilai_kelulusan: type === 'pre_test' ? 0 : (existingQuiz.nilai_kelulusan ?? 70),
        maks_percobaan: type === 'pre_test' ? 1 : (existingQuiz.maks_percobaan ?? 3),
        soal: allSoal,
        grid_config_json: existingQuiz.grid_config_json || null
      });

      if (initialTts.length > 0) {
        const layout = generateCrosswordLayout(initialTts, 12);
        setTtsLayout(layout);
      } else {
        setTtsLayout(null);
      }
    } else {
      setQuizForm({
        judul_kuis: type === 'pre_test' ? `Pre-Test: ${materi?.judul_materi}` : `Kuis ${modul.judul_modul}`,
        durasi_menit: 15,
        nilai_kelulusan: type === 'pre_test' ? 0 : 70,
        maks_percobaan: type === 'pre_test' ? 1 : 3,
        soal: [],
        grid_config_json: null
      });
      setTtsInputWords([]);
      setTtsLayout(null);
    }

    setNewQuizItem({
      teks_soal: '',
      kunci_jawaban: 'A',
      opsiA: '',
      opsiB: '',
      opsiC: '',
      opsiD: ''
    });
    setNewTtsItem({ word: '', clue: '' });
    setNewDragDropItem({ teks_soal: '', distractors: '', bobot_nilai: 1 });
    setShowQuizModal(true);
  };

  const handleAddQuestionToQuiz = (e) => {
    e.preventDefault();
    if (!newQuizItem.teks_soal.trim() || !newQuizItem.opsiA.trim() || !newQuizItem.opsiB.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Butir Soal Belum Lengkap',
        text: 'Teks pertanyaan dan minimal pilihan opsi A & B wajib diisi!',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    const item = {
      tipe_soal: 'pilihan_ganda',
      teks_soal: newQuizItem.teks_soal,
      kunci_jawaban: newQuizItem.kunci_jawaban,
      pilihan_jawaban_json: {
        A: newQuizItem.opsiA,
        B: newQuizItem.opsiB,
        C: newQuizItem.opsiC || '-',
        D: newQuizItem.opsiD || '-'
      },
      bobot_nilai: 1
    };

    setQuizForm(prev => ({
      ...prev,
      soal: [...prev.soal, item]
    }));

    setNewQuizItem({
      teks_soal: '',
      kunci_jawaban: 'A',
      opsiA: '',
      opsiB: '',
      opsiC: '',
      opsiD: ''
    });
  };

  const handleRemoveQuestionFromQuiz = (index) => {
    // index pada filter soal PG
    const pgQuestions = quizForm.soal.filter(s => s.tipe_soal !== 'tts' && s.tipe_soal !== 'drag_drop');
    const targetItem = pgQuestions[index];
    if (!targetItem) return;

    setQuizForm(prev => ({
      ...prev,
      soal: prev.soal.filter(s => s !== targetItem)
    }));
  };

  const handleAddDragDropToQuiz = (e) => {
    e.preventDefault();
    const rawText = newDragDropItem.teks_soal.trim();
    if (!rawText) {
      Swal.fire({
        icon: 'warning',
        title: 'Kalimat Soal Belum Diisi',
        text: 'Tuliskan kalimat soal dan apit kata kunci dengan tanda kurung siku [ ... ]',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    const regex = /\[([^\]]+)\]/g;
    const matches = [];
    let m;
    while ((m = regex.exec(rawText)) !== null) {
      const val = m[1].trim();
      if (val) matches.push(val);
    }

    if (matches.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Belum Ada Titik Kosong',
        text: 'Apit minimal 1 kata kunci dengan tanda kurung siku, contoh: Anak ayam lahir dari [telur] dan ikan bernafas dengan [insang]',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    const blanks = matches.map((kunci, idx) => ({
      id: idx + 1,
      kunci: kunci
    }));

    const distractorList = newDragDropItem.distractors
      ? newDragDropItem.distractors.split(',').map(d => d.trim()).filter(Boolean)
      : [];

    const allOptions = Array.from(new Set([...matches, ...distractorList]));

    const item = {
      tipe_soal: 'drag_drop',
      teks_soal: rawText,
      kunci_jawaban: matches.join(', '),
      pilihan_jawaban_json: {
        blanks: blanks,
        distractors: distractorList,
        all_options: allOptions
      },
      bobot_nilai: Number(newDragDropItem.bobot_nilai) || 1
    };

    setQuizForm(prev => ({
      ...prev,
      soal: [...prev.soal, item]
    }));

    setNewDragDropItem({
      teks_soal: '',
      distractors: '',
      bobot_nilai: 1
    });
  };

  const handleRemoveDragDropFromQuiz = (index) => {
    const ddQuestions = quizForm.soal.filter(s => s.tipe_soal === 'drag_drop');
    const targetItem = ddQuestions[index];
    if (!targetItem) return;

    setQuizForm(prev => ({
      ...prev,
      soal: prev.soal.filter(s => s !== targetItem)
    }));
  };

  const handleAddTtsWord = (e) => {
    e.preventDefault();
    const cleanWord = (newTtsItem.word || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (cleanWord.length < 2) {
      Swal.fire({
        icon: 'warning',
        title: 'Kata Terlalu Pendek',
        text: 'Kata TTS harus terdiri dari minimal 2 huruf abjad (A-Z).',
        confirmButtonColor: '#0F766E'
      });
      return;
    }
    if (!newTtsItem.clue.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Petunjuk Wajib Diisi',
        text: 'Tuliskan petunjuk (clue) untuk kata ini!',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    // Cek duplikasi kata
    if (ttsInputWords.some(w => w.word === cleanWord)) {
      Swal.fire({
        icon: 'warning',
        title: 'Kata Sudah Ada',
        text: `Kata "${cleanWord}" sudah ada dalam daftar TTS ini.`,
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    const updatedWords = [
      ...ttsInputWords,
      {
        id: `tts-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        word: cleanWord,
        clue: newTtsItem.clue.trim()
      }
    ];

    setTtsInputWords(updatedWords);
    setNewTtsItem({ word: '', clue: '' });

    // Auto-generate layout TTS
    const layout = generateCrosswordLayout(updatedWords, 12);
    setTtsLayout(layout);
    syncTtsLayoutToQuizForm(layout, updatedWords);
  };

  const handleRemoveTtsWord = (id) => {
    const updatedWords = ttsInputWords.filter(w => w.id !== id);
    setTtsInputWords(updatedWords);

    if (updatedWords.length > 0) {
      const layout = generateCrosswordLayout(updatedWords, 12);
      setTtsLayout(layout);
      syncTtsLayoutToQuizForm(layout, updatedWords);
    } else {
      setTtsLayout(null);
      setQuizForm(prev => ({
        ...prev,
        soal: prev.soal.filter(s => s.tipe_soal !== 'tts'),
        grid_config_json: null
      }));
    }
  };

  const handleRegenerateTtsLayout = () => {
    if (ttsInputWords.length === 0) return;
    const shuffled = [...ttsInputWords].sort(() => Math.random() - 0.5);
    const layout = generateCrosswordLayout(shuffled, 12);
    setTtsLayout(layout);
    syncTtsLayoutToQuizForm(layout, ttsInputWords);
  };

  const handleSaveQuiz = async () => {
    if (!targetQuizModule) return;
    if (quizForm.soal.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Kuis Masih Kosong',
        text: 'Kuis harus memiliki minimal 1 butir pertanyaan sebelum disimpan.',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    try {
      const isPreTest = targetQuizType === 'pre_test';
      const payload = {
        judul_kuis: quizForm.judul_kuis,
        durasi_menit: Number(quizForm.durasi_menit) || 15,
        tipe_kuis: targetQuizType,
        materi_id: isPreTest ? targetQuizMateri?.materi_id : null,
        nilai_kelulusan: isPreTest ? 0 : Number(quizForm.nilai_kelulusan),
        maks_percobaan: isPreTest ? 1 : Number(quizForm.maks_percobaan),
        grid_config_json: quizForm.grid_config_json,
        soal: quizForm.soal
      };

      let existingQuiz = isPreTest ? targetQuizMateri?.pre_test : getModulQuiz(targetQuizModule);
      if (!existingQuiz && !isPreTest && targetQuizModule) {
        const foundInModules = modules.find(m => m.modul_id === targetQuizModule.modul_id);
        if (foundInModules) {
          existingQuiz = getModulQuiz(foundInModules);
        }
      }

      if (existingQuiz && existingQuiz.kuis_id) {
        await api.put(`/admin-komunitas/kuis/${existingQuiz.kuis_id}`, payload);
      } else {
        await api.post(`/admin-komunitas/modul/${targetQuizModule.modul_id}/kuis`, payload);
      }

      const countPG = quizForm.soal.filter(s => s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal).length;
      const countTTS = quizForm.soal.filter(s => s.tipe_soal === 'tts').length;
      const countDD = quizForm.soal.filter(s => s.tipe_soal === 'drag_drop').length;

      await Swal.fire({
        icon: 'success',
        title: isPreTest ? 'Pre-Test Berhasil Disimpan!' : 'Kuis Berhasil Disimpan!',
        text: `${isPreTest ? 'Pre-test materi' : 'Kuis evaluasi modul'} berhasil disimpan (${countPG} PG, ${countTTS} TTS, ${countDD} Drag & Drop). Durasi: ${payload.durasi_menit} menit.`,
        confirmButtonColor: '#0F766E',
        timer: 2500,
        showConfirmButton: true
      });
      setShowQuizModal(false);
      fetchCourseData();
    } catch (error) {
      console.error('Error saving quiz:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Kuis',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan kuis.',
        confirmButtonColor: '#0F766E'
      });
    }
  };

  const handleDeleteQuiz = async (quizId, label = 'Kuis') => {
    const result = await Swal.fire({
      title: `Hapus ${label}?`,
      text: `Apakah Anda yakin ingin menghapus ${label} ini beserta seluruh butir soalnya?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin-komunitas/kuis/${quizId}`);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Dihapus',
          text: `${label} berhasil dihapus.`,
          confirmButtonColor: '#0F766E',
          timer: 2000
        });
        if (showQuizModal) setShowQuizModal(false);
        fetchCourseData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: err.response?.data?.message || `Gagal menghapus ${label}.`,
          confirmButtonColor: '#0F766E'
        });
      }
    }
  };

  // --- Post Test Config Handlers ---
  const handleSavePostTestConfig = async () => {
    if (!course) return;
    try {
      const passingGrade = course.nilai_kelulusan ?? 70;
      const payload = {
        nilai_kelulusan: passingGrade,
        maks_percobaan: postTest?.maks_percobaan || 3,
        durasi_menit: postTest?.durasi_menit || 45
      };

      if (postTest) {
        await api.put(`/admin-komunitas/post-test/${postTest.post_test_id}`, payload);
      } else {
        await api.post(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}/post-test`, payload);
      }
      await Swal.fire({
        icon: 'success',
        title: 'Konfigurasi Tersimpan!',
        text: 'Pengaturan Post Test berhasil diperbarui.',
        confirmButtonColor: '#0F766E',
        timer: 2000,
        showConfirmButton: true
      });
      fetchCourseData();
    } catch (error) {
      console.error('Error saving post test config:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Post Test',
        text: error.response?.data?.message || 'Gagal menyimpan konfigurasi post test.',
        confirmButtonColor: '#0F766E'
      });
    }
  };

  // --- Surat Pernyataan Handlers ---
  const handleUploadSuratPernyataan = async () => {
    if (!suratFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Berkas Belum Dipilih',
        text: 'Silakan pilih berkas PDF surat pernyataan terlebih dahulu.',
        confirmButtonColor: '#0F766E'
      });
      return;
    }
    try {
      setIsUploadingSurat(true);
      const formData = new FormData();
      formData.append('surat_pernyataan', suratFile);

      await api.post(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}?_method=PUT`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await Swal.fire({
        icon: 'success',
        title: 'Surat Berhasil Diunggah!',
        text: 'Surat pernyataan komitmen telah berhasil disimpan.',
        confirmButtonColor: '#0F766E',
        timer: 2000,
        showConfirmButton: true
      });
      setSuratFile(null);
      fetchCourseData();
    } catch (error) {
      console.error('Error uploading surat pernyataan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengunggah Surat',
        text: error.response?.data?.message || 'Gagal mengunggah surat pernyataan.',
        confirmButtonColor: '#0F766E'
      });
    } finally {
      setIsUploadingSurat(false);
    }
  };

  const handleRemoveSuratPernyataan = async () => {
    const confirm = await Swal.fire({
      title: 'Hapus Surat Keabsahan?',
      text: 'Berkas surat pernyataan keabsahan akan dihapus dari kursus ini. Kursus tetap dapat diajukan untuk approval publikasi.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}/surat-pernyataan`);
      setCourse(prev => ({ ...prev, surat_pernyataan_url: null }));
      Swal.fire({
        icon: 'success',
        title: 'Surat Dihapus',
        text: 'Berkas surat keabsahan berhasil dihapus. Anda tetap dapat mengajukan approval ke BKPSDM.',
        confirmButtonColor: '#0F766E'
      });
      fetchCourseData();
    } catch (error) {
      // Fallback update
      try {
        await api.put(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}`, {
          judul_pembelajaran: course.judul_pembelajaran,
          deskripsi: course.deskripsi,
          kategori: course.kategori,
          surat_pernyataan_url: null
        });
        setCourse(prev => ({ ...prev, surat_pernyataan_url: null }));
        fetchCourseData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: 'Gagal menghapus berkas surat pernyataan.',
          confirmButtonColor: '#0F766E'
        });
      }
    }
  };

  // --- Ajukan Approval ---
  const handleAjukanApproval = async () => {
    if (!course) return;

    if (modules.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Pelatihan Belum Lengkap',
        text: 'Pelatihan belum memiliki modul. Harap tambahkan minimal 1 modul beserta materi dan kuisnya sebelum mengajukan approval.',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    const totalMateri = modules.reduce((acc, m) => acc + (m.materi?.length || 0), 0);
    if (totalMateri === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Materi Belum Tersedia',
        text: 'Modul pelatihan belum memiliki materi pembelajaran. Harap unggah materi terlebih dahulu sebelum mengajukan approval.',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    const confirmSubmit = await Swal.fire({
      title: 'Ajukan Approval Publikasi?',
      html: `
        <div class="text-left text-sm text-gray-600 space-y-3 pt-2">
          <p>Kursus <b>"${course.judul_pembelajaran}"</b> akan diajukan ke tim <b>BKPSDM</b> untuk proses review dan persetujuan publikasi.</p>
          <div class="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-800 space-y-1">
            <div class="font-semibold">Kelengkapan Kursus Saat Ini:</div>
            <div>• Jumlah Modul: <b>${modules.length}</b> modul</div>
            <div>• Total Materi: <b>${totalMateri}</b> materi</div>
            <div>• Bank Soal Post Test: <b>${postTest?.soal_post_test?.length || 0}</b> butir soal</div>
            <div>• Surat Keabsahan: <b>${(course.surat_pernyataan_url || suratFile) ? 'Sudah Dilampirkan' : 'Tidak Dilampirkan (Opsional - Tetap Dapat Diajukan)'}</b></div>
          </div>
          <p class="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded border border-emerald-200">
            ℹ️ Surat Keabsahan bersifat <b>opsional</b>. Kursus ini dapat langsung diajukan dan diverifikasi oleh Admin BKPSDM.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Ajukan Sekarang',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!confirmSubmit.isConfirmed) return;

    try {
      // Pastikan informasi dasar dan thumbnail terbaru tersimpan sebelum diajukan
      if (courseThumbnailFile) {
        const formData = new FormData();
        formData.append('judul_pembelajaran', course.judul_pembelajaran);
        formData.append('deskripsi', course.deskripsi || '-');
        formData.append('kategori', course.kategori || 'Pengembangan Kompetensi');
        formData.append('capaian_pembelajaran', course.capaian_pembelajaran || '-');
        formData.append('nilai_kelulusan', course.nilai_kelulusan ?? 70);
        formData.append('komunitas_id', course.komunitas_id);
        formData.append('thumbnail', courseThumbnailFile);
        await api.post(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCourseThumbnailFile(null);
      } else {
        await api.put(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}`, {
          judul_pembelajaran: course.judul_pembelajaran,
          deskripsi: course.deskripsi,
          kategori: course.kategori || 'Pengembangan Kompetensi',
          capaian_pembelajaran: course.capaian_pembelajaran || '-',
          nilai_kelulusan: course.nilai_kelulusan,
          komunitas_id: course.komunitas_id
        });
      }

      if (suratFile) {
        const formData = new FormData();
        formData.append('ringkasan_materi', course.deskripsi || 'Ringkasan materi kursus');
        formData.append('surat_pernyataan', suratFile);
        await api.post(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}/ajukan-approval`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuratFile(null);
      } else {
        const payload = {
          ringkasan_materi: course.deskripsi || 'Ringkasan materi kursus'
        };
        await api.post(`/admin-komunitas/pembelajaran/${course.pembelajaran_id}/ajukan-approval`, payload);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Pengajuan Approval Berhasil!',
        html: 'Pengajuan approval kursus berhasil dikirimkan ke <b>Admin BKPSDM</b>.<br/><span class="text-sm text-gray-500">Status pelatihan kini sedang dalam peninjauan verifikator.</span>',
        confirmButtonColor: '#0F766E'
      });
      fetchCourseData();
    } catch (error) {
      console.error('Error submitting for approval:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengajukan Approval',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengajukan approval.',
        confirmButtonColor: '#0F766E'
      });
    }
  };

  if (loading) return <AdminKomunitasSkeleton />;
  if (!course) return null;

  const isReadOnly = course.dapat_dikelola === false;
  const totalJp = modules.reduce((acc, m) => acc + (parseFloat(m.jp_modul) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-36 sm:pb-24">
      <AdminSidebar
        activeMenu="katalog-kursus"
        onNavigate={onNavigate}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header setIsOpen={setIsSidebarOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <button
                  onClick={() => onNavigate('pelatihan-saya')}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0F766E] mb-3 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Manajemen Pelatihan
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {course.judul_pembelajaran || 'Kursus Baru'}
                  </h1>
                  {course.status && (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase ${course.status === 'dipublikasikan'
                        ? 'bg-green-100 text-green-700'
                        : course.status === 'menunggu_approval'
                          ? 'bg-amber-100 text-amber-700'
                          : course.status === 'ditolak'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                      {course.status.replace('_', ' ')}
                    </span>
                  )}
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Total: {totalJp % 1 === 0 ? totalJp : totalJp.toFixed(2)} JP
                  </span>
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteCourse}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Pelatihan
                  </button>
                </div>
              )}
            </div>

            {/* Read-Only Alert Banner */}
            {isReadOnly && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
                <Eye className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Mode Hanya Baca (Read-Only)</h4>
                  <p className="text-xs text-blue-700">Pembelajaran di Komunitas Umum ini dirancang oleh admin komunitas lain. Anda dapat meninjau seluruh modul dan materi dalam mode baca.</p>
                </div>
              </div>
            )}

            {/* Published Alert Banner */}
            {course.status === 'dipublikasikan' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-amber-900 mb-1">Pelatihan Sedang Aktif Dipublikasikan</h3>
                  <p className="text-xs text-amber-800 leading-relaxed mb-2">
                    Pelatihan ini saat ini berstatus aktif di katalog umum. Jika Anda melakukan perubahan (edit informasi dasar, modul, materi, kuis, atau post-test), status pelatihan akan <b>otomatis menjadi Menunggu Approval</b> dan <b>tetap tampil di katalog peserta dalam kondisi terkunci</b> sampai disetujui kembali oleh Admin BKPSDM.
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium">
                    💡 Pelatihan tidak akan hilang dari katalog peserta, melainkan terkunci secara otomatis.
                  </p>
                </div>
              </div>
            )}

            {/* Rejection Alert Banner */}
            {course.status === 'ditolak' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-red-900">Pengajuan Pembelajaran Ditolak oleh BKPSDM</h3>
                    {course.validasi?.pemvalidasi?.nama_lengkap && (
                      <span className="text-[11px] text-red-700 bg-red-100/70 px-2 py-0.5 rounded">
                        Diverifikasi oleh: {course.validasi.pemvalidasi.nama_lengkap}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-red-700 mb-2.5 leading-relaxed bg-white/70 p-3 rounded-lg border border-red-100">
                    <span className="font-semibold block text-red-800 mb-0.5">Catatan Perbaikan:</span>
                    {course.validasi?.catatan
                      ? course.validasi.catatan
                      : 'Pembelajaran ini memerlukan perbaikan sebelum dapat dipublikasikan. Silakan lengkapi modul, materi, atau evaluasi sesuai arahan verifikator.'}
                  </p>
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1.5">
                    <span>💡 <b>Petunjuk:</b> Lakukan perbaikan konten pada halaman ini, lalu klik tombol <b>"Simpan Draft"</b> untuk mengembalikan status kursus ke <b>Draft</b> sebelum diajukan approval kembali.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Section 1: Informasi Dasar Kursus */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-gray-900">Informasi Dasar Kursus</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {totalJp % 1 === 0 ? totalJp : totalJp.toFixed(2)} JP Total
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium">ID Pembelajaran: #{course.pembelajaran_id}</span>
              </div>
              <div className="p-6 space-y-6">
                {/* Thumbnail / Cover Kursus */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thumbnail / Cover Kursus <span className="text-gray-400 text-xs font-normal">(Maks. 2MB)</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-full sm:w-56 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 shrink-0 relative shadow-2xs">
                      <img
                        src={courseThumbnailPreview || course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
                        alt={course.judul_pembelajaran}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-2">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          <span>{courseThumbnailFile ? 'Ganti File Dipilih' : 'Pilih File Thumbnail'}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleCourseThumbnailChange}
                            className="hidden"
                          />
                        </label>
                        {courseThumbnailFile && (
                          <button
                            type="button"
                            onClick={handleRemoveCourseThumbnail}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                          >
                            Batal Pilih
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Format yang didukung: JPG, JPEG, PNG, WEBP. Maksimal 2MB. Gambar ini tampil di kartu kursus katalog dan dasbor peserta.
                      </p>
                      {courseThumbnailFile && (
                        <p className="text-xs text-teal-700 font-medium">
                          File baru terpilih: <strong>{courseThumbnailFile.name}</strong> (klik <em>Simpan Perubahan</em> di bawah untuk menerapkan)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Kursus</label>
                  <input
                    type="text"
                    value={course.judul_pembelajaran || ''}
                    onChange={(e) => setCourse({ ...course, judul_pembelajaran: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                    <div className="relative">
                      <select
                        value={course.kategori_id || course.kategori || 'Pengembangan Kompetensi'}
                        onChange={(e) => {
                          const val = e.target.value;
                          const catObj = categories.find(c => String(c.kategori_id) === String(val) || c.nama_kategori === val);
                          setCourse({
                            ...course,
                            kategori_id: catObj ? catObj.kategori_id : '',
                            kategori: catObj ? catObj.nama_kategori : val
                          });
                        }}
                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pr-10"
                      >
                        {categories.length > 0 ? (
                          categories.map((c) => (
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
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Capaian Pembelajaran</label>
                    <input
                      type="text"
                      value={course.capaian_pembelajaran || ''}
                      onChange={(e) => setCourse({ ...course, capaian_pembelajaran: e.target.value })}
                      placeholder="Contoh: Menguasai prinsip integritas birokrasi"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Kursus</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                    value={course.deskripsi === '-' ? '' : (course.deskripsi || '')}
                    onChange={(e) => setCourse({ ...course, deskripsi: e.target.value })}
                    placeholder="Tuliskan deskripsi lengkap mengenai tujuan dan target pelatihan ini..."
                  ></textarea>
                </div>

                {/* Tombol Simpan Cepat untuk Informasi Dasar & Thumbnail */}
                {!isReadOnly && (
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={handleUpdateBasicInfo}
                      disabled={savingBasicInfo}
                      className="px-5 py-2.5 bg-[#0F766E] hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      {savingBasicInfo ? 'Menyimpan...' : 'Simpan Informasi Dasar & Thumbnail'}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Section 2: Modul & Materi */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-bold text-gray-900">Modul & Materi Pembelajaran</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Total: {totalJp % 1 === 0 ? totalJp : totalJp.toFixed(2)} JP
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Kelola bab, dokumen bacaan PDF, dan video pendukung.</p>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={handleOpenAddModuleModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-[#0F766E]/30 text-[#0F766E] text-sm font-semibold rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Tambah Modul
                  </button>
                )}
              </div>

              <div className="p-6 space-y-4">
                {modules.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Belum ada modul pada kursus ini</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">Mulai dengan menambahkan modul pembelajaran pertama.</p>
                    {!isReadOnly && (
                      <button
                        onClick={handleOpenAddModuleModal}
                        className="px-4 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800"
                      >
                        Tambah Modul Sekarang
                      </button>
                    )}
                  </div>
                ) : (
                  modules.map((modul, idx) => {
                    const isOpen = !!openModuleIds[modul.modul_id];
                    const materiList = modul.materi || [];

                    return (
                      <div key={modul.modul_id} className="border border-gray-200 rounded-xl overflow-hidden transition-all shadow-xs">
                        {/* Accordion Header */}
                        <div
                          className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors ${isOpen ? 'bg-teal-50/60 border-b border-teal-100' : 'bg-white hover:bg-gray-50'
                            }`}
                        >
                          <div
                            className="flex items-center gap-3 text-sm font-bold text-gray-900 flex-1 min-w-0"
                            onClick={() => toggleModuleOpen(modul.modul_id)}
                          >
                            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold shrink-0">
                              {idx + 1}
                            </span>
                            {modul.thumbnail_url && (
                              <img 
                                src={modul.thumbnail_url} 
                                alt={modul.judul_modul} 
                                className="w-8 h-8 rounded-md object-cover border border-gray-200 shrink-0" 
                              />
                            )}
                            <span className="truncate">{modul.judul_modul}</span>
                            <span className="text-xs font-normal text-gray-500 hidden sm:inline">
                              ({materiList.length} Materi • {modul.durasi_total_menit || 0} Menit)
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                              {parseFloat(modul.jp_modul || 0)} JP
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isReadOnly && (
                              <>
                                <button
                                  onClick={() => handleOpenAddMaterialModal(modul.modul_id)}
                                  title="Tambah Materi"
                                  className="px-2.5 py-1 bg-white border border-gray-200 text-teal-700 hover:bg-teal-50 rounded text-xs font-semibold flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Materi</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditModuleModal(modul)}
                                  title="Edit Modul"
                                  className="p-1 text-gray-400 hover:text-teal-600 rounded hover:bg-teal-50 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteModule(modul.modul_id, modul.judul_modul)}
                                  title="Hapus Modul"
                                  className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => toggleModuleOpen(modul.modul_id)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-600' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Accordion Body */}
                        {isOpen && (
                          <div className="p-4 sm:p-5 bg-white space-y-4">
                            {(modul.deskripsi || modul.gambaran_umum || modul.thumbnail_url) && (
                              <div className="text-xs text-gray-700 bg-gray-50/80 p-3 rounded-lg border border-gray-100 flex items-start gap-3">
                                {modul.thumbnail_url && (
                                  <img 
                                    src={modul.thumbnail_url} 
                                    alt={modul.judul_modul} 
                                    className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0" 
                                  />
                                )}
                                <div className="flex-1">
                                  <span className="font-semibold text-gray-900 block mb-0.5">Deskripsi Modul:</span>
                                  <span className="leading-relaxed text-gray-600">{modul.deskripsi || modul.gambaran_umum || '-'}</span>
                                </div>
                              </div>
                            )}

                            {/* Materi List */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daftar Materi:</h4>
                                <span className="text-[11px] text-gray-400">Total: {materiList.length} berkas</span>
                              </div>

                              {materiList.length === 0 ? (
                                <div className="p-4 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                                  <p className="text-xs text-gray-500 mb-2">Belum ada berkas materi di modul ini.</p>
                                  <button
                                    onClick={() => handleOpenAddMaterialModal(modul.modul_id)}
                                    className="text-xs font-semibold text-teal-700 hover:underline inline-flex items-center gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Tambah materi sekarang
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {materiList.map((mat) => (
                                    <div key={mat.materi_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/70 hover:bg-gray-50 transition-colors gap-2">
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${mat.tipe_materi === 'pdf' ? 'bg-red-50 text-red-600' : mat.tipe_materi === 'h5p' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                          }`}>
                                          {mat.tipe_materi === 'pdf' ? <FileText className="w-4 h-4" /> : mat.tipe_materi === 'h5p' ? <Sparkles className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{mat.judul_materi}</p>
                                            {mat.tipe_materi === 'h5p' && (
                                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-purple-500" />
                                                H5P Interaktif
                                              </span>
                                            )}
                                            {mat.pre_test ? (
                                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                                                Pre-test Aktif ({mat.pre_test.durasi_menit || 15}m)
                                              </span>
                                            ) : (
                                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
                                                Tanpa Pre-test
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            {mat.tipe_materi === 'pdf' ? 'Dokumen PDF' : mat.tipe_materi === 'h5p' ? 'Video Interaktif (H5P)' : 'Video Pembelajaran'} • {mat.durasi_menit} Menit
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        {!isReadOnly && (
                                          <>
                                            <button
                                              onClick={() => handleOpenQuizModal(modul, 'pre_test', mat)}
                                              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                                mat.pre_test
                                                  ? 'bg-white border border-teal-200 text-teal-700 hover:bg-teal-50'
                                                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                              }`}
                                              title={mat.pre_test ? 'Edit Pre-test Materi' : 'Buat Pre-test untuk Materi ini'}
                                            >
                                              {mat.pre_test ? <><Edit2 className="w-3.5 h-3.5" /> Edit Pre-test</> : <><Plus className="w-3.5 h-3.5" /> + Pre-test</>}
                                            </button>

                                            <button
                                              onClick={() => handleOpenEditMaterialModal(mat, modul.modul_id)}
                                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
                                              title="Edit Materi Pembelajaran"
                                            >
                                              <Edit className="w-3.5 h-3.5" /> Edit Materi
                                            </button>
                                          </>
                                        )}

                                        <a
                                          href={mat.tautan_atau_berkas.startsWith('http') ? mat.tautan_atau_berkas : `http://localhost:8000${mat.tautan_atau_berkas}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded transition-colors"
                                        >
                                          <Eye className="w-3.5 h-3.5" /> Buka
                                        </a>
                                        {!isReadOnly && (
                                          <button
                                            onClick={() => handleDeleteMaterial(mat.materi_id, mat.judul_materi)}
                                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                            title="Hapus Materi"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Section 3: Evaluasi & Post Test */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-900">Evaluasi Pembelajaran (Kuis & Post Test)</h2>
              </div>
              <div className="p-6 space-y-8">

                {/* Kuis per Modul */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Kuis Evaluasi per Modul</h3>
                  <p className="text-xs text-gray-500 mb-4">Setiap modul wajib memiliki minimal 1 kuis pemahaman sebelum kursus diajukan approval.</p>

                  <div className="space-y-3">
                    {modules.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Tambahkan modul terlebih dahulu untuk menyusun kuis.</p>
                    ) : (
                      modules.map((m) => {
                        const quiz = getModulQuiz(m);
                        const hasQuiz = Boolean(quiz && quiz.kuis_id);
                        const questionCount = quiz?.soal_kuis?.length || 0;

                        return (
                          <div
                            key={m.modul_id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-xl transition-colors ${hasQuiz ? 'border-gray-200 bg-gray-50/50' : 'border-dashed border-amber-200 bg-amber-50/30'
                              }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-900">{m.judul_modul}</p>
                                {hasQuiz ? (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Kuis Aktif</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">Belum Ada Kuis</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {hasQuiz
                                  ? `${questionCount} Butir Soal • Durasi ${quiz?.durasi_menit || 15} Menit • Batas Lulus ${quiz?.nilai_kelulusan ?? 70}% • Maks. ${quiz?.maks_percobaan ?? 3}x Coba`
                                  : 'Modul ini belum memiliki evaluasi kuis'}
                              </p>
                            </div>

                            <button
                              onClick={() => handleOpenQuizModal(m)}
                              className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-colors w-full sm:w-auto ${hasQuiz
                                  ? 'bg-white border border-gray-200 text-teal-700 hover:bg-gray-50'
                                  : 'bg-[#0F766E] text-white hover:bg-teal-800'
                                }`}
                            >
                              {hasQuiz ? <><Edit2 className="w-3.5 h-3.5" /> Edit Kuis</> : <><Plus className="w-3.5 h-3.5" /> Buat Kuis</>}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Konfigurasi Post Test */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Konfigurasi Post Test Akhir</h3>
                      <p className="text-xs text-gray-500">Evaluasi kelulusan komprehensif setelah seluruh modul diselesaikan.</p>
                    </div>
                    {!isReadOnly && (
                      <button
                        onClick={handleSavePostTestConfig}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-teal-700 hover:bg-teal-50 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Simpan Konfigurasi
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nilai Kelulusan (Passing Grade)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0" max="100"
                          value={course.nilai_kelulusan ?? 70}
                          onChange={(e) => setCourse({ ...course, nilai_kelulusan: Number(e.target.value) })}
                          className="w-full pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Batas Maksimal Percobaan</label>
                      <div className="relative">
                        <select
                          value={postTest?.maks_percobaan || 3}
                          onChange={(e) => setPostTest(prev => prev ? { ...prev, maks_percobaan: Number(e.target.value) } : { maks_percobaan: Number(e.target.value) })}
                          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pr-10"
                        >
                          <option value="3">3 Kali Kesempatan</option>
                          <option value="1">1 Kali Kesempatan</option>
                          <option value="2">2 Kali Kesempatan</option>
                          <option value="5">5 Kali Kesempatan</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Bank Soal Link Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-teal-50/50 rounded-xl border border-teal-100">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Bank Soal Post Test</h3>
                    <p className="text-xs text-gray-600">
                      Total <span className="font-bold text-teal-800">{postTest?.soal_post_test?.length || 0} Pertanyaan</span> telah dikonfigurasi pada Bank Soal kursus ini.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem('adminKomunitasCourseId', course.pembelajaran_id);
                      if (onNavigate) onNavigate('bank-soal');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm text-center"
                  >
                    Kelola Bank Soal
                  </button>
                </div>
              </div>
            </section>

            {/* Section 4: Surat Pernyataan Keabsahan */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    Surat Pernyataan Keabsahan Konten
                  </h2>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                  Opsional (Tidak Wajib)
                </span>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 flex gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 mb-1">Status Pengunggahan: Bersifat Opsional</h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Pengunggahan berkas Surat Pernyataan Keabsahan Konten bersifat <b>opsional</b>. Admin Komunitas <b>tetap bisa mengajukan approval publikasi ke Admin BKPSDM</b> meskipun berkas ini tidak diisi atau tidak diunggah.
                    </p>
                  </div>
                </div>

                {/* Upload or View */}
                {course.surat_pernyataan_url ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-green-200 bg-green-50/50 rounded-xl gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                        PDF
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">Surat_Pernyataan_Keabsahan_Terupload.pdf</p>
                        <p className="text-xs text-green-700 font-semibold mt-0.5">Berkas telah tersimpan di server</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <a
                        href={course.surat_pernyataan_url.startsWith('http') ? course.surat_pernyataan_url : `http://localhost:8000${course.surat_pernyataan_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-md bg-white border border-teal-200"
                      >
                        <Eye className="w-3.5 h-3.5" /> Buka Dokumen
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveSuratPernyataan}
                        className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 px-3 py-1.5 rounded-md bg-white border border-red-200 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus Berkas
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* File Upload Box */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {course.surat_pernyataan_url ? 'Ganti Surat Pernyataan (PDF - Opsional)' : 'Unggah Berkas Surat Pernyataan (PDF - Opsional)'}
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Kosongkan bagian ini jika instansi Anda tidak memerlukan surat pengantar khusus keabsahan.
                  </p>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/60 flex flex-col items-center justify-center text-center">
                    <Upload className="w-8 h-8 text-teal-600 mb-2" />
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setSuratFile(e.target.files[0] || null)}
                      className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                    <p className="text-xs text-gray-400 mt-2">Maksimal ukuran file 5MB (Format .pdf) • Opsional</p>
                    {suratFile && (
                      <div className="mt-3">
                        <button
                          onClick={handleUploadSuratPernyataan}
                          disabled={isUploadingSurat}
                          className="px-4 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 disabled:opacity-50"
                        >
                          {isUploadingSurat ? 'Mengunggah...' : 'Upload Berkas Sekarang'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </section>

            {/* Section 5: Ulasan & Rating Peserta */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900">Ulasan & Evaluasi Peserta</h2>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        {reviewsData.statistik?.total_ulasan || 0} Ulasan
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Umpan balik dan penilaian mutu pembelajaran dari peserta yang telah menyelesaikan pelatihan.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshReviews}
                  disabled={loadingReviews}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-50"
                  title="Segarkan data ulasan"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingReviews ? 'animate-spin text-teal-600' : 'text-gray-500'}`} />
                  <span>{loadingReviews ? 'Memuat...' : 'Segarkan Ulasan'}</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Rating Overview Card */}
                <div className="bg-gradient-to-br from-amber-50/60 via-white to-teal-50/30 border border-amber-100/80 rounded-xl p-5 sm:p-6 shadow-2xs">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Nilai Rata-rata Besar */}
                    <div className="flex flex-col items-center justify-center text-center sm:border-r sm:border-gray-200/80 md:pr-8 shrink-0 min-w-[160px]">
                      <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                        {reviewsData.statistik?.rata_rata ? Number(reviewsData.statistik.rata_rata).toFixed(1) : '0.0'}
                      </span>
                      <div className="flex items-center gap-1 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(reviewsData.statistik?.rata_rata || 0)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-medium text-gray-500">
                        Dari total <strong className="text-gray-800">{reviewsData.statistik?.total_ulasan || 0}</strong> ulasan peserta
                      </p>
                    </div>

                    {/* Breakdown Bintang 5 s/d 1 */}
                    <div className="flex-1 w-full space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewsData.statistik?.distribusi?.[star] || 0;
                        const total = reviewsData.statistik?.total_ulasan || 0;
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                        return (
                          <div key={star} className="flex items-center gap-3 text-xs">
                            <span className="w-14 font-semibold text-gray-700 flex items-center gap-1 shrink-0">
                              {star} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                            </span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-16 text-right text-gray-500 font-medium shrink-0">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Filter Bintang Tabs */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-gray-400" /> Filter:
                  </span>
                  {[
                    { id: 'all', label: `Semua (${reviewsData.statistik?.total_ulasan || 0})` },
                    { id: '5', label: `⭐ 5 (${reviewsData.statistik?.distribusi?.[5] || 0})` },
                    { id: '4', label: `⭐ 4 (${reviewsData.statistik?.distribusi?.[4] || 0})` },
                    { id: '3', label: `⭐ 3 (${reviewsData.statistik?.distribusi?.[3] || 0})` },
                    { id: '2', label: `⭐ 2 (${reviewsData.statistik?.distribusi?.[2] || 0})` },
                    { id: '1', label: `⭐ 1 (${reviewsData.statistik?.distribusi?.[1] || 0})` },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSelectedReviewStar(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedReviewStar === filter.id
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Daftar Review Cards */}
                {(() => {
                  const filteredReviews = (reviewsData.ulasan || []).filter((r) => {
                    if (selectedReviewStar === 'all') return true;
                    return String(r.skor_rating) === String(selectedReviewStar);
                  });

                  if (filteredReviews.length === 0) {
                    return (
                      <div className="text-center py-10 px-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                          <Star className="w-6 h-6 stroke-1 fill-amber-100" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-800 mb-1">
                          {selectedReviewStar === 'all'
                            ? 'Belum Ada Ulasan dari Peserta'
                            : `Tidak Ada Ulasan dengan ${selectedReviewStar} Bintang`}
                        </h4>
                        <p className="text-xs text-gray-500 max-w-md mx-auto">
                          {selectedReviewStar === 'all'
                            ? 'Ulasan dan penilaian dari peserta pelatihan akan otomatis tampil di sini setelah peserta menyelesaikan materi dan mengirimkan evaluasi.'
                            : 'Silakan pilih filter rating lainnya untuk melihat ulasan peserta.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3.5">
                      {filteredReviews.map((rev) => (
                        <div
                          key={rev.ulasan_id}
                          className="p-4 sm:p-5 border border-gray-200/90 rounded-xl bg-white hover:border-teal-200 hover:shadow-xs transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                                {(rev.peserta?.nama_lengkap || 'P').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                                  {rev.peserta?.nama_lengkap || 'Peserta Anonim'}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  NIP: <span className="font-mono text-gray-700">{rev.peserta?.nip || '-'}</span> • {rev.peserta?.unit_kerja || 'Pemerintah Kabupaten Buleleng'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <div className="flex items-center gap-0.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= rev.skor_rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-xs font-bold text-amber-900 ml-1">
                                  {rev.skor_rating}.0
                                </span>
                              </div>
                              <span className="text-[11px] text-gray-400">
                                {rev.dikirim_pada
                                  ? new Date(rev.dikirim_pada).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : '-'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-gray-50/70 border border-gray-100 rounded-lg p-3 sm:p-3.5 text-xs text-gray-700 leading-relaxed relative">
                            <MessageSquare className="w-3.5 h-3.5 text-gray-400 absolute top-3.5 left-3 pointer-events-none" />
                            <p className="pl-6 italic text-gray-800 font-normal">
                              "{rev.teks_ulasan || 'Peserta memberikan penilaian rating tanpa komentar teks.'}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 p-4 px-6 z-20 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {isReadOnly ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-gray-400" /> Mode Hanya Baca — Kursus Komunitas Umum milik admin lain
            </span>
            <button
              onClick={() => onNavigate && onNavigate('katalog-kursus')}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Kembali ke Katalog
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleDeleteCourse}
              className="w-full sm:w-auto px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Hapus Pelatihan
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button onClick={handleUpdateBasicInfo} disabled={savingBasicInfo} className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50">
                {savingBasicInfo ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button onClick={handleAjukanApproval} className="w-full sm:w-auto px-6 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                Ajukan Approval Publikasi ke BKPSDM
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODAL: Tambah & Edit Modul */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {isEditingModule ? 'Edit Modul Pembelajaran' : 'Tambah Modul Pembelajaran'}
              </h3>
              <button onClick={() => setShowAddModuleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Thumbnail / Gambar Modul</label>
                <div className="flex items-center gap-3.5">
                  {moduleThumbnailPreview ? (
                    <div className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden shrink-0 group">
                      <img src={moduleThumbnailPreview} alt="Thumbnail Modul" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setModuleThumbnailFile(null); setModuleThumbnailPreview(''); }}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-bold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-gray-50">
                      <ImageIcon className="w-5 h-5 mb-0.5 text-gray-400" />
                      <span className="text-[9px]">No Image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="module-thumbnail-upload"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleModuleThumbnailChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="module-thumbnail-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> {moduleThumbnailPreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                    </label>
                    <p className="text-[11px] text-gray-400 mt-1">Format: JPG, PNG, WEBP. Maksimal 2MB.</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Judul Modul</label>
                <input
                  type="text"
                  required
                  value={moduleForm.judul_modul || ''}
                  onChange={(e) => setModuleForm({ ...moduleForm, judul_modul: e.target.value })}
                  placeholder="Contoh: Modul 1: Konsep Dasar Integritas"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Alokasi Jam Pelajaran (JP) Modul
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="99.99"
                    value={moduleForm.jp_modul ?? ''}
                    onChange={(e) => setModuleForm({ ...moduleForm, jp_modul: e.target.value })}
                    placeholder="Contoh: 2 atau 1.5"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pr-12"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                    JP
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Alokasi JP untuk modul ini. Nilai otomatis diakumulasikan ke total JP kursus.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Deskripsi / Gambaran Umum Modul</label>
                <textarea
                  rows="3"
                  value={moduleForm.deskripsi || ''}
                  onChange={(e) => setModuleForm({ ...moduleForm, deskripsi: e.target.value })}
                  placeholder="Tuliskan deskripsi atau gambaran umum mengenai materi pada modul ini..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800"
                >
                  {isEditingModule ? 'Simpan Perubahan' : 'Simpan Modul'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Materi */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Tambah Materi Pembelajaran</h3>
              <button onClick={() => setShowAddMaterialModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Judul Materi</label>
                <input
                  type="text"
                  required
                  value={materialForm.judul_materi || ''}
                  onChange={(e) => setMaterialForm({ ...materialForm, judul_materi: e.target.value })}
                  placeholder="Contoh: Modul Bacaan Bab 1 (PDF)"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tipe Materi</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMaterialForm({ ...materialForm, tipe_materi: 'pdf' })}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${materialForm.tipe_materi === 'pdf'
                        ? 'bg-teal-50 border-[#0F766E] text-[#0F766E]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    Dokumen PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialForm({ ...materialForm, tipe_materi: 'video_embed' })}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${materialForm.tipe_materi === 'video_embed'
                        ? 'bg-teal-50 border-[#0F766E] text-[#0F766E]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    Video YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialForm({ ...materialForm, tipe_materi: 'h5p' })}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${materialForm.tipe_materi === 'h5p'
                        ? 'bg-purple-50 border-purple-600 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>H5P Interaktif</span>
                  </button>
                </div>
              </div>

              {materialForm.tipe_materi === 'pdf' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Unggah Berkas PDF (Maks. 10MB)</label>
                  <input
                    type="file"
                    required
                    accept="application/pdf"
                    onChange={(e) => setMaterialForm({ ...materialForm, file_pdf: e.target.files[0] || null })}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                </div>
              ) : materialForm.tipe_materi === 'h5p' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Tautan Embed H5P</label>
                    <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded">Lumi / H5P / Iframe</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={materialForm.tautan_atau_berkas_embed || ''}
                    onChange={(e) => setMaterialForm({ ...materialForm, tautan_atau_berkas_embed: e.target.value })}
                    placeholder="https://app.lumi.education/run/... atau kode iframe"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    💡 Masukkan URL run/embed dari Lumi Cloud, platform H5P, atau kode iframe video interaktif.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">URL Video YouTube</label>
                  <input
                    type="url"
                    required
                    value={materialForm.tautan_atau_berkas_embed || ''}
                    onChange={(e) => setMaterialForm({ ...materialForm, tautan_atau_berkas_embed: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Estimasi Durasi Belajar (Menit)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={materialForm.durasi_menit ?? 15}
                  onChange={(e) => setMaterialForm({ ...materialForm, durasi_menit: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800"
                >
                  Unggah Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Materi Pembelajaran */}
      {showEditMaterialModal && editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Edit Materi Pembelajaran</h3>
                <p className="text-xs text-gray-500">Ubah detail atau berkas materi pada modul</p>
              </div>
              <button 
                onClick={() => { setShowEditMaterialModal(false); setEditingMaterial(null); }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {course?.status === 'dipublikasikan' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <b>Peringatan Approval:</b> Pelatihan ini aktif di katalog. Menyimpan perubahan materi akan <b>mengunci pelatihan (berwarna abu-abu)</b> pada katalog peserta hingga disetujui kembali oleh <b>Admin BKPSDM</b>.
                </p>
              </div>
            )}

            <form onSubmit={handleUpdateMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Judul Materi</label>
                <input
                  type="text"
                  required
                  value={editMaterialForm.judul_materi || ''}
                  onChange={(e) => setEditMaterialForm({ ...editMaterialForm, judul_materi: e.target.value })}
                  placeholder="Contoh: Modul Bacaan Bab 1 (PDF)"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tipe Materi</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMaterialForm({ ...editMaterialForm, tipe_materi: 'pdf' })}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      editMaterialForm.tipe_materi === 'pdf'
                        ? 'bg-teal-50 border-[#0F766E] text-[#0F766E]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Dokumen PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMaterialForm({ ...editMaterialForm, tipe_materi: 'video_embed' })}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      editMaterialForm.tipe_materi === 'video_embed'
                        ? 'bg-teal-50 border-[#0F766E] text-[#0F766E]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Video YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMaterialForm({ ...editMaterialForm, tipe_materi: 'h5p' })}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${
                      editMaterialForm.tipe_materi === 'h5p'
                        ? 'bg-purple-50 border-purple-600 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>H5P Interaktif</span>
                  </button>
                </div>
              </div>

              {editMaterialForm.tipe_materi === 'pdf' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Ganti Berkas PDF (Opsional, Maks. 10MB)
                  </label>
                  {editingMaterial?.tautan_atau_berkas && (
                    <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 flex items-center justify-between">
                      <span className="truncate max-w-xs">Berkas saat ini: {editingMaterial.tautan_atau_berkas.split('/').pop()}</span>
                      <a 
                        href={editingMaterial.tautan_atau_berkas.startsWith('http') ? editingMaterial.tautan_atau_berkas : `http://localhost:8000${editingMaterial.tautan_atau_berkas}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-teal-700 font-semibold hover:underline"
                      >
                        Pratinjau
                      </a>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setEditMaterialForm({ ...editMaterialForm, file_pdf: e.target.files[0] || null })}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Biarkan kosong jika tidak ingin mengubah berkas PDF.</p>
                </div>
              ) : editMaterialForm.tipe_materi === 'h5p' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Tautan Embed H5P</label>
                    <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded">Lumi / H5P / Iframe</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={editMaterialForm.tautan_atau_berkas_embed || ''}
                    onChange={(e) => setEditMaterialForm({ ...editMaterialForm, tautan_atau_berkas_embed: e.target.value })}
                    placeholder="https://app.lumi.education/run/... atau kode iframe"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    💡 Masukkan URL run/embed dari platform H5P atau iframe interaktif.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">URL Video YouTube</label>
                  <input
                    type="url"
                    required
                    value={editMaterialForm.tautan_atau_berkas_embed || ''}
                    onChange={(e) => setEditMaterialForm({ ...editMaterialForm, tautan_atau_berkas_embed: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editMaterialForm.durasi_menit ?? 15}
                    onChange={(e) => setEditMaterialForm({ ...editMaterialForm, durasi_menit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Sifat Materi</label>
                  <select
                    value={editMaterialForm.apakah_wajib ? '1' : '0'}
                    onChange={(e) => setEditMaterialForm({ ...editMaterialForm, apakah_wajib: e.target.value === '1' })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="1">Wajib Dipelajari</option>
                    <option value="0">Materi Pengayaan (Opsional)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowEditMaterialModal(false); setEditingMaterial(null); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 shadow-sm"
                >
                  Simpan Perubahan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Kelola Kuis Modul */}
      {showQuizModal && targetQuizModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 max-h-[92vh] overflow-y-auto overflow-x-hidden">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">
                    {targetQuizType === 'pre_test'
                      ? `Kelola Pre-Test Materi: ${targetQuizMateri?.judul_materi}`
                      : `Kelola Kuis Evaluasi: ${targetQuizModule.judul_modul}`}
                  </h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    targetQuizType === 'pre_test'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {targetQuizType === 'pre_test' ? 'Pre-Test Materi' : 'Evaluasi Modul'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {targetQuizType === 'pre_test'
                    ? 'Pre-test ini wajib dikerjakan peserta untuk membuka berkas materi. Tidak ada nilai kelulusan minimal.'
                    : 'Konfigurasi soal evaluasi pemahaman modul (Pilihan Ganda, TTS, atau Drag & Drop).'}
                </p>
              </div>
              <button onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quiz General Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className={targetQuizType === 'pre_test' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Judul {targetQuizType === 'pre_test' ? 'Pre-Test' : 'Kuis'}</label>
                <input
                  type="text"
                  value={quizForm.judul_kuis || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, judul_kuis: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Durasi (Menit)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={quizForm.durasi_menit ?? 15}
                    onChange={(e) => setQuizForm({ ...quizForm, durasi_menit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                    placeholder="15"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-gray-400 pointer-events-none">mnt</span>
                </div>
              </div>
              {targetQuizType === 'evaluasi_modul' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Passing Grade (%)</label>
                    <input
                      type="number"
                      min="0" max="100"
                      value={quizForm.nilai_kelulusan ?? 70}
                      onChange={(e) => setQuizForm({ ...quizForm, nilai_kelulusan: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Maks. Percobaan</label>
                    <input
                      type="number"
                      min="1"
                      value={quizForm.maks_percobaan ?? 3}
                      onChange={(e) => setQuizForm({ ...quizForm, maks_percobaan: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center">
                  <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Pre-test tidak memerlukan syarat kelulusan skor nilai.
                  </div>
                </div>
              )}
            </div>

            {/* Tab Nav: Pilihan Ganda vs Teka-Teki Silang vs Drag & Drop */}
            <div className="flex border-b border-gray-200 gap-2 sm:gap-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setQuizActiveTab('pilihan_ganda')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
                  quizActiveTab === 'pilihan_ganda'
                    ? 'border-[#0F766E] text-[#0F766E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Soal Pilihan Ganda ({quizForm.soal.filter(s => s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal).length})
              </button>
              <button
                type="button"
                onClick={() => setQuizActiveTab('tts')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
                  quizActiveTab === 'tts'
                    ? 'border-[#0F766E] text-[#0F766E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
                Teka-Teki Silang (TTS) ({ttsInputWords.length})
              </button>
              <button
                type="button"
                onClick={() => setQuizActiveTab('drag_drop')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
                  quizActiveTab === 'drag_drop'
                    ? 'border-[#0F766E] text-[#0F766E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Dropdown / Drag & Drop ({quizForm.soal.filter(s => s.tipe_soal === 'drag_drop').length})
              </button>
            </div>

            {/* TAB CONTENT: PILIHAN GANDA */}
            {quizActiveTab === 'pilihan_ganda' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Daftar Butir Pilihan Ganda ({quizForm.soal.filter(s => s.tipe_soal !== 'tts').length})
                  </h4>
                  {quizForm.soal.filter(s => s.tipe_soal !== 'tts').length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-3 bg-gray-50 rounded-lg text-center">
                      Belum ada butir soal pilihan ganda. Tambahkan melalui formulir di bawah jika diperlukan.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {quizForm.soal.filter(s => s.tipe_soal !== 'tts').map((q, idx) => (
                        <div key={idx} className="p-3 border border-gray-100 rounded-lg bg-gray-50/70 flex justify-between items-start gap-2">
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-gray-900">{idx + 1}. {q.teks_soal}</p>
                            <p className="text-teal-700 font-semibold">Kunci Jawaban: {q.kunci_jawaban}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionFromQuiz(idx)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Question Form PG */}
                <form onSubmit={handleAddQuestionToQuiz} className="border border-teal-100 bg-teal-50/30 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">Tambah Pertanyaan Pilihan Ganda</h4>
                  <div>
                    <input
                      type="text"
                      placeholder="Tuliskan butir soal pertanyaan..."
                      value={newQuizItem.teks_soal || ''}
                      onChange={(e) => setNewQuizItem({ ...newQuizItem, teks_soal: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((optKey) => (
                      <div key={optKey} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600 w-4">{optKey}.</span>
                        <input
                          type="text"
                          placeholder={`Pilihan ${optKey}`}
                          value={newQuizItem[`opsi${optKey}`] || ''}
                          onChange={(e) => setNewQuizItem({ ...newQuizItem, [`opsi${optKey}`]: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700">Kunci Jawaban Benar:</span>
                      <select
                        value={newQuizItem.kunci_jawaban || 'A'}
                        onChange={(e) => setNewQuizItem({ ...newQuizItem, kunci_jawaban: e.target.value })}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-teal-700"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Soal PG
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB CONTENT: TEKA-TEKI SILANG (TTS) */}
            {quizActiveTab === 'tts' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Game Teka-Teki Silang Interaktif:</span> Masukkan kata kunci jawaban dan petunjuk (clue). Kotak persilangan kata dan nomor petunjuk akan otomatis dihitung dan disusun ke dalam papan TTS.
                  </div>
                </div>

                {/* Form Tambah Kata TTS - Rapi mendatar dan proporsional */}
                <form onSubmit={handleAddTtsWord} className="border border-teal-200 bg-teal-50/30 p-4 sm:p-5 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#0F766E] uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> Tambah Kata & Petunjuk TTS
                    </h4>
                    <span className="text-[11px] text-gray-500 font-medium">Hanya huruf A-Z, tanpa spasi</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                    <div className="md:col-span-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-gray-700">Kata Kunci (Jawaban)</label>
                        <span className="text-[10px] text-teal-700 font-semibold">{newTtsItem.word.length} huruf</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Contoh: INTEGRITAS"
                        value={newTtsItem.word}
                        onChange={(e) => setNewTtsItem({ ...newTtsItem, word: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
                        className="w-full h-10 px-3.5 bg-white border border-gray-300 rounded-lg text-xs font-extrabold tracking-wider text-teal-900 uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-2xs"
                      />
                    </div>

                    <div className="md:col-span-6">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-gray-700">Petunjuk (Clue / Soal)</label>
                        <span className="text-[10px] text-gray-400">Pertanyaan peserta</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Contoh: Sikap teguh berpegang pada nilai moral dan kejujuran"
                        value={newTtsItem.clue}
                        onChange={(e) => setNewTtsItem({ ...newTtsItem, clue: e.target.value })}
                        className="w-full h-10 px-3.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-2xs"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="h-[17px] mb-1"></div>
                      <button
                        type="submit"
                        className="w-full h-10 bg-[#0F766E] text-white rounded-lg text-xs font-bold hover:bg-teal-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Tambah
                      </button>
                    </div>
                  </div>
                </form>

                {/* List Kata TTS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Daftar Kata TTS</span>
                      <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {ttsInputWords.length} Kata
                      </span>
                    </h4>
                    {ttsInputWords.length > 1 && (
                      <button
                        type="button"
                        onClick={handleRegenerateTtsLayout}
                        className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1.5 hover:underline cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                        title="Acak ulang susunan persilangan kata"
                      >
                        <RefreshCw className="w-3 h-3" /> Acak Ulang Susunan
                      </button>
                    )}
                  </div>

                  {ttsInputWords.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                      <Grid className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-gray-500">Belum ada kata TTS yang ditambahkan.</p>
                      <p className="text-[11px] text-gray-400">Tambahkan minimal 2 kata di atas untuk menghasilkan papan TTS otomatis.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-gray-50/70 rounded-xl border border-gray-200">
                      {ttsInputWords.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-teal-200 shadow-2xs text-xs group hover:border-teal-400 transition-colors"
                        >
                          <span className="font-extrabold text-teal-900 tracking-wider uppercase">{item.word}</span>
                          <span className="bg-teal-50 text-teal-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                            {item.word.length}H
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-600 truncate max-w-[220px]" title={item.clue}>{item.clue}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTtsWord(item.id)}
                            className="text-gray-400 hover:text-red-500 ml-1 p-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus kata"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Preview Grid TTS */}
                {ttsLayout && (
                  <div className="border border-teal-100 rounded-2xl p-4 sm:p-5 bg-teal-50/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gray-800 flex items-center gap-2">
                        <Grid className="w-4 h-4 text-[#0F766E]" />
                        Preview Papan Teka-Teki Silang ({ttsLayout.rows} &times; {ttsLayout.cols} Kotak)
                      </span>
                      <span className="text-[11px] text-[#0F766E] bg-teal-100/70 px-2.5 py-0.5 rounded-full border border-teal-200 font-bold">
                        {ttsLayout.placedWords.length} Kata Tersusun Rapi
                      </span>
                    </div>

                    {ttsLayout.unplacedWords && ttsLayout.unplacedWords.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Perhatian:</span> Kata (<b>{ttsLayout.unplacedWords.map(w => w.word).join(', ')}</b>) belum memiliki huruf yang bersilangan dengan kata lainnya. Coba klik <b>"Acak Ulang Susunan"</b> atau tambahkan kata lain yang memiliki huruf yang sama.
                        </div>
                      </div>
                    )}

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs w-full overflow-hidden">
                      <CrosswordBoard gridData={ttsLayout} showAnswers={true} isReadOnly={true} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: DRAG & DROP / DROPDOWN */}
            {quizActiveTab === 'drag_drop' && (
              <div className="space-y-5">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-teal-900">
                  <Sparkles className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Cara Membuat Soal Dropdown / Drag & Drop:</span> Tuliskan kalimat soal dan apit kata yang ingin dijadikan titik-titik kosong menggunakan tanda kurung siku <b>[ ... ]</b>. Kata di dalam kurung siku otomatis menjadi kunci jawaban dan bank pilihan.
                    <div className="mt-1 text-[11px] text-teal-700 font-mono bg-white/70 px-2 py-1 rounded border border-teal-100">
                      Contoh: Anak ayam lahir dari [telur] dan ikan bernafas dengan [insang]
                    </div>
                  </div>
                </div>

                {/* Form Tambah Soal Drag & Drop */}
                <form onSubmit={handleAddDragDropToQuiz} className="border border-teal-200 bg-teal-50/20 p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#0F766E] uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> Tambah Soal Dropdown / Drag & Drop
                    </h4>
                    <span className="text-[11px] text-gray-500 font-medium">Apit kata kunci dengan [ ]</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kalimat Soal (Gunakan [kunci] untuk titik-titik kosong)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: ASN harus memiliki nilai dasar [BerAKHLAK] dan selalu menjaga [integritas] dalam melayani masyarakat."
                      value={newDragDropItem.teks_soal}
                      onChange={(e) => setNewDragDropItem({ ...newDragDropItem, teks_soal: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-8">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Pilihan Pengecoh / Tambahan (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: loyalitas, adaptif, kompeten (pisahkan dengan koma)"
                        value={newDragDropItem.distractors}
                        onChange={(e) => setNewDragDropItem({ ...newDragDropItem, distractors: e.target.value })}
                        className="w-full h-10 px-3.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-400 mt-0.5 block">Kata pengecoh untuk memperkaya pilihan</span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Bobot Nilai</label>
                      <input
                        type="number"
                        min="1"
                        value={newDragDropItem.bobot_nilai}
                        onChange={(e) => setNewDragDropItem({ ...newDragDropItem, bobot_nilai: Number(e.target.value) })}
                        className="w-full h-10 px-3.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-teal-800"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="w-full h-10 bg-[#0F766E] text-white rounded-lg text-xs font-bold hover:bg-teal-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Simpan Soal
                      </button>
                    </div>
                  </div>
                </form>

                {/* Daftar Soal Drag & Drop yang Sudah Dibuat */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Daftar Soal Dropdown / Drag & Drop</span>
                    <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {quizForm.soal.filter(s => s.tipe_soal === 'drag_drop').length} Soal
                    </span>
                  </h4>

                  {quizForm.soal.filter(s => s.tipe_soal === 'drag_drop').length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                      <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-gray-500">Belum ada butir soal Drag & Drop.</p>
                      <p className="text-[11px] text-gray-400">Tambahkan kalimat rumpang melalui formulir di atas.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quizForm.soal.filter(s => s.tipe_soal === 'drag_drop').map((item, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <span className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              Soal #{idx + 1} (Bobot: {item.bobot_nilai || 1})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDragDropFromQuiz(idx)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                              title="Hapus Soal"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>

                          {/* Live Preview Soal dengan DragDropQuiz */}
                          <DragDropQuiz
                            question={item}
                            isReadOnly={true}
                            showAnswers={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Total Soal: <span className="font-bold text-gray-800">{quizForm.soal.length}</span> (
                {quizForm.soal.filter(s => s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal).length} PG,{' '}
                {quizForm.soal.filter(s => s.tipe_soal === 'tts').length} TTS,{' '}
                {quizForm.soal.filter(s => s.tipe_soal === 'drag_drop').length} Drag & Drop)
              </div>
              <div className="flex items-center gap-2">
                {((targetQuizType === 'pre_test' && targetQuizMateri?.pre_test?.kuis_id) ||
                  (targetQuizType === 'evaluasi_modul' && getModulQuiz(targetQuizModule)?.kuis_id)) && (
                  <button
                    type="button"
                    onClick={() => {
                      const qId = targetQuizType === 'pre_test' ? targetQuizMateri?.pre_test?.kuis_id : getModulQuiz(targetQuizModule)?.kuis_id;
                      handleDeleteQuiz(qId, targetQuizType === 'pre_test' ? 'Pre-Test' : 'Kuis');
                    }}
                    className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus {targetQuizType === 'pre_test' ? 'Pre-Test' : 'Kuis'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuiz}
                  className="px-6 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 shadow-sm"
                >
                  Simpan Seluruh {targetQuizType === 'pre_test' ? 'Pre-Test' : 'Kuis'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailKursus;
