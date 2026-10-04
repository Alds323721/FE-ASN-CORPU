import React from 'react';
import { Grid, Sparkles } from 'lucide-react';
import CrosswordBoard from '../../components/CrosswordBoard';

export default function CrosswordSection({
  ttsQuestions,
  parsedGridConfig,
  answers,
  handleAnswer,
  handleSubmit,
  submitting
}) {
  const completedWordsCount = ttsQuestions.filter(
    s => answers[s.soal_kuis_id] && answers[s.soal_kuis_id].trim().length === (s.panjang_kata || 0)
  ).length;

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-xl p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] flex items-center gap-2">
            <Grid className="w-6 h-6 text-[#006A63]" />
            Game Teka-Teki Silang (TTS)
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Klik pada kotak TTS atau klik nomor petunjuk (mendatar / menurun), lalu ketik huruf jawabannya.
          </p>
        </div>
        <div className="text-xs bg-teal-50 text-[#006A63] font-bold px-3 py-1.5 rounded-lg border border-teal-200 self-start sm:self-auto flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#006A63]" />
          {completedWordsCount} dari {ttsQuestions.length} Kata Terisi Lengkap
        </div>
      </div>

      <CrosswordBoard
        gridConfig={parsedGridConfig}
        words={ttsQuestions}
        answers={answers}
        onAnswerChange={handleAnswer}
      />

      {/* Submit Button Section for TTS */}
      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500">
          Pastikan seluruh kata terisi sebelum menyelesaikan kuis. Klik <b>Submit Kuis</b> jika sudah selesai.
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
  );
}
