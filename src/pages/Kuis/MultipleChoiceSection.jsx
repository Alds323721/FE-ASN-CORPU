import React, { useRef, useEffect } from 'react';
import { Flag, Check, ChevronLeft, Send, Grid, ListChecks, Scale } from 'lucide-react';
import QuestionNavigation, { MobileQuestionBar } from './QuestionNavigation';
import CrosswordBoard from '../../components/CrosswordBoard';
import DragDropQuiz from '../../components/DragDropQuiz';

export const QuestionCard = ({
  questionNumber,
  questionData,
  onPrevious,
  onNext,
  onFlag,
  onAnswer,
  isDisabled,
  savedAnswer,
  answers = {},
  ttsQuestions = [],
  parsedGridConfig = null,
  isAllAnswered = false,
  onSubmit = null,
  submitting = false,
  submitLabel = 'Kumpulkan Jawaban'
}) => {
  if (!questionData) return null;

  const tipeSoal = questionData.tipe_soal || 'pilihan_ganda';

  const handleSelectAnswer = (value) => {
    if (onAnswer) {
      onAnswer(questionData.soal_kuis_id, value);
    }
  };

  const options =
    questionData.pilihan_jawaban && !Array.isArray(questionData.pilihan_jawaban)
      ? Object.entries(questionData.pilihan_jawaban)
      : [];

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-6 md:p-8 shadow-xs min-w-0 max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-xl md:text-2xl font-semibold text-[#1D315F]">Pertanyaan {questionNumber}</h2>
          {tipeSoal === 'pilihan_berbobot' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Scale className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>Pilihan Berbobot</span>
            </span>
          )}
          {tipeSoal === 'tts' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-50 text-[#006A63] border border-teal-200">
              <Grid className="w-3.5 h-3.5 text-[#006A63]" aria-hidden="true" />
              <span>Teka-Teki Silang (TTS)</span>
            </span>
          )}
          {tipeSoal === 'drag_drop' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-50 text-[#006A63] border border-teal-200">
              <ListChecks className="w-3.5 h-3.5 text-[#006A63]" aria-hidden="true" />
              <span>Lengkapi Kalimat</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onFlag}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F59E0B] transition-colors text-sm font-semibold cursor-pointer"
        >
          <Flag className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Tandai Ragu</span>
        </button>
      </div>

      {/* Konten Berdasarkan Tipe Soal */}
      {tipeSoal === 'tts' ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs sm:text-sm text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#006A63]">
                Petunjuk #{questionData.nomor_urut || questionNumber} ({questionData.arah === 'menurun' ? 'Menurun' : 'Mendatar'}):
              </span>{' '}
              <span className="font-semibold">{questionData.teks_soal}</span>
            </div>
            <span className="text-xs font-bold bg-white text-[#006A63] px-2.5 py-1 rounded-md border border-teal-200 shrink-0 self-start sm:self-center">
              {questionData.panjang_kata || 0} Huruf
            </span>
          </div>

          <CrosswordBoard
            gridConfig={parsedGridConfig}
            words={ttsQuestions.length > 0 ? ttsQuestions : [questionData]}
            answers={answers}
            onAnswerChange={onAnswer}
            focusedWordId={questionData.soal_kuis_id}
            isReadOnly={submitting}
          />
        </div>
      ) : tipeSoal === 'drag_drop' ? (
        <div className="space-y-4">
          <DragDropQuiz
            question={questionData}
            value={Array.isArray(savedAnswer) ? savedAnswer : []}
            onChange={(newAns) => handleSelectAnswer(newAns)}
            isReadOnly={submitting}
          />
        </div>
      ) : (
        <>
          <div className="mb-8 min-w-0 max-w-full">
            <p className="text-[#1D315F] text-base md:text-lg leading-relaxed font-semibold break-words [overflow-wrap:anywhere] [word-break:break-word]">
              {questionData.teks_soal}
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {options.map(([key, rawVal]) => {
              const text = typeof rawVal === 'object' && rawVal !== null ? (rawVal.teks ?? '') : String(rawVal ?? '');
              const isSelected =
                savedAnswer !== undefined &&
                savedAnswer !== null &&
                String(savedAnswer).trim().toLowerCase() === String(key).trim().toLowerCase();
              return (
                <div
                  key={key}
                  onClick={() => handleSelectAnswer(key)}
                  className={`flex items-start justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 select-none group min-w-0 max-w-full ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50/80'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Badge Huruf Opsi (A, B, C, D) */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                      }`}
                    >
                      {key}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span
                        className={`block font-semibold text-sm md:text-base leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] ${
                          isSelected ? 'text-emerald-950 font-bold' : 'text-[#1D315F]'
                        }`}
                      >
                        {text}
                      </span>
                    </div>
                  </div>

                  {/* Tanda Centang Hijau saat dipilih */}
                  <div className="shrink-0 self-start mt-0.5">
                    {isSelected ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-sm animate-in zoom-in-95 duration-150">
                        <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
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
        </>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isDisabled.previous}
          className={`px-6 py-2.5 border-2 border-[#1D315F] text-[#1D315F] font-semibold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            isDisabled.previous ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Sebelumnya
        </button>

        <button
          type="button"
          onClick={onFlag}
          className="px-6 py-2.5 bg-[#F59E0B] text-white font-semibold rounded-md hover:bg-[#D97706] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Flag className="w-4 h-4" aria-hidden="true" />
          Ragu-ragu
        </button>

        {isAllAnswered && onSubmit ? (
          <button
            type="button"
            onClick={() => onSubmit(false)}
            disabled={submitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>{submitting ? 'Mengumpulkan...' : submitLabel}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isDisabled.next}
            title={isDisabled.next ? 'Lengkapi seluruh soal untuk mengumpulkan' : undefined}
            className={`px-6 py-2.5 bg-[#006A63] text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isDisabled.next ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00534D]'
            }`}
          >
            <span>Selanjutnya</span>
            <ChevronLeft className="w-4 h-4 rotate-180" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default function MultipleChoiceSection({
  pgQuestions,
  allQuestions,
  ttsQuestions = [],
  parsedGridConfig = null,
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
  submitting,
  isAllAnswered: isAllAnsweredProp,
  submitLabel = 'Kumpulkan Jawaban'
}) {
  const questionList = allQuestions || pgQuestions || [];
  const activeQuestionData = currentQuestionData || questionList[currentQuestion - 1];

  const isAllAnswered =
    typeof isAllAnsweredProp === 'boolean'
      ? isAllAnsweredProp
      : questionList.length > 0 && answeredQuestionsSet.size >= questionList.length;

  const questionCardRef = useRef(null);

  useEffect(() => {
    // When switching question, if viewport is scrolled past question top, gently scroll to card
    if (questionCardRef.current) {
      const rect = questionCardRef.current.getBoundingClientRect?.() || { top: 0 };
      if (rect.top < 70) {
        questionCardRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentQuestion]);

  return (
    <div>
      {/* Mobile Sticky Quick Navigation Bar (< md) */}
      <MobileQuestionBar
        currentQuestion={currentQuestion}
        totalQuestions={questionList.length}
        onNavigate={handleQuestionSelect}
        flaggedQuestions={flaggedQuestions}
        answeredQuestions={answeredQuestionsSet}
      />

      {/* Main Layout: Desktop & Tablet 2 columns, Mobile 1 column */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
        {/* Left Column: Question Card */}
        <div ref={questionCardRef} className="md:col-span-8 min-w-0 max-w-full scroll-mt-24">
          <QuestionCard
            questionNumber={currentQuestion}
            questionData={activeQuestionData}
            savedAnswer={answers[activeQuestionData?.soal_kuis_id]}
            answers={answers}
            ttsQuestions={ttsQuestions}
            parsedGridConfig={parsedGridConfig}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onFlag={handleFlag}
            onAnswer={handleAnswer}
            isAllAnswered={isAllAnswered}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel={submitLabel}
            isDisabled={{
              previous: currentQuestion === 1,
              next: currentQuestion === questionList.length,
            }}
          />
        </div>

        {/* Right Column: QuestionNavigation + Submit Button (Sticky on md & lg) */}
        <div className="md:col-span-4 md:sticky md:top-20 md:self-start space-y-6 z-20">
          <QuestionNavigation
            currentQuestion={currentQuestion}
            totalQuestions={questionList.length}
            onNavigate={handleQuestionSelect}
            flaggedQuestions={flaggedQuestions}
            answeredQuestions={answeredQuestionsSet}
          />

          {/* Submit Button - Desktop & Tablet (Sticky di sidebar samping navigasi) */}
          <div className="hidden md:block">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="w-full px-8 py-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>{submitting ? 'Mengumpulkan...' : 'Submit Kuis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button - Mobile only (terletak di bawah card navigasi pada alur dokumen mobile) */}
      <div className="md:hidden mt-6">
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="w-full px-8 py-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span>{submitting ? 'Mengumpulkan...' : 'Submit Kuis'}</span>
        </button>
      </div>
    </div>
  );
}
