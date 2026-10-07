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
  Star, MessageSquare, ThumbsUp, Package
} from 'lucide-react';
import { generateCrosswordLayout } from '../utils/crosswordGenerator';
import CrosswordBoard from '../components/CrosswordBoard';
import DragDropQuiz from '../components/DragDropQuiz';

import AdminKomunitasSidebar from '../components/layout/AdminKomunitasSidebar';
import AdminKomunitasHeader from '../components/layout/AdminKomunitasHeader';
import { validateThumbnailFile } from '../utils/imageValidation';

import CourseBasicInfoCard from './DetailKursus/components/CourseBasicInfoCard';
import CourseSyllabusSection from './DetailKursus/components/CourseSyllabusSection';
import CourseEvaluationSection from './DetailKursus/components/CourseEvaluationSection';
import SuratPernyataanCard from './DetailKursus/components/SuratPernyataanCard';
import CourseReviewsCard from './DetailKursus/components/CourseReviewsCard';
import ModuleModal from './DetailKursus/modals/ModuleModal';
import MaterialModal from './DetailKursus/modals/MaterialModal';
import QuizBuilderModal from './DetailKursus/modals/QuizBuilderModal';

const DetailKursus = ({ onNavigate, onLogout }) => {
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
    file_pdf: null,
    file_scorm: null,
    scorm_mode: 'zip' // 'zip' | 'link'
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
    file_scorm: null,
    scorm_mode: 'zip',
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
    opsiD: '',
    bobot_nilai: 1
  });
  const [quizActiveTab, setQuizActiveTab] = useState('pilihan_ganda'); // 'pilihan_ganda' | 'tts' | 'drag_drop' | 'pilihan_berbobot'
  const [ttsInputWords, setTtsInputWords] = useState([]);
  const [newTtsItem, setNewTtsItem] = useState({ word: '', clue: '', bobot_nilai: 1 });
  const [ttsLayout, setTtsLayout] = useState(null);
  const [newDragDropItem, setNewDragDropItem] = useState({
    teks_soal: '',
    distractors: '',
    bobot_nilai: 1
  });
  const [newWeightedItem, setNewWeightedItem] = useState({
    teks_soal: '',
    opsiA: '',
    bobotA: 5,
    opsiB: '',
    bobotB: 4,
    opsiC: '',
    bobotC: 3,
    opsiD: '',
    bobotD: 2,
    opsiE: '',
    bobotE: 1,
    bobot_nilai: 5
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

    const isValid = validateThumbnailFile(file, e.target, () => {
      setCourseThumbnailFile(null);
    });
    if (!isValid) return;

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

    // Double-check validasi ukuran thumbnail kursus
    if (courseThumbnailFile && !validateThumbnailFile(courseThumbnailFile, null, () => setCourseThumbnailFile(null))) {
      return;
    }

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
      const errThumbnail = error.response?.data?.errors?.thumbnail?.[0];
      const errMsg = errThumbnail || error.response?.data?.message || 'Gagal menyimpan perubahan.';

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
          title: 'Gagal Menyimpan',
          text: errMsg
        });
      }
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

    const isValid = validateThumbnailFile(file, e.target, () => {
      setModuleThumbnailFile(null);
    });
    if (!isValid) return;

    setModuleThumbnailFile(file);
    setModuleThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleForm.judul_modul.trim()) return;

    // Double-check validasi ukuran thumbnail modul
    if (moduleThumbnailFile && !validateThumbnailFile(moduleThumbnailFile, null, () => setModuleThumbnailFile(null))) {
      return;
    }

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
      const errThumbnail = error.response?.data?.errors?.thumbnail?.[0];
      const errMsg = errThumbnail || error.response?.data?.message || 'Gagal menyimpan modul.';

      if (errThumbnail || (errMsg && errMsg.toLowerCase().includes('2mb'))) {
        Swal.fire({
          icon: 'warning',
          title: 'Ukuran Foto Melebihi 2MB!',
          html: `
            <div class="text-left text-xs sm:text-sm text-gray-600 space-y-2 pt-1">
              <p class="bg-red-50 text-red-800 p-2.5 rounded-lg border border-red-200">
                ${errMsg}
              </p>
              <p>Harap <b>mengompres foto thumbnail modul</b> Anda terlebih dahulu agar berukuran di bawah 2MB sebelum menyimpannya.</p>
            </div>
          `,
          confirmButtonColor: '#0F766E',
          confirmButtonText: 'Saya Mengerti, Kompres Dulu'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: errMsg
        });
      }
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
      file_pdf: null,
      file_scorm: null,
      scorm_mode: 'zip'
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
      } else if (materialForm.tipe_materi === 'scorm') {
        if (materialForm.scorm_mode === 'zip') {
          if (!materialForm.file_scorm) {
            Swal.fire({
              icon: 'warning',
              title: 'Berkas SCORM (.zip) Belum Dipilih',
              text: 'Silakan pilih paket file ZIP SCORM yang ingin diunggah.',
              confirmButtonColor: '#0F766E'
            });
            return;
          }
          formData.append('file_scorm', materialForm.file_scorm);
        } else {
          if (!materialForm.tautan_atau_berkas_embed.trim()) {
            Swal.fire({
              icon: 'warning',
              title: 'Tautan SCORM Diperlukan',
              text: 'Silakan masukkan tautan player SCORM eksternal.',
              confirmButtonColor: '#0F766E'
            });
            return;
          }
          formData.append('tautan_atau_berkas_embed', materialForm.tautan_atau_berkas_embed);
        }
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
    const isScormZip = materi.tipe_materi === 'scorm' && materi.tautan_atau_berkas && materi.tautan_atau_berkas.includes('/storage/scorm/');
    setEditMaterialForm({
      judul_materi: materi.judul_materi || '',
      tipe_materi: materi.tipe_materi || 'pdf',
      durasi_menit: materi.durasi_menit || 15,
      tautan_atau_berkas_embed: (materi.tipe_materi !== 'pdf' && !isScormZip) ? (materi.tautan_atau_berkas || '') : '',
      file_pdf: null,
      file_scorm: null,
      scorm_mode: isScormZip ? 'zip' : (materi.tipe_materi === 'scorm' ? 'link' : 'zip'),
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
      } else if (editMaterialForm.tipe_materi === 'scorm') {
        if (editMaterialForm.scorm_mode === 'zip') {
          if (editMaterialForm.file_scorm) {
            formData.append('file_scorm', editMaterialForm.file_scorm);
          }
        } else {
          if (!editMaterialForm.tautan_atau_berkas_embed.trim()) {
            Swal.fire({
              icon: 'warning',
              title: 'Tautan SCORM Diperlukan',
              text: 'Silakan masukkan tautan player SCORM eksternal.',
              confirmButtonColor: '#0F766E'
            });
            return;
          }
          formData.append('tautan_atau_berkas_embed', editMaterialForm.tautan_atau_berkas_embed);
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
  const getModulQuiz = (m, type = 'evaluasi_modul') => {
    if (!m) return null;
    if (type === 'kuis_berbobot') {
      if (m.kuis_berbobot) return m.kuis_berbobot;
      if (Array.isArray(m.semua_kuis)) {
        return m.semua_kuis.find(k => k.tipe_kuis === 'kuis_berbobot') || null;
      }
      if (Array.isArray(m.kuis)) {
        return m.kuis.find(k => k.tipe_kuis === 'kuis_berbobot') || null;
      }
      return null;
    }
    // Evaluasi Modul (default)
    if (Array.isArray(m.kuis)) {
      return m.kuis.find(k => k.tipe_kuis === 'evaluasi_modul' || !k.tipe_kuis) || (m.kuis.length > 0 && m.kuis[0].tipe_kuis !== 'kuis_berbobot' ? m.kuis[0] : null);
    }
    if (Array.isArray(m.semua_kuis)) {
      const q = m.semua_kuis.find(k => k.tipe_kuis === 'evaluasi_modul' || !k.tipe_kuis);
      if (q) return q;
    }
    return (m.kuis && m.kuis.tipe_kuis !== 'kuis_berbobot') ? m.kuis : null;
  };

  // --- Kuis Handlers ---
  const syncTtsLayoutToQuizForm = (layout, wordSource) => {
    if (!layout || layout.placedWords.length === 0) return;

    const sourceMap = {};
    (wordSource || []).forEach(w => {
      sourceMap[w.word] = Number(w.bobot_nilai) || 1;
    });

    const ttsSoalItems = layout.placedWords.map(w => ({
      tipe_soal: 'tts',
      teks_soal: w.clue,
      kunci_jawaban: w.word,
      arah: w.direction,
      nomor_urut: w.number,
      baris_mulai: w.row,
      kolom_mulai: w.col,
      pilihan_jawaban_json: null,
      bobot_nilai: sourceMap[w.word] || Number(w.bobot_nilai) || 1
    }));

    setQuizForm(prev => {
      const nonTts = prev.soal.filter(s => s.tipe_soal !== 'tts');
      return {
        ...prev,
        soal: [...nonTts, ...ttsSoalItems],
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

    if (type === 'kuis_berbobot') {
      setQuizActiveTab('pilihan_berbobot');
    } else {
      setQuizActiveTab('pilihan_ganda');
    }

    let existingQuiz = null;
    if (type === 'pre_test') {
      existingQuiz = materi?.pre_test || null;
    } else if (type === 'kuis_berbobot') {
      existingQuiz = getModulQuiz(freshModul, 'kuis_berbobot');
    } else {
      existingQuiz = getModulQuiz(freshModul, 'evaluasi_modul');
    }

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
          bobot_nilai: Number(s.bobot_nilai) || 1
        };
      });

      const ttsSoal = allSoal.filter(s => s.tipe_soal === 'tts');
      const initialTts = ttsSoal.map((s, idx) => ({
        id: s.soal_kuis_id ? `tts-${s.soal_kuis_id}` : `tts-init-${idx}`,
        word: s.kunci_jawaban || '',
        clue: s.teks_soal || '',
        bobot_nilai: Number(s.bobot_nilai) || 1
      }));

      setTtsInputWords(initialTts);

      let defaultTitle = `Kuis ${modul.judul_modul}`;
      if (type === 'pre_test') defaultTitle = `Pre-Test: ${materi?.judul_materi}`;
      if (type === 'kuis_berbobot') defaultTitle = `Kuis Berbobot: ${modul.judul_modul}`;

      setQuizForm({
        judul_kuis: existingQuiz.judul_kuis || defaultTitle,
        durasi_menit: existingQuiz.durasi_menit || 15,
        nilai_kelulusan: (type === 'pre_test' || type === 'kuis_berbobot') ? (existingQuiz.nilai_kelulusan ?? 0) : (existingQuiz.nilai_kelulusan ?? 70),
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
      let defaultTitle = `Kuis ${modul.judul_modul}`;
      if (type === 'pre_test') defaultTitle = `Pre-Test: ${materi?.judul_materi}`;
      if (type === 'kuis_berbobot') defaultTitle = `Kuis Berbobot: ${modul.judul_modul}`;

      setQuizForm({
        judul_kuis: defaultTitle,
        durasi_menit: 15,
        nilai_kelulusan: (type === 'pre_test' || type === 'kuis_berbobot') ? 0 : 70,
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
      opsiD: '',
      bobot_nilai: 1
    });
    setNewTtsItem({ word: '', clue: '', bobot_nilai: 1 });
    setNewDragDropItem({ teks_soal: '', distractors: '', bobot_nilai: 1 });
    setNewWeightedItem({
      teks_soal: '',
      opsiA: '',
      bobotA: 5,
      opsiB: '',
      bobotB: 4,
      opsiC: '',
      bobotC: 3,
      opsiD: '',
      bobotD: 2,
      opsiE: '',
      bobotE: 1,
      bobot_nilai: 5
    });
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
      bobot_nilai: Number(newQuizItem.bobot_nilai) || 1
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
      opsiD: '',
      bobot_nilai: 1
    });
  };

  const handleRemoveQuestionFromQuiz = (index) => {
    const pgQuestions = quizForm.soal.filter(s => s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal);
    const targetItem = pgQuestions[index];
    if (!targetItem) return;

    setQuizForm(prev => ({
      ...prev,
      soal: prev.soal.filter(s => s !== targetItem)
    }));
  };

  const handleAddWeightedToQuiz = (e) => {
    e.preventDefault();
    if (!newWeightedItem.teks_soal.trim() || !newWeightedItem.opsiA.trim() || !newWeightedItem.opsiB.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Butir Soal Belum Lengkap',
        text: 'Teks pertanyaan dan minimal pilihan opsi A & B beserta bobot nilainya wajib diisi!',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    const options = {
      A: { teks: newWeightedItem.opsiA.trim(), bobot: Number(newWeightedItem.bobotA) || 0 },
      B: { teks: newWeightedItem.opsiB.trim(), bobot: Number(newWeightedItem.bobotB) || 0 }
    };

    if (newWeightedItem.opsiC.trim()) {
      options.C = { teks: newWeightedItem.opsiC.trim(), bobot: Number(newWeightedItem.bobotC) || 0 };
    }
    if (newWeightedItem.opsiD.trim()) {
      options.D = { teks: newWeightedItem.opsiD.trim(), bobot: Number(newWeightedItem.bobotD) || 0 };
    }
    if (newWeightedItem.opsiE.trim()) {
      options.E = { teks: newWeightedItem.opsiE.trim(), bobot: Number(newWeightedItem.bobotE) || 0 };
    }

    let maxBobot = 0;
    let bestKey = 'A';
    Object.entries(options).forEach(([k, v]) => {
      if (v.bobot > maxBobot) {
        maxBobot = v.bobot;
        bestKey = k;
      }
    });

    const item = {
      tipe_soal: 'pilihan_berbobot',
      teks_soal: newWeightedItem.teks_soal.trim(),
      kunci_jawaban: bestKey,
      pilihan_jawaban_json: options,
      bobot_nilai: Number(newWeightedItem.bobot_nilai) || (maxBobot > 0 ? maxBobot : 1)
    };

    setQuizForm(prev => ({
      ...prev,
      soal: [...prev.soal, item]
    }));

    setNewWeightedItem({
      teks_soal: '',
      opsiA: '',
      bobotA: 5,
      opsiB: '',
      bobotB: 4,
      opsiC: '',
      bobotC: 3,
      opsiD: '',
      bobotD: 2,
      opsiE: '',
      bobotE: 1,
      bobot_nilai: 5
    });
  };

  const handleRemoveWeightedFromQuiz = (index) => {
    const weightedQuestions = quizForm.soal.filter(s => s.tipe_soal === 'pilihan_berbobot');
    const targetItem = weightedQuestions[index];
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
        clue: newTtsItem.clue.trim(),
        bobot_nilai: Number(newTtsItem.bobot_nilai) || 1
      }
    ];

    setTtsInputWords(updatedWords);
    setNewTtsItem({ word: '', clue: '', bobot_nilai: 1 });

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
      const isWeighted = targetQuizType === 'kuis_berbobot';
      const payload = {
        judul_kuis: quizForm.judul_kuis,
        durasi_menit: Number(quizForm.durasi_menit) || 15,
        tipe_kuis: targetQuizType,
        materi_id: isPreTest ? targetQuizMateri?.materi_id : null,
        nilai_kelulusan: (isPreTest || isWeighted) ? Number(quizForm.nilai_kelulusan || 0) : Number(quizForm.nilai_kelulusan),
        maks_percobaan: isPreTest ? 1 : Number(quizForm.maks_percobaan),
        grid_config_json: quizForm.grid_config_json,
        soal: quizForm.soal
      };

      let existingQuiz = null;
      if (isPreTest) {
        existingQuiz = targetQuizMateri?.pre_test;
      } else if (isWeighted) {
        existingQuiz = getModulQuiz(targetQuizModule, 'kuis_berbobot');
      } else {
        existingQuiz = getModulQuiz(targetQuizModule, 'evaluasi_modul');
      }

      if (existingQuiz && existingQuiz.kuis_id) {
        await api.put(`/admin-komunitas/kuis/${existingQuiz.kuis_id}`, payload);
      } else {
        await api.post(`/admin-komunitas/modul/${targetQuizModule.modul_id}/kuis`, payload);
      }

      const countPG = quizForm.soal.filter(s => s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal).length;
      const countTTS = quizForm.soal.filter(s => s.tipe_soal === 'tts').length;
      const countDD = quizForm.soal.filter(s => s.tipe_soal === 'drag_drop').length;
      const countWeighted = quizForm.soal.filter(s => s.tipe_soal === 'pilihan_berbobot').length;

      const typeTitle = isPreTest ? 'Pre-Test' : (isWeighted ? 'Kuis Nilai Berbobot' : 'Kuis Evaluasi Modul');

      await Swal.fire({
        icon: 'success',
        title: `${typeTitle} Berhasil Disimpan!`,
        text: `${typeTitle} berhasil disimpan (${countPG} PG, ${countTTS} TTS, ${countDD} Drag & Drop, ${countWeighted} Berbobot). Durasi: ${payload.durasi_menit} menit.`,
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
      <AdminKomunitasSidebar
        activeMenu="katalog-kursus"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminKomunitasHeader setIsOpen={setIsSidebarOpen} />

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

            {/* Section 1: Informasi Dasar */}
            <CourseBasicInfoCard
              course={course}
              setCourse={setCourse}
              categories={categories}
              totalJp={totalJp}
              courseThumbnailPreview={courseThumbnailPreview}
              courseThumbnailFile={courseThumbnailFile}
              handleCourseThumbnailChange={handleCourseThumbnailChange}
              handleRemoveCourseThumbnail={handleRemoveCourseThumbnail}
              handleUpdateBasicInfo={handleUpdateBasicInfo}
              savingBasicInfo={savingBasicInfo}
              isReadOnly={isReadOnly}
            />

            {/* Section 2: Modul & Materi */}
            <CourseSyllabusSection
              modules={modules}
              totalJp={totalJp}
              isReadOnly={isReadOnly}
              openModuleIds={openModuleIds}
              toggleModuleOpen={toggleModuleOpen}
              handleOpenAddModuleModal={handleOpenAddModuleModal}
              handleOpenEditModuleModal={handleOpenEditModuleModal}
              handleDeleteModule={handleDeleteModule}
              handleOpenAddMaterialModal={handleOpenAddMaterialModal}
              handleOpenEditMaterialModal={handleOpenEditMaterialModal}
              handleDeleteMaterial={handleDeleteMaterial}
              handleOpenQuizModal={handleOpenQuizModal}
            />

            {/* Section 3: Evaluasi & Post Test */}
            <CourseEvaluationSection
              modules={modules}
              course={course}
              setCourse={setCourse}
              postTest={postTest}
              setPostTest={setPostTest}
              getModulQuiz={getModulQuiz}
              handleOpenQuizModal={handleOpenQuizModal}
              handleSavePostTestConfig={handleSavePostTestConfig}
              isReadOnly={isReadOnly}
              onNavigate={onNavigate}
            />

            {/* Section 4: Surat Pernyataan Keabsahan */}
            <SuratPernyataanCard
              course={course}
              suratFile={suratFile}
              setSuratFile={setSuratFile}
              isUploadingSurat={isUploadingSurat}
              handleUploadSuratPernyataan={handleUploadSuratPernyataan}
              handleRemoveSuratPernyataan={handleRemoveSuratPernyataan}
            />

            {/* Section 5: Ulasan & Rating Peserta */}
            <CourseReviewsCard
              reviewsData={reviewsData}
              loadingReviews={loadingReviews}
              handleRefreshReviews={handleRefreshReviews}
              selectedReviewStar={selectedReviewStar}
              setSelectedReviewStar={setSelectedReviewStar}
            />
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
              className="w-full sm:w-auto px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Hapus Pelatihan
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleUpdateBasicInfo}
                disabled={savingBasicInfo}
                className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingBasicInfo ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button
                onClick={handleAjukanApproval}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Ajukan Approval Publikasi ke BKPSDM
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODAL: Tambah & Edit Modul */}
      <ModuleModal
        isOpen={showAddModuleModal}
        onClose={() => setShowAddModuleModal(false)}
        isEditing={isEditingModule}
        moduleForm={moduleForm}
        setModuleForm={setModuleForm}
        moduleThumbnailPreview={moduleThumbnailPreview}
        setModuleThumbnailPreview={setModuleThumbnailPreview}
        setModuleThumbnailFile={setModuleThumbnailFile}
        handleModuleThumbnailChange={handleModuleThumbnailChange}
        handleSaveModule={handleSaveModule}
      />

      {/* MODAL: Tambah Materi */}
      <MaterialModal
        isOpen={showAddMaterialModal}
        onClose={() => setShowAddMaterialModal(false)}
        isEdit={false}
        form={materialForm}
        setForm={setMaterialForm}
        onSubmit={handleCreateMaterial}
        courseStatus={course.status}
      />

      {/* MODAL: Edit Materi Pembelajaran */}
      <MaterialModal
        isOpen={showEditMaterialModal && !!editingMaterial}
        onClose={() => {
          setShowEditMaterialModal(false);
          setEditingMaterial(null);
        }}
        isEdit={true}
        form={editMaterialForm}
        setForm={setEditMaterialForm}
        onSubmit={handleUpdateMaterial}
        courseStatus={course.status}
        editingMaterial={editingMaterial}
      />

      {/* MODAL: Kelola Kuis Modul */}
      <QuizBuilderModal
        isOpen={showQuizModal && !!targetQuizModule}
        onClose={() => setShowQuizModal(false)}
        targetQuizModule={targetQuizModule}
        targetQuizType={targetQuizType}
        targetQuizMateri={targetQuizMateri}
        quizForm={quizForm}
        setQuizForm={setQuizForm}
        quizActiveTab={quizActiveTab}
        setQuizActiveTab={setQuizActiveTab}
        newQuizItem={newQuizItem}
        setNewQuizItem={setNewQuizItem}
        handleAddQuestionToQuiz={handleAddQuestionToQuiz}
        handleRemoveQuestionFromQuiz={handleRemoveQuestionFromQuiz}
        ttsInputWords={ttsInputWords}
        setTtsInputWords={setTtsInputWords}
        newTtsItem={newTtsItem}
        setNewTtsItem={setNewTtsItem}
        handleAddTtsWord={handleAddTtsWord}
        handleRemoveTtsWord={handleRemoveTtsWord}
        ttsLayout={ttsLayout}
        handleRegenerateTtsLayout={handleRegenerateTtsLayout}
        newDragDropItem={newDragDropItem}
        setNewDragDropItem={setNewDragDropItem}
        handleAddDragDropToQuiz={handleAddDragDropToQuiz}
        handleRemoveDragDropFromQuiz={handleRemoveDragDropFromQuiz}
        newWeightedItem={newWeightedItem}
        setNewWeightedItem={setNewWeightedItem}
        handleAddWeightedToQuiz={handleAddWeightedToQuiz}
        handleRemoveWeightedFromQuiz={handleRemoveWeightedFromQuiz}
        getModulQuiz={getModulQuiz}
        handleDeleteQuiz={handleDeleteQuiz}
        handleSaveQuiz={handleSaveQuiz}
      />
    </div>
  );
};

export default DetailKursus;
