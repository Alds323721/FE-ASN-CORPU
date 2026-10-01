import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import logoImg from '../assets/logo-removebg-preview 1.png';
import AdminKomunitasProfile from '../components/AdminKomunitasProfile';
import { 
  Users, BookOpen, Award, TrendingUp, TrendingDown,
  LayoutDashboard, LogOut, Bell, Settings, Search, Menu, X,
  FileText, RotateCcw, ChevronDown, CheckCircle2,
  PlayCircle, Edit, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Clock,
  BarChart2, Book, HelpCircle, GraduationCap, HeadphonesIcon, Download, Eye,
  ArrowRight, Video, Mail, MessageSquare, Monitor, FileQuestion, PenTool, Bug, Send
} from 'lucide-react';

const AdminSidebar = ({ activeMenu = 'pusat-bantuan', onNavigate, isOpen, setIsOpen }) => {
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
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Cari solusi atau panduan..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        />
      </div>
    </div>
  </header>
);

const PusatBantuan = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingFaq, setLoadingFaq] = useState(true);

  // Form keluhan
  const [subjek, setSubjek] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoadingFaq(true);
        const res = await api.get('/admin-komunitas/faq');
        setFaqs(res.data?.data || []);
      } catch (e) {
        console.error('Error fetching FAQ:', e);
        // Fallback default
        setFaqs([
          { faq_id: 1, pertanyaan: 'Bagaimana cara mengajukan draf kursus untuk approval?', jawaban: 'Lengkapi minimal 1 modul beserta materi dan kuis evaluasi. Kemudian klik tombol "Ajukan Approval Publikasi" pada halaman Detail Kursus.' },
          { faq_id: 2, pertanyaan: 'Berapa format dan ukuran maksimal file materi PDF?', jawaban: 'Format yang didukung adalah PDF dengan ukuran maksimal hingga 10MB per berkas materi.' },
          { faq_id: 3, pertanyaan: 'Apakah Surat Pernyataan Keabsahan bersifat wajib?', jawaban: 'Surat Pernyataan bersifat Opsional namun sangat dianjurkan untuk kelengkapan administrasi OPD sebelum materi dipublikasikan ke katalog umum.' },
          { faq_id: 4, pertanyaan: 'Bagaimana cara mengekspor data laporan progres peserta?', jawaban: 'Masuk ke menu Laporan Progress, lalu klik tombol "Export Laporan (CSV)" pada sudut kanan atas.' }
        ]);
      } finally {
        setLoadingFaq(false);
      }
    };
    fetchFaqs();
  }, []);

  const handleSubmitKeluhan = async (e) => {
    e.preventDefault();
    if (!subjek.trim() || !deskripsi.trim()) {
      alert('Subjek dan deskripsi keluhan wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/admin-komunitas/tiket', {
        subjek,
        deskripsi
      });
      alert('Keluhan / tiket bantuan berhasil dikirimkan ke tim teknis BKPSDM!');
      setSubjek('');
      setDeskripsi('');
    } catch (error) {
      console.error('Error submitting tiket:', error);
      alert(error.response?.data?.message || 'Gagal mengirim keluhan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = faqs.filter(f => 
    f.pertanyaan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.jawaban?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar activeMenu="pusat-bantuan" onNavigate={onNavigate} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-64">
        <Header setIsOpen={setIsSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
           {/* Header title */}
           <div className="mb-8">
             <h1 className="text-2xl font-bold text-gray-900 mb-1">Pusat Bantuan Admin Komunitas</h1>
             <p className="text-sm text-gray-500">Cari solusi, baca panduan operasional, atau sampaikan kendala teknis pengelolaan kursus.</p>
           </div>

           {/* Search Banner */}
           <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-8 flex flex-col items-center justify-center text-center">
             <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Bagaimana kami bisa membantu Anda?</h2>
             <div className="relative w-full max-w-2xl">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik kata kunci pertanyaan atau kendala..." 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                />
             </div>
           </div>

           {/* Content Grid */}
           <div className="flex flex-col lg:flex-row gap-8 mb-8">
              {/* Left Column (Main Content) */}
              <div className="flex-1 flex flex-col gap-8">
                {/* Panduan Cepat */}
                <div>
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-gray-900 text-sm sm:text-base">Panduan Pengelolaan Pembelajaran</h3>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div 
                        onClick={() => onNavigate && onNavigate('pelatihan-saya')}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2.5 hover:border-teal-500 transition-colors cursor-pointer group"
                      >
                         <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
                           <BookOpen className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="font-bold text-gray-900 text-xs mb-1">Buat Kursus Baru</h4>
                           <p className="text-[11px] text-gray-500 line-clamp-2">Langkah membuat draft awal pelatihan.</p>
                         </div>
                      </div>
                      <div 
                        onClick={() => onNavigate && onNavigate('katalog-kursus')}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2.5 hover:border-teal-500 transition-colors cursor-pointer group"
                      >
                         <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
                           <FileQuestion className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="font-bold text-gray-900 text-xs mb-1">Kelola Modul & Kuis</h4>
                           <p className="text-[11px] text-gray-500 line-clamp-2">Menyusun bab bacaan dan evaluasi pemahaman.</p>
                         </div>
                      </div>
                      <div 
                        onClick={() => onNavigate && onNavigate('laporan-progress')}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2.5 hover:border-teal-500 transition-colors cursor-pointer group"
                      >
                         <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
                           <Award className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="font-bold text-gray-900 text-xs mb-1">Pantau Progres Peserta</h4>
                           <p className="text-[11px] text-gray-500 line-clamp-2">Memonitor tingkat kelulusan dan skor.</p>
                         </div>
                      </div>
                      <div 
                        onClick={() => onNavigate && onNavigate('bank-soal')}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2.5 hover:border-teal-500 transition-colors cursor-pointer group"
                      >
                         <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
                           <PenTool className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="font-bold text-gray-900 text-xs mb-1">Bank Soal Post Test</h4>
                           <p className="text-[11px] text-gray-500 line-clamp-2">Manajemen butir soal ujian akhir.</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* FAQ */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-base text-gray-900">Pertanyaan Sering Diajukan (FAQ)</h3>
                  </div>
                  <div className="space-y-3">
                    {loadingFaq ? (
                      <p className="text-xs text-gray-400 py-3">Memuat daftar FAQ...</p>
                    ) : filteredFaqs.length === 0 ? (
                      <p className="text-xs text-gray-400 py-3">Tidak ada FAQ yang cocok dengan kata kunci pencarian.</p>
                    ) : (
                      filteredFaqs.map((item, idx) => {
                        const isOpen = openFaqId === (item.faq_id || idx);
                        return (
                          <div key={item.faq_id || idx} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => setOpenFaqId(isOpen ? null : (item.faq_id || idx))}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors font-semibold text-xs sm:text-sm text-gray-900"
                            >
                              <span>{item.pertanyaan}</span>
                              <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-teal-600' : ''}`} />
                            </button>
                            {isOpen && (
                              <div className="p-4 pt-1 bg-gray-50/50 text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                                {item.jawaban}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Sampaikan Keluhan */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <HeadphonesIcon className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-base text-gray-900">Sampaikan Keluhan / Tiket Bantuan</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-6">
                    Sampaikan kendala teknis atau pertanyaan regulasi langsung ke admin pengelola BKPSDM.
                  </p>

                  <form onSubmit={handleSubmitKeluhan} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Subjek Kendala</label>
                      <input 
                        type="text" 
                        required
                        value={subjek}
                        onChange={(e) => setSubjek(e.target.value)}
                        placeholder="Contoh: Kendala unggah file PDF materi modul 2" 
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Masalah</label>
                      <textarea 
                        required
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        placeholder="Jelaskan detail kendala yang dialami serta pesan error yang muncul jika ada..." 
                        rows={4} 
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                      ></textarea>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 transition-colors w-full sm:w-auto shadow-sm disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? 'Mengirimkan...' : 'Kirim Keluhan'}
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* Right Column (Sidebar) */}
              <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
                 {/* Kontak Dukungan */}
                 <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <HeadphonesIcon className="w-5 h-5 text-teal-600" />
                      <h3 className="font-bold text-sm text-gray-900">Kontak Bantuan BKPSDM</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-5">Tim Teknis BKPSDM Kabupaten Buleleng siap membantu operasional platform.</p>
                    
                    <div className="space-y-4 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-500">Email Helpdesk</p>
                          <p className="font-bold text-gray-900 mt-0.5">bkpsdm@bulelengkab.go.id</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-500">Layanan WhatsApp</p>
                          <p className="font-bold text-gray-900 mt-0.5">+62 812-3456-7890</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-500">Jam Operasional</p>
                          <p className="font-bold text-gray-900 mt-0.5">Senin - Jumat, 08:00 - 16:00 WITA</p>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="pb-24"></div>
        </main>
      </div>
    </div>
  );
};

export default PusatBantuan;
