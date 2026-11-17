import React from 'react';

export const isQuestionAnswered = (num, answeredQuestions) => {
  if (!answeredQuestions) return false;
  if (answeredQuestions instanceof Set) return answeredQuestions.has(num);
  if (Array.isArray(answeredQuestions)) return answeredQuestions.includes(num);
  return false;
};

export const getAnsweredCount = (answeredQuestions) => {
  if (!answeredQuestions) return 0;
  if (answeredQuestions instanceof Set) return answeredQuestions.size;
  if (Array.isArray(answeredQuestions)) return answeredQuestions.length;
  if (typeof answeredQuestions === 'object') return Object.keys(answeredQuestions).length;
  return 0;
};

export const getQuestionButtonClass = (
  num,
  currentQuestion,
  flaggedQuestions = [],
  answeredQuestions = new Set()
) => {
  if (num === currentQuestion) {
    // Current question - always highlighted as the active one (dark teal)
    return 'bg-[#006A63] text-white ring-2 ring-[#006A63] ring-offset-2 hover:bg-[#00534D]';
  }
  const isFlagged = Array.isArray(flaggedQuestions) && flaggedQuestions.includes(num);
  if (isFlagged) {
    // Flagged questions - yellow
    return 'bg-[#F59E0B] text-white hover:bg-[#D97706]';
  }
  if (isQuestionAnswered(num, answeredQuestions)) {
    // Answered questions - teal/soft green
    return 'bg-[#3FCDC1] text-white hover:bg-[#2eb3a3]';
  }
  // Not visited / unanswered questions - neutral/white with border
  return 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50';
};

/**
 * Mobile-specific sticky horizontal quick navigation bar
 * Sticks right beneath the mobile navbar without obscuring question choices
 */
export function MobileQuestionBar({
  currentQuestion,
  totalQuestions,
  onNavigate,
  flaggedQuestions = [],
  answeredQuestions = new Set()
}) {
  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const answeredCount = getAnsweredCount(answeredQuestions);

  return (
    <div className="md:hidden sticky top-[65px] z-30 bg-white border border-[#BBC9C7] rounded-lg p-2.5 mb-4 shadow-xs">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs font-bold text-[#1D315F]">
          Navigasi Soal ({currentQuestion}/{totalQuestions})
        </span>
        <span className="text-[11px] font-semibold text-gray-500">
          {answeredCount}/{totalQuestions} Terjawab
        </span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth">
        {questions.map((num) => {
          const isCurrent = num === currentQuestion;
          const isFlagged = Array.isArray(flaggedQuestions) && flaggedQuestions.includes(num);
          const isAnswered = isQuestionAnswered(num, answeredQuestions);

          return (
            <button
              key={num}
              type="button"
              onClick={() => onNavigate(num)}
              aria-label={`Nomor Soal ${num}${isCurrent ? ' (Sedang Dikerjakan)' : ''}${isFlagged ? ' (Ragu-ragu)' : ''}${isAnswered ? ' (Terjawab)' : ' (Belum Dijawab)'}`}
              className={`shrink-0 w-8 h-8 rounded-md font-semibold text-xs transition-all cursor-pointer flex items-center justify-center ${getQuestionButtonClass(
                num,
                currentQuestion,
                flaggedQuestions,
                answeredQuestions
              )}`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main QuestionNavigation component for Desktop and Tablet sidebar
 * Sticky card with responsive max-height and internal scroll for large question sets
 */
export default function QuestionNavigation({
  currentQuestion,
  totalQuestions,
  onNavigate,
  flaggedQuestions = [],
  answeredQuestions = new Set(),
  className = ''
}) {
  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const answeredCount = getAnsweredCount(answeredQuestions);

  return (
    <div className={`bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6 flex flex-col max-h-[calc(100vh-14rem)] shadow-2xs ${className}`}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="font-semibold text-[#1D315F] text-base md:text-lg">Navigasi Soal</h3>
        <span className="text-xs font-semibold text-gray-500">
          {answeredCount}/{totalQuestions}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-1">
        {questions.map((num) => {
          const isCurrent = num === currentQuestion;
          const isFlagged = Array.isArray(flaggedQuestions) && flaggedQuestions.includes(num);
          const isAnswered = isQuestionAnswered(num, answeredQuestions);

          return (
            <button
              key={num}
              type="button"
              onClick={() => onNavigate(num)}
              aria-label={`Nomor Soal ${num}${isCurrent ? ' (Sedang Dikerjakan)' : ''}${isFlagged ? ' (Ragu-ragu)' : ''}${isAnswered ? ' (Terjawab)' : ' (Belum Dijawab)'}`}
              className={`w-full aspect-square rounded-md font-semibold text-sm transition-all cursor-pointer flex items-center justify-center ${getQuestionButtonClass(
                num,
                currentQuestion,
                flaggedQuestions,
                answeredQuestions
              )}`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Legend / Status Indikator di bagian bawah card navigasi */}
      <div className="mt-4 pt-3 border-t border-gray-100 shrink-0 grid grid-cols-2 gap-2 text-[11px] text-gray-600 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#006A63] ring-1 ring-[#006A63]"></span>
          <span>Aktif</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#3FCDC1]"></span>
          <span>Terjawab</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#F59E0B]"></span>
          <span>Ragu-ragu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-gray-300"></span>
          <span>Belum Dijawab</span>
        </div>
      </div>
    </div>
  );
}
