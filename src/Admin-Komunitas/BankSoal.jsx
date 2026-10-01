import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import logoImg from '../assets/logo-removebg-preview 1.png';
import AdminKomunitasProfile from '../components/AdminKomunitasProfile';
import { 
  LayoutDashboard, LogOut, Bell, Settings, Search, Menu, X,
  FileText, RotateCcw, ChevronDown, CheckCircle, CheckCircle2,
  ChevronLeft, ChevronRight, BarChart2, Book, HelpCircle, 
  GraduationCap, HeadphonesIcon, ArrowLeft, Plus, Trash2, Edit3,
  Check, Filter, AlertCircle
} from 'lucide-react';

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
      }).catch(() => {});
    } catch (e) {}
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
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
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Cari modul atau soal..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        />
      </div>
    </div>
  </header>
);

const BankSoal = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('semua'); // 'semua', 'pilihan_ganda', 'benar_salah'
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState([]);
  const [course, setCourse] = useState(null);
  const [postTest, setPostTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [newType, setNewType] = useState('pilihan_ganda');
  const [newQuestion, setNewQuestion] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('A');
  const [newOptions, setNewOptions] = useState({
    A: '',
    B: '',
    C: '',
    D: ''
  });

  const courseId = localStorage.getItem('adminKomunitasCourseId');

  const fetchData = async () => {
    if (!courseId) {
      if (onNavigate) onNavigate('katalog-kursus');
      return;
    }

    try {
      setLoading(true);
      const [resCourse, resPostTest] = await Promise.allSettled([
        api.get(`/admin-komunitas/pembelajaran/${courseId}`),
        api.get(`/admin-komunitas/pembelajaran/${courseId}/post-test`)
      ]);

      if (resCourse.status === 'fulfilled') {
        setCourse(resCourse.value.data.data);
      }

      if (resPostTest.status === 'fulfilled' && resPostTest.value.data.data) {
        const pt = resPostTest.value.data.data;
        setPostTest(pt);

        const rawList = pt.soal_post_test || [];
        const formatted = rawList.map((item) => {
          let opts = item.pilihan_jawaban_json;
          if (typeof opts === 'string') {
            try { opts = JSON.parse(opts); } catch (e) { opts = {}; }
          }

          let opsiArray = [];
          if (Array.isArray(opts)) {
            opsiArray = opts;
          } else if (typeof opts === 'object' && opts !== null) {
            opsiArray = Object.keys(opts).map(k => ({
              key: k,
              text: opts[k]
            }));
          }

          const isBenarSalah = opsiArray.length === 2 && 
            (opsiArray[0].text?.toLowerCase().includes('benar') || opsiArray[1].text?.toLowerCase().includes('salah'));

          return {
            id: item.soal_post_test_id,
            type: isBenarSalah ? 'benar_salah' : 'pilihan_ganda',
            pertanyaan: item.teks_soal,
            jawabanBenar: item.kunci_jawaban,
            bobotNilai: item.bobot_nilai || 1,
            opsi: opsiArray
          };
        });

        setQuestions(formatted);
      } else {
        setPostTest(null);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching bank soal data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesFilter = 
      activeFilter === 'semua' || 
      (activeFilter === 'pilihan_ganda' && q.type === 'pilihan_ganda') ||
      (activeFilter === 'benar_salah' && q.type === 'benar_salah');
    
    const matchesSearch = 
      q.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.opsi.some(o => o.text && o.text.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const displayedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Pertanyaan Diperlukan',
        text: 'Silakan isi pertanyaan terlebih dahulu.',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    if (newType === 'pilihan_ganda' && (!newOptions.A?.trim() || !newOptions.B?.trim())) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilihan Belum Lengkap',
        text: 'Pilihan Ganda memerlukan minimal Opsi A dan Opsi B.',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    let pilihanPayload = {};
    if (newType === 'pilihan_ganda') {
      pilihanPayload = {
        A: newOptions.A || 'Pilihan A',
        B: newOptions.B || 'Pilihan B',
        C: newOptions.C || 'Pilihan C',
        D: newOptions.D || 'Pilihan D'
      };
    } else {
      pilihanPayload = {
        A: 'Benar',
        B: 'Salah'
      };
    }

    const newQuestionPayload = {
      teks_soal: newQuestion,
      kunci_jawaban: newCorrectAnswer,
      pilihan_jawaban_json: pilihanPayload,
      bobot_nilai: 1
    };

    try {
      if (postTest && postTest.post_test_id) {
        // Extract existing questions
        const existingSoal = (postTest.soal_post_test || []).map(s => {
          let opts = s.pilihan_jawaban_json;
          if (typeof opts === 'string') {
            try { opts = JSON.parse(opts); } catch (e) { opts = {}; }
          }
          return {
            teks_soal: s.teks_soal,
            kunci_jawaban: s.kunci_jawaban,
            pilihan_jawaban_json: opts,
            bobot_nilai: s.bobot_nilai || 1
          };
        });

        await api.put(`/admin-komunitas/post-test/${postTest.post_test_id}`, {
          soal: [...existingSoal, newQuestionPayload]
        });
      } else {
        // Create post test first
        await api.post(`/admin-komunitas/pembelajaran/${courseId}/post-test`, {
          nilai_kelulusan: course?.nilai_kelulusan || 70,
          maks_percobaan: 3,
          durasi_menit: 45,
          soal: [newQuestionPayload]
        });
      }

      await Swal.fire({
        icon: 'success',
        title: 'Soal Berhasil Ditambahkan!',
        text: 'Butir soal baru berhasil disimpan ke Bank Soal Post Test.',
        confirmButtonColor: '#0F766E',
        timer: 2000,
        showConfirmButton: true
      });
      setIsAddModalOpen(false);
      setNewQuestion('');
      setNewOptions({ A: '', B: '', C: '', D: '' });
      setNewCorrectAnswer('A');
      fetchData();
    } catch (error) {
      console.error('Error saving new question:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Soal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan butir soal.',
        confirmButtonColor: '#0F766E'
      });
    }
  };

  const handleDeleteQuestion = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Butir Soal?',
      text: 'Apakah Anda yakin ingin menghapus butir soal ini dari Bank Soal?',
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
      if (!postTest) return;

      const remainingSoal = (postTest.soal_post_test || [])
        .filter(s => s.soal_post_test_id !== id)
        .map(s => {
          let opts = s.pilihan_jawaban_json;
          if (typeof opts === 'string') {
            try { opts = JSON.parse(opts); } catch (e) { opts = {}; }
          }
          return {
            teks_soal: s.teks_soal,
            kunci_jawaban: s.kunci_jawaban,
            pilihan_jawaban_json: opts,
            bobot_nilai: s.bobot_nilai || 1
          };
        });

      await api.put(`/admin-komunitas/post-test/${postTest.post_test_id}`, {
        soal: remainingSoal
      });

      Swal.fire({
        icon: 'success',
        title: 'Soal Berhasil Dihapus',
        text: 'Butir pertanyaan telah dihapus dari Bank Soal.',
        timer: 1500,
        showConfirmButton: false
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting question:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus Soal',
        text: error.response?.data?.message || 'Gagal menghapus butir soal.',
        confirmButtonColor: '#0F766E'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      <AdminSidebar 
        activeMenu="katalog-kursus" 
        onNavigate={onNavigate}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Breadcrumb Back Link */}
            <div>
              <button 
                onClick={() => onNavigate && onNavigate('detail-kursus')}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0F766E] font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Kelola Kursus
              </button>
            </div>

            {/* Page Title & Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-gray-900 tracking-tight">
                  Bank Soal: {course?.judul_pembelajaran || 'Memuat...'}
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Kelola daftar bank butir pertanyaan yang akan diujikan pada Post Test peserta.
                </p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold rounded-lg shadow-sm text-sm transition-all w-full sm:w-auto shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Soal</span>
              </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => { setActiveFilter('semua'); setCurrentPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    activeFilter === 'semua'
                      ? 'bg-[#0F766E] text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  Semua Soal ({questions.length})
                </button>
                <button
                  onClick={() => { setActiveFilter('pilihan_ganda'); setCurrentPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    activeFilter === 'pilihan_ganda'
                      ? 'bg-[#0F766E] text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  Pilihan Ganda
                </button>
                <button
                  onClick={() => { setActiveFilter('benar_salah'); setCurrentPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    activeFilter === 'benar_salah'
                      ? 'bg-[#0F766E] text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  Benar / Salah
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Cari butir soal..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Questions Card Container */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-8 space-y-8">
                {loading ? (
                  <div className="py-12 text-center text-gray-500 text-sm">
                    Memuat data Bank Soal...
                  </div>
                ) : displayedQuestions.length === 0 ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-700 font-semibold text-sm">Belum ada butir soal yang ditemukan.</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">Tambahkan pertanyaan untuk melengkapi bank soal evaluasi akhir.</p>
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800"
                    >
                      Tambah Soal Sekarang
                    </button>
                  </div>
                ) : (
                  displayedQuestions.map((question, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <div key={question.id || index} className="group">
                        {/* Question Title & Actions */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-base font-bold text-gray-900 leading-snug">
                            {globalIndex}. {question.pertanyaan}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <button 
                              onClick={() => handleDeleteQuestion(question.id)}
                              title="Hapus Soal"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Options Stack */}
                        <div className="border-l-2 border-gray-200 pl-3 sm:pl-5 space-y-2 my-3">
                          {question.opsi.map((opt) => {
                            const isCorrect = opt.key === question.jawabanBenar;

                            if (isCorrect) {
                              return (
                                <div 
                                  key={opt.key}
                                  className="bg-[#EAF7EE] border border-[#B9E8CA] rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-xs"
                                >
                                  <div className="flex items-start gap-2.5 text-sm min-w-0 flex-1">
                                    <span className="font-bold text-[#15803D] shrink-0">
                                      {opt.key}.
                                    </span>
                                    <span className="font-medium text-gray-900 leading-relaxed break-words">
                                      {opt.text}
                                    </span>
                                  </div>
                                  <div className="shrink-0 flex items-center ml-2">
                                    <CheckCircle className="w-5 h-5 text-[#16A34A] fill-[#EAF7EE]" />
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div 
                                key={opt.key}
                                className="px-3.5 py-2 flex items-start gap-2.5 text-sm text-gray-800"
                              >
                                <span className="font-bold text-gray-700 shrink-0">
                                  {opt.key}.
                                </span>
                                <span className="font-normal text-gray-700 leading-relaxed break-words">
                                  {opt.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {index < displayedQuestions.length - 1 && (
                          <div className="h-px bg-gray-100 mt-6 mb-2"></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Pagination Footer */}
              <div className="border-t border-gray-100 px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                <span className="text-xs sm:text-sm text-gray-500">
                  Menampilkan {displayedQuestions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                  {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} dari {filteredQuestions.length} butir soal
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-1.5 rounded-lg border border-gray-200 transition-colors ${
                      currentPage === 1 
                        ? 'text-gray-300 border-gray-100 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold px-2 text-gray-600">
                    Hal {currentPage} dari {totalPages}
                  </span>
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-1.5 rounded-lg border border-gray-200 transition-colors ${
                      currentPage === totalPages 
                        ? 'text-gray-300 border-gray-100 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Tambah Soal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tambah Soal Post Test</h3>
                <p className="text-xs text-gray-500">Tambahkan butir pertanyaan ke bank soal evaluasi akhir</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
              {/* Question Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Tipe Soal
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setNewType('pilihan_ganda'); setNewCorrectAnswer('A'); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      newType === 'pilihan_ganda'
                        ? 'bg-teal-50 border-[#0F766E] text-[#0F766E]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Pilihan Ganda
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewType('benar_salah'); setNewCorrectAnswer('A'); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      newType === 'benar_salah'
                        ? 'bg-teal-50 border-[#0F766E] text-[#0F766E]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Benar / Salah
                  </button>
                </div>
              </div>

              {/* Question Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Pertanyaan
                </label>
                <textarea
                  rows="3"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Tuliskan butir soal pertanyaan di sini..."
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Options Input */}
              {newType === 'pilihan_ganda' ? (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Pilihan Jawaban (Pilih radio untuk jawaban benar)
                  </label>
                  {['A', 'B', 'C', 'D'].map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <input 
                        type="radio"
                        id={`ans-${key}`}
                        name="correctAnswer"
                        checked={newCorrectAnswer === key}
                        onChange={() => setNewCorrectAnswer(key)}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500 accent-[#0F766E] cursor-pointer"
                      />
                      <label htmlFor={`ans-${key}`} className="font-bold text-sm text-gray-700 w-4">
                        {key}.
                      </label>
                      <input 
                        type="text"
                        value={newOptions[key]}
                        onChange={(e) => setNewOptions({ ...newOptions, [key]: e.target.value })}
                        placeholder={`Teks jawaban pilihan ${key}`}
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Kunci Jawaban Benar
                  </label>
                  <div className="flex gap-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <input 
                        type="radio"
                        name="correctAnswer"
                        checked={newCorrectAnswer === 'A'}
                        onChange={() => setNewCorrectAnswer('A')}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500 accent-[#0F766E]"
                      />
                      <span>A. Benar</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <input 
                        type="radio"
                        name="correctAnswer"
                        checked={newCorrectAnswer === 'B'}
                        onChange={() => setNewCorrectAnswer('B')}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500 accent-[#0F766E]"
                      />
                      <span>B. Salah</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg text-xs hover:bg-gray-50 transition-colors text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold rounded-lg text-xs transition-colors shadow-sm text-center"
                >
                  Simpan Soal ke Bank Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSoal;
