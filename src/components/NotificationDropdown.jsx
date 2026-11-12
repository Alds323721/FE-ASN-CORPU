import React, { useId } from 'react';
import {
  AlertCircle,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Award,
  BookOpen,
  CheckCircle2,
  X,
  XCircle,
  Info,
  Trash2,
  Loader2,
} from 'lucide-react';

const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'module_approved':
    case 'access_approved':
      return <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />;
    case 'module_rejected':
    case 'access_rejected':
      return <XCircle className="w-4 h-4 text-red-700 shrink-0" aria-hidden="true" />;
    case 'certificate_issued':
      return <Award className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />;
    case 'course_published':
    case 'module_submitted':
      return <BookOpen className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />;
    default:
      return <Info className="w-4 h-4 text-[#1D315F] shrink-0" aria-hidden="true" />;
  }
};

export default function NotificationDropdown({
  id,
  notifications,
  unreadCount,
  loading,
  error,
  permissionState,
  enablingPush,
  deletingId,
  onClose,
  onRetry,
  onEnablePush,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onDeleteAllNotifications,
  onSelectNotification,
  hasMore,
  onLoadMore,
  loadingMore,
}) {
  const headingId = useId();
  const hasBulkActions = unreadCount > 0 || notifications.length > 0;

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={headingId}
      className="fixed inset-x-3 top-[4.25rem] sm:inset-x-auto sm:absolute sm:right-0 sm:top-full sm:mt-2.5 sm:w-[420px] sm:max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-200 z-[80] overflow-hidden"
    >
      <div className="px-4 py-3 bg-[#F4F8FB] border-b border-gray-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 id={headingId} className="text-sm font-bold text-[#1D315F]">
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold bg-[#006A63] text-white rounded-full shrink-0">
                {unreadCount > 99 ? '99+' : unreadCount} Baru
              </span>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup panel notifikasi"
              title="Tutup"
              className="min-h-11 min-w-11 lg:min-h-8 lg:min-w-8 inline-flex items-center justify-center rounded-lg text-gray-600 hover:text-[#1D315F] hover:bg-gray-200/70 active:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006A63] shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {hasBulkActions && (
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-200/80">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="min-h-11 lg:min-h-8 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#006A63] hover:text-[#00534D] hover:bg-teal-50 active:bg-teal-100 inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006A63]"
              >
                <CheckCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Tandai semua dibaca</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onDeleteAllNotifications}
                aria-label="Hapus semua notifikasi"
                className="min-h-11 lg:min-h-8 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Hapus semua</span>
              </button>
            )}
          </div>
        )}
      </div>

      {permissionState === 'default' && (
        <div className="px-4 py-3 bg-teal-50/80 border-b border-teal-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <BellRing className="w-4 h-4 text-[#006A63] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-teal-900 leading-snug font-medium">
              Aktifkan notifikasi browser agar info persetujuan modul & sertifikat langsung muncul di perangkat Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onEnablePush}
            disabled={enablingPush}
            className="min-h-11 lg:min-h-9 w-full sm:w-auto px-3 py-2 bg-[#006A63] hover:bg-[#00534D] active:bg-[#00443F] disabled:opacity-60 text-white text-xs font-bold rounded-lg shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006A63] focus-visible:ring-offset-2"
          >
            {enablingPush ? 'Memproses...' : 'Aktifkan Notifikasi'}
          </button>
        </div>
      )}

      {permissionState === 'denied' && (
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-800">
          Izin Web Push diblokir di browser. Notifikasi tetap tersimpan dan dapat dilihat pada daftar di bawah.
        </div>
      )}

      <div className="max-h-[min(24rem,calc(100dvh-13rem))] overflow-y-auto">
        {loading ? (
          <div
            role="status"
            className="p-6 text-center text-xs text-gray-600 font-medium flex items-center justify-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none text-[#006A63]" aria-hidden="true" />
            <span>Memuat riwayat notifikasi...</span>
          </div>
        ) : error ? (
          <div role="alert" className="p-6 text-center flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-700" aria-hidden="true" />
            <p className="text-xs font-semibold text-gray-800">Gagal memuat notifikasi</p>
            <p className="text-xs text-gray-600 leading-relaxed">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-1 min-h-11 lg:min-h-9 px-3.5 py-2 rounded-lg bg-[#006A63] hover:bg-[#00534D] active:bg-[#00443F] text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006A63] focus-visible:ring-offset-2"
              >
                Coba Lagi
              </button>
            )}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Bell className="w-9 h-9 mb-2 text-gray-500" aria-hidden="true" />
            <p className="text-xs font-semibold text-gray-700">Belum ada notifikasi</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Pemberitahuan kursus, persetujuan modul, dan sertifikat akan tampil di sini.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((item) => {
              const isUnread = !item.read_at;
              return (
                <li
                  key={item.id}
                  className={`px-4 py-3 transition-colors ${
                    isUnread ? 'bg-teal-50/40 hover:bg-teal-50/80' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-gray-200 shrink-0">
                      {getTypeIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectNotification(item)}
                          className="text-left flex-1 min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006A63] focus-visible:ring-offset-1 group"
                        >
                          <span
                            className={`block text-xs leading-snug group-hover:underline ${
                              isUnread ? 'font-bold text-[#1D315F]' : 'font-semibold text-gray-800'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="block text-xs text-gray-700 mt-1 leading-relaxed line-clamp-3 font-normal">
                            {item.body}
                          </span>
                        </button>

                        <div className="flex items-center gap-1 shrink-0 -mt-1">
                          {isUnread && (
                            <span
                              className="w-2 h-2 rounded-full bg-[#006A63] shrink-0"
                              title="Belum dibaca"
                            >
                              <span className="sr-only">Belum dibaca</span>
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => onDeleteNotification(item.id)}
                            className="min-h-11 min-w-11 lg:min-h-8 lg:min-w-8 inline-flex items-center justify-center text-gray-600 hover:text-red-700 disabled:opacity-40 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                            title="Hapus notifikasi ini"
                            aria-label={`Hapus notifikasi ${item.title || ''}`.trim()}
                          >
                            {deletingId === item.id ? (
                              <Loader2
                                className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none text-red-700"
                                aria-hidden="true"
                              />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 font-medium">
                          <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                          {formatRelativeTime(item.created_at)}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          {isUnread && (
                            <button
                              type="button"
                              onClick={() => onMarkAsRead(item.id)}
                              className="min-h-11 lg:min-h-7 px-2 py-1 rounded-md text-[11px] font-semibold text-[#006A63] hover:text-[#00534D] hover:bg-teal-50 active:bg-teal-100 inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006A63]"
                              title="Tandai sudah dibaca"
                            >
                              <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
                              <span>Tandai dibaca</span>
                            </button>
                          )}
                          {item.data?.url && (
                            <button
                              type="button"
                              onClick={() => onSelectNotification(item)}
                              className="min-h-11 lg:min-h-7 px-2 py-1 rounded-md text-[11px] font-semibold text-[#1D315F] hover:text-[#006A63] hover:bg-gray-100 active:bg-gray-200 inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006A63]"
                            >
                              <span>Buka</span>
                              <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {hasMore && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="min-h-11 lg:min-h-9 w-full rounded-lg text-xs font-bold text-[#006A63] hover:text-[#00534D] hover:bg-teal-50 active:bg-teal-100 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006A63]"
          >
            {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
          </button>
        </div>
      )}
    </div>
  );
}
