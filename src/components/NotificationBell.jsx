import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import Swal from 'sweetalert2';
import NotificationDropdown from './NotificationDropdown';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
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

  const containerRef = useRef(null);

  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const count = await fetchUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Abaikan jika gagal mengambil unread count sementara
    }
  }, []);

  const loadNotifications = useCallback(async (page = 1, append = false) => {
    if (!isAuthenticated()) return;
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const res = await fetchNotifications(page, 15);
      const items = Array.isArray(res?.data) ? res.data : [];
      const meta = res?.meta || {};

      setNotifications((prev) => (append ? [...prev, ...items] : items));
      setUnreadCount(Number(meta.unread_count ?? 0));
      setCurrentPage(Number(meta.current_page ?? page));
      setLastPage(Number(meta.last_page ?? 1));
    } catch {
      // Abaikan error sementara
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Sinkronisasi awal token FCM (jika izin sudah granted) & polling ringan unread count
  useEffect(() => {
    if (!isAuthenticated()) return;

    setPermissionState(getNotificationPermissionState());
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
  }, [isOpen, loadNotifications, loadUnreadCount]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    } catch {
      // Abaikan jika gagal
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      const nowIso = new Date().toISOString();
      setNotifications((prev) => prev.map((item) => ({ ...item, read_at: item.read_at || nowIso })));
      setUnreadCount(0);
    } catch {
      // Abaikan jika gagal
    }
  };

  const handleNavigateFromPayload = (data = {}, fallbackUrl = '') => {
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
        type="button"
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-600 hover:text-[#006A63] hover:bg-gray-100 rounded-full transition-colors focus:outline-none cursor-pointer"
        title="Notifikasi"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          permissionState={permissionState}
          enablingPush={enablingPush}
          onEnablePush={handleEnablePush}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onSelectNotification={handleSelectNotification}
          hasMore={currentPage < lastPage}
          loadingMore={loadingMore}
          onLoadMore={() => loadNotifications(currentPage + 1, true)}
        />
      )}
    </div>
  );
}

