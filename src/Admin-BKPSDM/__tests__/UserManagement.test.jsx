// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockApiGet, mockApiPost, mockApiPut, mockToastFire, mockSwalFire } = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockApiPut: vi.fn(),
  mockToastFire: vi.fn(),
  mockSwalFire: vi.fn(() => Promise.resolve({ isConfirmed: false })),
}));

vi.mock('../../api/axios', () => ({
  default: {
    get: mockApiGet,
    post: mockApiPost,
    put: mockApiPut,
  },
}));

vi.mock('sweetalert2', () => ({
  default: {
    mixin: () => ({ fire: mockToastFire }),
    fire: mockSwalFire,
  },
}));

vi.mock('../../components/AdminLoadingSkeleton', () => ({
  default: () => <div data-testid="loading-skeleton">Memuat...</div>,
}));

vi.mock('../../components/AdminBkpsdmProfile', () => ({
  default: () => <div data-testid="admin-profile">Admin</div>,
}));

vi.mock('../../utils/auth', () => ({
  getUser: vi.fn(() => ({ pengguna_id: '1', peran: 'admin_bkpsdm', roles: ['admin_bkpsdm'] })),
  getActiveRole: vi.fn(() => 'admin_bkpsdm'),
  setActiveRole: vi.fn(),
  logout: vi.fn(),
}));

import UserManagement from '../UserManagement';

const sampleUsers = [
  {
    pengguna_id: 'u-1',
    nama_lengkap: 'Budi Komunitas',
    nip: '199001012020011001',
    email: 'budi@instansi.go.id',
    peran: 'admin_komunitas',
    roles: ['admin_komunitas'],
    jabatan: 'Analis SDM',
    rumpun_jabatan: 'JF',
    unit_kerja: 'BKPSDM',
    status: 'aktif',
    sudah_aktivasi: true,
  },
  {
    pengguna_id: 'u-2',
    nama_lengkap: 'Siti Sistem',
    nip: '199002022020012002',
    email: 'siti@instansi.go.id',
    peran: 'root',
    roles: ['root'],
    jabatan: 'Pranata Komputer',
    rumpun_jabatan: 'JF',
    unit_kerja: 'Diskominfo',
    status: 'aktif',
    sudah_aktivasi: false,
  },
];

const buildUsersResponse = (data = sampleUsers, metaOverrides = {}) => ({
  data: {
    message: 'Daftar Pengguna',
    data,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: data.length,
      from: data.length ? 1 : 0,
      to: data.length,
      ...metaOverrides,
    },
    stats: {
      total: 10,
      aktif: 8,
      admin_komunitas: 2,
      belum_aktivasi: 3,
    },
  },
});

describe('UserManagement role filter buttons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockImplementation((url) => {
      if (url === '/admin-bkpsdm/komunitas') {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve(buildUsersResponse());
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Belum Aktivasi and all 3 admin role filter buttons with aria-pressed="false"', async () => {
    render(<UserManagement onNavigate={vi.fn()} onLogout={vi.fn()} />);

    const belumBtn = await screen.findByRole('button', { name: 'Filter: Belum Aktivasi' });
    const komunitasBtn = screen.getByRole('button', { name: 'Filter: Admin Komunitas' });
    const bkpsdmBtn = screen.getByRole('button', { name: 'Filter: Admin BKPSDM' });
    const sistemBtn = screen.getByRole('button', { name: 'Filter: Admin Sistem' });

    expect(belumBtn.getAttribute('aria-pressed')).toBe('false');
    expect(komunitasBtn.getAttribute('aria-pressed')).toBe('false');
    expect(bkpsdmBtn.getAttribute('aria-pressed')).toBe('false');
    expect(sistemBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('supports single, multi-select admin role filters, combined Belum Aktivasi, and Reset Filter', async () => {
    render(<UserManagement onNavigate={vi.fn()} onLogout={vi.fn()} />);

    const komunitasBtn = await screen.findByRole('button', { name: 'Filter: Admin Komunitas' });
    fireEvent.click(komunitasBtn);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith(
        '/admin-bkpsdm/pengguna',
        expect.objectContaining({
          params: expect.objectContaining({ page: 1, per_page: 20, peran: 'admin_komunitas' }),
        })
      );
    });
    expect(screen.getByRole('button', { name: 'Filter Aktif: Admin Komunitas' }).getAttribute('aria-pressed')).toBe('true');

    const bkpsdmBtn = screen.getByRole('button', { name: 'Filter: Admin BKPSDM' });
    fireEvent.click(bkpsdmBtn);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith(
        '/admin-bkpsdm/pengguna',
        expect.objectContaining({
          params: expect.objectContaining({ page: 1, peran: 'admin_komunitas,admin_bkpsdm' }),
        })
      );
    });

    const belumBtn = screen.getByRole('button', { name: 'Filter: Belum Aktivasi' });
    fireEvent.click(belumBtn);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith(
        '/admin-bkpsdm/pengguna',
        expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            belum_aktivasi: 1,
            peran: 'admin_komunitas,admin_bkpsdm',
          }),
        })
      );
    });

    const resetBtn = screen.getByRole('button', { name: 'Reset Filter' });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      const lastPenggunaCall = mockApiGet.mock.calls
        .filter(([url]) => url === '/admin-bkpsdm/pengguna')
        .pop();
      expect(lastPenggunaCall[1].params).toEqual({ page: 1, per_page: 20 });
    });
  });

  it('shows accurate empty state with Reset Filter when filtered result is empty', async () => {
    mockApiGet.mockImplementation((url, config) => {
      if (url === '/admin-bkpsdm/komunitas') {
        return Promise.resolve({ data: { data: [] } });
      }
      if (config?.params?.peran === 'root') {
        return Promise.resolve(buildUsersResponse([]));
      }
      return Promise.resolve(buildUsersResponse());
    });

    render(<UserManagement onNavigate={vi.fn()} onLogout={vi.fn()} />);

    const sistemBtn = await screen.findByRole('button', { name: 'Filter: Admin Sistem' });
    fireEvent.click(sistemBtn);

    expect(
      await screen.findByText('Tidak ada pengguna yang sesuai dengan filter atau pencarian.')
    ).toBeTruthy();

    const resetButtons = screen.getAllByRole('button', { name: 'Reset Filter' });
    expect(resetButtons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(resetButtons[resetButtons.length - 1]);

    expect(await screen.findByText('Budi Komunitas')).toBeTruthy();
  });

  it('displays error state with retry button on fetch failure and ignores stale responses', async () => {
    let resolveSlowRequest;
    let callCount = 0;

    mockApiGet.mockImplementation((url, config) => {
      if (url === '/admin-bkpsdm/komunitas') {
        return Promise.resolve({ data: { data: [] } });
      }
      callCount += 1;
      if (config?.params?.peran === 'admin_komunitas') {
        return new Promise((resolve) => {
          resolveSlowRequest = resolve;
        });
      }
      if (config?.params?.peran === 'admin_komunitas,admin_bkpsdm') {
        return Promise.resolve(
          buildUsersResponse([
            {
              ...sampleUsers[0],
              pengguna_id: 'u-bkpsdm',
              nama_lengkap: 'Dewi BKPSDM',
              peran: 'admin_bkpsdm',
              roles: ['admin_bkpsdm'],
            },
          ])
        );
      }
      if (callCount >= 4) {
        return Promise.reject({ response: { data: { message: 'Server error 500' } } });
      }
      return Promise.resolve(buildUsersResponse());
    });

    render(<UserManagement onNavigate={vi.fn()} onLogout={vi.fn()} />);

    const komunitasBtn = await screen.findByRole('button', { name: 'Filter: Admin Komunitas' });
    fireEvent.click(komunitasBtn);

    const bkpsdmBtn = screen.getByRole('button', { name: 'Filter: Admin BKPSDM' });
    fireEvent.click(bkpsdmBtn);

    expect(await screen.findByText('Dewi BKPSDM')).toBeTruthy();

    // Resolve earlier slow request after newer one already succeeded; stale data must not overwrite
    resolveSlowRequest(
      buildUsersResponse([
        {
          ...sampleUsers[0],
          pengguna_id: 'u-stale',
          nama_lengkap: 'Stale Komunitas User',
        },
      ])
    );

    await waitFor(() => {
      expect(screen.queryByText('Stale Komunitas User')).toBeNull();
      expect(screen.getByText('Dewi BKPSDM')).toBeTruthy();
    });

    // Trigger error on next filter toggle
    const sistemBtn = screen.getByRole('button', { name: 'Filter: Admin Sistem' });
    fireEvent.click(sistemBtn);

    expect(await screen.findByText('Server error 500')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Coba Lagi' })).toBeTruthy();
  });

  it('opens Edit Pengguna modal with existing Unit Kerja and submits updated unit_kerja', async () => {
    const testUser = {
      ...sampleUsers[0],
      komunitas_id: 'k-1',
    };

    mockApiGet.mockImplementation((url) => {
      if (url === '/admin-bkpsdm/komunitas') {
        return Promise.resolve({ data: { data: [{ komunitas_id: 'k-1', nama_komunitas: 'Komunitas TI' }] } });
      }
      return Promise.resolve(buildUsersResponse([testUser]));
    });

    mockApiPut.mockResolvedValue({
      data: {
        message: 'Pengguna berhasil diperbarui',
        data: { ...testUser, unit_kerja: 'Dinas Sosial' },
      },
    });

    render(<UserManagement onNavigate={vi.fn()} onLogout={vi.fn()} />);

    expect(await screen.findByText('Budi Komunitas')).toBeTruthy();

    const editBtn = screen.getByTitle('Edit Pengguna');
    fireEvent.click(editBtn);

    expect(await screen.findByText('Edit Pengguna')).toBeTruthy();

    const unitKerjaInput = screen.getByPlaceholderText('Dinas Komunikasi dan Informatika');
    expect(unitKerjaInput.value).toBe('BKPSDM');

    fireEvent.change(unitKerjaInput, { target: { value: 'Dinas Sosial' } });
    expect(unitKerjaInput.value).toBe('Dinas Sosial');

    const updateBtn = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(mockApiPut).toHaveBeenCalledWith(
        '/admin-bkpsdm/pengguna/u-1',
        expect.objectContaining({
          unit_kerja: 'Dinas Sosial',
        })
      );
    });
  });
});
