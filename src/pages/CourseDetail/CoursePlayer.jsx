import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ExternalLink,
  Video,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Package,
  Globe,
  RotateCw,
  Maximize2,
  Minimize2,
  Lock,
  Clock,
  Info
} from 'lucide-react';
import PreTestLockedCard from './PreTestLockedCard';
import { extractYouTubeId, getDocumentUrl, isMateriVideo, getHostFromUrl } from './courseHelpers';

export default function CoursePlayer({
  activeMateri,
  courseData,
  onMarkAsRead,
  onNavigate,
  onNextMateri,
  nextStepInfo
}) {
  const [isWebExpanded, setIsWebExpanded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isContentCompleted, setIsContentCompleted] = useState(Boolean(activeMateri?.is_read));
  const maxTimeWatchedRef = useRef(0);

  useEffect(() => {
    setIsContentCompleted(Boolean(activeMateri?.is_read));
    maxTimeWatchedRef.current = 0;
  }, [activeMateri?.materi_id, activeMateri?.is_read]);

  // Listen for completion events from H5P, SCORM, or YouTube iframe
  useEffect(() => {
    const handlePlayerMessage = (event) => {
      if (!event.data) return;

      if (typeof event.data === 'object') {
        if (event.data.type === 'h5p-completed' || event.data.type === 'scorm-completed') {
          setIsContentCompleted(true);
        }
        return;
      }

      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === 'h5p-completed' ||
            data.type === 'scorm-completed' ||
            (data.event === 'onStateChange' && data.info === 0)
          ) {
            setIsContentCompleted(true);
          }
        } catch {
          // Ignore non-JSON postMessage payloads
        }
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [activeMateri?.materi_id]);

  // Auto-pause video, YouTube, H5P, and SCORM when user switches tab or minimizes window
  useEffect(() => {
    const pauseAllActiveMedia = () => {
      document.querySelectorAll('video, audio').forEach((media) => {
        try {
          if (!media.paused) media.pause();
        } catch {
          // Ignore media pause error
        }
      });

      const ytIframe = document.getElementById('youtube-player');
      if (ytIframe?.contentWindow) {
        try {
          ytIframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
            '*'
          );
        } catch {
          // Ignore cross-origin postMessage error
        }
      }

      ['h5p-interactive-player', 'scorm-interactive-player'].forEach((id) => {
        const frame = document.getElementById(id);
        if (!frame) return;
        try {
          frame.contentWindow?.postMessage({ action: 'pause' }, '*');
          const innerDoc = frame.contentDocument || frame.contentWindow?.document;
          innerDoc?.querySelectorAll('video, audio').forEach((m) => {
            if (!m.paused) m.pause();
          });
        } catch {
          // Cross-origin fallback handled via postMessage
        }
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseAllActiveMedia();
      }
    };

    const handleWindowBlur = () => {
      // Wait briefly to see if focus moved into one of our own player iframes
      setTimeout(() => {
        const activeEl = document.activeElement;
        const isPlayerIframeFocused =
          activeEl &&
          activeEl.tagName === 'IFRAME' &&
          (activeEl.id === 'youtube-player' ||
            activeEl.id === 'h5p-interactive-player' ||
            activeEl.id === 'scorm-interactive-player' ||
            activeEl.id === 'webview-material-player');

        if (!isPlayerIframeFocused && document.hidden) {
          pauseAllActiveMedia();
        } else if (!isPlayerIframeFocused && !document.hasFocus()) {
          pauseAllActiveMedia();
        }
      }, 150);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  if (!activeMateri) {
    return (
      <div className="bg-white border border-[#BBC9C7] rounded-lg p-10 text-center text-gray-500">
        Silakan pilih materi di silabus untuk mulai belajar.
      </div>
    );
  }

  if (activeMateri.is_locked) {
    return <PreTestLockedCard activeMateri={activeMateri} courseData={courseData} onNavigate={onNavigate} />;
  }

  const isH5P = activeMateri?.tipe === 'h5p';
  const isScorm = activeMateri?.tipe === 'scorm';
  const isWeb = activeMateri?.tipe === 'tautan_web';
  const isVideo = !isH5P && !isScorm && !isWeb && isMateriVideo(activeMateri);
  const youtubeId = isVideo ? extractYouTubeId(activeMateri.tautan) : null;
  const docUrl = getDocumentUrl(activeMateri.tautan);
  const domainHost = isWeb ? getHostFromUrl(activeMateri.tautan) : '';

  const requiresCompletionGuard = isH5P || isScorm || isVideo;
  const isLockedUntilComplete = requiresCompletionGuard && !activeMateri.is_read && !isContentCompleted;

  // URL embed via backend proxy agar terbebas dari X-Frame-Options & tampil langsung di card
  const webviewEmbedUrl = (isWeb && activeMateri?.tautan)
    ? `${getDocumentUrl('/api/webview-proxy')}?url=${encodeURIComponent(activeMateri.tautan)}`
    : '';

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white border border-[#BBC9C7] rounded-lg overflow-hidden shadow-xs">
        <div className="flex items-center justify-between p-4 md:p-6 pb-3 md:pb-4 flex-wrap gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-[#1D315F]">
            {activeMateri.judul}
          </h2>
          {isH5P && (
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
              Video Interaktif (H5P)
            </span>
          )}
          {isScorm && (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              Video Interaktif (SCORM)
            </span>
          )}
          {isWeb && (
            <span className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
              Materi Web / Webview
            </span>
          )}
        </div>

        {isH5P ? (
          <div className="w-full bg-slate-950 aspect-video relative overflow-hidden flex items-center justify-center">
            {activeMateri.tautan ? (
              <iframe
                id="h5p-interactive-player"
                className="w-full h-full border-0"
                src={getDocumentUrl(activeMateri.tautan)}
                title={activeMateri.judul || 'Video Interaktif H5P'}
                allow="autoplay; fullscreen; geolocation; microphone; camera; midi; encrypted-media"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Sparkles className="w-12 h-12 mb-2 text-purple-400" aria-hidden="true" />
                <p className="text-sm font-semibold text-white">Tautan video interaktif H5P tidak tersedia</p>
              </div>
            )}
          </div>
        ) : isScorm ? (
          <div className="w-full bg-slate-950 aspect-video relative overflow-hidden flex items-center justify-center">
            {activeMateri.tautan ? (
              <iframe
                id="scorm-interactive-player"
                className="w-full h-full border-0"
                src={getDocumentUrl(activeMateri.tautan)}
                title={activeMateri.judul || 'Materi SCORM Interaktif'}
                allow="autoplay; fullscreen; geolocation; microphone; camera; midi; encrypted-media"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Package className="w-12 h-12 mb-2 text-amber-400" aria-hidden="true" />
                <p className="text-sm font-semibold text-white">Berkas SCORM tidak tersedia</p>
              </div>
            )}
          </div>
        ) : isWeb ? (
          /* Card Preview Materi Web / Webview (Scroll Down) */
          <div className="w-full border-t border-b border-gray-200 bg-slate-50 flex flex-col">
            {/* Browser-like Toolbar */}
            <div className="bg-slate-100/90 px-3 py-2 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 font-medium truncate max-w-sm sm:max-w-md shadow-2xs">
                  <Lock className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span className="truncate">{activeMateri.tautan || 'https://...'}</span>
                </span>
                {domainHost && (
                  <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium">
                    ({domainHost})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsIframeLoading(true);
                    setIframeKey((prev) => prev + 1);
                  }}
                  title="Muat Ulang Halaman (Reload)"
                  className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span className="hidden md:inline">Muat Ulang</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWebExpanded(!isWebExpanded)}
                  title={isWebExpanded ? 'Perkecil Tampilan' : 'Perbesar Tampilan'}
                  className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  {isWebExpanded ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      <span className="hidden md:inline">Tinggi Normal</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      <span className="hidden md:inline">Perluas Tampilan</span>
                    </>
                  )}
                </button>

                {activeMateri.tautan && (
                  <a
                    href={activeMateri.tautan}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka di Jendela Tab Baru"
                    className="p-1.5 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 hover:border-sky-300 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <span>Buka Tab Baru</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>

            {/* Scrollable Webview Container */}
            <div
              className={`w-full relative transition-all duration-300 bg-white ${
                isWebExpanded ? 'h-[850px]' : 'h-[600px] md:h-[650px]'
              }`}
            >
              {isIframeLoading && activeMateri.tautan && (
                <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-2xs flex flex-col items-center justify-center z-10 text-slate-500 p-4 text-center">
                  <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs font-semibold text-slate-700">Memuat Halaman Materi...</p>
                  <p className="text-[11px] text-slate-400 mt-1">Mengambil konten dari {domainHost || 'website'}</p>
                </div>
              )}

              {activeMateri.tautan ? (
                <iframe
                  key={iframeKey}
                  id="webview-material-player"
                  className="w-full h-full border-0"
                  src={webviewEmbedUrl}
                  title={activeMateri.judul || 'Materi Webview'}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  onLoad={() => setIsIframeLoading(false)}
                  onError={() => setIsIframeLoading(false)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-12 text-center h-full">
                  <Globe className="w-12 h-12 mb-2 text-sky-400" aria-hidden="true" />
                  <p className="text-sm font-semibold text-gray-700">Tautan web materi belum tersedia</p>
                </div>
              )}
            </div>

            {/* Sub-bar / Scroll helper tip */}
            <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                <span>
                  <b>Petunjuk:</b> Gulir ke bawah pada kartu di atas untuk membaca seluruh isi materi web.
                </span>
              </span>
              {activeMateri.tautan && (
                <span className="hidden sm:inline text-[10px] text-slate-400">
                  Jika halaman tidak muncul karena kebijakan keamanan domain, silakan gunakan tombol <b>Buka Tab Baru</b>.
                </span>
              )}
            </div>
          </div>
        ) : isVideo ? (
          <div className="w-full bg-black aspect-video relative flex items-center justify-center">
            {youtubeId ? (
              <iframe
                id="youtube-player"
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&rel=0`}
                title={activeMateri.judul}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onLoad={(e) => {
                  try {
                    e.currentTarget.contentWindow?.postMessage(
                      JSON.stringify({ event: 'listening', id: 'youtube-player' }),
                      '*'
                    );
                  } catch {
                    // Ignore cross-origin handshake error
                  }
                }}
              />
            ) : docUrl ? (
              <video
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
                src={docUrl}
                onTimeUpdate={(e) => {
                  const video = e.currentTarget;
                  if (!video.seeking && video.currentTime > maxTimeWatchedRef.current) {
                    maxTimeWatchedRef.current = video.currentTime;
                  }
                  if (video.duration > 0 && video.currentTime >= video.duration * 0.95) {
                    setIsContentCompleted(true);
                  }
                }}
                onSeeking={(e) => {
                  const video = e.currentTarget;
                  if (!activeMateri.is_read && !isContentCompleted && video.currentTime > maxTimeWatchedRef.current + 1.5) {
                    video.currentTime = maxTimeWatchedRef.current;
                  }
                }}
                onEnded={() => {
                  setIsContentCompleted(true);
                  if (!activeMateri.is_read) {
                    onMarkAsRead();
                  }
                }}
              >
                Browser Anda tidak mendukung pemutar video.
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Video className="w-12 h-12 mb-2 text-gray-500" aria-hidden="true" />
                <p className="text-sm font-semibold text-white">Tautan video tidak tersedia</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 md:p-12 bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md">
              <FileText className="w-16 h-16 text-teal-600/70 mx-auto mb-3" aria-hidden="true" />
              <p className="text-gray-600 font-medium mb-5 text-sm md:text-base">
                Silakan baca dokumen materi berikut
              </p>
              {docUrl ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#006A63] text-white rounded-lg font-bold text-sm hover:bg-[#00534D] active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>Buka Materi</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold">
                  Dokumen materi belum tersedia
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Deskripsi Materi */}
      {Boolean(activeMateri?.deskripsi && activeMateri.deskripsi.trim()) && (
        <div className="bg-white border border-[#BBC9C7] rounded-lg p-5 md:p-6 shadow-xs">
          <h3 className="text-sm md:text-base font-semibold text-[#1D315F] mb-2">
            Deskripsi & Panduan Materi
          </h3>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium">
            {activeMateri.deskripsi}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6 flex justify-between items-center flex-wrap gap-4 shadow-xs">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-[#1D315F] mb-1">Status Penyelesaian</h3>
          <p className="text-xs text-gray-500">
            {isH5P
              ? 'Selesaikan seluruh interaksi dan kuis di dalam konten H5P hingga tuntas.'
              : isScorm
                ? 'Selesaikan seluruh tahapan materi interaktif SCORM hingga mencapai status selesai.'
                : isWeb
                  ? 'Gulir dan baca seluruh isi materi web di atas. Setelah selesai membaca, klik tombol di samping untuk membuka materi selanjutnya.'
                  : isVideo
                    ? 'Tonton video hingga selesai tanpa mempercepat bagian yang belum ditonton.'
                    : 'Tandai telah selesai jika Anda sudah membaca dan memahami materi ini.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isLockedUntilComplete ? (
            <button
              type="button"
              disabled
              className="px-5 py-2.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-2 bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed"
            >
              <Clock className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
              <span>Materi Sedang Berlangsung: Selesaikan Konten Terlebih Dahulu</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onMarkAsRead}
              disabled={activeMateri.is_read}
              className={`px-6 py-2.5 rounded text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                activeMateri.is_read
                  ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200'
                  : isH5P
                    ? 'bg-[#006A63] text-white hover:bg-[#00534D]'
                    : isScorm
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : isWeb
                        ? 'bg-teal-700 text-white hover:bg-teal-800 shadow-sm'
                        : isVideo
                          ? 'bg-[#006A63] text-white hover:bg-[#00534D]'
                          : 'bg-[#1D315F] text-white hover:bg-[#162847]'
              }`}
            >
              {activeMateri.is_read ? (
                <>
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  <span>{isVideo ? 'Selesai Ditonton' : isWeb ? 'Selesai Dibaca' : 'Selesai Dipelajari'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  <span>Tandai Telah Selesai</span>
                </>
              )}
            </button>
          )}

          {activeMateri.is_read && nextStepInfo?.type === 'same_modul_materi' && (
            <button
              onClick={() => onNextMateri(nextStepInfo.materi, nextStepInfo.modulId)}
              className="px-5 py-2.5 bg-[#006A63] text-white hover:bg-[#00534D] rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Materi Selanjutnya</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {activeMateri.is_read &&
            nextStepInfo?.type === 'modul_kuis' &&
            !nextStepInfo?.kuis?.is_completed &&
            !courseData?.post_test?.is_completed &&
            courseData?.status_pendaftaran !== 'lulus' &&
            courseData?.status_pendaftaran !== 'selesai' && (
            <button
              onClick={() => {
                localStorage.setItem('userModulId', nextStepInfo.modulId);
                localStorage.setItem('userKuisId', nextStepInfo.kuis.kuis_id);
                onNavigate('kuis');
              }}
              className="px-5 py-2.5 bg-amber-600 text-white hover:bg-amber-700 rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Kerjakan Kuis Modul</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {activeMateri.is_read && nextStepInfo?.type === 'next_modul_materi' && (
            <button
              onClick={() => onNextMateri(nextStepInfo.materi, nextStepInfo.modulId)}
              className="px-5 py-2.5 bg-[#006A63] text-white hover:bg-[#00534D] rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Lanjut Modul Berikutnya</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
