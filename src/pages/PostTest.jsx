import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import logoImg from '../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../assets/ASN-CORPU.png';
import hiasanImg from '../assets/Hiasan.png';
import ProfileDropdown from '../components/ProfileDropdown';
import LanguageDropdown from '../components/LanguageDropdown';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronDown,
  Menu,
  X,
  ChevronLeft,
  Flag,
  Mail,
  Phone,
  MapPin,
  Check
} from 'lucide-react';

/* ── Navbar ─────────────────────────────────────────── */
const PostTestNavbar = ({ onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logoImg} alt="Logo BKPSDM" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <span className="font-semibold text-base sm:text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-[#1D315F] font-semibold text-sm">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.dashboard')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('community'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.community')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.catalog')}</a>
        <a href="#" className="text-[#006A63] border-b-2 border-[#006A63] pb-1">{t('nav.myCourses')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('certificates'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.certificates')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors pb-1">{t('nav.helpCenter')}</a>

        {/* Right icons */}
        <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-6">
          <LanguageDropdown />
          <ProfileDropdown onLogout={() => onNavigate('landing')} />
        </div>
      </div>

      {/* Mobile toggle */}
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
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('certificates'); }} className="hover:text-[#006A63] transition-colors">{t('nav.certificates')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help-center'); }} className="hover:text-[#006A63] transition-colors">{t('nav.helpCenter')}</a>
        </div>
      )}
    </nav>
  );
};

const PostTestHeader = ({ onBack, testData, currentQuestion }) => (
  <div className="bg-[#1D315F] py-6 md:py-8 px-6 md:px-12 relative overflow-hidden" style={{ backgroundImage: `url(${hiasanImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
    <div className="absolute inset-0 bg-[#1D315F] opacity-55"></div>
    <div className="max-w-7xl mx-auto relative z-10">
      <h1 className="text-white text-2xl md:text-3xl font-semibold mb-4">Post Test Akhir</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white text-xs sm:text-sm">
          <button
            onClick={onBack}
            className="flex items-center gap-1 hover:text-[#3FCDC1] transition-colors font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Pelatihan</span>
          </button>
          <span className="hidden sm:inline">•</span>
          <span className="text-xs sm:text-sm font-semibold">{testData?.judul_pembelajaran || 'Pelatihan'}</span>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <span className="text-white">Post Test</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <div className="w-16 sm:w-20 h-1.5 bg-[#3FCDC1] rounded-full"></div>
            <span className="text-white text-xs">{currentQuestion}/{testData?.soal?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TimerCard = ({ answeredCount, totalQuestions, durationMinutes, onTimeUp, storageKey }) => {
  const [time, setTime] = useState(() => {
    if (!storageKey || !durationMinutes) return (durationMinutes || 60) * 60;
    try {
      const savedEndTime = localStorage.getItem(storageKey);
      if (savedEndTime) {
        const parsed = parseInt(savedEndTime, 10);
        const remaining = Math.max(0, Math.floor((parsed - Date.now()) / 1000));
        if (remaining > 0 && (parsed - Date.now()) <= (durationMinutes * 60 + 300) * 1000) {
          return remaining;
        }
      }
    } catch (e) {}
    return (durationMinutes || 60) * 60;
  });

  const timerRef = useRef(null);

  useEffect(() => {
    if (!durationMinutes) return;

    let targetEndTime;
    try {
      const savedEndTime = storageKey ? localStorage.getItem(storageKey) : null;
      if (savedEndTime) {
        const parsed = parseInt(savedEndTime, 10);
        const remaining = Math.max(0, Math.floor((parsed - Date.now()) / 1000));
        if (remaining > 0 && (parsed - Date.now()) <= (durationMinutes * 60 + 300) * 1000) {
          targetEndTime = parsed;
          setTime(remaining);
        } else if (remaining === 0) {
          setTime(0);
          if (onTimeUp) onTimeUp();
          return;
        }
      }
    } catch (e) {}

    if (!targetEndTime) {
      targetEndTime = Date.now() + (durationMinutes * 60) * 1000;
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, targetEndTime.toString());
        } catch (e) {}
      }
      setTime(durationMinutes * 60);
    }

    timerRef.current = setInterval(() => {
      const currentRemaining = Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000));
      setTime(currentRemaining);
      if (currentRemaining <= 0) {
        clearInterval(timerRef.current);
        if (storageKey) {
          try {
            localStorage.removeItem(storageKey);
          } catch (e) {}
        }
        if (onTimeUp) onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [durationMinutes, storageKey, onTimeUp]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6">
      <h3 className="font-semibold text-[#1D315F] text-base md:text-lg mb-4">Waktu Tersisa</h3>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 mb-6">
        <div className="text-4xl md:text-5xl font-semibold text-red-500 text-center">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-gray-600 font-semibold">Status</span>
          <span className="text-[#006A63] font-semibold">Sedang Berjalan</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-gray-600 font-semibold">Batas Kesempatan</span>
          <span className="text-[#1D315F] font-semibold">3 Kali</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-semibold">Soal Terjawab</span>
          <span className="text-[#1D315F] font-semibold">{answeredCount} dari {totalQuestions}</span>
        </div>
      </div>
    </div>
  );
};

const QuestionNavigation = ({ currentQuestion, totalQuestions, onNavigate, flaggedQuestions, answeredQuestions }) => {
  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  const getButtonClass = (num) => {
    if (num === currentQuestion) {
      // Current question - always highlighted as the active one
      return 'bg-[#006A63] text-white ring-2 ring-[#006A63] ring-offset-2 hover:bg-[#00534D]';
    }
    if (flaggedQuestions.includes(num)) {
      // Flagged questions - yellow
      return 'bg-[#F59E0B] text-white hover:bg-[#D97706]';
    }
    if (answeredQuestions.has(num)) {
      // Answered questions - teal/soft green
      return 'bg-[#3FCDC1] text-white hover:bg-[#2eb3a3]';
    }
    // Not visited questions - neutral/white with border
    return 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50';
  };

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6 mt-6">
      <h3 className="font-semibold text-[#1D315F] text-base md:text-lg mb-4">Navigasi Soal</h3>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((num) => (
          <button
            key={num}
            onClick={() => onNavigate(num)}
            className={`w-full aspect-square rounded-md font-semibold text-sm transition-all ${getButtonClass(num)}`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

const QuestionCard = ({ questionNumber, questionData, onPrevious, onNext, onFlag, onAnswer, isDisabled, savedAnswer }) => {
  if (!questionData) return null;

  const handleSelectAnswer = (value) => {
    if (onAnswer) {
      onAnswer(questionData.soal_post_test_id, value);
    }
  };

  const options = questionData.pilihan_jawaban ? Object.entries(questionData.pilihan_jawaban) : [];

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-[#1D315F]">Pertanyaan {questionNumber}</h2>
        <button
          onClick={onFlag}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F59E0B] transition-colors text-sm font-semibold"
        >
          <Flag className="w-4 h-4" />
          <span className="hidden sm:inline">Tandai Ragu</span>
        </button>
      </div>

      <div className="mb-8">
        <p className="text-[#1D315F] text-base md:text-lg leading-relaxed font-semibold">
          {questionData.teks_soal}
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {options.map(([key, text]) => {
          const isSelected = savedAnswer !== undefined && savedAnswer !== null && String(savedAnswer).trim().toLowerCase() === String(key).trim().toLowerCase();
          return (
            <div
              key={key}
              onClick={() => handleSelectAnswer(key)}
              className={`flex items-start sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 select-none group ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                  : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50/80'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Badge Huruf Opsi (A, B, C, D) */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                  }`}
                >
                  {key}
                </div>

                <div className="flex-1 min-w-0">
                  <span
                    className={`font-semibold text-sm md:text-base leading-relaxed ${
                      isSelected ? 'text-emerald-950 font-bold' : 'text-[#1D315F]'
                    }`}
                  >
                    {text}
                  </span>
                </div>
              </div>

              {/* Tanda Centang Hijau saat dipilih */}
              <div className="shrink-0 self-start sm:self-center">
                {isSelected ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-sm animate-in zoom-in-95 duration-150">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span className="hidden sm:inline">Terpilih</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-emerald-300 transition-colors" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          disabled={isDisabled.previous}
          className={`px-6 py-2.5 border-2 border-[#1D315F] text-[#1D315F] font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${isDisabled.previous ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Sebelumnya
        </button>

        <button
          onClick={onFlag}
          className="px-6 py-2.5 bg-[#F59E0B] text-white font-semibold rounded-md hover:bg-[#D97706] transition-colors flex items-center justify-center gap-2"
        >
          <Flag className="w-4 h-4" />
          Ragu-ragu
        </button>

        <button
          onClick={onNext}
          disabled={isDisabled.next}
          className={`px-6 py-2.5 bg-[#006A63] text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${isDisabled.next ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00534D]'
            }`}
        >
          Selanjutnya
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default function PostTest({ onNavigate, onBack }) {
  const courseId = localStorage.getItem('userCourseId');
  const timerStorageKey = courseId ? `post_test_timer_end_${courseId}` : null;
  const answersStorageKey = courseId ? `post_test_answers_${courseId}` : null;
  const flaggedStorageKey = courseId ? `post_test_flagged_${courseId}` : null;
  const questionStorageKey = courseId ? `post_test_current_q_${courseId}` : null;

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    try {
      const cId = localStorage.getItem('userCourseId');
      if (cId) {
        const saved = localStorage.getItem(`post_test_current_q_${cId}`);
        if (saved) return parseInt(saved, 10) || 1;
      }
    } catch (e) {}
    return 1;
  });

  const [flaggedQuestions, setFlaggedQuestions] = useState(() => {
    try {
      const cId = localStorage.getItem('userCourseId');
      if (cId) {
        const saved = localStorage.getItem(`post_test_flagged_${cId}`);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {}
    return [];
  });

  const [answers, setAnswers] = useState(() => {
    try {
      const cId = localStorage.getItem('userCourseId');
      if (cId) {
        const saved = localStorage.getItem(`post_test_answers_${cId}`);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {}
    return {};
  });

  useEffect(() => {
    if (answersStorageKey) {
      try {
        localStorage.setItem(answersStorageKey, JSON.stringify(answers));
      } catch (e) {}
    }
  }, [answers, answersStorageKey]);

  useEffect(() => {
    if (flaggedStorageKey) {
      try {
        localStorage.setItem(flaggedStorageKey, JSON.stringify(flaggedQuestions));
      } catch (e) {}
    }
  }, [flaggedQuestions, flaggedStorageKey]);

  useEffect(() => {
    if (questionStorageKey) {
      try {
        localStorage.setItem(questionStorageKey, currentQuestion.toString());
      } catch (e) {}
    }
  }, [currentQuestion, questionStorageKey]);

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchPostTest = async () => {
      try {
        const res = await api.get(`/user/courses/${courseId}/post-test`);
        if (res.data?.data) {
          setTestData(res.data.data);
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Gagal mengambil soal post test.';
        const isAlreadyPassed = errorMsg.toLowerCase().includes('sudah lulus');

        await Swal.fire({
          icon: isAlreadyPassed ? 'info' : 'error',
          title: isAlreadyPassed ? 'Pelatihan Telah Diselesaikan' : 'Gagal Memuat Soal',
          text: isAlreadyPassed 
            ? 'Anda telah berhasil menyelesaikan program pelatihan ini dan lulus Post Test.' 
            : errorMsg,
          confirmButtonColor: '#006A63',
          confirmButtonText: isAlreadyPassed ? 'Lihat Hasil & Sertifikat' : 'Kembali',
          allowOutsideClick: false
        });

        if (isAlreadyPassed) {
          onNavigate('test-result');
        } else if (onBack) {
          onBack();
        } else {
          onNavigate('my-courses');
        }
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchPostTest();
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'ID Tidak Ditemukan',
        text: 'Data sesi pelatihan tidak ditemukan.',
        confirmButtonColor: '#006A63'
      }).then(() => {
        onNavigate('my-courses');
      });
    }
  }, [courseId]);

  const handleFlag = () => {
    setFlaggedQuestions((prev) => {
      if (prev.includes(currentQuestion)) {
        return prev.filter((q) => q !== currentQuestion);
      } else {
        return [...prev, currentQuestion];
      }
    });
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (testData && currentQuestion < testData.soal.length) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleQuestionSelect = (num) => {
    setCurrentQuestion(num);
  };

  const handleAnswer = (soalId, value) => {
    setAnswers(prev => ({
      ...prev,
      [soalId]: value
    }));
  };

  const handleSubmit = async (isTimeUp = false) => {
    if (!testData || submitting) return;

    const totalSoal = testData.soal?.length || 0;
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = totalSoal - answeredCount;

    if (!isTimeUp) {
      const confirmResult = await Swal.fire({
        title: 'Kumpulkan Post Test?',
        html: unansweredCount > 0 ? `
          <div class="text-left text-sm text-gray-600 space-y-2 pt-1">
            <p>Masih ada <b class="text-red-500">${unansweredCount} dari ${totalSoal} butir soal</b> yang belum Anda jawab.</p>
            <p class="text-xs text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
              ⚠️ Post Test merupakan evaluasi akhir penentu kelulusan Anda. Soal yang tidak terjawab akan bernilai 0.
            </p>
          </div>
        ` : `
          <div class="text-left text-sm text-gray-600 space-y-2 pt-1">
            <p>Anda telah menjawab seluruh <b>${totalSoal} butir soal</b>.</p>
            <p>Apakah Anda yakin ingin menyelesaikan dan mengumpulkan Post Test ini?</p>
          </div>
        `,
        icon: unansweredCount > 0 ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonColor: '#006A63',
        cancelButtonColor: '#6B7280',
        confirmButtonText: unansweredCount > 0 ? 'Tetap Kumpulkan' : 'Ya, Kumpulkan',
        cancelButtonText: 'Periksa Kembali',
        reverseButtons: true
      });

      if (!confirmResult.isConfirmed) return;
    }

    try {
      setSubmitting(true);
      
      const formattedAnswers = Object.entries(answers).map(([id, val]) => ({
        soal_post_test_id: parseInt(id),
        jawaban: val
      }));

      const res = await api.post(`/user/courses/${courseId}/post-test/submit`, {
        jawaban: formattedAnswers
      });
      
      localStorage.setItem('postTestResult', JSON.stringify(res.data.data));

      // Hapus data timer dan draft jawaban yang tersimpan
      try {
        if (timerStorageKey) localStorage.removeItem(timerStorageKey);
        if (answersStorageKey) localStorage.removeItem(answersStorageKey);
        if (flaggedStorageKey) localStorage.removeItem(flaggedStorageKey);
        if (questionStorageKey) localStorage.removeItem(questionStorageKey);
      } catch (e) {}

      // Alert Post Test Berhasil di Submit
      await Swal.fire({
        icon: 'success',
        title: 'Post Test Berhasil Dikumpulkan!',
        text: 'Jawaban Post Test Anda telah berhasil tersimpan dan diproses oleh sistem.',
        confirmButtonColor: '#006A63',
        confirmButtonText: 'Lihat Hasil Evaluasi',
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false
      });

      onNavigate('test-result');
    } catch (error) {
      console.error('Error submitting post test:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengumpulkan Post Test',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengumpulkan Post Test. Silakan coba kembali.',
        confirmButtonColor: '#006A63'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#1D315F] font-bold">Memuat Soal...</div>;
  }

  if (!testData || testData.soal.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-[#1D315F] font-bold">Tidak ada soal tersedia.</div>;
  }

  const answeredQuestionsSet = new Set(
    testData.soal
      .map((s, idx) => (answers[s.soal_post_test_id] ? idx + 1 : null))
      .filter(Boolean)
  );

  const currentQuestionData = testData.soal[currentQuestion - 1];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9FBFC]">
      <PostTestNavbar onNavigate={onNavigate} />
      <PostTestHeader onBack={onBack} testData={testData} currentQuestion={currentQuestion} />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8">
          {/* Timer Card - Top untuk semua tampilan */}
          <div className="mb-6">
            <TimerCard 
              answeredCount={Object.keys(answers).length} 
              totalQuestions={testData.soal.length} 
              durationMinutes={testData.durasi_menit}
              storageKey={timerStorageKey}
              onTimeUp={() => handleSubmit(true)}
            />
          </div>

          {/* Desktop Layout: QuestionCard + Navigation + Submit */}
          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            <div className="lg:col-span-8">
              <QuestionCard
                questionNumber={currentQuestion}
                questionData={currentQuestionData}
                savedAnswer={answers[currentQuestionData?.soal_post_test_id]}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onFlag={handleFlag}
                onAnswer={handleAnswer}
                isDisabled={{
                  previous: currentQuestion === 1,
                  next: currentQuestion === testData.soal.length,
                }}
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <QuestionNavigation
                currentQuestion={currentQuestion}
                totalQuestions={testData.soal.length}
                onNavigate={handleQuestionSelect}
                flaggedQuestions={flaggedQuestions}
                answeredQuestions={answeredQuestionsSet}
              />

              {/* Submit Button - Desktop (di samping navigasi) */}
              <div>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="w-full px-8 py-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="text-lg">▶</span>
                  {submitting ? 'Mengumpulkan...' : 'Submit Post Test'}
                </button>
              </div>
            </div>
          </div>

          {/* Tablet & Mobile Layout: QuestionCard + Navigation */}
          <div className="lg:hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
              {/* QuestionCard */}
              <div className="md:col-span-8">
                <QuestionCard
                  questionNumber={currentQuestion}
                  questionData={currentQuestionData}
                  savedAnswer={answers[currentQuestionData?.soal_post_test_id]}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onFlag={handleFlag}
                  onAnswer={handleAnswer}
                  isDisabled={{
                    previous: currentQuestion === 1,
                    next: currentQuestion === testData.soal.length,
                  }}
                />
              </div>

              <div className="md:col-span-4">
                <QuestionNavigation
                  currentQuestion={currentQuestion}
                  totalQuestions={testData.soal.length}
                  onNavigate={handleQuestionSelect}
                  flaggedQuestions={flaggedQuestions}
                  answeredQuestions={answeredQuestionsSet}
                />
              </div>
            </div>

            {/* Submit Button - Bottom hanya untuk Tablet & Mobile */}
            <div className="mt-6">
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="w-full px-8 py-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="text-lg">▶</span>
                {submitting ? 'Mengumpulkan...' : 'Submit Post Test'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
