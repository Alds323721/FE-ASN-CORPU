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
  const hasAutoMarkedRef = useRef(Boolean(activeMateri?.is_read));

  useEffect(() => {
    const alreadyRead = Boolean(activeMateri?.is_read);
    setIsContentCompleted(alreadyRead);
    hasAutoMarkedRef.current = alreadyRead;
    maxTimeWatchedRef.current = 0;
  }, [activeMateri?.materi_id, activeMateri?.is_read]);

  const triggerAutoComplete = () => {
    setIsContentCompleted(true);
    if (!activeMateri?.is_read && !hasAutoMarkedRef.current) {
      hasAutoMarkedRef.current = true;
      onMarkAsRead(false);
    }
  };

  // Listen for completion events from H5P, SCORM, or YouTube iframe
  useEffect(() => {
    const handlePlayerMessage = (event) => {
      if (!event.data) return;

      if (typeof event.data === 'object') {
        if (
          event.data.type === 'h5p-completed' ||
          event.data.event === 'h5p-completed' ||
          event.data.type === 'scorm-completed' ||
          event.data.action === 'completed'
        ) {
          triggerAutoComplete();
        }
        return;
      }

      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === 'h5p-completed' ||
            data.event === 'h5p-completed' ||
            data.type === 'scorm-completed' ||
            data.action === 'completed' ||
            (data.event === 'onStateChange' && typeof data.info === 'number' && data.info === 0)
          ) {
            triggerAutoComplete();
          }
        } catch {
          // Ignore non-JSON postMessage payloads
        }
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [activeMateri?.materi_id, activeMateri?.is_read]);

  // Direct DOM / H5P instance observer for H5P & SCORM iframes (handles nested .h5p-iframe & videos without endscreen)
  useEffect(() => {
    if (!activeMateri || (activeMateri.tipe !== 'h5p' && activeMateri.tipe !== 'scorm')) return;
    if (activeMateri.is_read || isContentCompleted) return;

    const canCompleteH5pInstance = (inst) => {
      if (!inst) return true;
      try {
        if (typeof inst.hasUncompletedRequiredInteractions === 'function' && inst.hasUncompletedRequiredInteractions()) {
          return false;
        }
        if (Array.isArray(inst.interactions)) {
          for (let i = 0; i < inst.interactions.length; i++) {
            const inter = inst.interactions[i];
            if (inter && typeof inter.getRequiresCompletion === 'function' && inter.getRequiresCompletion()) {
              if (typeof inter.hasFullScore === 'function' && !inter.hasFullScore()) {
                return false;
              }
            }
          }
        }
      } catch {
        // Ignore inspection error
      }
      return true;
    };

    const isFrameVideoAtEnd = (win, doc) => {
      if (!win || !doc) return false;
      try {
        const inst = Array.isArray(win.H5P?.instances) ? win.H5P.instances[0] : null;
        const vidEl = doc.querySelector('video');
        const hasH5pVideo = Boolean(inst && inst.video);

        if (!hasH5pVideo && !vidEl) {
          return true;
        }

        let duration = 0;
        let currentTime = 0;

        if (inst && typeof inst.getDuration === 'function') {
          duration = Number(inst.getDuration()) || 0;
        }
        if (!duration && inst?.video && typeof inst.video.getDuration === 'function') {
          duration = Number(inst.video.getDuration()) || 0;
        }
        if (!duration && vidEl && vidEl.duration > 0 && Number.isFinite(vidEl.duration)) {
          duration = Number(vidEl.duration) || 0;
        }

        if (inst?.video && typeof inst.video.getCurrentTime === 'function') {
          currentTime = Number(inst.video.getCurrentTime()) || 0;
        }
        if (vidEl && vidEl.currentTime > currentTime) {
          currentTime = Number(vidEl.currentTime) || 0;
        }

        if (duration <= 0) {
          return false;
        }

        if (vidEl && vidEl.ended && currentTime >= duration - 2) {
          return true;
        }

        return currentTime >= duration - 1.5;
      } catch {
        return false;
      }
    };

    const inspectWindowAndBind = (win) => {
      if (!win) return;
      try {
        const doc = win.document;
        if (!doc) return;

        // 1. Inspect H5P instances and externalDispatcher if available in this window
        if (win.H5P) {
          if (win.H5P.externalDispatcher && !win.__lmsH5pBound) {
            win.__lmsH5pBound = true;
            win.H5P.externalDispatcher.on('xAPI', (event) => {
              try {
                // Gerbang Mutlak: Tolak semua xAPI jika video belum mencapai menit akhir
                if (!isFrameVideoAtEnd(win, doc)) return;

                const stmt = event?.data?.statement;
                if (!stmt) return;
                const verbId = stmt?.verb?.id || '';
                const isCompletedVerb = verbId.includes('completed') || verbId.includes('passed');
                const subContentId = stmt?.object?.definition?.extensions?.['http://h5p.org/x-api/h5p-subContentId'] || '';
                const isRootEvent = !subContentId && !stmt?.context?.contextActivities?.parent;

                const categoryArr = stmt?.context?.contextActivities?.category || [];
                const categoryId = Array.isArray(categoryArr) && categoryArr[0] ? categoryArr[0].id || '' : '';
                const isSummaryInteraction =
                  categoryId.includes('H5P.Summary') || String(subContentId).includes('summary');
                const isSummaryCompleted = Boolean(
                  stmt?.result && (
                    stmt.result.completion === true ||
                    (stmt.result.score && Number(stmt.result.score.scaled) >= 1)
                  )
                );

                if ((isCompletedVerb && isRootEvent) || (isSummaryInteraction && isSummaryCompleted)) {
                  const instances = win.H5P.instances || [];
                  if (instances.every(canCompleteH5pInstance)) {
                    triggerAutoComplete();
                  }
                }
              } catch {
                // Ignore dispatcher error
              }
            });
          }

          const instances = win.H5P.instances || [];
          instances.forEach((inst) => {
            if (inst?.video && typeof inst.video.on === 'function' && !inst.video.__lmsVideoBound) {
              inst.video.__lmsVideoBound = true;
              inst.video.on('stateChange', (event) => {
                const state = event?.data;
                const endedConst = win.H5P?.Video?.ENDED !== undefined ? win.H5P.Video.ENDED : 0;
                if (
                  typeof state === 'number' &&
                  (state === endedConst || state === 0) &&
                  isFrameVideoAtEnd(win, doc) &&
                  canCompleteH5pInstance(inst)
                ) {
                  triggerAutoComplete();
                }
              });
            }
          });
        }

        // 2. Inspect HTML5 <video> elements inside this document
        doc.querySelectorAll('video').forEach((vid) => {
          const checkVideoEnded = () => {
            if (
              vid.duration > 0 &&
              (vid.ended || vid.currentTime >= vid.duration - 0.5) &&
              isFrameVideoAtEnd(win, doc)
            ) {
              const instances = win.H5P?.instances || [];
              if (instances.every(canCompleteH5pInstance)) {
                triggerAutoComplete();
              }
            }
          };

          if (!vid.__lmsDomVideoBound) {
            vid.__lmsDomVideoBound = true;
            vid.addEventListener('ended', checkVideoEnded);
            vid.addEventListener('timeupdate', checkVideoEnded);
          }
          checkVideoEnded();
        });

        // 3. Recurse into nested iframes (e.g. .h5p-iframe)
        doc.querySelectorAll('iframe').forEach((nestedFrame) => {
          try {
            if (nestedFrame.contentWindow) {
              inspectWindowAndBind(nestedFrame.contentWindow);
            }
          } catch {
            // Cross-origin nested iframe ignored
          }
        });
      } catch {
        // Cross-origin frame access ignored (handled by H5pService postMessage)
      }
    };

    const intervalId = setInterval(() => {
      const playerFrame =
        document.getElementById('h5p-interactive-player') ||
        document.getElementById('scorm-interactive-player');
      if (playerFrame?.contentWindow) {
        inspectWindowAndBind(playerFrame.contentWindow);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeMateri?.materi_id, activeMateri?.tipe, activeMateri?.is_read, isContentCompleted]);

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
  const isMateriCompleted = Boolean(activeMateri.is_read || isContentCompleted);
  const isLockedUntilComplete = requiresCompletionGuard && !isMateriCompleted;

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
                    onMarkAsRead(false);
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
            {isMateriCompleted
              ? 'Materi ini telah selesai dipelajari. Silakan klik tombol Selanjutnya untuk beralih ke tahapan berikutnya.'
              : isH5P
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
              <span>
                {isH5P || isScorm
                  ? 'Selesaikan Video Interaktif Dahulu'
                  : 'Materi Sedang Berlangsung: Selesaikan Konten Terlebih Dahulu'}
              </span>
            </button>
          ) : !isMateriCompleted ? (
            <button
              type="button"
              onClick={() => onMarkAsRead(true)}
              className={`px-6 py-2.5 rounded text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                isWeb
                  ? 'bg-teal-700 text-white hover:bg-teal-800 shadow-sm'
                  : 'bg-[#1D315F] text-white hover:bg-[#162847]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span>Tandai Telah Selesai</span>
            </button>
          ) : (
            <>
              <span className="px-4 py-2.5 rounded text-xs sm:text-sm font-bold flex items-center gap-2 bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
                <span>{isVideo ? 'Selesai Ditonton' : isWeb ? 'Selesai Dibaca' : 'Selesai Dipelajari'}</span>
              </span>

              {nextStepInfo?.type === 'same_modul_materi' && (
                <button
                  type="button"
                  onClick={() => onNextMateri(nextStepInfo.materi, nextStepInfo.modulId)}
                  className="px-5 py-2.5 bg-[#006A63] text-white hover:bg-[#00534D] rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Selanjutnya: Materi Berikutnya</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}

              {nextStepInfo?.type === 'modul_kuis' &&
                !nextStepInfo?.kuis?.is_completed &&
                !courseData?.post_test?.is_completed &&
                courseData?.status_pendaftaran !== 'lulus' &&
                courseData?.status_pendaftaran !== 'selesai' && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('userModulId', nextStepInfo.modulId);
                    localStorage.setItem('userKuisId', nextStepInfo.kuis.kuis_id);
                    onNavigate('kuis');
                  }}
                  className="px-5 py-2.5 bg-amber-600 text-white hover:bg-amber-700 rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Selanjutnya: Kerjakan Kuis Modul</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}

              {nextStepInfo?.type === 'next_modul_materi' && (
                <button
                  type="button"
                  onClick={() => onNextMateri(nextStepInfo.materi, nextStepInfo.modulId)}
                  className="px-5 py-2.5 bg-[#006A63] text-white hover:bg-[#00534D] rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Selanjutnya: Modul Berikutnya</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}

              {nextStepInfo?.type === 'all_completed' &&
                courseData?.post_test &&
                !courseData?.post_test?.is_completed &&
                courseData?.status_pendaftaran !== 'lulus' &&
                courseData?.status_pendaftaran !== 'selesai' && (
                <button
                  type="button"
                  onClick={() => onNavigate('post-test')}
                  className="px-5 py-2.5 bg-[#006A63] text-white hover:bg-[#00534D] rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Selanjutnya: Mulai Post Test</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
