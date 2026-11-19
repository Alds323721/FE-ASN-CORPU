// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import QuestionNavigation, {
  MobileQuestionBar,
  getQuestionButtonClass,
  isQuestionAnswered,
  getAnsweredCount,
} from '../QuestionNavigation';
import MultipleChoiceSection, { QuestionCard } from '../MultipleChoiceSection';

describe('Sticky Question Navigation & Status Tests', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Helper Functions & Button Styling', () => {
    it('accurately detects whether a question is answered in Set and Array formats', () => {
      const answeredSet = new Set([1, 3, 5]);
      expect(isQuestionAnswered(1, answeredSet)).toBe(true);
      expect(isQuestionAnswered(2, answeredSet)).toBe(false);

      const answeredArray = [2, 4];
      expect(isQuestionAnswered(2, answeredArray)).toBe(true);
      expect(isQuestionAnswered(3, answeredArray)).toBe(false);
    });

    it('returns the correct answered count for Set, Array, and Object', () => {
      expect(getAnsweredCount(new Set([1, 2, 3]))).toBe(3);
      expect(getAnsweredCount([1, 2])).toBe(2);
      expect(getAnsweredCount({ q1: 'A', q2: 'B' })).toBe(2);
      expect(getAnsweredCount(null)).toBe(0);
    });

    it('assigns correct visual classes for active, flagged, answered, and unanswered states', () => {
      // Active question takes top precedence
      const activeClass = getQuestionButtonClass(1, 1, [1], new Set([1]));
      expect(activeClass).toContain('bg-[#006A63]');
      expect(activeClass).toContain('ring-[#006A63]');

      // Flagged question when not active
      const flaggedClass = getQuestionButtonClass(2, 1, [2], new Set([2]));
      expect(flaggedClass).toContain('bg-[#F59E0B]');

      // Answered question when not active and not flagged
      const answeredClass = getQuestionButtonClass(3, 1, [], new Set([3]));
      expect(answeredClass).toContain('bg-[#3FCDC1]');

      // Unanswered question
      const unvisitedClass = getQuestionButtonClass(4, 1, [], new Set([3]));
      expect(unvisitedClass).toContain('bg-white');
      expect(unvisitedClass).toContain('border-gray-300');
    });
  });

  describe('QuestionNavigation Component', () => {
    it('renders all question numbers with max-height and overflow-y auto for scroll resilience', () => {
      const handleNavigate = vi.fn();
      const { container } = render(
        <QuestionNavigation
          currentQuestion={1}
          totalQuestions={15}
          onNavigate={handleNavigate}
          flaggedQuestions={[3]}
          answeredQuestions={new Set([1, 2])}
        />
      );

      // Verify max-height and internal scroll classes
      const card = container.firstChild;
      expect(card.className).toContain('max-h-[calc(100vh-14rem)]');

      const grid = container.querySelector('.grid-cols-5');
      expect(grid.className).toContain('overflow-y-auto');

      // Verify questions 1 through 15 are rendered
      for (let i = 1; i <= 15; i++) {
        expect(screen.getByRole('button', { name: new RegExp(`Nomor Soal ${i}\\b`) })).toBeDefined();
      }

      // Verify status legend items exist
      expect(screen.getByText('Aktif')).toBeDefined();
      expect(screen.getByText('Terjawab')).toBeDefined();
      expect(screen.getByText('Ragu-ragu')).toBeDefined();
      expect(screen.getByText('Belum Dijawab')).toBeDefined();

      // Click on question 5
      const btn5 = screen.getByRole('button', { name: /Nomor Soal 5/ });
      fireEvent.click(btn5);
      expect(handleNavigate).toHaveBeenCalledWith(5);
    });
  });

  describe('MobileQuestionBar Component', () => {
    it('renders mobile quick navigation bar with sticky top classes and horizontal scroll', () => {
      const handleNavigate = vi.fn();
      const { container } = render(
        <MobileQuestionBar
          currentQuestion={2}
          totalQuestions={8}
          onNavigate={handleNavigate}
          flaggedQuestions={[4]}
          answeredQuestions={new Set([1, 2])}
        />
      );

      const bar = container.firstChild;
      expect(bar.className).toContain('md:hidden');
      expect(bar.className).toContain('sticky');
      expect(bar.className).toContain('top-[65px]');
      expect(bar.className).toContain('z-30');

      // Check header and buttons
      expect(screen.getByText('Navigasi Soal (2/8)')).toBeDefined();
      expect(screen.getByText('2/8 Terjawab')).toBeDefined();

      const btn4 = screen.getByRole('button', { name: /Nomor Soal 4/ });
      fireEvent.click(btn4);
      expect(handleNavigate).toHaveBeenCalledWith(4);
    });
  });

  describe('MultipleChoiceSection Integration', () => {
    const mockPgQuestions = [
      {
        soal_kuis_id: 'q1',
        teks_soal: 'Ini adalah pertanyaan pertama dengan teks yang cukup panjang untuk menguji responsivitas layout.',
        pilihan_jawaban: {
          A: 'Pilihan jawaban A yang sangat panjang hingga membutuhkan wrapping beberapa baris pada tampilan layar.',
          B: 'Pilihan jawaban B yang juga mendalam dan berisi penjelasan lengkap.',
          C: 'Pilihan jawaban C singkat.',
          D: 'Pilihan jawaban D alternatif.',
        },
      },
      {
        soal_kuis_id: 'q2',
        teks_soal: 'Pertanyaan kedua?',
        pilihan_jawaban: {
          A: 'Opsi A',
          B: 'Opsi B',
        },
      },
    ];

    it('renders sticky sidebar container with md:sticky, md:top-20, md:self-start on desktop and tablet', () => {
      const { container } = render(
        <MultipleChoiceSection
          pgQuestions={mockPgQuestions}
          currentQuestion={1}
          currentQuestionData={mockPgQuestions[0]}
          answers={{}}
          handlePrevious={vi.fn()}
          handleNext={vi.fn()}
          handleFlag={vi.fn()}
          handleAnswer={vi.fn()}
          handleQuestionSelect={vi.fn()}
          flaggedQuestions={[]}
          answeredQuestionsSet={new Set()}
          handleSubmit={vi.fn()}
          submitting={false}
          isAllAnswered={false}
        />
      );

      // Verify sidebar column has sticky classes
      const sidebar = container.querySelector('.md\\:sticky');
      expect(sidebar).toBeDefined();
      expect(sidebar.className).toContain('md:sticky');
      expect(sidebar.className).toContain('md:top-20');
      expect(sidebar.className).toContain('md:self-start');
      expect(sidebar.className).toContain('z-20');

      // Verify question card wrapper has scroll-mt-24
      const leftCol = container.querySelector('.scroll-mt-24');
      expect(leftCol).toBeDefined();
    });

    it('displays "Selanjutnya" button when questions remain unanswered, and transforms to "Kumpulkan Jawaban" when all questions are answered', () => {
      const handleSubmit = vi.fn();
      const { rerender } = render(
        <MultipleChoiceSection
          pgQuestions={mockPgQuestions}
          currentQuestion={2}
          currentQuestionData={mockPgQuestions[1]}
          answers={{ q1: 'A' }}
          handlePrevious={vi.fn()}
          handleNext={vi.fn()}
          handleFlag={vi.fn()}
          handleAnswer={vi.fn()}
          handleQuestionSelect={vi.fn()}
          flaggedQuestions={[]}
          answeredQuestionsSet={new Set([1])}
          handleSubmit={handleSubmit}
          submitting={false}
          isAllAnswered={false}
        />
      );

      // When isAllAnswered is false on last question, it shows Selanjutnya (disabled because last question)
      expect(screen.getByText('Selanjutnya')).toBeDefined();
      expect(screen.queryByText('Kumpulkan Jawaban')).toBeNull();

      // Rerender with isAllAnswered = true
      rerender(
        <MultipleChoiceSection
          pgQuestions={mockPgQuestions}
          currentQuestion={2}
          currentQuestionData={mockPgQuestions[1]}
          answers={{ q1: 'A', q2: 'B' }}
          handlePrevious={vi.fn()}
          handleNext={vi.fn()}
          handleFlag={vi.fn()}
          handleAnswer={vi.fn()}
          handleQuestionSelect={vi.fn()}
          flaggedQuestions={[]}
          answeredQuestionsSet={new Set([1, 2])}
          handleSubmit={handleSubmit}
          submitting={false}
          isAllAnswered={true}
        />
      );

      // Button should now be "Kumpulkan Jawaban"
      const submitBtn = screen.getByRole('button', { name: /Kumpulkan Jawaban/ });
      expect(submitBtn).toBeDefined();

      fireEvent.click(submitBtn);
      expect(handleSubmit).toHaveBeenCalledWith(false);
    });

    it('allows navigating to any question directly via sticky navigation card without scrolling', () => {
      const handleQuestionSelect = vi.fn();
      render(
        <MultipleChoiceSection
          pgQuestions={mockPgQuestions}
          currentQuestion={1}
          currentQuestionData={mockPgQuestions[0]}
          answers={{ q1: 'A' }}
          handlePrevious={vi.fn()}
          handleNext={vi.fn()}
          handleFlag={vi.fn()}
          handleAnswer={vi.fn()}
          handleQuestionSelect={handleQuestionSelect}
          flaggedQuestions={[]}
          answeredQuestionsSet={new Set([1])}
          handleSubmit={vi.fn()}
          submitting={false}
          isAllAnswered={false}
        />
      );

      // Target question 2 in the desktop sidebar
      const navButtons = screen.getAllByRole('button', { name: /Nomor Soal 2/ });
      expect(navButtons.length).toBeGreaterThan(0);

      fireEvent.click(navButtons[0]);
      expect(handleQuestionSelect).toHaveBeenCalledWith(2);
    });

    it('wraps long unbroken text and options with break-words and overflow-wrap anywhere to prevent card overflow', () => {
      const longTextQuestion = {
        soal_kuis_id: 'q_long',
        teks_soal: 'soal_awdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
        pilihan_jawaban: {
          A: 'opsi_awdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
        },
      };

      const { container } = render(
        <MultipleChoiceSection
          pgQuestions={[longTextQuestion]}
          currentQuestion={1}
          currentQuestionData={longTextQuestion}
          answers={{}}
          handlePrevious={vi.fn()}
          handleNext={vi.fn()}
          handleFlag={vi.fn()}
          handleAnswer={vi.fn()}
          handleQuestionSelect={vi.fn()}
          flaggedQuestions={[]}
          answeredQuestionsSet={new Set()}
          handleSubmit={vi.fn()}
          submitting={false}
          isAllAnswered={false}
        />
      );

      // Verify column and card have min-w-0 max-w-full
      const leftCol = container.querySelector('.md\\:col-span-8');
      expect(leftCol.className).toContain('min-w-0');
      expect(leftCol.className).toContain('max-w-full');

      // Verify question text has break-words and anywhere wrapping classes
      const questionTextEl = screen.getByText(longTextQuestion.teks_soal);
      expect(questionTextEl.className).toContain('break-words');
      expect(questionTextEl.className).toContain('[overflow-wrap:anywhere]');

      // Verify option text has break-words and anywhere wrapping classes
      const optionTextEl = screen.getByText(longTextQuestion.pilihan_jawaban.A);
      expect(optionTextEl.className).toContain('break-words');
      expect(optionTextEl.className).toContain('[overflow-wrap:anywhere]');
    });
    it('renders mixed question types (PG, Pilihan Berbobot, TTS, Drag & Drop) in a single unified flow without separating into tabs/modals and allows submitting', () => {
      const mixedQuestions = [
        {
          soal_kuis_id: 'q_pg',
          tipe_soal: 'pilihan_ganda',
          teks_soal: 'Pertanyaan pilihan ganda nomor 1?',
          pilihan_jawaban: { A: 'Opsi A1', B: 'Opsi B1' },
        },
        {
          soal_kuis_id: 'q_weighted',
          tipe_soal: 'pilihan_berbobot',
          teks_soal: 'Pertanyaan pilihan berbobot nomor 2?',
          pilihan_jawaban: { A: 'Sangat Setuju', B: 'Setuju' },
        },
        {
          soal_kuis_id: 'q_dd',
          tipe_soal: 'drag_drop',
          teks_soal: 'ASN wajib menjaga [integritas] dalam bekerja.',
          pilihan_jawaban: ['integritas', 'egoisme'],
          jumlah_blank: 1,
        },
      ];

      const handleSubmit = vi.fn();
      const handleQuestionSelect = vi.fn();

      const { rerender } = render(
        <MultipleChoiceSection
          allQuestions={mixedQuestions}
          pgQuestions={mixedQuestions}
          currentQuestion={2}
          currentQuestionData={mixedQuestions[1]}
          answers={{ q_pg: 'A', q_weighted: 'A', q_dd: ['integritas'] }}
          handlePrevious={vi.fn()}
          handleNext={vi.fn()}
          handleFlag={vi.fn()}
          handleAnswer={vi.fn()}
          handleQuestionSelect={handleQuestionSelect}
          flaggedQuestions={[]}
          answeredQuestionsSet={new Set([1, 2, 3])}
          handleSubmit={handleSubmit}
          submitting={false}
          isAllAnswered={true}
        />
      );

      // Verify question navigation renders all 3 mixed questions in one unified navigator
      expect(screen.getAllByRole('button', { name: /Nomor Soal 1\b/ }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: /Nomor Soal 2\b/ }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: /Nomor Soal 3\b/ }).length).toBeGreaterThan(0);

      // Verify Weighted Question badge & options render on question 2
      expect(screen.getByText('Pilihan Berbobot')).toBeDefined();
      expect(screen.getByText('Sangat Setuju')).toBeDefined();

      // Switch to Question 3 (Drag & Drop) in the same page flow
      rerender(
        <MultipleChoiceSection
          allQuestions={mixedQuestions}
          pgQuestions={mixedQuestions}
          currentQuestion={3}
          currentQuestionData={mixedQuestions[2]}
          answers={{ q_pg: 'A', q_weighted: 'A', q_dd: ['integritas'] }}
          handlePrevious={vi.fn()}
          handleNext={vi.fn()}
          handleFlag={vi.fn()}
          handleAnswer={vi.fn()}
          handleQuestionSelect={handleQuestionSelect}
          flaggedQuestions={[]}
          answeredQuestionsSet={new Set([1, 2, 3])}
          handleSubmit={handleSubmit}
          submitting={false}
          isAllAnswered={true}
        />
      );

      expect(screen.getByText('Lengkapi Kalimat')).toBeDefined();

      // Verify "Kumpulkan Jawaban" submit button works across mixed questions
      const submitBtn = screen.getByRole('button', { name: /Kumpulkan Jawaban/ });
      fireEvent.click(submitBtn);
      expect(handleSubmit).toHaveBeenCalledWith(false);
    });
  });
});
