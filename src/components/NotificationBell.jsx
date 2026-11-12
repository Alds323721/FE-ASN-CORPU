import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { Bell } from 'lucide-react';
import Swal from 'sweetalert2';
import NotificationDropdown from './NotificationDropdown';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../services/notificationService';
import {
  getNotificationPermissionState,
  requestPermissionAndRegisterToken,
  syncExistingPermissionToken,
  subscribeForegroundMessages,
} from '../services/pushNotificationService';
import { isAuthenticated } from '../utils/auth';

export default function NotificationBell({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [permissionState, setPermissionState] = useState(() => getNotificationPermissionState());
  const [enablingPush, setEnablingPush] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const bellButtonRef = useRef(null);
  const dropdownId = useId();

  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const count = await fetchUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Abaikan kegagalan polling latar belakang agar tidak mengganggu UI utama
    }
  }, []);

  const loadNotifications = useCallback(async (page = 1, append = false) => {
    if (!isAuthenticated()) return;
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const res = await fetchNotifications(page, 15);
      const items = Array.isArray(res?.data) ? res.data : [];
      const meta = res?.meta || {};

      setNotifications((prev) => (append ? [...prev, ...items] : items));
      setUnreadCount(Number(meta.unread_count ?? 0));
      setCurrentPage(Number(meta.current_page ?? page));
      setLastPage(Number(meta.last_page ?? 1));
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Gagal memuat riwayat notifikasi. Periksa koneksi Anda lalu coba lagi.';
      if (append) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: message,
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleNavigateFromPayload = useCallback((data = {}, fallbackUrl = '') => {
    const pembelajaranId = data?.pembelajaran_id || data?.module_id;
    const route = data?.route || '';
    const url = data?.url || fallbackUrl || '';

    if (pembelajaranId) {
      if (route === 'detail-kursus' || url.includes('/admin-komunitas/detail-kursus')) {
        localStorage.setItem('adminKomunitasCourseId', String(pembelajaranId));
      } else if (route === 'course-review' || url.includes('/admin/course-validation')) {
        localStorage.setItem('reviewCourseId', String(pembelajaranId));
      } else {
        localStorage.setItem('userCourseId', String(pembelajaranId));
      }
    }

    if (typeof onNavigate === 'function') {
      if (route) {
        onNavigate(route);
        return;
      }
      if (url === '/admin-komunitas/detail-kursus') {
        onNavigate('detail-kursus');
        return;
      }
      if (url === '/admin/course-validation') {
        onNavigate('course-validation');
        return;
      }
      if (url === '/certificates') {
        onNavigate('certificates');
        return;
      }
      if (url === '/course-detail') {
        onNavigate('course-detail');
        return;
      }
    }

    if (url && url.startsWith('/')) {
      window.location.href = url;
    }
  }, [onNavigate]);

  // Sinkronisasi awal token FCM (jika izin sudah granted) & polling ringan unread count
  useEffect(() => {
    if (!isAuthenticated()) return;

    syncExistingPermissionToken();
    loadUnreadCount();

    const intervalId = setInterval(() => {
      loadUnreadCount();
    }, 45000);

    return () => clearInterval(intervalId);
  }, [loadUnreadCount]);

  // Foreground FCM message handler & Service Worker click bridge
  useEffect(() => {
    if (!isAuthenticated()) return;

    let unsubscribe = () => {};
    let isMounted = true;

    subscribeForegroundMessages((payload) => {
      if (!isMounted) return;
      const title =
        payload?.notification?.title ||
        payload?.data?.title ||
        'Notifikasi Baru';
      const body =
        payload?.notification?.body ||
        payload?.data?.body ||
        '';

      loadUnreadCount();
      if (isOpen) {
        loadNotifications(1, false);
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title,
        text: body,
        timer: 4500,
        showConfirmButton: false,
      });
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    const handleSwMessage = (event) => {
      if (event.data?.type === 'FCM_NOTIFICATION_CLICK') {
        handleNavigateFromPayload(event.data?.data || {}, event.data?.url);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, [isOpen, loadNotifications, loadUnreadCount, handleNavigateFromPayload]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (event.target?.closest?.('.swal2-container')) return;
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (document.querySelector('.swal2-container')) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
        bellButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleCloseDropdown = () => {
    setIsOpen(false);
    bellButtonRef.current?.focus();
  };

  const handleToggleDropdown = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    setPermissionState(getNotificationPermissionState());
    if (nextOpen) {
      loadNotifications(1, false);
    }
  };

  const handleEnablePush = async () => {
    setEnablingPush(true);
    try {
      const result = await requestPermissionAndRegisterToken();
      setPermissionState(getNotificationPermissionState());
      if (result.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Notifikasi Diaktifkan',
          text: 'Perangkat ini siap menerima push notification.',
          timer: 3000,
          showConfirmButton: false,
        });
      } else if (result.message) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: 'Notifikasi Belum Aktif',
          text: result.message,
          timer: 3500,
          showConfirmButton: false,
        });
      }
    } finally {
      setEnablingPush(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? { ...item, read_at: res?.data?.read_at || new Date().toISOString() }
            : item
        )
      );
      if (res?.meta?.unread_count !== undefined) {
        setUnreadCount(Number(res.meta.unread_count));
      } else {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: err?.response?.data?.message || 'Gagal menandai notifikasi sudah dibaca',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      const nowIso = new Date().toISOString();
      setNotifications((prev) => prev.map((item) => ({ ...item, read_at: item.read_at || nowIso })));
      setUnreadCount(0);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: err?.response?.data?.message || 'Gagal menandai semua notifikasi dibaca',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    setDeletingId(notificationId);
    try {
      const res = await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
      if (res?.meta?.unread_count !== undefined) {
        setUnreadCount(Number(res.meta.unread_count));
      } else {
        loadUnreadCount();
      }
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Notifikasi dihapus',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: error.response?.data?.message || 'Gagal menghapus notifikasi',
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) return;

    const result = await Swal.fire({
      title: 'Hapus Semua Notifikasi?',
      text: 'Seluruh riwayat notifikasi Anda akan dihapus secara permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus Semua',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Semua notifikasi berhasil dihapus',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: error.response?.data?.message || 'Gagal menghapus notifikasi',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const handleSelectNotification = async (item) => {
    if (!item.read_at) {
      await handleMarkAsRead(item.id);
    }
    setIsOpen(false);
    handleNavigateFromPayload(item.data || {}, item.data?.url);
  };

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        ref={bellButtonRef}
        type="button"
        onClick={handleToggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={isOpen ? dropdownId : undefined}
        className="relative min-h-11 min-w-11 inline-flex items-center justify-center p-2.5 text-gray-700 hover:text-[#006A63] hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006A63] focus-visible:ring-offset-2 cursor-pointer"
        title="Notifikasi"
        aria-label={unreadCount > 0 ? `Notifikasi (${unreadCount} belum dibaca)` : 'Notifikasi'}
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          id={dropdownId}
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          error={error}
          permissionState={permissionState}
          enablingPush={enablingPush}
          deletingId={deletingId}
          onClose={handleCloseDropdown}
          onRetry={() => loadNotifications(1, false)}
          onEnablePush={handleEnablePush}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDeleteNotification={handleDeleteNotification}
          onDeleteAllNotifications={handleDeleteAllNotifications}
          onSelectNotification={handleSelectNotification}
          hasMore={currentPage < lastPage}
          loadingMore={loadingMore}
          onLoadMore={() => loadNotifications(currentPage + 1, true)}
        />
      )}
    </div>
  );
}

