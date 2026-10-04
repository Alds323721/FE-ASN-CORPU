import React from 'react';

export default function QuestionNavigation({
  currentQuestion,
  totalQuestions,
  onNavigate,
  flaggedQuestions,
  answeredQuestions
}) {
  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  const getButtonClass = (num) => {
    if (num === currentQuestion) {
      // Current question - always highlighted as the active one
      return 'bg-[#006A63] text-white ring-2 ring-[#006A63] ring-offset-2 hover:bg-[#00534D]';
    }
    if (flaggedQuestions.includes(num)) {
      // Flagged questions - yellow
      return 'bg-[#F59E0B] text-white hover:bg-[#D97706]';
    }
    if (answeredQuestions.has(num)) {
      // Answered questions - teal/soft green
      return 'bg-[#3FCDC1] text-white hover:bg-[#2eb3a3]';
    }
    // Not visited questions - neutral/white with border
    return 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50';
  };

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6 mt-6">
      <h3 className="font-semibold text-[#1D315F] text-base md:text-lg mb-4">Navigasi Soal</h3>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((num) => (
          <button
            key={num}
            onClick={() => onNavigate(num)}
            className={`w-full aspect-square rounded-md font-semibold text-sm transition-all cursor-pointer ${getButtonClass(num)}`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
