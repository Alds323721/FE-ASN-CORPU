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
  Info,
  Download
} from 'lucide-react';
import api from '../../api/axios';
import PreTestLockedCard from './PreTestLockedCard';
import { extractYouTubeId, getDocumentUrl, isMateriVideo, getHostFromUrl } from './courseHelpers';

const buildPreviewDocumentUrl = (rawUrl, resolvedUrl) => {
  if (!resolvedUrl) return '';
  const trimmed = String(rawUrl || '').trim();

  // Konversi tautan Google Drive / Docs agar bisa di-embed langsung
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  const docsMatch = trimmed.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/i);
  if (docsMatch && docsMatch[1] && docsMatch[2]) {
    return `https://docs.google.com/${docsMatch[1]}/d/${docsMatch[2]}/preview`;
  }

  if (/\.pdf(\?.*)?$/i.test(resolvedUrl) && !resolvedUrl.includes('#')) {
    return `${resolvedUrl}#toolbar=1&navpanes=0&view=FitH`;
  }

  return resolvedUrl;
};

export default function CoursePlayer({
  activeMateri,
  courseData,
  onMarkAsRead,
  onNavigate,
  onNextMateri,
  nextStepInfo
}) {
  const effectiveCourseId =
    courseData?.pembelajaran_id ||
    localStorage.getItem('userCourseId') ||
    localStorage.getItem('userActiveMateriCourseId') ||
    'course';
  const effectiveMateriId =
    activeMateri?.materi_id ||
    localStorage.getItem('userActiveMateriId') ||
    'materi';
  const timerStorageKey = `lms_watch_timer_${effectiveCourseId}_${effectiveMateriId}`;

  const [isWebExpanded, setIsWebExpanded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [docIframeKey, setDocIframeKey] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isDocLoading, setIsDocLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isContentCompleted, setIsContentCompleted] = useState(Boolean(activeMateri?.is_read));
  const [mediaToken, setMediaToken] = useState('');
  const [isInitializingMedia, setIsInitializingMedia] = useState(false);
  const [elapsedInteractiveSeconds, setElapsedInteractiveSeconds] = useState(() => {
    try {
      const cId =
        courseData?.pembelajaran_id ||
        localStorage.getItem('userCourseId') ||
        localStorage.getItem('userActiveMateriCourseId') ||
        'course';
      const mId =
        activeMateri?.materi_id ||
        localStorage.getItem('userActiveMateriId') ||
        'materi';
      const saved = parseInt(localStorage.getItem(`lms_watch_timer_${cId}_${mId}`) || '0', 10);
      return Number.isFinite(saved) ? Math.max(0, saved) : 0;
    } catch {
      return 0;
    }
  });
  const maxTimeWatchedRef = useRef(0);
  const hasAutoMarkedRef = useRef(Boolean(activeMateri?.is_read));

  const isInteractiveMateri = activeMateri?.tipe === 'h5p' || activeMateri?.tipe === 'scorm';
  const useInteractiveTimerRule = activeMateri?.gunakan_tombol_selesai !== false;
  const targetMinutes = Math.max(
    1,
    parseInt(activeMateri?.waktu_muncul_tombol_menit || activeMateri?.durasi || 1, 10) || 1
  );
  const targetSeconds = targetMinutes * 60;

  useEffect(() => {
    const alreadyRead = Boolean(activeMateri?.is_read);
    setIsContentCompleted(alreadyRead);
    hasAutoMarkedRef.current = alreadyRead;
    maxTimeWatchedRef.current = 0;
    setIsIframeLoading(true);
    setIsDocLoading(true);

    if (alreadyRead) {
      setElapsedInteractiveSeconds(targetSeconds);
    } else if (isInteractiveMateri) {
      try {
        const saved = parseInt(localStorage.getItem(timerStorageKey) || '0', 10);
        const clamped = Number.isFinite(saved) ? Math.min(targetSeconds, Math.max(0, saved)) : 0;
        setElapsedInteractiveSeconds(clamped);
      } catch {
        setElapsedInteractiveSeconds(0);
      }
    } else {
      setElapsedInteractiveSeconds(0);
    }
  }, [activeMateri?.materi_id, activeMateri?.is_read, isInteractiveMateri, targetSeconds, timerStorageKey]);

  // Inisialisasi sesi media pembelajaran terproteksi (cookie + token scoped)
  useEffect(() => {
    let isCancelled = false;

    const initMediaSession = async () => {
      const tautan = String(activeMateri?.tautan || '').trim();
      const needsSecureSession =
        tautan.includes('/api/media/') ||
        tautan.includes('/storage/scorm/') ||
        tautan.includes('/storage/h5p/') ||
        tautan.includes('/storage/materi_');

      if (!needsSecureSession || !effectiveCourseId || !activeMateri?.materi_id) {
        setMediaToken('');
        return;
      }

      setIsInitializingMedia(true);
      try {
        const response = await api.post(
          `/courses/${effectiveCourseId}/materi/${activeMateri.materi_id}/session`
        );
        if (!isCancelled && response.data?.media_token) {
          setMediaToken(response.data.media_token);
        }
      } catch (err) {
        console.warn('Gagal inisialisasi sesi media pembelajaran terproteksi:', err);
      } finally {
        if (!isCancelled) {
          setIsInitializingMedia(false);
        }
      }
    };

    initMediaSession();

    return () => {
      isCancelled = true;
    };
  }, [activeMateri?.materi_id, activeMateri?.tautan, effectiveCourseId]);

  const attachMediaToken = (url) => {
    if (!url || !mediaToken) return url;
    const hashIndex = url.indexOf('#');
    let baseUrl = url;
    let hash = '';
    if (hashIndex !== -1) {
      baseUrl = url.substring(0, hashIndex);
      hash = url.substring(hashIndex);
    }
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}media_token=${encodeURIComponent(mediaToken)}${hash}`;
  };

  const triggerAutoComplete = () => {
    setIsContentCompleted(true);
    if (!activeMateri?.is_read && !hasAutoMarkedRef.current) {
      hasAutoMarkedRef.current = true;
      onMarkAsRead(false);
    }
  };

  // Timer kemunculan tombol "Tandai Sudah Ditonton" untuk H5P & SCORM sesuai estimasi durasi materi (menit)
  useEffect(() => {
    if (!activeMateri || !isInteractiveMateri) return;
    if (activeMateri.is_read || isContentCompleted) return;

    const intervalId = setInterval(() => {
      if (document.hidden) return;

      setElapsedInteractiveSeconds((prev) => {
        if (prev >= targetSeconds) return prev;
        const nextVal = prev + 1;
        try {
          localStorage.setItem(timerStorageKey, String(nextVal));
        } catch {
          // Ignore storage quota error
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeMateri?.materi_id, activeMateri?.is_read, isInteractiveMateri, isContentCompleted, targetSeconds, timerStorageKey]);

  // Listen for completion events from YouTube iframe
  useEffect(() => {
    const handlePlayerMessage = (event) => {
      if (!event.data || isInteractiveMateri) return;

      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'onStateChange' && typeof data.info === 'number' && data.info === 0) {
            triggerAutoComplete();
          }
        } catch {
          // Ignore non-JSON postMessage payloads
        }
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [activeMateri?.materi_id, activeMateri?.is_read, isInteractiveMateri]);

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
            activeEl.id === 'webview-material-player' ||
            activeEl.id === 'document-material-player');

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
  const isDocument = !isH5P && !isScorm && !isWeb && !isVideo;
  const youtubeId = isVideo ? extractYouTubeId(activeMateri.tautan) : null;
  const docUrl = getDocumentUrl(activeMateri.tautan);
  const previewDocUrl = isDocument ? buildPreviewDocumentUrl(activeMateri.tautan, docUrl) : '';
  const domainHost = isWeb ? getHostFromUrl(activeMateri.tautan) : '';

  const isInteractiveButtonReady =
    !isInteractiveMateri || !useInteractiveTimerRule || elapsedInteractiveSeconds >= targetSeconds;
  const remainingInteractiveSeconds = Math.max(0, targetSeconds - elapsedInteractiveSeconds);
  const isMateriCompleted = Boolean(activeMateri.is_read || isContentCompleted);
  const isLockedUntilComplete =
    !isMateriCompleted && ((isInteractiveMateri && !isInteractiveButtonReady) || isVideo);

  // URL embed via backend proxy agar terbebas dari X-Frame-Options & tampil langsung di card
  const webviewEmbedUrl = (isWeb && activeMateri?.tautan)
    ? `${getDocumentUrl('/api/webview-proxy')}?url=${encodeURIComponent(activeMateri.tautan)}`
    : '';

  const handleDownloadMateri = async () => {
    if (!docUrl || isDownloading) return;

    const rawPath = String(activeMateri?.tautan || '').trim();
    const isLocalStorageFile =
      rawPath.startsWith('/storage/') ||
      rawPath.startsWith('storage/') ||
      rawPath.startsWith('/api/media/') ||
      !rawPath.startsWith('http');

    const extMatch = rawPath.match(/\.([a-zA-Z0-9]{2,5})(\?.*)?$/);
    const ext = extMatch && extMatch[1] ? extMatch[1] : 'pdf';
    const cleanTitle = String(activeMateri?.judul || 'materi-pembelajaran')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '')
      .replace(/\s+/g, '-');
    const fallbackFileName = `${cleanTitle || 'materi-pembelajaran'}.${ext}`;

    setIsDownloading(true);
    try {
      if (isLocalStorageFile && courseData?.pembelajaran_id && activeMateri?.materi_id) {
        const response = await api.get(
          `/user/courses/${courseData.pembelajaran_id}/materi/${activeMateri.materi_id}/download`,
          { responseType: 'blob' }
        );
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', fallbackFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
        return;
      }

      const response = await fetch(docUrl);
      if (!response.ok) throw new Error('Download langsung gagal');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fallbackFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement('a');
      link.href = docUrl;
      link.setAttribute('download', fallbackFileName);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setIsDownloading(false);
    }
  };

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
          {isDocument && (
            <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
              Dokumen Materi (PDF)
            </span>
          )}
        </div>

        {isH5P ? (
          <div className="w-full bg-slate-950 aspect-video relative overflow-hidden flex items-center justify-center">
            {activeMateri.tautan ? (
              <iframe
                key={`h5p-${activeMateri?.materi_id}-${mediaToken}`}
                id="h5p-interactive-player"
                className="w-full h-full border-0"
                src={attachMediaToken(getDocumentUrl(activeMateri.tautan))}
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
                key={`scorm-${activeMateri?.materi_id}-${mediaToken}`}
                id="scorm-interactive-player"
                className="w-full h-full border-0"
                src={attachMediaToken(getDocumentUrl(activeMateri.tautan))}
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
                key={`video-${activeMateri?.materi_id}-${mediaToken}`}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
                src={attachMediaToken(docUrl)}
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
          <div className="w-full border-t border-b border-gray-200 bg-slate-50 flex flex-col">
            {docUrl ? (
              <>
                {/* Toolbar Preview & Download Dokumen */}
                <div className="bg-slate-100/90 px-3 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 font-medium truncate max-w-sm sm:max-w-md shadow-2xs">
                      <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" aria-hidden="true" />
                      <span className="truncate">{activeMateri.judul || 'Dokumen Materi'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDocLoading(true);
                        setDocIframeKey((prev) => prev + 1);
                      }}
                      title="Muat Ulang Dokumen"
                      className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      <span className="hidden md:inline">Muat Ulang</span>
                    </button>

                    <a
                      href={attachMediaToken(docUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Buka Materi di Tab Baru"
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <span>Buka Tab Baru</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                {/* Area Preview Dokumen / PDF Langsung di Halaman */}
                <div className="w-full relative transition-all duration-300 bg-slate-200/70 h-[620px] md:h-[700px]">
                  {isDocLoading && (
                    <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-2xs flex flex-col items-center justify-center z-10 text-slate-500 p-4 text-center">
                      <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-xs font-semibold text-slate-700">Memuat Pratinjau Materi...</p>
                      <p className="text-[11px] text-slate-400 mt-1">Menampilkan dokumen langsung di halaman</p>
                    </div>
                  )}

                  <iframe
                    key={`doc-${docIframeKey}-${mediaToken}`}
                    id="document-material-player"
                    className="w-full h-full border-0 bg-white"
                    src={attachMediaToken(previewDocUrl)}
                    title={activeMateri.judul || 'Pratinjau Dokumen Materi'}
                    allow="fullscreen"
                    onLoad={() => setIsDocLoading(false)}
                    onError={() => setIsDocLoading(false)}
                  />
                </div>

                {/* Footer Petunjuk & Aksi Cepat Download */}
                <div className="bg-slate-50 px-3 py-2.5 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" aria-hidden="true" />
                    <span>
                      <b>Petunjuk:</b> Gulir di dalam dokumen di atas untuk membaca materi, atau unduh dokumen untuk dibaca secara offline.
                    </span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadMateri}
                      disabled={isDownloading}
                      title="Download Berkas Materi"
                      className="px-3 py-1.5 bg-[#006A63] hover:bg-[#00534D] disabled:opacity-60 text-white rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] font-semibold shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isDownloading ? 'Mengunduh...' : 'Download Materi'}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 md:p-12 bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <FileText className="w-16 h-16 text-teal-600/70 mx-auto mb-3" aria-hidden="true" />
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold">
                    Dokumen materi belum tersedia
                  </div>
                </div>
              </div>
            )}
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
              : isH5P || isScorm
                ? isInteractiveButtonReady
                  ? 'Waktu belajar materi interaktif telah terpenuhi. Silakan klik tombol "Tandai Sudah Ditonton" untuk menyelesaikan materi.'
                  : 'Pelajari dan selesaikan seluruh aktivitas materi pembelajaran interaktif ini hingga selesai.'
                : isWeb
                  ? 'Gulir dan baca seluruh isi materi web di atas. Setelah selesai membaca, klik tombol di samping untuk membuka materi selanjutnya.'
                  : isVideo
                    ? 'Tonton video hingga selesai tanpa mempercepat bagian yang belum ditonton.'
                    : 'Tandai telah selesai jika Anda sudah membaca dan memahami materi ini.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isLockedUntilComplete ? (
            isInteractiveMateri ? null : (
              <button
                type="button"
                disabled
                className="px-5 py-2.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-2 bg-slate-100 text-slate-700 border border-slate-300 cursor-not-allowed"
              >
                <Clock className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
                <span>Materi Sedang Berlangsung: Selesaikan Konten Terlebih Dahulu</span>
              </button>
            )
          ) : !isMateriCompleted ? (
            <button
              type="button"
              onClick={() => onMarkAsRead(true)}
              className={`px-6 py-2.5 rounded text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                isH5P || isScorm || isWeb
                  ? 'bg-[#006A63] text-white hover:bg-[#00534D] shadow-xs'
                  : 'bg-[#1D315F] text-white hover:bg-[#162847]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span>{isH5P || isScorm ? 'Tandai Sudah Ditonton' : 'Tandai Telah Selesai'}</span>
            </button>
          ) : (
            <>
              <span className="px-4 py-2.5 rounded text-xs sm:text-sm font-bold flex items-center gap-2 bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
                <span>
                  {isVideo || isH5P || isScorm
                    ? 'Sudah Ditonton'
                    : isWeb
                      ? 'Selesai Dibaca'
                      : 'Selesai Dipelajari'}
                </span>
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
