// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
  mockFetchNotifications,
  mockFetchUnreadCount,
  mockMarkAsRead,
  mockMarkAllAsRead,
  mockDeleteNotification,
  mockDeleteAllNotifications,
  mockGetPermissionState,
  mockRequestPermission,
  mockSyncToken,
  mockSubscribeForeground,
  mockSwalFire,
} = vi.hoisted(() => ({
  mockFetchNotifications: vi.fn(),
  mockFetchUnreadCount: vi.fn(),
  mockMarkAsRead: vi.fn(),
  mockMarkAllAsRead: vi.fn(),
  mockDeleteNotification: vi.fn(),
  mockDeleteAllNotifications: vi.fn(),
  mockGetPermissionState: vi.fn(() => 'default'),
  mockRequestPermission: vi.fn(),
  mockSyncToken: vi.fn(),
  mockSubscribeForeground: vi.fn(() => Promise.resolve(() => {})),
  mockSwalFire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
}));

vi.mock('../../services/notificationService', () => ({
  fetchNotifications: mockFetchNotifications,
  fetchUnreadNotificationCount: mockFetchUnreadCount,
  markNotificationAsRead: mockMarkAsRead,
  markAllNotificationsAsRead: mockMarkAllAsRead,
  deleteNotification: mockDeleteNotification,
  deleteAllNotifications: mockDeleteAllNotifications,
}));

vi.mock('../../services/pushNotificationService', () => ({
  getNotificationPermissionState: mockGetPermissionState,
  requestPermissionAndRegisterToken: mockRequestPermission,
  syncExistingPermissionToken: mockSyncToken,
  subscribeForegroundMessages: mockSubscribeForeground,
}));

vi.mock('../../utils/auth', () => ({
  isAuthenticated: vi.fn(() => true),
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: mockSwalFire,
  },
}));

import NotificationBell from '../NotificationBell';

const sampleNotification = {
  id: 101,
  type: 'module_approved',
  title: 'Pengajuan Modul Disetujui',
  body: 'Pengajuan kursus "Test Semeton" telah disetujui dan dipublikasikan oleh Admin BKPSDM.',
  created_at: new Date().toISOString(),
  read_at: null,
  data: { url: '/course-detail', route: 'course-detail', pembelajaran_id: 55 },
};

describe('NotificationBell & NotificationDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPermissionState.mockReturnValue('default');
    mockFetchUnreadCount.mockResolvedValue(1);
    mockFetchNotifications.mockResolvedValue({
      data: [sampleNotification],
      meta: { unread_count: 1, current_page: 1, last_page: 1 },
    });
    mockMarkAsRead.mockResolvedValue({ data: { read_at: new Date().toISOString() }, meta: { unread_count: 0 } });
    mockMarkAllAsRead.mockResolvedValue({});
    mockDeleteNotification.mockResolvedValue({ meta: { unread_count: 0 } });
    mockDeleteAllNotifications.mockResolvedValue({});
    mockRequestPermission.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    cleanup();
  });

  it('opens accessible dialog, closes via Escape and close button, and caps unread label at 99+', async () => {
    mockFetchUnreadCount.mockResolvedValue(120);
    mockFetchNotifications.mockResolvedValue({
      data: [sampleNotification],
      meta: { unread_count: 120, current_page: 1, last_page: 1 },
    });

    render(<NotificationBell onNavigate={vi.fn()} />);

    const bellButton = await screen.findByRole('button', { name: /notifikasi \(120 belum dibaca\)/i });
    expect(bellButton.getAttribute('aria-expanded')).toBe('false');
    expect(bellButton.getAttribute('aria-haspopup')).toBe('dialog');

    fireEvent.click(bellButton);
    expect(bellButton.getAttribute('aria-expanded')).toBe('true');

    expect(await screen.findByRole('dialog', { name: /notifikasi/i })).toBeTruthy();
    await screen.findByText('Pengajuan Modul Disetujui');
    expect(screen.getByText('99+ Baru')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(bellButton);

    fireEvent.click(bellButton);
    await screen.findByRole('dialog', { name: /notifikasi/i });
    fireEvent.click(screen.getByRole('button', { name: /tutup panel notifikasi/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(bellButton);
  });

  it('renders error state with retry button and recovers when retried', async () => {
    mockFetchNotifications
      .mockRejectedValueOnce({ response: { data: { message: 'Koneksi bermasalah' } } })
      .mockResolvedValueOnce({
        data: [sampleNotification],
        meta: { unread_count: 1, current_page: 1, last_page: 1 },
      });

    render(<NotificationBell onNavigate={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: /notifikasi/i }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Gagal memuat notifikasi');
    expect(alert.textContent).toContain('Koneksi bermasalah');

    fireEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    await screen.findByText('Pengajuan Modul Disetujui');
  });

  it('renders empty state and denied push notice when applicable', async () => {
    mockGetPermissionState.mockReturnValue('denied');
    mockFetchUnreadCount.mockResolvedValue(0);
    mockFetchNotifications.mockResolvedValue({
      data: [],
      meta: { unread_count: 0, current_page: 1, last_page: 1 },
    });

    render(<NotificationBell onNavigate={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: /notifikasi/i }));

    await screen.findByText('Belum ada notifikasi');
    expect(screen.getByText(/izin web push diblokir di browser/i)).toBeTruthy();
  });

  it('operates all interactive controls: enable push, mark read, mark all, delete item, delete all, load more, and navigate', async () => {
    const onNavigate = vi.fn();
    mockFetchNotifications
      .mockResolvedValueOnce({
        data: [sampleNotification],
        meta: { unread_count: 1, current_page: 1, last_page: 2 },
      })
      .mockResolvedValueOnce({
        data: [
          {
            ...sampleNotification,
            id: 102,
            title: 'Sertifikat Terbit',
            read_at: new Date().toISOString(),
          },
        ],
        meta: { unread_count: 1, current_page: 2, last_page: 2 },
      });

    render(<NotificationBell onNavigate={onNavigate} />);

    fireEvent.click(await screen.findByRole('button', { name: /notifikasi/i }));
    await screen.findByText('Pengajuan Modul Disetujui');

    fireEvent.click(screen.getByRole('button', { name: /aktifkan notifikasi/i }));
    await waitFor(() => expect(mockRequestPermission).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /muat lebih banyak/i }));
    await screen.findByText('Sertifikat Terbit');
    expect(mockFetchNotifications).toHaveBeenCalledWith(2, 15);

    fireEvent.click(screen.getByRole('button', { name: /tandai semua dibaca/i }));
    await waitFor(() => expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /hapus notifikasi sertifikat terbit/i }));
    await waitFor(() => expect(mockDeleteNotification).toHaveBeenCalledWith(102));
    await waitFor(() => expect(screen.queryByText('Sertifikat Terbit')).toBeNull());

    fireEvent.click(screen.getByRole('button', { name: /buka/i }));
    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('course-detail'));

    fireEvent.click(await screen.findByRole('button', { name: /notifikasi/i }));
    await screen.findByRole('button', { name: /hapus semua notifikasi/i });
    fireEvent.click(screen.getByRole('button', { name: /hapus semua notifikasi/i }));
    await waitFor(() => expect(mockDeleteAllNotifications).toHaveBeenCalledTimes(1));
  });
});
