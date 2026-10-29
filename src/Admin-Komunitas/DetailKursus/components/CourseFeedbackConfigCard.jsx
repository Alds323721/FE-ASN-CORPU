import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Swal from 'sweetalert2';
import { Plus, Trash2, Eye, X, Check, HelpCircle, Save } from 'lucide-react';

const PRESET_OPTIONS = {
  kepuasan: [
    'Sangat Puas',
    'Puas',
    'Cukup Puas',
    'Kurang Puas',
    'Tidak Puas'
  ],
  pemahaman: [
    'Sangat Mudah Dipahami',
    'Mudah Dipahami',
    'Cukup Dipahami',
    'Sulit Dipahami',
    'Tidak Dapat Dipahami'
  ]
};

export default function CourseFeedbackConfigCard({
  courseId,
  isReadOnly = false,
  onQuestionsChange
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState({});

  useEffect(() => {
    if (onQuestionsChange) {
      onQuestionsChange(questions);
    }
  }, [questions, onQuestionsChange]);

  useEffect(() => {
    if (courseId) {
      fetchKuesioner();
    }
  }, [courseId]);

  const fetchKuesioner = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin-komunitas/pembelajaran/${courseId}/kuesioner`);
      const data = res.data?.data || [];
      if (data.length > 0) {
        setQuestions(
          data.map((q) => ({
            kuesioner_id: q.kuesioner_id,
            pertanyaan: q.pertanyaan,
            tipe_skala: q.tipe_skala || 'kepuasan',
            opsi_jawaban: Array.isArray(q.opsi_jawaban) ? q.opsi_jawaban : PRESET_OPTIONS.kepuasan,
            apakah_wajib: q.apakah_wajib ?? true
          }))
        );
      } else {
        // Template bawaan jika belum pernah diatur
        setQuestions([
          {
            pertanyaan: 'Bagaimana tingkat kepuasan Anda terhadap materi pembelajaran yang disajikan?',
            tipe_skala: 'kepuasan',
            opsi_jawaban: PRESET_OPTIONS.kepuasan,
            apakah_wajib: true
          },
          {
            pertanyaan: 'Seberapa mudah materi pada kursus ini untuk dipahami dan dipelajari?',
            tipe_skala: 'pemahaman',
            opsi_jawaban: PRESET_OPTIONS.pemahaman,
            apakah_wajib: true
          },
          {
            pertanyaan: 'Seberapa relevan materi ini dalam menunjang tugas dan pengembangan kompetensi Anda?',
            tipe_skala: 'kepuasan',
            opsi_jawaban: ['Sangat Relevan', 'Relevan', 'Cukup Relevan', 'Kurang Relevan', 'Tidak Relevan'],
            apakah_wajib: true
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching kuesioner:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        pertanyaan: '',
        tipe_skala: 'kepuasan',
        opsi_jawaban: PRESET_OPTIONS.kepuasan,
        apakah_wajib: true
      }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Minimal 1 Pertanyaan',
        text: 'Kursus wajib memiliki minimal 1 butir kuesioner evaluasi.',
        confirmButtonColor: '#0F766E'
      });
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      if (field === 'tipe_skala') {
        if (value === 'kepuasan') {
          copy[index].opsi_jawaban = PRESET_OPTIONS.kepuasan;
        } else if (value === 'pemahaman') {
          copy[index].opsi_jawaban = PRESET_OPTIONS.pemahaman;
        }
      }
      return copy;
    });
  };

  const handleCustomOptionsChange = (index, commaSeparatedString) => {
    const list = commaSeparatedString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        opsi_jawaban: list.length > 0 ? list : ['Opsi 1', 'Opsi 2']
      };
      return copy;
    });
  };

  const handleSave = async () => {
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].pertanyaan.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Pertanyaan Belum Lengkap',
          text: `Silakan isi teks pertanyaan pada butir kuesioner #${i + 1}.`,
          confirmButtonColor: '#0F766E'
        });
        return;
      }
      if (!questions[i].opsi_jawaban || questions[i].opsi_jawaban.length < 2) {
        Swal.fire({
          icon: 'warning',
          title: 'Opsi Jawaban Kurang',
          text: `Butir kuesioner #${i + 1} minimal harus memiliki 2 opsi pilihan ganda.`,
          confirmButtonColor: '#0F766E'
        });
        return;
      }
    }

    try {
      setSaving(true);
      await api.post(`/admin-komunitas/pembelajaran/${courseId}/kuesioner`, {
        soal: questions
      });
      Swal.fire({
        icon: 'success',
        title: 'Kuesioner Tersimpan',
        text: 'Format kuesioner evaluasi kursus berhasil diperbarui dan siap digunakan.',
        timer: 1800,
        showConfirmButton: false
      });
      fetchKuesioner();
    } catch (err) {
      console.error('Error saving kuesioner:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan kuesioner.',
        confirmButtonColor: '#0F766E'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-gray-900 text-base">Kuesioner Evaluasi Kursus (Feedback Peserta)</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Susun butir pertanyaan evaluasi yang wajib dijawab peserta di halaman kelulusan sebelum mengunduh sertifikat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-teal-700" />
            <span>Pratinjau Kuesioner</span>
          </button>
        </div>
      </div>

      {/* Body List */}
      <div className="p-6 space-y-5">
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Memuat konfigurasi kuesioner...</div>
        ) : (
          <>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 rounded-xl bg-gray-50/40 hover:bg-white hover:border-gray-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-gray-700">Pertanyaan #{idx + 1}</span>
                    </div>

                    {!isReadOnly && questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Hapus Pertanyaan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Pertanyaan Input */}
                  <div>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={q.pertanyaan}
                      onChange={(e) => handleQuestionChange(idx, 'pertanyaan', e.target.value)}
                      placeholder="Contoh: Seberapa mudah materi pada kursus ini untuk dipahami dan dipelajari?"
                      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Format Pilihan Ganda & Tipe Skala */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Jenis Skala Pilihan Ganda:
                      </label>
                      <select
                        disabled={isReadOnly}
                        value={q.tipe_skala}
                        onChange={(e) => handleQuestionChange(idx, 'tipe_skala', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="kepuasan">Skala Kepuasan (Puas s.d. Tidak Puas)</option>
                        <option value="pemahaman">Skala Pemahaman (Mudah s.d. Sulit Dipahami)</option>
                        <option value="kustom">Pilihan Kustom (Manual)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Pratinjau Opsi Jawaban:
                      </label>
                      {q.tipe_skala === 'kustom' ? (
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={q.opsi_jawaban.join(', ')}
                          onChange={(e) => handleCustomOptionsChange(idx, e.target.value)}
                          placeholder="Pisahkan pilihan dengan koma, contoh: Sangat Baik, Cukup, Kurang"
                          className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {q.opsi_jawaban.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[11px] text-gray-700 font-medium shadow-2xs"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isReadOnly && (
              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:border-[#0F766E] hover:text-[#0F766E] hover:bg-teal-50/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Butir Pertanyaan Kuesioner</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* MODAL PRATINJAU KUESIONER KURSUS (PREVIEW) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  Pratinjau Kursus (Tampilan Peserta)
                </span>
                <h3 className="font-bold text-gray-900 text-lg mt-1">
                  Kuesioner Evaluasi & Kepuasan Pelatihan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Berikut adalah pratinjau form evaluasi yang akan ditampilkan kepada peserta pada halaman kelulusan. Peserta wajib melengkapi kuesioner ini agar tombol unduh sertifikat resmi menjadi aktif.
            </p>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <p className="text-xs font-semibold text-gray-900 leading-snug">
                    <span className="text-[#0F766E] font-bold mr-1.5">{idx + 1}.</span>
                    {q.pertanyaan || `Pertanyaan #${idx + 1}`}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.opsi_jawaban.map((opt, oIdx) => {
                      const isSelected = previewAnswers[idx] === opt;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setPreviewAnswers({ ...previewAnswers, [idx]: opt })}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] font-semibold'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
