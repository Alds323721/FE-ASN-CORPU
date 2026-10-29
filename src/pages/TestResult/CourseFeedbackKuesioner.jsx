import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { CheckCircle2, Star, Check, Download, Lock, Award, ArrowRight, MessageSquare } from 'lucide-react';

export default function CourseFeedbackKuesioner({
  courseId,
  sudahMengisi: propSudahMengisi,
  setSudahMengisi: propSetSudahMengisi,
  onSubmitted,
  showCertificateButton = false,
  courseTitle = 'Pelatihan',
  variant = 'card',
  isPostTestCompleted = true,
  onOpenGraduationPage
}) {
  const [internalSudahMengisi, setInternalSudahMengisi] = useState(false);
  const sudahMengisi = propSudahMengisi !== undefined ? propSudahMengisi : internalSudahMengisi;
  const setSudahMengisi = propSetSudahMengisi || setInternalSudahMengisi;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [rating, setRating] = useState(5);
  const [saran, setSaran] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  const handleDownloadCertificate = async () => {
    if (!courseId) return;
    try {
      setDownloadingCert(true);
      const response = await api.get(`/user/courses/${courseId}/certificate/download`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = (courseTitle || 'Pelatihan').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `Sertifikat_${cleanTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download certificate error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengunduh Sertifikat',
        text: 'Pastikan Anda telah lulus Post Test dan menyelesaikan seluruh rangkaian pelatihan ini.',
        confirmButtonColor: '#006A63'
      });
    } finally {
      setDownloadingCert(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchKuesioner();
    }
  }, [courseId]);

  const fetchKuesioner = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user/courses/${courseId}/kuesioner`);
      const data = res.data?.data || [];
      setQuestions(data);
      const isDone = Boolean(res.data?.sudah_mengisi);
      setSudahMengisi(isDone);

      if (res.data?.jawaban_user && typeof res.data.jawaban_user === 'object') {
        const normalized = {};
        Object.entries(res.data.jawaban_user).forEach(([k, v]) => {
          normalized[k] = v;
          normalized[Number(k)] = v;
        });
        setAnswers(normalized);
      }
      if (res.data?.ulasan_sebelumnya) {
        setRating(Number(res.data.ulasan_sebelumnya.rating || 5));
        setSaran(
          res.data.ulasan_sebelumnya.ulasan && res.data.ulasan_sebelumnya.ulasan !== '-'
            ? res.data.ulasan_sebelumnya.ulasan
            : ''
        );
      }
    } catch (err) {
      console.error('Error fetching user kuesioner:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (kuesionerId, option) => {
    if (sudahMengisi) return;
    setAnswers((prev) => ({
      ...prev,
      [kuesionerId]: option
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi apakah seluruh pertanyaan wajib telah dijawab
    for (const q of questions) {
      if (q.apakah_wajib && !answers[q.kuesioner_id]) {
        Swal.fire({
          icon: 'warning',
          title: 'Feedback Kursus Belum Lengkap',
          text: `Mohon jawab butir kuesioner: "${q.pertanyaan}".`,
          confirmButtonColor: '#006A63'
        });
        return;
      }
    }

    const payloadAnswers = Object.entries(answers).map(([qid, ans]) => ({
      kuesioner_id: Number(qid),
      jawaban_terpilih: ans
    }));

    try {
      setSubmitting(true);
      const res = await api.post(`/user/courses/${courseId}/kuesioner/submit`, {
        jawaban: payloadAnswers,
        rating: rating,
        ulasan: saran.trim() || '-'
      });

      setSudahMengisi(true);

      await Swal.fire({
        icon: 'success',
        title: 'Feedback Kursus Terkirim!',
        text:
          variant === 'section'
            ? 'Terima kasih telah mengisi Feedback Kursus. Anda sekarang akan diarahkan ke Halaman Kelulusan & Sertifikat!'
            : res.data?.message || 'Terima kasih telah mengisi kuesioner. Akses unduh sertifikat resmi kini telah aktif!',
        confirmButtonColor: '#006A63',
        confirmButtonText: variant === 'section' ? 'Buka Halaman Kelulusan' : 'OK'
      });

      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error('Error submitting kuesioner:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim Feedback',
        text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan respons Anda.',
        confirmButtonColor: '#006A63'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isSection = variant === 'section';

  if (loading) {
    return (
      <div className={`bg-white border border-[#BBC9C7] rounded-xl p-6 ${isSection ? '' : 'mt-6'} text-center text-xs text-gray-500 font-medium`}>
        Memuat kuesioner feedback kursus...
      </div>
    );
  }

  return (
    <div className={`bg-white border border-[#BBC9C7] rounded-xl overflow-hidden shadow-xs ${isSection ? '' : 'p-6 mt-6'}`}>
      {/* Header Section */}
      <div className={`${isSection ? 'px-6 py-5 bg-gradient-to-r from-[#F4F8FB] via-white to-teal-50/40 border-b border-gray-200' : 'border-b border-gray-100 pb-3 mb-4'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-[#006A63] border border-teal-200">
              Kategori: Feedback Kursus
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                sudahMengisi
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isPostTestCompleted
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {sudahMengisi
                ? '✓ Selesai Diisi'
                : isPostTestCompleted
                  ? 'Wajib Diisi Sebelum Halaman Kelulusan'
                  : 'Menunggu Penyelesaian Post Test'}
            </span>
          </div>
        </div>

        <h3 className={`font-bold text-[#1D315F] ${isSection ? 'text-lg md:text-xl mt-2' : 'text-base mt-1.5'}`}>
          Kuesioner Feedback & Evaluasi Penyelenggaraan Kursus
        </h3>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
          {sudahMengisi
            ? 'Terima kasih telah mengisi kuesioner evaluasi kursus ini. Tanggapan Anda telah tercatat dalam kategori evaluasi kursus.'
            : 'Peserta wajib mengisi kuesioner feedback kursus ini setelah menyelesaikan Post Test untuk dapat melanjutkan ke Halaman Kelulusan dan mengunduh sertifikat resmi.'}
        </p>
      </div>

      {/* Body Content */}
      <div className={isSection ? 'p-6' : ''}>
        {!isPostTestCompleted && !sudahMengisi ? (
          <div className="p-5 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1D315F]">
                  Feedback Kursus Terbuka Setelah Lulus Post Test Akhir
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-2xl">
                  Selesaikan seluruh materi modul dan kerjakan <b>Post Test Akhir Pelatihan</b> terlebih dahulu. Setelah lulus Post Test, formulir Feedback Kursus ini akan terbuka secara otomatis sebagai syarat wajib menuju <b>Halaman Kelulusan</b>.
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 shrink-0">
              🔒 Terkunci Sementara
            </span>
          </div>
        ) : sudahMengisi ? (
          <div className="space-y-5">
            <div className="p-4 sm:p-5 bg-teal-50/80 border border-teal-200 text-teal-900 rounded-xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#006A63] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold text-sm text-[#006A63]">
                    Kuesioner Feedback Kursus Telah Selesai Diisi & Tersimpan
                  </p>
                  <p className="text-teal-800 font-medium mt-0.5">
                    Hasil evaluasi kursus Anda ({rating}/5 Bintang) telah tersimpan. Halaman Kelulusan & Sertifikat Resmi sudah dapat diakses langsung.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {onOpenGraduationPage && (
                  <button
                    type="button"
                    onClick={onOpenGraduationPage}
                    className="px-4 py-2.5 bg-[#1D315F] text-white font-bold rounded-lg hover:bg-[#152447] transition-colors text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Buka Halaman Kelulusan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {showCertificateButton && (
                  <button
                    type="button"
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCert}
                    className="px-4 py-2.5 bg-[#006A63] text-white font-bold rounded-lg hover:bg-[#00534D] transition-colors disabled:opacity-50 text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingCert ? 'Mengunduh...' : 'Unduh Sertifikat (PDF)'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tampilan Hasil Jawaban Kuesioner & Ulasan yang Sudah Tersimpan */}
            {questions.length > 0 && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1D315F]">
                    Hasil Jawaban Feedback Anda (Tersimpan)
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    ✓ Data Evaluasi Tersimpan
                  </span>
                </div>

                <div className={isSection ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                  {questions.map((q, qIdx) => {
                    const savedChoice = answers[q.kuesioner_id] ?? answers[String(q.kuesioner_id)];
                    return (
                      <div
                        key={q.kuesioner_id || qIdx}
                        className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2.5 flex flex-col justify-between"
                      >
                        <p className="text-xs sm:text-sm font-semibold text-[#1D315F] leading-snug">
                          <span className="text-[#006A63] font-bold mr-1.5">{qIdx + 1}.</span>
                          {q.pertanyaan}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          {(q.opsi_jawaban || []).map((opt, oIdx) => {
                            const isSelected = savedChoice === opt;
                            return (
                              <div
                                key={oIdx}
                                className={`w-full px-3 py-2 text-xs rounded-lg border text-left flex items-center justify-between font-medium ${
                                  isSelected
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                                    : 'bg-white/70 border-gray-200 text-gray-500'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                    <Check className="w-3 h-3" /> Jawaban Anda
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={isSection ? 'grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-gray-100' : 'space-y-3 pt-2 border-t border-gray-100'}>
                  <div className={isSection ? 'md:col-span-5 bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 flex flex-col justify-center' : 'bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5'}>
                    <span className="text-xs font-bold text-[#1D315F] mb-1.5">
                      Penilaian Bintang Anda:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        {rating} / 5
                      </span>
                    </div>
                  </div>

                  <div className={isSection ? 'md:col-span-7 bg-gray-50 border border-gray-200 rounded-xl p-4' : 'bg-gray-50 border border-gray-200 rounded-xl p-3.5'}>
                    <span className="text-xs font-bold text-[#1D315F] mb-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#006A63]" />
                      <span>Ulasan / Masukan yang Tersimpan:</span>
                    </span>
                    <p className="text-xs text-gray-700 font-medium mt-1 leading-relaxed">
                      {saran ? `"${saran}"` : 'Tidak ada catatan tambahan (Telah selesai dievaluasi).'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Daftar Butir Kuesioner Pilihan Ganda */}
            <div className={isSection ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {questions.map((q, qIdx) => (
                <div
                  key={q.kuesioner_id || qIdx}
                  className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-3 flex flex-col justify-between"
                >
                  <p className="text-xs sm:text-sm font-semibold text-[#1D315F] leading-snug">
                    <span className="text-[#006A63] font-bold mr-1.5">{qIdx + 1}.</span>
                    {q.pertanyaan}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {(q.opsi_jawaban || []).map((opt, oIdx) => {
                      const isSelected = answers[q.kuesioner_id] === opt;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectAnswer(q.kuesioner_id, opt)}
                          className={`w-full px-3 py-2 text-xs rounded-lg border text-left transition-all flex items-center justify-between font-medium cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50/90 border-[#006A63] text-[#006A63] font-semibold shadow-2xs'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#006A63] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Rating Bintang & Kritik Saran dalam Grid Rapi */}
            <div className={isSection ? 'grid grid-cols-1 md:grid-cols-12 gap-5 pt-3 border-t border-gray-100' : 'space-y-4 pt-2 border-t border-gray-100'}>
              <div className={isSection ? 'md:col-span-5 bg-amber-50/40 border border-amber-200/70 rounded-xl p-4 flex flex-col justify-center' : ''}>
                <label className="block text-xs font-bold text-[#1D315F] mb-1">
                  Tingkat Kepuasan Kursus (Bintang):
                </label>
                <p className="text-[11px] text-gray-500 mb-2.5">
                  Berikan penilaian bintang untuk kualitas materi & penyelenggaraan kursus ini.
                </p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {rating} / 5
                  </span>
                </div>
              </div>

              <div className={isSection ? 'md:col-span-7' : ''}>
                <label className="block text-xs font-bold text-[#1D315F] mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#006A63]" />
                  <span>Ulasan, Kritik, atau Masukan untuk Kursus Ini (Opsional):</span>
                </label>
                <textarea
                  rows={3}
                  value={saran}
                  onChange={(e) => setSaran(e.target.value)}
                  placeholder="Tuliskan kesan, pesan, atau masukan Anda mengenai materi dan penyelenggaraan kursus ini..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006A63] focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting}
                className={`${isSection ? 'w-full sm:w-auto px-6 py-3' : 'w-full py-2.5 px-4'} bg-[#006A63] text-white font-bold rounded-lg hover:bg-[#00534D] transition-colors disabled:opacity-50 text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer`}
              >
                <span>
                  {submitting
                    ? 'Mengirim Feedback Kursus...'
                    : isSection
                      ? 'Kirim Feedback Kursus & Lanjut ke Halaman Kelulusan'
                      : 'Kirim Feedback & Aktifkan Sertifikat'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

