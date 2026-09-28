import { useState, useEffect } from 'react';
import api from '../api/axios';
import logoImg from '../assets/logo-removebg-preview 1.png';
import hiasanImg from '../assets/Hiasan.png';
import ProfileDropdown from '../components/ProfileDropdown';
import LanguageDropdown from '../components/LanguageDropdown';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronDown,
  Menu,
  X,
  Award,
  Download,
  Share2,
  ChevronLeft,
  Star,
  Info
} from 'lucide-react';

const TestResultNavbar = ({ onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logoImg} alt="Logo BKPSDM" className="w-6 sm:w-8 object-contain" />
        <span className="font-semibold text-base sm:text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-[#1D315F] font-semibold text-sm">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.dashboard')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('community'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.community')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.catalog')}</a>
        <a href="#" className="text-[#006A63] border-b-2 border-[#006A63] pb-1">{t('nav.myCourses')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.helpCenter')}</a>

        <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-6">
          <LanguageDropdown />
          <ProfileDropdown onLogout={() => onNavigate('landing')} />
        </div>
      </div>

      <div className="md:hidden flex items-center gap-3">
        <LanguageDropdown />
        <ProfileDropdown onLogout={() => onNavigate('landing')} />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#1D315F] hover:text-[#006A63] focus:outline-none">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-md md:hidden flex flex-col py-4 px-6 gap-4 text-[#1D315F] font-semibold text-sm z-50">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="hover:text-[#006A63] transition-colors">{t('nav.dashboard')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('community'); }} className="hover:text-[#006A63] transition-colors">{t('nav.community')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="hover:text-[#006A63] transition-colors">{t('nav.catalog')}</a>
          <a href="#" className="text-[#006A63]">{t('nav.myCourses')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors">{t('nav.helpCenter')}</a>
        </div>
      )}
    </nav>
  );
};

const CertificatePreview = ({ sertifikat }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const courseId = localStorage.getItem('userCourseId');
    if (!courseId) {
      alert('ID Pelatihan tidak ditemukan.');
      return;
    }

    try {
      setDownloading(true);
      const response = await api.get(`/user/courses/${courseId}/certificate/download`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = (sertifikat?.judul_pembelajaran || 'Pelatihan').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `Sertifikat_${cleanTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Gagal mengunduh sertifikat. Pastikan Anda telah menyelesaikan tes dan berhak mendapatkan sertifikat.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const title = sertifikat?.judul_pembelajaran || 'Pelatihan';
    navigator.clipboard.writeText(`Saya telah menyelesaikan pelatihan "${title}" di Buleleng ASN Corpu!`);
    alert('Pesan achievement telah disalin ke clipboard!');
  };

  return (
  <div className="bg-white border border-[#BBC9C7] rounded-lg p-8 md:p-12 flex flex-col items-center text-center shadow-sm">
    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#3FCDC1]/10 rounded-full flex items-center justify-center mb-6">
      <Award className="w-8 h-8 md:w-10 md:h-10 text-[#006A63]" />
    </div>
    
    <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">SERTIFIKAT KELULUSAN</p>
    
    <h2 className="text-2xl md:text-3xl font-semibold text-[#1D315F] mb-6 md:mb-8">
      {sertifikat?.judul_pembelajaran || 'Pelatihan'}
    </h2>
    
    <div className="mb-6 md:mb-8">
      <p className="text-sm md:text-base text-gray-600 font-semibold mb-2">Diberikan Kepada:</p>
      <h3 className="text-xl md:text-2xl font-semibold text-[#1D315F] mb-1">{sertifikat?.nama_peserta || 'Peserta'}</h3>
      <p className="text-sm text-gray-500 font-semibold">NIP: {sertifikat?.nip || '-'}</p>
    </div>
    
    <div className="grid grid-cols-2 gap-8 md:gap-16 mb-8 md:mb-10 w-full max-w-md">
      <div className="text-center">
        <p className="text-xs text-gray-500 font-semibold mb-1">JPL</p>
        <p className="text-2xl md:text-3xl font-semibold text-[#1D315F]">{sertifikat?.jpl || 0} Jam</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500 font-semibold mb-1">Tanggal</p>
        <p className="text-base md:text-lg font-semibold text-[#1D315F]">{sertifikat?.tanggal || 'Hari Ini'}</p>
      </div>
    </div>
    
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
      <button 
        onClick={handleDownload} 
        disabled={downloading}
        className="flex-1 px-6 py-3 bg-[#006A63] text-white font-semibold rounded-md hover:bg-[#00534D] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Download className="w-5 h-5" />
        {downloading ? 'Mengunduh...' : 'Unduh Sertifikat (PDF)'}
      </button>
      <button onClick={handleShare} className="flex-1 px-6 py-3 border-2 border-[#006A63] text-[#006A63] font-semibold rounded-md hover:bg-[#EFF5F3] transition-colors flex items-center justify-center gap-2">
        <Share2 className="w-5 h-5" />
        Bagikan Achievement
      </button>
    </div>
  </div>
  );
};

const ScoreSummary = ({ resultData }) => (
  <div className="bg-white border border-[#BBC9C7] rounded-lg p-6">
    <h3 className="font-semibold text-[#1D315F] text-lg mb-6">Ringkasan Nilai</h3>
    
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <span className="text-gray-600 font-semibold text-sm">Nilai Akhir Post Test</span>
        <div className="text-right">
          <span className="text-3xl font-semibold text-[#006A63]">{Math.round(resultData.nilai)}</span>
          <span className="text-gray-500 font-semibold">/100</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <span className="text-gray-600 font-semibold text-sm">Status Kelulusan</span>
        <span className={`px-4 py-1.5 font-semibold text-sm rounded-full ${
          resultData.apakah_lulus ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-red-100 text-red-600'
        }`}>
          {resultData.apakah_lulus ? 'Lulus' : 'Tidak Lulus'}
        </span>
      </div>
      
      <div className="bg-[#F4F8FB] border border-[#3FCDC1]/30 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#006A63] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 font-semibold">
          Percobaan ke-{resultData.percobaan_ke} dari maksimal {resultData.maks_percobaan} kali percobaan.
        </p>
      </div>
    </div>
  </div>
);

const FeedbackSection = () => {
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const courseId = localStorage.getItem('userCourseId');

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      alert('Mohon isi pesan ulasan Anda terlebih dahulu.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/user/courses/${courseId}/ulasan`, {
        rating: rating,
        ulasan: feedback
      });
      alert('Ulasan berhasil dikirim! Terima kasih atas tanggapan Anda.');
      setFeedback('');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengirim ulasan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-6 mt-6">
      <h3 className="font-semibold text-[#1D315F] text-lg mb-4">Berikan Ulasan Anda</h3>
      
      <p className="text-sm text-gray-600 font-semibold mb-4">
        Bantu kami meningkatkan kualitas pelatihan dengan memberikan ulasan.
      </p>
      
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 font-semibold mb-4">Kesan & Pesan / Keluhan Layanan</p>
      
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Tuliskan pengalaman Anda mengikuti pelatihan ini..."
        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#006A63] focus:border-transparent resize-none font-semibold"
      />
      
      <button 
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 w-full px-6 py-2.5 bg-gray-100 text-[#1D315F] font-semibold rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </div>
  );
};

export default function TestResult({ onNavigate }) {
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('postTestResult');
    if (data) {
      setResultData(JSON.parse(data));
    }
  }, []);

  if (!resultData) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-[#1D315F]">Memuat Hasil...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9FBFC]">
      <TestResultNavbar onNavigate={onNavigate} />
      
      <main className="flex-grow py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          {/* Success / Fail Banner */}
          <div className="text-center mb-8 md:mb-12">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              resultData.apakah_lulus ? 'bg-[#10B981]/10' : 'bg-red-100'
            }`}>
              <Award className={`w-8 h-8 md:w-10 md:h-10 ${resultData.apakah_lulus ? 'text-[#10B981]' : 'text-red-500'}`} />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1D315F] mb-3">
              {resultData.apakah_lulus ? 'Selamat, Anda Lulus!' : 'Mohon Maaf, Anda Belum Lulus'}
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-semibold">
              {resultData.apakah_lulus 
                ? 'Anda telah berhasil menyelesaikan program pelatihan dan berhak mendapatkan sertifikat resmi.'
                : `Nilai Anda masih di bawah standar kelulusan. Sisa percobaan Anda: ${resultData.sisa_percobaan} kali.`
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              {resultData.apakah_lulus ? (
                 <CertificatePreview sertifikat={resultData.sertifikat} />
              ) : (
                 <div className="bg-white border border-[#BBC9C7] rounded-lg p-8 md:p-12 flex flex-col items-center text-center shadow-sm">
                    <h2 className="text-2xl font-bold text-[#1D315F] mb-4">Belum Bisa Mengunduh Sertifikat</h2>
                    <p className="text-gray-500 mb-6 font-semibold">Anda harus lulus Post Test terlebih dahulu untuk dapat mengunduh sertifikat pelatihan ini.</p>
                    {resultData.sisa_percobaan > 0 && (
                      <button 
                        onClick={() => onNavigate('post-test')}
                        className="px-6 py-3 bg-[#006A63] text-white font-semibold rounded-md hover:bg-[#00534D] transition-colors"
                      >
                        Coba Lagi Post Test
                      </button>
                    )}
                 </div>
              )}
            </div>
            
            <div className="lg:col-span-4">
              <ScoreSummary resultData={resultData} />
              {resultData.apakah_lulus && <FeedbackSection />}
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => onNavigate('my-courses')}
              className="flex items-center gap-2 text-[#006A63] hover:text-[#00534D] font-semibold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Kembali ke Pelatihanku
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
