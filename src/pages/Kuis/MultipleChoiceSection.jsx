import React from 'react';
import { Flag, Check, ChevronLeft } from 'lucide-react';
import QuestionNavigation from './QuestionNavigation';

export const QuestionCard = ({
  questionNumber,
  questionData,
  onPrevious,
  onNext,
  onFlag,
  onAnswer,
  isDisabled,
  savedAnswer
}) => {
  if (!questionData) return null;

  const handleSelectAnswer = (value) => {
    if (onAnswer) {
      onAnswer(questionData.soal_kuis_id, value);
    }
  };

  const options = questionData.pilihan_jawaban ? Object.entries(questionData.pilihan_jawaban) : [];

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-[#1D315F]">Pertanyaan {questionNumber}</h2>
        <button
          onClick={onFlag}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F59E0B] transition-colors text-sm font-semibold cursor-pointer"
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
          className={`px-6 py-2.5 border-2 border-[#1D315F] text-[#1D315F] font-semibold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            isDisabled.previous ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Sebelumnya
        </button>

        <button
          onClick={onFlag}
          className="px-6 py-2.5 bg-[#F59E0B] text-white font-semibold rounded-md hover:bg-[#D97706] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Flag className="w-4 h-4" />
          Ragu-ragu
        </button>

        <button
          onClick={onNext}
          disabled={isDisabled.next}
          className={`px-6 py-2.5 bg-[#006A63] text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            isDisabled.next ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00534D]'
          }`}
        >
          Selanjutnya
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default function MultipleChoiceSection({
  pgQuestions,
  currentQuestion,
  currentQuestionData,
  answers,
  handlePrevious,
  handleNext,
  handleFlag,
  handleAnswer,
  handleQuestionSelect,
  flaggedQuestions,
  answeredQuestionsSet,
  handleSubmit,
  submitting
}) {
  return (
    <>
      {/* Desktop Layout: QuestionCard + Navigation + Submit */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-8">
          <QuestionCard
            questionNumber={currentQuestion}
            questionData={currentQuestionData}
            savedAnswer={answers[currentQuestionData?.soal_kuis_id]}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onFlag={handleFlag}
            onAnswer={handleAnswer}
            isDisabled={{
              previous: currentQuestion === 1,
              next: currentQuestion === pgQuestions.length,
            }}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <QuestionNavigation
            currentQuestion={currentQuestion}
            totalQuestions={pgQuestions.length}
            onNavigate={handleQuestionSelect}
            flaggedQuestions={flaggedQuestions}
            answeredQuestions={answeredQuestionsSet}
          />

          {/* Submit Button - Desktop (di samping navigasi) */}
          <div>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="w-full px-8 py-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span className="text-lg">▶</span>
              {submitting ? 'Mengumpulkan...' : 'Submit Kuis'}
            </button>
          </div>
        </div>
      </div>

      {/* Tablet & Mobile Layout: QuestionCard + Navigation */}
      <div className="lg:hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          <div className="md:col-span-8">
            <QuestionCard
              questionNumber={currentQuestion}
              questionData={currentQuestionData}
              savedAnswer={answers[currentQuestionData?.soal_kuis_id]}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onFlag={handleFlag}
              onAnswer={handleAnswer}
              isDisabled={{
                previous: currentQuestion === 1,
                next: currentQuestion === pgQuestions.length,
              }}
            />
          </div>

          <div className="md:col-span-4">
            <QuestionNavigation
              currentQuestion={currentQuestion}
              totalQuestions={pgQuestions.length}
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
            className="w-full px-8 py-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span className="text-lg">▶</span>
            {submitting ? 'Mengumpulkan...' : 'Submit Kuis'}
          </button>
        </div>
      </div>
    </>
  );
}
