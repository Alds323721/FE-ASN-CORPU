import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import DragDropQuiz from '../../components/DragDropQuiz';

export default function DragDropSection({
  dragDropQuestions,
  answers,
  handleAnswer,
  handleSubmit,
  submitting
}) {
  const completedQuestionsCount = dragDropQuestions.filter(
    s => Array.isArray(answers[s.soal_kuis_id]) && answers[s.soal_kuis_id].filter(Boolean).length === (s.jumlah_blank || 1)
  ).length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#BBC9C7] rounded-xl p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#006A63]" />
              Soal Dropdown / Drag & Drop
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Lengkapi titik-titik kosong pada kalimat berikut dengan menyeret kata atau mengklik titik kosong untuk memilih kata yang tepat.
            </p>
          </div>
          <div className="text-xs bg-teal-50 text-[#006A63] font-bold px-3 py-1.5 rounded-lg border border-teal-200 self-start sm:self-auto flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#006A63]" />
            {completedQuestionsCount} dari {dragDropQuestions.length} Soal Terisi Lengkap
          </div>
        </div>

        <div className="space-y-8">
          {dragDropQuestions.map((q, idx) => (
            <div key={q.soal_kuis_id} className="p-4 sm:p-6 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#006A63] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-[#006A63] flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  Pertanyaan #{idx + 1}
                </span>
                <span className="text-[11px] text-gray-400 font-semibold">
                  Bobot: {q.bobot_nilai || 1} Poin
                </span>
              </div>

              <DragDropQuiz
                question={q}
                value={answers[q.soal_kuis_id] || []}
                onChange={(newAns) => handleAnswer(q.soal_kuis_id, newAns)}
                isReadOnly={submitting}
              />
            </div>
          ))}
        </div>

        {/* Submit Button Section for Drag & Drop */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500">
            Pastikan seluruh titik kosong pada semua soal telah terisi sebelum menyelesaikan kuis.
          </div>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
          >
            <span className="text-base">▶</span>
            {submitting ? 'Mengumpulkan...' : 'Submit Kuis'}
          </button>
        </div>
      </div>
    </div>
  );
}
