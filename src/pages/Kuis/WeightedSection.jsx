import React from 'react';
import { Star, Check } from 'lucide-react';

export default function WeightedSection({
  weightedQuestions,
  testData,
  answers,
  handleAnswer,
  handleSubmit,
  submitting
}) {
  const answeredCount = weightedQuestions.filter(s => answers[s.soal_kuis_id]).length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#BBC9C7] rounded-xl p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
              {testData?.tipe_kuis === 'kuis_berbobot' ? 'Kuis Nilai Berbobot (Asesmen Mandiri)' : 'Soal Pilihan Berbobot'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Pilihlah salah satu jawaban yang paling tepat sesuai kondisi Anda. Setiap pilihan memiliki bobot penilaian tersendiri.
            </p>
          </div>
          <div className="text-xs bg-amber-50 text-amber-900 font-bold px-3 py-1.5 rounded-lg border border-amber-200 self-start sm:self-auto flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
            {answeredCount} dari {weightedQuestions.length} Soal Terjawab
          </div>
        </div>

        <div className="space-y-6">
          {weightedQuestions.map((q, idx) => {
            const options = q.pilihan_jawaban ? Object.entries(q.pilihan_jawaban) : [];
            const savedAns = answers[q.soal_kuis_id];
            return (
              <div key={q.soal_kuis_id} className="p-4 sm:p-6 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="font-semibold text-sm md:text-base text-[#1D315F] leading-relaxed">
                      {q.teks_soal}
                    </p>
                  </div>
                  <span className="text-[11px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                    Bobot: {q.bobot_nilai || 5} Poin
                  </span>
                </div>

                <div className="space-y-2.5 pl-0 sm:pl-8">
                  {options.map(([optKey, optVal]) => {
                    const text = typeof optVal === 'object' ? (optVal.teks || '') : String(optVal);
                    const isSelected = savedAns !== undefined && savedAns !== null && String(savedAns).trim().toUpperCase() === String(optKey).trim().toUpperCase();
                    return (
                      <div
                        key={optKey}
                        onClick={() => handleAnswer(q.soal_kuis_id, optKey)}
                        className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl border cursor-pointer transition-all duration-150 select-none ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/70 shadow-2xs ring-2 ring-amber-400/20'
                            : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {optKey}
                          </span>
                          <span className={`text-xs sm:text-sm font-semibold leading-relaxed ${
                            isSelected ? 'text-amber-950 font-bold' : 'text-gray-700'
                          }`}>
                            {text}
                          </span>
                        </div>

                        <div className="shrink-0 pl-2">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button Section for Weighted Questions */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500">
            Pastikan Anda telah memilih jawaban untuk seluruh pertanyaan sebelum menyelesaikan kuis.
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
