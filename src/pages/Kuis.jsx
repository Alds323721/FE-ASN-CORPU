import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';

import KuisNavbar from './Kuis/KuisNavbar';
import KuisHeader from './Kuis/KuisHeader';
import TimerCard from './Kuis/TimerCard';
import KuisFooter from './Kuis/KuisFooter';
import MultipleChoiceSection from './Kuis/MultipleChoiceSection';

export const isQuizItemAnswered = (s, ans) => {
  if (!s) return false;
  if (s.tipe_soal === 'tts') {
    const minLen = s.panjang_kata || 2;
    return typeof ans === 'string' && ans.trim().length >= minLen && !ans.includes(' ');
  }
  if (s.tipe_soal === 'drag_drop') {
    const required = s.jumlah_blank || 1;
    return Array.isArray(ans) && ans.filter(Boolean).length === required;
  }
  return typeof ans === 'string' && ans.trim().length > 0;
};

export default function Kuis({ onNavigate, onBack }) {
  const courseId = localStorage.getItem('userCourseId');
  const modulId = localStorage.getItem('userModulId');
  const kuisId = localStorage.getItem('userKuisId');

  const quizSessionKey = (courseId && modulId && kuisId)
    ? `${courseId}_${modulId}_${kuisId}`
    : (kuisId || 'default');

  const timerStorageKey = `quiz_timer_end_${quizSessionKey}`;
  const answersStorageKey = `quiz_answers_${quizSessionKey}`;
  const flaggedStorageKey = `quiz_flagged_${quizSessionKey}`;
  const questionStorageKey = `quiz_current_q_${quizSessionKey}`;
  const sectionStorageKey = `quiz_section_${quizSessionKey}`;

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    try {
      const saved = localStorage.getItem(questionStorageKey);
      if (saved) return parseInt(saved, 10) || 1;
    } catch (e) { }
    return 1;
  });

  const [flaggedQuestions, setFlaggedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem(flaggedStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return [];
  });

  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(answersStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {};
  });

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(answersStorageKey, JSON.stringify(answers));
    } catch (e) { }
  }, [answers, answersStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(flaggedStorageKey, JSON.stringify(flaggedQuestions));
    } catch (e) { }
  }, [flaggedQuestions, flaggedStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(questionStorageKey, currentQuestion.toString());
    } catch (e) { }
  }, [currentQuestion, questionStorageKey]);

  const hasFetchedKuisRef = useRef(false);

  useEffect(() => {
    if (hasFetchedKuisRef.current) return;
    hasFetchedKuisRef.current = true;

    const fetchKuis = async () => {
      try {
        const res = await api.get(`/user/courses/${courseId}/modul/${modulId}/kuis/${kuisId}`);
        if (res.data?.data) {
          setTestData(res.data.data);
        }
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Kuis',
          text: error.response?.data?.message || 'Gagal mengambil soal kuis.',
          confirmButtonColor: '#006A63'
        });
        if (onBack) onBack();
        else onNavigate('my-courses');
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      fetchKuis();
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

  const allQuestions = useMemo(() => testData?.soal || [], [testData]);

  // Klasifikasi soal berdasarkan tipe untuk ringkasan dan papan TTS
  const pgQuestions = useMemo(() => {
    return allQuestions.filter(s => s.tipe_soal === 'pilihan_ganda' || (!s.tipe_soal && s.tipe_soal !== 'tts' && s.tipe_soal !== 'drag_drop' && s.tipe_soal !== 'pilihan_berbobot'));
  }, [allQuestions]);

  const weightedQuestions = useMemo(() => {
    return allQuestions.filter(s => s.tipe_soal === 'pilihan_berbobot');
  }, [allQuestions]);

  const ttsQuestions = useMemo(() => {
    return allQuestions.filter(s => s.tipe_soal === 'tts');
  }, [allQuestions]);

  const dragDropQuestions = useMemo(() => {
    return allQuestions.filter(s => s.tipe_soal === 'drag_drop');
  }, [allQuestions]);

  const totalSoal = allQuestions.length;

  useEffect(() => {
    if (totalSoal > 0 && currentQuestion > totalSoal) {
      setCurrentQuestion(1);
    }
  }, [totalSoal, currentQuestion]);

  // Hitung himpunan nomor urut soal yang sudah terjawab di seluruh tipe soal
  const answeredQuestionsSet = useMemo(() => {
    const set = new Set();
    allQuestions.forEach((s, idx) => {
      if (isQuizItemAnswered(s, answers[s.soal_kuis_id])) {
        set.add(idx + 1);
      }
    });
    return set;
  }, [allQuestions, answers]);

  const answeredCount = answeredQuestionsSet.size;

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
    if (currentQuestion < totalSoal) {
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

  // Parse grid_config secara aman jika berbentuk string JSON
  const parsedGridConfig = useMemo(() => {
    if (!testData?.grid_config) return null;
    if (typeof testData.grid_config === 'string') {
      try {
        return JSON.parse(testData.grid_config);
      } catch (e) {
        return null;
      }
    }
    return testData.grid_config;
  }, [testData?.grid_config]);

  const handleSubmit = async (isTimeUp = false) => {
    if (!testData || submitting) return;

    const unansweredCount = totalSoal - answeredCount;
    const isPreTestQuiz = testData?.tipe_kuis === 'pre_test';

    if (isPreTestQuiz && unansweredCount > 0) {
      const firstUnansIdx = allQuestions.findIndex(s => !isQuizItemAnswered(s, answers[s.soal_kuis_id]));
      if (firstUnansIdx !== -1) {
        setCurrentQuestion(firstUnansIdx + 1);
      }

      await Swal.fire({
        icon: 'warning',
        title: 'Jawaban Pre-Test Belum Lengkap',
        text: `Seluruh pertanyaan Pre-Test wajib dijawab. Masih terdapat ${unansweredCount} soal yang belum terisi. Silakan lengkapi jawaban terlebih dahulu.`,
        confirmButtonColor: '#006A63',
        confirmButtonText: 'Lengkapi Jawaban'
      });
      return;
    }

    if (!isTimeUp) {
      const unansPG = pgQuestions.filter(s => !isQuizItemAnswered(s, answers[s.soal_kuis_id])).length;
      const unansWeighted = weightedQuestions.filter(s => !isQuizItemAnswered(s, answers[s.soal_kuis_id])).length;
      const unansTTS = ttsQuestions.filter(s => !isQuizItemAnswered(s, answers[s.soal_kuis_id])).length;
      const unansDD = dragDropQuestions.filter(s => !isQuizItemAnswered(s, answers[s.soal_kuis_id])).length;

      const breakdownDetails = [];
      if (unansPG > 0) breakdownDetails.push(`<li><b>${unansPG}</b> Soal Pilihan Ganda</li>`);
      if (unansWeighted > 0) breakdownDetails.push(`<li><b>${unansWeighted}</b> Soal Pilihan Berbobot</li>`);
      if (unansTTS > 0) breakdownDetails.push(`<li><b>${unansTTS}</b> Kata Teka-Teki Silang (TTS)</li>`);
      if (unansDD > 0) breakdownDetails.push(`<li><b>${unansDD}</b> Soal Drag & Drop / Dropdown</li>`);

      const confirmResult = await Swal.fire({
        title: 'Kumpulkan Kuis?',
        html: unansweredCount > 0 ? `
          <div class="text-left text-sm text-gray-600 space-y-2 pt-1">
            <p>Masih ada <b class="text-red-500">${unansweredCount} dari ${totalSoal} butir soal / kata</b> yang belum selesai Anda jawab:</p>
            ${breakdownDetails.length > 0 ? `<ul class="list-disc pl-5 text-xs text-gray-700 space-y-1">${breakdownDetails.join('')}</ul>` : ''}
            <p class="text-xs text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
              Catatan: Soal, kata TTS, atau titik kosong yang belum terjawab akan bernilai 0. Apakah Anda yakin ingin mengumpulkan kuis sekarang?
            </p>
          </div>
        ` : `
          <div class="text-left text-sm text-gray-600 space-y-2 pt-1">
            <p>Anda telah menjawab seluruh <b>${totalSoal} butir pertanyaan</b> dengan lengkap.</p>
            <p>Apakah Anda yakin ingin menyelesaikan dan mengumpulkan kuis ini?</p>
          </div>
        `,
        icon: unansweredCount > 0 ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonColor: '#006A63',
        cancelButtonColor: '#6B7280',
        confirmButtonText: unansweredCount > 0 ? 'Ya, Tetap Kumpulkan' : 'Ya, Kumpulkan',
        cancelButtonText: 'Periksa Kembali',
        reverseButtons: true
      });

      if (!confirmResult.isConfirmed) return;
    }

    try {
      setSubmitting(true);

      const formattedAnswers = allQuestions.map(s => {
        const val = answers[s.soal_kuis_id];
        if (s.tipe_soal === 'drag_drop') {
          return {
            soal_kuis_id: s.soal_kuis_id,
            jawaban: Array.isArray(val) ? val : []
          };
        }
        return {
          soal_kuis_id: s.soal_kuis_id,
          jawaban: typeof val === 'string' ? val.trim().toUpperCase() : (val || '')
        };
      });

      const res = await api.post(`/user/courses/${courseId}/modul/${modulId}/kuis/${kuisId}/submit`, {
        jawaban: formattedAnswers
      });

      const result = res.data?.data;
      const isPassed = !!result?.apakah_lulus;
      const score = result?.nilai ?? 0;
      const passingGrade = testData?.nilai_kelulusan ?? 70;
      const isPreTest = testData?.tipe_kuis === 'pre_test' || result?.tipe_kuis === 'pre_test';
      const isWeightedQuiz = testData?.tipe_kuis === 'kuis_berbobot'
        || result?.tipe_kuis === 'kuis_berbobot'
        || result?.is_kuis_berbobot
        || (weightedQuestions.length > 0 && pgQuestions.length === 0 && ttsQuestions.length === 0 && dragDropQuestions.length === 0)
        || Number(testData?.nilai_kelulusan ?? 0) === 0;

      if (isPreTest) {
        if (testData?.materi_id) {
          localStorage.setItem('userActiveMateriId', testData.materi_id);
          localStorage.setItem('userModulId', modulId);
          localStorage.setItem('userJustCompletedPreTest', 'true');
        }
        await Swal.fire({
          title: 'Pre-Test Selesai!',
          html: `
            <div class="text-center space-y-4 pt-2">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-700 mx-auto">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <div class="text-4xl font-extrabold text-[#006A63]">
                  ${score}
                </div>
                <div class="text-xs text-gray-500 font-semibold mt-1">
                  Skor Penilaian Awal (Pre-Test)
                </div>
              </div>
              <div class="p-3.5 rounded-lg text-xs md:text-sm text-left leading-relaxed bg-teal-50 text-teal-900 border border-teal-200">
                <b>Terima kasih!</b> Anda telah menyelesaikan Pre-Test ini. Akses berkas materi pembelajaran sekarang telah terbuka dan dapat Anda pelajari.
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#006A63',
          confirmButtonText: 'Buka Materi Pembelajaran',
          allowOutsideClick: false,
          timer: 2500,
          timerProgressBar: true
        });
      } else if (isWeightedQuiz) {
        localStorage.setItem('userCompletedKuisModulId', modulId);
        localStorage.setItem('userCompletedKuisId', kuisId);
        localStorage.setItem('userJustPassedKuis', JSON.stringify({
          modulId: String(modulId),
          kuisId: String(kuisId),
          isWeighted: true
        }));
        await Swal.fire({
          title: 'Kuis Berbobot Selesai!',
          html: `
            <div class="text-center space-y-4 pt-2">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <div class="text-4xl font-extrabold text-amber-600">
                  ${score}
                </div>
                <div class="text-xs text-gray-500 font-semibold mt-1">
                  Skor Penilaian Berbobot
                </div>
              </div>
              <div class="p-3.5 rounded-lg text-xs md:text-sm text-left leading-relaxed bg-amber-50 text-amber-950 border border-amber-200">
                <b>Terima kasih!</b> Anda telah menyelesaikan kuis berbobot ini. Seluruh pilihan jawaban Anda telah direkam dan dinilai berdasarkan bobot masing-masing opsi tanpa sistem kelulusan benar/salah mutlak.
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#D97706',
          confirmButtonText: 'Lanjut ke Materi Berikutnya',
          allowOutsideClick: false,
          timer: 2500,
          timerProgressBar: true
        });
      } else {
        if (isPassed) {
          localStorage.setItem('userCompletedKuisModulId', modulId);
          localStorage.setItem('userCompletedKuisId', kuisId);
          localStorage.setItem('userJustPassedKuis', JSON.stringify({
            modulId: String(modulId),
            kuisId: String(kuisId),
            isWeighted: false
          }));
        }
        // Pop-up keterangan kelulusan kuis evaluasi modul
        await Swal.fire({
          title: isPassed ? 'Selamat, Anda Lulus Kuis!' : 'Belum Memenuhi Kelulusan',
          html: `
            <div class="text-center space-y-4 pt-2">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full ${isPassed ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-600'} text-3xl font-bold mx-auto">
                ${isPassed ? '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>' : '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>'}
              </div>
              <div>
                <div class="text-4xl font-extrabold ${isPassed ? 'text-[#006A63]' : 'text-red-600'}">
                  ${score}
                </div>
                <div class="text-xs text-gray-500 font-semibold mt-1">
                  Batas Kelulusan (KKM): ${passingGrade}
                </div>
              </div>
              <div class="p-3.5 rounded-lg text-xs md:text-sm text-left leading-relaxed ${isPassed ? 'bg-teal-50 text-teal-900 border border-teal-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}">
                ${isPassed
              ? '<b>Hebat!</b> Anda telah memahami materi modul ini dengan baik dan berhak melanjutkan ke materi/modul berikutnya.'
              : 'Nilai Anda belum mencapai batas minimal kelulusan. Silakan pelajari kembali materi pada modul ini dan ulangi kuis evaluasi.'}
              </div>
            </div>
          `,
          icon: isPassed ? 'success' : 'warning',
          confirmButtonColor: isPassed ? '#006A63' : '#1D315F',
          confirmButtonText: isPassed ? 'Lanjut ke Materi Berikutnya' : 'Kembali ke Materi',
          allowOutsideClick: false,
          ...(isPassed ? { timer: 2500, timerProgressBar: true } : {})
        });
      }

      // Hapus data timer dan draft kuis yang tersimpan
      try {
        localStorage.removeItem(timerStorageKey);
        localStorage.removeItem(answersStorageKey);
        localStorage.removeItem(flaggedStorageKey);
        localStorage.removeItem(questionStorageKey);
        localStorage.removeItem(sectionStorageKey);
      } catch (e) { }

      onNavigate('course-detail');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengumpulkan Kuis',
        text: error.response?.data?.message || 'Terjadi gangguan saat mengumpulkan kuis. Silakan coba kembali.',
        confirmButtonColor: '#006A63'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#1D315F] font-bold">Memuat Soal...</div>;
  }

  if (!testData || totalSoal === 0) {
    return <div className="min-h-screen flex items-center justify-center text-[#1D315F] font-bold">Tidak ada soal tersedia.</div>;
  }

  const currentQuestionData = allQuestions[currentQuestion - 1];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9FBFC]">
      <KuisNavbar onNavigate={onNavigate} />
      <KuisHeader onBack={onBack} testData={testData} answeredCount={answeredCount} />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8">
          {/* Timer Card - Top untuk semua tampilan */}
          <div className="mb-6">
            <TimerCard
              answeredCount={answeredCount}
              totalQuestions={totalSoal}
              durationMinutes={testData.durasi_menit || 15}
              maxAttempts={testData.maks_percobaan ?? 3}
              isPreTest={testData.tipe_kuis === 'pre_test'}
              isWeighted={testData.tipe_kuis === 'kuis_berbobot' || (weightedQuestions.length > 0 && pgQuestions.length === 0 && ttsQuestions.length === 0 && dragDropQuestions.length === 0) || Number(testData.nilai_kelulusan || 0) === 0}
              storageKey={timerStorageKey}
              onTimeUp={() => handleSubmit(true)}
            />
          </div>

          {/* Tampilan Kuis Terpadu dalam 1 Halaman & 1 Alur Navigasi */}
          <MultipleChoiceSection
            allQuestions={allQuestions}
            pgQuestions={allQuestions}
            ttsQuestions={ttsQuestions}
            parsedGridConfig={parsedGridConfig}
            currentQuestion={currentQuestion}
            currentQuestionData={currentQuestionData}
            answers={answers}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            handleFlag={handleFlag}
            handleAnswer={handleAnswer}
            handleQuestionSelect={handleQuestionSelect}
            flaggedQuestions={flaggedQuestions}
            answeredQuestionsSet={answeredQuestionsSet}
            handleSubmit={handleSubmit}
            submitting={submitting}
            isAllAnswered={totalSoal > 0 && answeredCount >= totalSoal}
            submitLabel={testData?.tipe_kuis === 'pre_test' ? 'Submit Pre-Test' : 'Kumpulkan Jawaban'}
          />
        </div>
      </main>

      <KuisFooter />
    </div>
  );
}
