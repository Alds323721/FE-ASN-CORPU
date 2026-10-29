import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { CheckCircle2, Star, Check } from 'lucide-react';

export default function CourseFeedbackKuesioner({
  courseId,
  sudahMengisi,
  setSudahMengisi,
  onSubmitted
}) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [rating, setRating] = useState(5);
  const [saran, setSaran] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      if (res.data?.sudah_mengisi) {
        setSudahMengisi(true);
      }
      if (res.data?.jawaban_user) {
        setAnswers(res.data.jawaban_user);
      }
      if (res.data?.ulasan_sebelumnya) {
        setRating(res.data.ulasan_sebelumnya.rating || 5);
        setSaran(res.data.ulasan_sebelumnya.ulasan || '');
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
          title: 'Kuesioner Belum Lengkap',
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
      if (onSubmitted) onSubmitted();

      Swal.fire({
        icon: 'success',
        title: 'Evaluasi Terkirim!',
        text: res.data?.message || 'Terima kasih telah mengisi kuesioner. Akses unduh sertifikat resmi kini telah aktif!',
        confirmButtonColor: '#006A63'
      });
    } catch (err) {
      console.error('Error submitting kuesioner:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim Kuesioner',
        text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan respons Anda.',
        confirmButtonColor: '#006A63'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#BBC9C7] rounded-lg p-6 mt-6 text-center text-xs text-gray-500 font-medium">
        Memuat kuesioner evaluasi...
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-6 mt-6 shadow-xs">
      <div className="border-b border-gray-100 pb-3 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-[#006A63] border border-teal-200">
          Evaluasi Kursus
        </span>
        <h3 className="font-semibold text-[#1D315F] text-base mt-1.5">
          Kuesioner Feedback Pelatihan
        </h3>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
          {sudahMengisi
            ? 'Terima kasih telah mengisi kuesioner evaluasi. Tanggapan Anda telah tersimpan.'
            : 'Mohon luangkan waktu sejenak untuk mengisi penilaian kursus ini sebagai syarat penerbitan sertifikat resmi.'}
        </p>
      </div>

      {sudahMengisi ? (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-900 rounded-lg text-xs font-semibold flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#006A63] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-bold text-[#006A63]">Kuesioner Telah Selesai Diisi</p>
            <p className="text-teal-800 font-medium mt-0.5">
              Anda telah memenuhi syarat kelulusan. Silakan klik tombol <b>Unduh Sertifikat (PDF)</b> di samping untuk mengunduh dokumen sertifikat resmi Anda.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Daftar Butir Kuesioner Pilihan Ganda */}
          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div key={q.kuesioner_id || qIdx} className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-lg space-y-2.5">
                <p className="text-xs font-semibold text-[#1D315F] leading-snug">
                  <span className="text-[#006A63] font-bold mr-1">{qIdx + 1}.</span>
                  {q.pertanyaan}
                </p>

                <div className="space-y-1.5">
                  {(q.opsi_jawaban || []).map((opt, oIdx) => {
                    const isSelected = answers[q.kuesioner_id] === opt;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(q.kuesioner_id, opt)}
                        className={`w-full px-3 py-2 text-xs rounded-md border text-left transition-all flex items-center justify-between font-medium ${
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

          {/* Rating Bintang Opsional */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-semibold text-[#1D315F] mb-1.5">
              Tingkat Kepuasan Keseluruhan (Bintang):
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Saran / Ulasan Teks Opsional */}
          <div>
            <label className="block text-xs font-semibold text-[#1D315F] mb-1">
              Kritik, Saran, atau Masukan (Opsional):
            </label>
            <textarea
              rows={3}
              value={saran}
              onChange={(e) => setSaran(e.target.value)}
              placeholder="Tuliskan pengalaman atau masukan Anda..."
              className="w-full p-2.5 border border-gray-300 rounded-md text-xs font-medium focus:ring-2 focus:ring-[#006A63] focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[#006A63] text-white font-semibold rounded-md hover:bg-[#00534D] transition-colors disabled:opacity-50 text-xs shadow-xs"
          >
            {submitting ? 'Mengirim Evaluasi...' : 'Kirim Feedback & Aktifkan Sertifikat'}
          </button>
        </form>
      )}
    </div>
  );
}

