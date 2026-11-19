// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import React from 'react';
import HelpCenter from '../HelpCenter';

vi.mock('../../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => {
      const map = {
        'helpCenter.formTitle': 'Formulir Keluhan',
        'helpCenter.formDesc': 'Sampaikan keluhan Anda.',
        'helpCenter.complaintType': 'Jenis Keluhan',
        'helpCenter.complaintTypePlaceholder': 'Pilih jenis keluhan',
        'helpCenter.complaintDesc': 'Deskripsi Keluhan',
        'helpCenter.complaintDescPlaceholder': 'Jelaskan secara detail masalah yang Anda alami...',
        'helpCenter.cat1Title': 'Akun & Login',
        'helpCenter.cat2Title': 'Pelatihan & Materi',
        'helpCenter.cat3Title': 'Sertifikat',
        'helpCenter.cat4Title': 'Kendala Teknis',
        'helpCenter.satisfaction': 'Tingkat Kepuasan Layanan Bantuan (Opsional)',
        'helpCenter.sendComplaint': 'Kirim Keluhan',
        'helpCenter.sending': 'Mengirim...',
        'helpCenter.formSuccess': 'Keluhan berhasil dikirim.',
      };
      return map[key] || key;
    },
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

import api from '../../api/axios';

describe('HelpCenter Complaint Form Validation', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows inline field validation errors without calling window.alert when submitting empty form', () => {
    render(<HelpCenter onNavigate={vi.fn()} />);

    const submitBtn = screen.getByRole('button', { name: 'Kirim Keluhan' });
    fireEvent.click(submitBtn);

    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.getByText('Silakan pilih jenis keluhan terlebih dahulu.')).toBeDefined();
    expect(screen.getByText('Silakan isi deskripsi keluhan secara detail.')).toBeDefined();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('shows specific description validation error when type is selected but description is empty or too short', () => {
    render(<HelpCenter onNavigate={vi.fn()} />);

    const selectEl = screen.getByLabelText(/Jenis Keluhan/i);
    const descEl = screen.getByLabelText(/Deskripsi Keluhan/i);
    const submitBtn = screen.getByRole('button', { name: 'Kirim Keluhan' });

    fireEvent.change(selectEl, { target: { value: 'teknis' } });
    fireEvent.click(submitBtn);

    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.queryByText('Silakan pilih jenis keluhan terlebih dahulu.')).toBeNull();
    expect(screen.getByText('Silakan isi deskripsi keluhan secara detail.')).toBeDefined();

    fireEvent.change(descEl, { target: { value: 'error' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/minimal 10 karakter/i)).toBeDefined();
  });

  it('submits valid complaint and displays inline success feedback without alert', async () => {
    api.post.mockResolvedValueOnce({ data: { message: 'OK' } });
    render(<HelpCenter onNavigate={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Jenis Keluhan/i), { target: { value: 'teknis' } });
    fireEvent.change(screen.getByLabelText(/Deskripsi Keluhan/i), {
      target: { value: 'Video pembelajaran tidak bisa diputar di halaman modul.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Keluhan' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/user/bantuan/tiket', {
        subjek: 'TEKNIS: Tiket Keluhan Baru',
        deskripsi: 'Video pembelajaran tidak bisa diputar di halaman modul.',
      });
      expect(screen.getByText('Keluhan berhasil dikirim.')).toBeDefined();
    });
    expect(window.alert).not.toHaveBeenCalled();
  });
});
