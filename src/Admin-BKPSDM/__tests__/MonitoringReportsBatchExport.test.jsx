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

describe('MonitoringReports KPK Batch Export (20 per batch)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-zip');
    window.URL.revokeObjectURL = vi.fn();

    mockApiGet.mockImplementation((url) => {
      if (url === '/admin-bkpsdm/komunitas') {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url === '/admin-bkpsdm/riwayat-validasi-sertifikat') {
        return Promise.resolve({
          data: {
            data: { data: [], current_page: 1, last_page: 1, total: 0 },
            stats: { total_validasi: 0, sertifikat_unik: 0, validasi_hari_ini: 0 },
          },
        });
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
      if (url === '/admin-bkpsdm/laporan/sertifikat/kpk-courses') {
        return Promise.resolve({
          data: {
            data: [
              {
                pembelajaran_id: 12,
                judul_pembelajaran: 'Kursus KPK Batch Uji',
                total_lulus: 50,
                total_pending_tte: 45,
                total_signed_tte: 5,
              },
              {
                pembelajaran_id: 13,
                judul_pembelajaran: 'Kursus KPK Ringkas 20',
                total_lulus: 20,
                total_pending_tte: 20,
                total_signed_tte: 0,
              },
            ],
          },
        });
      }
      if (url === '/admin-bkpsdm/laporan/sertifikat/export-kpk-zip') {
        return Promise.resolve({
          data: new Blob(['PKmockzip'], { type: 'application/zip' }),
          headers: {
            'content-disposition': 'attachment; filename="Sertifikat_KPK_Kursus_12_Batch_2_dari_3_20261112.zip"',
            'x-total-exported': '20',
            'x-batch-number': '2',
            'x-total-batches': '3',
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('membagi 45 berkas menjadi 3 batch (20, 20, 5) dan mengirim batch_size=20 saat ekspor', async () => {
    render(<MonitoringReports />);

    const openBtn = await screen.findByText('Export Sertifikat KPK (.ZIP)');
    fireEvent.click(openBtn);

    // 45 + 20 = 65 total pending across "all" courses initially -> 4 batches (20, 20, 20, 5)
    await screen.findByText('Ekspor per Batch 20 Berkas');
    expect(screen.getByText('Total: 65 Berkas (4 Batch)')).toBeTruthy();

    // Pilih kursus ID 12 (45 pending -> 3 batch: 1-20, 21-40, 41-45)
    const select = screen.getByLabelText('Pilih Kursus KPK');
    fireEvent.change(select, { target: { value: '12' } });

    expect(screen.getByText('Total: 45 Berkas (3 Batch)')).toBeTruthy();
    expect(screen.getByText('1-20 (20 berkas)')).toBeTruthy();
    expect(screen.getByText('21-40 (20 berkas)')).toBeTruthy();
    expect(screen.getByText('41-45 (5 berkas)')).toBeTruthy();
    expect(screen.getByText('Unduh Batch 1 (20 Berkas .ZIP)')).toBeTruthy();

    // Pilih Batch 2
    fireEvent.click(screen.getByText('21-40 (20 berkas)').closest('button'));
    expect(screen.getByText('Unduh Batch 2 (20 Berkas .ZIP)')).toBeTruthy();

    // Pilih Batch 3
    fireEvent.click(screen.getByText('41-45 (5 berkas)').closest('button'));
    expect(screen.getByText('Unduh Batch 3 (5 Berkas .ZIP)')).toBeTruthy();

    // Kembali ke Batch 2 lalu unduh
    fireEvent.click(screen.getByText('21-40 (20 berkas)').closest('button'));
    fireEvent.click(screen.getByText('Unduh Batch 2 (20 Berkas .ZIP)').closest('button'));

    await waitFor(() => {
      const exportCall = mockApiGet.mock.calls.find(
        ([url]) => url === '/admin-bkpsdm/laporan/sertifikat/export-kpk-zip'
      );
      expect(exportCall).toBeTruthy();
      expect(exportCall[1].params).toEqual({
        format: 'nip',
        scope: 'pending_tte',
        batch_size: 20,
        batch_number: 2,
        pembelajaran_id: '12',
      });
      expect(exportCall[1].timeout).toBe(300000);
    });

    // Memastikan tabel laporan di-refresh setelah ekspor
    await waitFor(() => {
      const pesertaCalls = mockApiGet.mock.calls.filter(
        ([url]) => url === '/admin-bkpsdm/laporan/peserta'
      );
      expect(pesertaCalls.length).toBeGreaterThanOrEqual(2);
    });

    expect(mockSwalFire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ekspor Berhasil',
        icon: 'success',
      })
    );
  });

  it('menampilkan ringkasan <= 20 berkas otomatis 1 batch saat total berkas <= 20 dan menutup modal dengan Escape', async () => {
    render(<MonitoringReports />);

    const openBtn = await screen.findByText('Export Sertifikat KPK (.ZIP)');
    fireEvent.click(openBtn);

    await screen.findByText('Ekspor per Batch 20 Berkas');
    const select = screen.getByLabelText('Pilih Kursus KPK');
    fireEvent.change(select, { target: { value: '13' } });

    expect(screen.getByText('Aturan 20/Batch')).toBeTruthy();
    expect(screen.getByText('Unduh 20 Berkas .ZIP')).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('mengirim batch_number="all" ketika admin memilih mode Ekspor Sekaligus Seluruh Berkas', async () => {
    render(<MonitoringReports />);

    const openBtn = await screen.findByText('Export Sertifikat KPK (.ZIP)');
    fireEvent.click(openBtn);

    await screen.findByText('Ekspor per Batch 20 Berkas');
    const select = screen.getByLabelText('Pilih Kursus KPK');
    fireEvent.change(select, { target: { value: '12' } });

    const allScopeRadio = screen.getByRole('radio', { name: /Semua Peserta Lulus/i });
    fireEvent.click(allScopeRadio);
    expect(screen.getByText('Total: 50 Berkas (3 Batch)')).toBeTruthy();

    const nipSignRadio = screen.getByRole('radio', { name: /\[NIP\]_sign\.pdf/i });
    fireEvent.click(nipSignRadio);

    const allModeRadio = screen.getByRole('radio', { name: /Ekspor Sekaligus Seluruh Berkas/i });
    fireEvent.click(allModeRadio);

    const downloadBtn = screen.getByText('Unduh 50 Berkas .ZIP').closest('button');
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      const exportCall = mockApiGet.mock.calls.find(
        ([url]) => url === '/admin-bkpsdm/laporan/sertifikat/export-kpk-zip'
      );
      expect(exportCall).toBeTruthy();
      expect(exportCall[1].params).toEqual({
        format: 'nip_sign',
        scope: 'all',
        batch_size: 20,
        batch_number: 'all',
        pembelajaran_id: '12',
      });
    });
  });

  it('menutup modal saat tombol Tutup (X) atau Batal diklik', async () => {
    render(<MonitoringReports />);

    fireEvent.click(await screen.findByText('Export Sertifikat KPK (.ZIP)'));
    await screen.findByRole('dialog');

    fireEvent.click(screen.getByLabelText('Tutup modal ekspor sertifikat KPK'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    fireEvent.click(screen.getByText('Export Sertifikat KPK (.ZIP)'));
    await screen.findByRole('dialog');

    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
