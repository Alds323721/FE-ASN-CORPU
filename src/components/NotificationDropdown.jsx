import React from 'react';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Info,
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
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />;
    case 'module_rejected':
    case 'access_rejected':
      return <XCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />;
    case 'certificate_issued':
      return <Award className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />;
    case 'course_published':
    case 'module_submitted':
      return <BookOpen className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />;
    default:
      return <Info className="w-4 h-4 text-[#1D315F] shrink-0" aria-hidden="true" />;
  }
};

export default function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
  permissionState,
  enablingPush,
  onEnablePush,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectNotification,
  hasMore,
  onLoadMore,
  loadingMore,
}) {
  return (
    <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-[80] overflow-hidden">
      {/* Header Dropdown */}
      <div className="px-4 py-3 bg-[#F4F8FB] border-b border-gray-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#1D315F]">Notifikasi</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-[#006A63] text-white rounded-full">
              {unreadCount} Baru
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-[#006A63] hover:text-[#00534D] inline-flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tandai semua dibaca</span>
          </button>
        )}
      </div>

      {/* Banner Eksplisit Izin Push Notification Browser */}
      {permissionState === 'default' && (
        <div className="px-4 py-3 bg-teal-50/80 border-b border-teal-200 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <BellRing className="w-4 h-4 text-[#006A63] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[11px] text-teal-900 leading-snug font-medium">
              Aktifkan notifikasi browser agar info persetujuan modul & sertifikat langsung muncul di perangkat Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onEnablePush}
            disabled={enablingPush}
            className="px-2.5 py-1.5 bg-[#006A63] hover:bg-[#00534D] disabled:opacity-60 text-white text-[11px] font-bold rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            {enablingPush ? 'Memproses...' : 'Aktifkan Notifikasi'}
          </button>
        </div>
      )}

      {permissionState === 'denied' && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-800">
          Izin Web Push diblokir di browser. Notifikasi tetap tersimpan dan dapat dilihat pada daftar di bawah.
        </div>
      )}

      {/* Daftar Notifikasi */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="p-6 text-center text-xs text-gray-500 font-medium">
            Memuat riwayat notifikasi...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
            <Bell className="w-9 h-9 mb-2 text-gray-300" aria-hidden="true" />
            <p className="text-xs font-semibold text-gray-600">Belum ada notifikasi</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Pemberitahuan kursus, persetujuan modul, dan sertifikat akan tampil di sini.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const isUnread = !item.read_at;
            return (
              <div
                key={item.id}
                onClick={() => onSelectNotification(item)}
                className={`px-4 py-3 transition-colors cursor-pointer flex items-start gap-3 ${
                  isUnread ? 'bg-teal-50/40 hover:bg-teal-50/80' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-gray-200 shadow-2xs shrink-0">
                  {getTypeIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs leading-snug ${
                        isUnread ? 'font-bold text-[#1D315F]' : 'font-semibold text-gray-700'
                      }`}
                    >
                      {item.title}
                    </p>
                    {isUnread && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#006A63] shrink-0 mt-1"
                        title="Belum dibaca"
                      />
                    )}
                  </div>

                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed line-clamp-3">
                    {item.body}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {formatRelativeTime(item.created_at)}
                    </span>

                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(item.id);
                          }}
                          className="text-[10px] font-semibold text-[#006A63] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          title="Tandai sudah dibaca"
                        >
                          <Check className="w-3 h-3" aria-hidden="true" />
                          <span>Tandai dibaca</span>
                        </button>
                      )}
                      {item.data?.url && (
                        <span className="text-[10px] font-semibold text-[#1D315F] inline-flex items-center gap-0.5">
                          <span>Buka</span>
                          <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tombol Muat Lebih Banyak */}
      {hasMore && (
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-xs font-bold text-[#006A63] hover:text-[#00534D] disabled:opacity-50 cursor-pointer"
          >
            {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
          </button>
        </div>
      )}
    </div>
  );
}

