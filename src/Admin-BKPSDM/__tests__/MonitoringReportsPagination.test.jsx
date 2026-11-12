// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockApiGet, mockApiPost, mockSwalFire } = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockSwalFire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
}));

vi.mock('../../api/axios', () => ({
  default: {
    get: mockApiGet,
    post: mockApiPost,
  },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: mockSwalFire,
  },
}));

vi.mock('../../components/AdminLoadingSkeleton', () => ({
  default: () => <div data-testid="loading-skeleton">Loading...</div>,
}));

vi.mock('../../components/AdminBkpsdmProfile', () => ({
  default: () => <div data-testid="admin-profile">Admin</div>,
}));

vi.mock('../../utils/auth', () => ({
  logout: vi.fn(),
}));

import MonitoringReports from '../MonitoringReports';

const buildUlasanItems = (start, count) =>
  Array.from({ length: count }, (_, idx) => {
    const num = start + idx;
    return {
      ulasan_id: num,
      skor_rating: 5,
      teks_ulasan: `Ulasan peserta ${num}`,
      dikirim_pada: '2026-11-10T08:00:00Z',
      peserta: {
        pengguna_id: num,
        nama_lengkap: `Peserta Ulasan ${num}`,
        nip: `199001012020121${String(num).padStart(3, '0')}`,
        unit_kerja: 'BKPSDM',
      },
      pembelajaran: {
        pembelajaran_id: 10,
        judul_pembelajaran: 'Pelatihan Dasar',
        nama_komunitas: '-',
      },
    };
  });

const buildValidasiItems = (start, count) =>
  Array.from({ length: count }, (_, idx) => {
    const num = start + idx;
    return {
      id: num,
      sertifikat_id: `cert-${num}`,
      nomor_sertifikat: `800/${String(num).padStart(4, '0')}/XI/BKPSDM/2026`,
      ip_address: `10.0.0.${num}`,
      perangkat: 'Desktop',
      scanned_at: '2026-11-10T09:00:00Z',
      sertifikat: {
        verification_code: `CODE-${num}`,
        nama_lengkap_snapshot: `Penerima Validasi ${num}`,
        nip_snapshot: `199501012020121${String(num).padStart(3, '0')}`,
        pendaftaran: {
          pembelajaran: {
            judul_pembelajaran: 'Pelatihan QR',
          },
        },
      },
    };
  });

describe('MonitoringReports pagination (15 per page for Ulasan & Audit Validasi)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockApiGet.mockImplementation((url, config = {}) => {
      if (url === '/admin-bkpsdm/komunitas') {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url === '/admin-bkpsdm/laporan/peserta') {
        return Promise.resolve({
          data: {
            data: [],
            meta: { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 },
            stats: { total_peserta: 0, progres_rata_rata: 0, sertifikat_terbit: 0, tingkat_kelulusan: 0 },
          },
        });
      }
      if (url === '/admin-bkpsdm/laporan/ulasan') {
        const page = Number(config?.params?.page || 1);
        const rows = page === 1 ? buildUlasanItems(1, 15) : buildUlasanItems(16, 5);
        return Promise.resolve({
          data: {
            data: {
              stats: {
                total_ulasan: 20,
                rata_rata_rating: 4.8,
                persen_puas: 95,
                pelatihan_terulas: 3,
                distribusi: { 5: 18, 4: 1, 3: 1, 2: 0, 1: 0 },
              },
              ulasan: rows,
              meta: {
                current_page: page,
                last_page: 2,
                per_page: 15,
                total: 20,
                from: page === 1 ? 1 : 16,
                to: page === 1 ? 15 : 20,
              },
            },
          },
        });
      }
      if (url === '/admin-bkpsdm/riwayat-validasi-sertifikat') {
        const page = Number(config?.params?.page || 1);
        const rows = page === 1 ? buildValidasiItems(1, 15) : buildValidasiItems(16, 5);
        return Promise.resolve({
          data: {
            data: {
              data: rows,
              current_page: page,
              last_page: 2,
              per_page: 15,
              total: 20,
              from: page === 1 ? 1 : 16,
              to: page === 1 ? 15 : 20,
            },
            stats: { total_validasi: 20, sertifikat_unik: 8, validasi_hari_ini: 4 },
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('requests 15 items per page and paginates Ulasan & Evaluasi Mutu Pelatihan', async () => {
    render(<MonitoringReports onNavigate={vi.fn()} onLogout={vi.fn()} />);

    await screen.findByText(/Ulasan & Evaluasi Mutu Pelatihan/i);
    fireEvent.click(screen.getByRole('button', { name: /Ulasan & Evaluasi Mutu Pelatihan/i }));

    await screen.findByText('Peserta Ulasan 1');
    expect(screen.getByText('Peserta Ulasan 15')).toBeTruthy();
    expect(screen.queryByText('Peserta Ulasan 16')).toBeNull();
    expect(mockApiGet).toHaveBeenCalledWith('/admin-bkpsdm/laporan/ulasan', {
      params: { page: 1, per_page: 15 },
    });

    const nav = screen.getByRole('navigation', { name: /Navigasi halaman ulasan/i });
    expect(nav.textContent).toContain('1 - 15 dari 20 ulasan');

    fireEvent.click(screen.getByRole('button', { name: 'Halaman 2' }));

    await screen.findByText('Peserta Ulasan 16');
    expect(screen.queryByText('Peserta Ulasan 1')).toBeNull();
    expect(mockApiGet).toHaveBeenCalledWith('/admin-bkpsdm/laporan/ulasan', {
      params: { page: 2, per_page: 15 },
    });
    expect(nav.textContent).toContain('16 - 20 dari 20 ulasan');
  });

  it('requests 15 items per page and paginates Audit Validasi & Scan QR with page numbers', async () => {
    render(<MonitoringReports onNavigate={vi.fn()} onLogout={vi.fn()} />);

    await screen.findByText(/Audit Validasi & Scan QR/i);
    fireEvent.click(screen.getByRole('button', { name: /Audit Validasi & Scan QR/i }));

    await screen.findByText('Penerima Validasi 1');
    expect(screen.getByText('Penerima Validasi 15')).toBeTruthy();
    expect(screen.queryByText('Penerima Validasi 16')).toBeNull();
    expect(mockApiGet).toHaveBeenCalledWith('/admin-bkpsdm/riwayat-validasi-sertifikat', {
      params: { page: 1, per_page: 15 },
    });

    const nav = screen.getByRole('navigation', { name: /Navigasi halaman log scan/i });
    expect(nav.textContent).toContain('1 - 15 dari 20 log scan');

    fireEvent.click(screen.getByRole('button', { name: /Halaman log scan berikutnya/i }));

    await screen.findByText('Penerima Validasi 16');
    expect(screen.queryByText('Penerima Validasi 1')).toBeNull();
    expect(mockApiGet).toHaveBeenCalledWith('/admin-bkpsdm/riwayat-validasi-sertifikat', {
      params: { page: 2, per_page: 15 },
    });
    expect(nav.textContent).toContain('16 - 20 dari 20 log scan');
  });
});

