import { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import logoImg from '../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../assets/ASN-CORPU.png';
import ProfileDropdown from '../components/ProfileDropdown';
import CourseFeedbackKuesioner from './TestResult/CourseFeedbackKuesioner';
import LanguageDropdown from '../components/LanguageDropdown';
import { useLanguage } from '../context/LanguageContext';
import {
  Menu,
  X,
  Award,
  Download,
  Share2,
  ChevronLeft,
  Star,
  Info,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';

function getRemainingCooldownParts(tersediaPadaIso, tersediaPadaStr, fallbackSeconds = 0) {
  let targetMs = null;
  if (tersediaPadaIso) {
    const parsed = Date.parse(tersediaPadaIso);
    if (!Number.isNaN(parsed)) targetMs = parsed;
  }
  if (!targetMs && tersediaPadaStr) {
    const parsed = Date.parse(tersediaPadaStr.replace(' ', 'T'));
    if (!Number.isNaN(parsed)) targetMs = parsed;
  }

  const rawRemaining = targetMs
    ? Math.max(0, Math.floor((targetMs - Date.now()) / 1000))
    : Math.max(0, Number(fallbackSeconds || 0));

  let diffSec = rawRemaining;
  const days = Math.floor(diffSec / 86400);
  diffSec -= days * 86400;
  const hours = Math.floor(diffSec / 3600);
  diffSec -= hours * 3600;
  const minutes = days === 0 && hours === 0 ? Math.max(1, Math.ceil(diffSec / 60)) : Math.floor(diffSec / 60);

  return {
    totalSeconds: rawRemaining,
    label: `Tersisa ${days} Hari ${hours} Jam ${minutes} Menit`
  };
}

const TestResultNavbar = ({ onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logoImg} alt="Logo BKPSDM" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <span className="font-semibold text-base sm:text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-[#1D315F] font-semibold text-sm">
        <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">{t('nav.dashboard')}</button>
        <button type="button" onClick={() => onNavigate('community')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">{t('nav.community')}</button>
        <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">{t('nav.catalog')}</button>
        <button type="button" onClick={() => onNavigate('my-courses')} className="text-[#006A63] border-b-2 border-[#006A63] pb-1 cursor-pointer">{t('nav.myCourses')}</button>
        <button type="button" onClick={() => onNavigate('certificates')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">{t('nav.certificates')}</button>
        <button type="button" onClick={() => onNavigate('help-center')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">{t('nav.helpCenter')}</button>

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
          <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-[#006A63] transition-colors cursor-pointer">{t('nav.dashboard')}</button>
          <button type="button" onClick={() => onNavigate('community')} className="hover:text-[#006A63] transition-colors cursor-pointer">{t('nav.community')}</button>
          <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-[#006A63] transition-colors cursor-pointer">{t('nav.catalog')}</button>
          <button type="button" onClick={() => onNavigate('my-courses')} className="text-[#006A63] cursor-pointer">{t('nav.myCourses')}</button>
          <button type="button" onClick={() => onNavigate('certificates')} className="hover:text-[#006A63] transition-colors cursor-pointer">{t('nav.certificates')}</button>
          <button type="button" onClick={() => onNavigate('help-center')} className="hover:text-[#006A63] transition-colors cursor-pointer">{t('nav.helpCenter')}</button>
        </div>
      )}
    </nav>
  );
};

const CertificatePreview = ({ sertifikat, sudahMengisiKuesioner }) => {
  const [downloading, setDownloading] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!sertifikat?.cooldown) return;
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [sertifikat?.cooldown]);

  const cooldownInfo = sertifikat?.cooldown
    ? getRemainingCooldownParts(sertifikat.tersedia_pada_iso, sertifikat.tersedia_pada, sertifikat.sisa_detik)
    : { totalSeconds: 0, label: '' };

  const isSigned = Boolean(sertifikat?.is_signed || sertifikat?.status_tte === 'signed');
  const isCooldownActive = Boolean(!isSigned && sertifikat?.cooldown && cooldownInfo.totalSeconds > 0);

  const handleDownload = async () => {
    if (!sudahMengisiKuesioner) {
      Swal.fire({
        icon: 'warning',
        title: 'Kuesioner Belum Diisi',
        text: 'Mohon lengkapi kuesioner evaluasi kursus terlebih dahulu agar sertifikat resmi dapat diunduh.',
        confirmButtonColor: '#006A63'
      });
      return;
    }

    if (isCooldownActive) {
      Swal.fire({
        icon: 'info',
        title: 'Masa Tunggu Sertifikat KPK',
        text: sertifikat?.cooldown_message || sertifikat?.message || 'Sertifikat khusus kursus KPK baru dapat diunduh setelah proses TTE B-Sign BSrE selesai.',
        confirmButtonColor: '#006A63'
      });
      return;
    }

    const courseId = localStorage.getItem('userCourseId');
    if (!courseId) {
      Swal.fire({
        icon: 'warning',
        title: 'ID Pelatihan Tidak Ditemukan',
        text: 'Data sesi pelatihan tidak ditemukan. Silakan buka kembali dari daftar Pelatihan Saya.',
        confirmButtonColor: '#006A63'
      });
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

      let downloadFilename = `Sertifikat_${(sertifikat?.judul_pembelajaran || 'Pelatihan').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      const disposition = response.headers?.['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          downloadFilename = match[1].replace(/['"]/g, '').trim();
        }
      }
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      let serverMessage = 'Pastikan Anda telah lulus Post Test dan berhak mendapatkan sertifikat resmi pelatihan ini.';
      try {
        if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) serverMessage = parsed.message;
        } else if (error.response?.data?.message) {
          serverMessage = error.response.data.message;
        }
      } catch {
        // Fallback to default message
      }

      Swal.fire({
        icon: error.response?.status === 403 ? 'info' : 'error',
        title: error.response?.status === 403 ? 'Masa Tunggu Sertifikat KPK' : 'Gagal Mengunduh Sertifikat',
        text: serverMessage,
        confirmButtonColor: '#006A63'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const title = sertifikat?.judul_pembelajaran || 'Pelatihan';
    navigator.clipboard.writeText(`Saya telah menyelesaikan pelatihan "${title}" di Buleleng ASN Corpu!`);
    Swal.fire({
      icon: 'success',
      title: 'Tersalin ke Clipboard',
      text: 'Pesan pencapaian berhasil disalin ke papan klip.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-8 md:p-12 flex flex-col items-center text-center shadow-sm">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-[#3FCDC1]/10 rounded-full flex items-center justify-center mb-6">
        <Award className="w-8 h-8 md:w-10 md:h-10 text-[#006A63]" aria-hidden="true" />
      </div>

      <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">HALAMAN KELULUSAN</p>

      <h2 className="text-2xl md:text-3xl font-semibold text-[#1D315F] mb-4 md:mb-6">
        {sertifikat?.judul_pembelajaran || 'Pelatihan'}
      </h2>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {sertifikat?.is_kpk && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-bold shadow-sm">
            <img src="/images/kpk_logo.png" alt="Logo KPK" className="w-5 h-5 object-contain" />
            <span>Program Kolaborasi Resmi KPK RI</span>
          </div>
        )}
        {isSigned && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Telah Ditandatangani Secara Elektronik (TTE BSrE BSSN)</span>
          </div>
        )}
      </div>

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

      {!sudahMengisiKuesioner && (
        <div className="mb-6 w-full max-w-md p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-left flex items-start gap-2.5 text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs font-semibold leading-relaxed">
            <b>Syarat Sertifikat:</b> Mohon isi kuesioner evaluasi pada bagian di bawah terlebih dahulu untuk mengaktifkan tombol unduh sertifikat resmi.
          </p>
        </div>
      )}

      {isCooldownActive && (
        <div className="mb-6 w-full max-w-md p-4 bg-amber-50 border border-amber-200 rounded-lg text-left text-amber-900 space-y-1.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-800">
            <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Sedang Proses Penandatanganan Elektronik (TTE B-Sign BSrE)</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Sertifikat untuk kursus KPK memerlukan tanda tangan digital resmi dari pimpinan melalui aplikasi B-Sign BSrE.
            {sertifikat?.tersedia_pada_formatted ? (
              <> Estimasi dapat diunduh: <b>{cooldownInfo.label}</b> (Mulai <b>{sertifikat.tersedia_pada_formatted} WITA</b>).</>
            ) : null}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={handleDownload}
          disabled={downloading || !sudahMengisiKuesioner || isCooldownActive}
          className={`flex-1 px-6 py-3 font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${
            !sudahMengisiKuesioner || isCooldownActive
              ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
              : isSigned
              ? 'bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer shadow-sm'
              : 'bg-[#006A63] text-white hover:bg-[#00534D] cursor-pointer'
          }`}
        >
          {isCooldownActive ? (
            <>
              <Clock className="w-5 h-5" aria-hidden="true" />
              <span>Menunggu TTE Resmi</span>
            </>
          ) : isSigned ? (
            <>
              <Download className="w-5 h-5" aria-hidden="true" />
              <span>{downloading ? 'Mengunduh...' : 'Unduh Sertifikat Ber-TTE (PDF)'}</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" aria-hidden="true" />
              <span>{downloading ? 'Mengunduh...' : 'Unduh Sertifikat (PDF)'}</span>
            </>
          )}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 px-6 py-3 border-2 border-[#006A63] text-[#006A63] font-semibold rounded-md hover:bg-[#EFF5F3] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-5 h-5" aria-hidden="true" />
          <span>Bagikan Achievement</span>
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
        <Info className="w-5 h-5 text-[#006A63] flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-gray-600 font-semibold">
          {Number(resultData.maks_percobaan) === 0
            ? `Percobaan ke-${resultData.percobaan_ke} (Tanpa Batas Percobaan)`
            : `Percobaan ke-${resultData.percobaan_ke} dari maksimal ${resultData.maks_percobaan} kali percobaan.`}
        </p>
      </div>
    </div>
  </div>
);

export default function TestResult({ onNavigate }) {
  const [resultData, setResultData] = useState(null);
  const [sudahMengisiKuesioner, setSudahMengisiKuesioner] = useState(false);
  const courseId = localStorage.getItem('userCourseId');

  useEffect(() => {
    const data = localStorage.getItem('postTestResult');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setResultData(parsed);
        if (parsed?.sudah_mengisi_kuesioner) {
          setSudahMengisiKuesioner(true);
        }
      } catch {
        // Ignore invalid localStorage payload
      }
    }
  }, []);

  // Refresh latest course & KPK cooldown metadata from server
  useEffect(() => {
    if (!courseId) return;
    let isMounted = true;
    api
      .get(`/user/courses/${courseId}`)
      .then((res) => {
        if (!isMounted) return;
        const freshResult = res.data?.data?.post_test?.result_data;
        if (freshResult) {
          setResultData((prev) => {
            const merged = { ...(prev || {}), ...freshResult };
            localStorage.setItem('postTestResult', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !resultData?.apakah_lulus) return;
    let isMounted = true;
    api
      .get(`/user/courses/${courseId}/kuesioner`)
      .then((res) => {
        if (!isMounted) return;
        const done = Boolean(res.data?.sudah_mengisi);
        setSudahMengisiKuesioner(done);
        if (!done) {
          localStorage.setItem('userOpenCourseFeedback', '1');
          Swal.fire({
            icon: 'warning',
            title: 'Wajib Mengisi Feedback Kursus',
            text: 'Silakan lengkapi Kuesioner Feedback Kursus terlebih dahulu sebelum mengakses Halaman Kelulusan & Sertifikat.',
            confirmButtonColor: '#006A63'
          }).then(() => {
            onNavigate('course-detail');
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [courseId, resultData?.apakah_lulus]);

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
              <Award className={`w-8 h-8 md:w-10 md:h-10 ${resultData.apakah_lulus ? 'text-[#10B981]' : 'text-red-500'}`} aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1D315F] mb-3">
              {resultData.apakah_lulus ? 'Selamat, Anda Lulus!' : 'Mohon Maaf, Anda Belum Lulus'}
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-semibold">
              {resultData.apakah_lulus
                ? 'Anda telah berhasil menyelesaikan program pelatihan dan berhak mendapatkan sertifikat resmi.'
                : (Number(resultData.maks_percobaan) === 0
                    ? 'Nilai Anda masih di bawah standar kelulusan. Anda dapat mencoba kembali kapan saja tanpa batasan.'
                    : `Nilai Anda masih di bawah standar kelulusan. Sisa percobaan Anda: ${resultData.sisa_percobaan} kali.`)
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              {resultData.apakah_lulus ? (
                <CertificatePreview sertifikat={resultData.sertifikat} sudahMengisiKuesioner={sudahMengisiKuesioner} />
              ) : (
                <div className="bg-white border border-[#BBC9C7] rounded-lg p-8 md:p-12 flex flex-col items-center text-center shadow-sm">
                  <h2 className="text-2xl font-bold text-[#1D315F] mb-4">Belum Bisa Mengunduh Sertifikat</h2>
                  <p className="text-gray-500 mb-6 font-semibold">Anda harus lulus Post Test terlebih dahulu untuk dapat mengunduh sertifikat pelatihan ini.</p>
                  {(!resultData.apakah_lulus && (Number(resultData.maks_percobaan) === 0 || resultData.sisa_percobaan > 0)) && (
                    <button
                      onClick={() => onNavigate('post-test')}
                      className="px-6 py-3 bg-[#006A63] text-white font-semibold rounded-md hover:bg-[#00534D] transition-colors cursor-pointer"
                    >
                      Coba Lagi Post Test
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-4">
              <ScoreSummary resultData={resultData} />
            </div>
          </div>

          {resultData.apakah_lulus && (
            <section className="mt-6">
              <CourseFeedbackKuesioner
                variant="section"
                courseId={courseId}
                courseTitle={resultData?.sertifikat?.judul_pembelajaran}
                sudahMengisi={sudahMengisiKuesioner}
                setSudahMengisi={setSudahMengisiKuesioner}
              />
            </section>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onNavigate('my-courses')}
              className="flex items-center gap-2 text-[#006A63] hover:text-[#00534D] font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              <span>Kembali ke Pelatihanku</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
