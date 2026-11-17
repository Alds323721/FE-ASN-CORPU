// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import PostTest from '../PostTest';

// Mock dependencies
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}));

vi.mock('../../components/ProfileDropdown', () => ({
  default: () => <div data-testid="profile-dropdown" />,
}));

vi.mock('../../components/LanguageDropdown', () => ({
  default: () => <div data-testid="language-dropdown" />,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  },
}));

import api from '../../api/axios';

describe('PostTest Sticky Question Navigation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('userCourseId', 'course-test-123');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockPostTestData = {
    judul_pembelajaran: 'Pelatihan Manajemen ASN',
    durasi_menit: 30,
    maks_percobaan: 3,
    soal: [
      {
        soal_post_test_id: 'pt-1',
        teks_soal: 'Soal nomor satu post test dengan uraian cukup panjang untuk menguji sticky navigation?',
        pilihan_jawaban: {
          A: 'Pilihan jawaban pertama yang panjang dan rinci',
          B: 'Pilihan jawaban kedua',
          C: 'Pilihan jawaban ketiga',
          D: 'Pilihan jawaban keempat',
        },
      },
      {
        soal_post_test_id: 'pt-2',
        teks_soal: 'Soal nomor dua post test?',
        pilihan_jawaban: {
          A: 'Jawaban A',
          B: 'Jawaban B',
        },
      },
      {
        soal_post_test_id: 'pt-3',
        teks_soal: 'Soal nomor tiga post test?',
        pilihan_jawaban: {
          A: 'Jawaban A3',
          B: 'Jawaban B3',
        },
      },
    ],
  };

  it('renders PostTest with sticky sidebar (md:sticky, md:top-20, md:self-start) and mobile sticky bar', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: mockPostTestData,
      },
    });

    const { container } = render(<PostTest onNavigate={vi.fn()} onBack={vi.fn()} />);

    // Wait until questions are loaded
    await waitFor(() => {
      expect(screen.getByText(/Pertanyaan 1/)).toBeDefined();
    });

    // Check sticky sidebar container
    const stickySidebar = container.querySelector('.md\\:sticky');
    expect(stickySidebar).toBeDefined();
    expect(stickySidebar.className).toContain('md:sticky');
    expect(stickySidebar.className).toContain('md:top-20');
    expect(stickySidebar.className).toContain('md:self-start');
    expect(stickySidebar.className).toContain('z-20');

    // Check mobile sticky quick bar
    const mobileBar = container.querySelector('.md\\:hidden.sticky');
    expect(mobileBar).toBeDefined();
    expect(mobileBar.className).toContain('top-[65px]');
    expect(mobileBar.className).toContain('z-30');

    // Check QuestionNavigation renders question numbers 1, 2, 3
    const q1Buttons = screen.getAllByRole('button', { name: /Nomor Soal 1\b/ });
    expect(q1Buttons.length).toBeGreaterThan(0);
    const q2Buttons = screen.getAllByRole('button', { name: /Nomor Soal 2\b/ });
    expect(q2Buttons.length).toBeGreaterThan(0);
  });

  it('allows jumping between questions via navigation and tracks answered status accurately', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: mockPostTestData,
      },
    });

    render(<PostTest onNavigate={vi.fn()} onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Pertanyaan 1/)).toBeDefined();
    });

    // Answer Question 1
    const optionA = screen.getByText('Pilihan jawaban pertama yang panjang dan rinci');
    fireEvent.click(optionA);

    // Navigate to Question 2 via sticky navigation
    const q2Buttons = screen.getAllByRole('button', { name: /Nomor Soal 2\b/ });
    fireEvent.click(q2Buttons[0]);

    // Question 2 should now be displayed
    await waitFor(() => {
      expect(screen.getByText(/Pertanyaan 2/)).toBeDefined();
    });

    // Question 1 should now be recorded as answered in the status indicator
    expect(screen.getAllByText(/1\/3/).length).toBeGreaterThan(0);
  });

  it('transitions from "Selanjutnya" to "Kumpulkan Jawaban" when all questions are answered', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: mockPostTestData,
      },
    });

    render(<PostTest onNavigate={vi.fn()} onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Pertanyaan 1/)).toBeDefined();
    });

    // Initially button says "Selanjutnya"
    expect(screen.getByText('Selanjutnya')).toBeDefined();
    expect(screen.queryByText('Kumpulkan Jawaban')).toBeNull();

    // Answer Q1
    fireEvent.click(screen.getByText('Pilihan jawaban pertama yang panjang dan rinci'));

    // Move to Q2 and answer it
    fireEvent.click(screen.getByText('Selanjutnya'));
    await waitFor(() => expect(screen.getByText(/Pertanyaan 2/)).toBeDefined());
    fireEvent.click(screen.getByText('Jawaban A'));

    // Move to Q3 and answer it
    fireEvent.click(screen.getByText('Selanjutnya'));
    await waitFor(() => expect(screen.getByText(/Pertanyaan 3/)).toBeDefined());
    fireEvent.click(screen.getByText('Jawaban A3'));

    // Now all 3 questions are answered! The button should change to "Kumpulkan Jawaban"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Kumpulkan Jawaban/ })).toBeDefined();
    });
  });
});
