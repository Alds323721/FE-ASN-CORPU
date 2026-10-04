import React from 'react';
import { BookOpen, Star, Plus, Edit2, ChevronDown } from 'lucide-react';

const CourseEvaluationSection = ({
  modules,
  course,
  setCourse,
  postTest,
  setPostTest,
  getModulQuiz,
  handleOpenQuizModal,
  handleSavePostTestConfig,
  isReadOnly,
  onNavigate
}) => {
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="font-bold text-gray-900">Evaluasi Pembelajaran (Kuis & Post Test)</h2>
      </div>
      <div className="p-6 space-y-8">
        {/* Kuis per Modul */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Kuis Evaluasi per Modul</h3>
          <p className="text-xs text-gray-500 mb-4">
            Setiap modul wajib memiliki minimal 1 kuis pemahaman sebelum kursus diajukan approval.
          </p>

          <div className="space-y-3">
            {modules.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Tambahkan modul terlebih dahulu untuk menyusun kuis.</p>
            ) : (
              modules.map((m) => {
                const evalQuiz = getModulQuiz(m, 'evaluasi_modul');
                const hasEvalQuiz = Boolean(evalQuiz && evalQuiz.kuis_id);
                const evalCount = evalQuiz?.soal_kuis?.length || 0;

                const weightedQuiz = getModulQuiz(m, 'kuis_berbobot');
                const hasWeightedQuiz = Boolean(weightedQuiz && weightedQuiz.kuis_id);
                const weightedCount = weightedQuiz?.soal_kuis?.length || 0;

                return (
                  <div
                    key={m.modul_id}
                    className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">{m.judul_modul}</p>
                      <span className="text-[11px] text-gray-500 font-semibold bg-white px-2 py-0.5 rounded border border-gray-200">
                        Modul #{m.urutan || 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* 1. Kuis Evaluasi Modul */}
                      <div
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                          hasEvalQuiz
                            ? 'bg-white border-teal-200 shadow-2xs'
                            : 'bg-gray-50/80 border-dashed border-gray-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[#0F766E]" /> Kuis Evaluasi Modul
                            </span>
                            {hasEvalQuiz ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                                Aktif ({evalCount} Soal)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">
                                Belum Ada
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500">
                            {hasEvalQuiz
                              ? `Durasi: ${evalQuiz?.durasi_menit || 15}m • KKM: ${evalQuiz?.nilai_kelulusan ?? 70}% • Percobaan: ${evalQuiz?.maks_percobaan ?? 3}x`
                              : 'Kuis evaluasi pemahaman modul dengan sistem salah & benar.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenQuizModal(m, 'evaluasi_modul')}
                          className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            hasEvalQuiz
                              ? 'bg-teal-50 text-[#0F766E] border border-teal-200 hover:bg-teal-100'
                              : 'bg-[#0F766E] text-white hover:bg-teal-800'
                          }`}
                        >
                          {hasEvalQuiz ? (
                            <>
                              <Edit2 className="w-3.5 h-3.5" /> Edit Kuis Evaluasi
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" /> Buat Kuis Evaluasi
                            </>
                          )}
                        </button>
                      </div>

                      {/* 2. Kuis Nilai Berbobot */}
                      <div
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                          hasWeightedQuiz
                            ? 'bg-white border-amber-300 shadow-2xs'
                            : 'bg-amber-50/30 border-dashed border-amber-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Kuis Nilai Berbobot
                            </span>
                            {hasWeightedQuiz ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                                Aktif ({weightedCount} Soal)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">
                                Opsional
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500">
                            {hasWeightedQuiz
                              ? `Durasi: ${weightedQuiz?.durasi_menit || 15}m • Penilaian Bobot Nilai (Tanpa Salah/Benar Mutlak)`
                              : 'Kuis dengan bobot nilai tiap butir & opsi jawaban (asesmen / skala nilai).'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenQuizModal(m, 'kuis_berbobot')}
                          className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            hasWeightedQuiz
                              ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                              : 'bg-amber-600 text-white hover:bg-amber-700'
                          }`}
                        >
                          {hasWeightedQuiz ? (
                            <>
                              <Edit2 className="w-3.5 h-3.5" /> Edit Kuis Berbobot
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" /> Buat Kuis Berbobot
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full"></div>

        {/* Konfigurasi Post Test */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Konfigurasi Post Test Akhir</h3>
              <p className="text-xs text-gray-500">Evaluasi kelulusan komprehensif setelah seluruh modul diselesaikan.</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={handleSavePostTestConfig}
                className="px-3 py-1.5 bg-white border border-gray-200 text-teal-700 hover:bg-teal-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Simpan Konfigurasi
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nilai Kelulusan (Passing Grade)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={course.nilai_kelulusan ?? 70}
                  onChange={(e) => setCourse({ ...course, nilai_kelulusan: Number(e.target.value) })}
                  className="w-full pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Batas Maksimal Percobaan</label>
              <div className="relative">
                <select
                  value={postTest?.maks_percobaan || 3}
                  onChange={(e) =>
                    setPostTest((prev) =>
                      prev
                        ? { ...prev, maks_percobaan: Number(e.target.value) }
                        : { maks_percobaan: Number(e.target.value) }
                    )
                  }
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pr-10"
                >
                  <option value="3">3 Kali Kesempatan</option>
                  <option value="1">1 Kali Kesempatan</option>
                  <option value="2">2 Kali Kesempatan</option>
                  <option value="5">5 Kali Kesempatan</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full"></div>

        {/* Bank Soal Link Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-teal-50/50 rounded-xl border border-teal-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Bank Soal Post Test</h3>
            <p className="text-xs text-gray-600">
              Total <span className="font-bold text-teal-800">{postTest?.soal_post_test?.length || 0} Pertanyaan</span> telah dikonfigurasi pada Bank Soal kursus ini.
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.setItem('adminKomunitasCourseId', course.pembelajaran_id);
              if (onNavigate) onNavigate('bank-soal');
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm text-center cursor-pointer"
          >
            Kelola Bank Soal
          </button>
        </div>
      </div>
    </section>
  );
};

export default CourseEvaluationSection;
