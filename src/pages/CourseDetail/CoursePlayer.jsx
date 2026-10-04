import React from 'react';
import {
  FileText,
  ExternalLink,
  Video,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Package
} from 'lucide-react';
import PreTestLockedCard from './PreTestLockedCard';
import { extractYouTubeId, getDocumentUrl, isMateriVideo } from './courseHelpers';

export default function CoursePlayer({
  activeMateri,
  onMarkAsRead,
  onNavigate,
  onNextMateri,
  nextStepInfo
}) {
  if (!activeMateri) {
    return (
      <div className="bg-white border border-[#BBC9C7] rounded-lg p-10 text-center text-gray-500">
        Silakan pilih materi di silabus untuk mulai belajar.
      </div>
    );
  }

  if (activeMateri.is_locked) {
    return <PreTestLockedCard activeMateri={activeMateri} onNavigate={onNavigate} />;
  }

  const isH5P = activeMateri?.tipe === 'h5p';
  const isScorm = activeMateri?.tipe === 'scorm';
  const isVideo = !isH5P && !isScorm && isMateriVideo(activeMateri);
  const youtubeId = isVideo ? extractYouTubeId(activeMateri.tautan) : null;
  const docUrl = getDocumentUrl(activeMateri.tautan);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white border border-[#BBC9C7] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 pb-3 md:pb-4 flex-wrap gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-[#1D315F]">
            {activeMateri.judul}
          </h2>
          {isH5P && (
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              Video Interaktif (H5P)
            </span>
          )}
          {isScorm && (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-500" />
              Video Interaktif (SCORM)
            </span>
          )}
        </div>

        {isH5P ? (
          <div className="w-full bg-slate-950 aspect-video relative overflow-hidden flex items-center justify-center">
            {activeMateri.tautan ? (
              <iframe
                id="h5p-interactive-player"
                className="w-full h-full border-0"
                src={activeMateri.tautan}
                title={activeMateri.judul || 'Video Interaktif H5P'}
                allow="autoplay; fullscreen; geolocation; microphone; camera; midi; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Sparkles className="w-12 h-12 mb-2 text-purple-400" />
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
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Package className="w-12 h-12 mb-2 text-amber-400" />
                <p className="text-sm font-semibold text-white">Berkas SCORM tidak tersedia</p>
              </div>
            )}
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
                allowFullScreen
              />
            ) : activeMateri.tautan ? (
              <video
                controls
                className="w-full h-full object-contain"
                src={getDocumentUrl(activeMateri.tautan)}
                onEnded={() => {
                  if (!activeMateri.is_read) {
                    onMarkAsRead();
                  }
                }}
              >
                Browser Anda tidak mendukung pemutar video.
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Video className="w-12 h-12 mb-2 text-gray-500" />
                <p className="text-sm font-semibold text-white">Tautan video tidak tersedia</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 md:p-12 bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md">
              <FileText className="w-16 h-16 text-teal-600/70 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-5 text-sm md:text-base">
                Silakan baca dokumen materi berikut
              </p>
              {activeMateri.tautan ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#006A63] text-white rounded-lg font-bold text-sm hover:bg-[#00534D] active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Buka Materi</span>
                  <ExternalLink className="w-4 h-4" />
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

      <div className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-[#1D315F] mb-1">Status Penyelesaian</h3>
          <p className="text-xs text-gray-500">
            {isH5P
              ? 'Selesaikan seluruh kuis interaktif di dalam video atau klik tombol jika sudah selesai.'
              : isScorm
                ? 'Selesaikan seluruh materi interaktif SCORM atau klik tombol jika sudah selesai.'
                : isVideo
                  ? 'Tonton video hingga selesai atau klik tombol jika sudah selesai menonton materi ini.'
                  : 'Tandai telah selesai jika Anda sudah memahami materi ini.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={onMarkAsRead}
            disabled={activeMateri.is_read}
            className={`px-6 py-2.5 rounded text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeMateri.is_read 
                ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200' 
                : isH5P
                  ? 'bg-[#006A63] text-white hover:bg-[#00534D]'
                  : isScorm
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : isVideo
                      ? 'bg-[#006A63] text-white hover:bg-[#00534D]'
                      : 'bg-[#1D315F] text-white hover:bg-[#162847]'
            }`}
          >
            {activeMateri.is_read ? (
              <><CheckCircle2 className="w-5 h-5" /> {isVideo ? 'Selesai Ditonton' : 'Selesai Dipelajari'}</>
            ) : isH5P ? (
              <><CheckCircle2 className="w-5 h-5" /> Selesaikan Materi H5P</>
            ) : isScorm ? (
              <><CheckCircle2 className="w-5 h-5" /> Selesaikan Materi SCORM</>
            ) : isVideo ? (
              <><CheckCircle2 className="w-5 h-5" /> Tandai Telah Ditonton</>
            ) : (
              <><CheckCircle2 className="w-5 h-5" /> Tandai Telah Dibaca</>
            )}
          </button>

          {activeMateri.is_read && nextStepInfo?.type === 'same_modul_materi' && (
            <button
              onClick={() => onNextMateri(nextStepInfo.materi, nextStepInfo.modulId)}
              className="px-5 py-2.5 bg-[#006A63] text-white hover:bg-[#00534D] rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Materi Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {activeMateri.is_read && nextStepInfo?.type === 'modul_kuis' && (
            <button
              onClick={() => {
                localStorage.setItem('userModulId', nextStepInfo.modulId);
                localStorage.setItem('userKuisId', nextStepInfo.kuis.kuis_id);
                onNavigate('kuis');
              }}
              className="px-5 py-2.5 bg-amber-600 text-white hover:bg-amber-700 rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Kerjakan Kuis Modul</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {activeMateri.is_read && nextStepInfo?.type === 'next_modul_materi' && (
            <button
              onClick={() => onNextMateri(nextStepInfo.materi, nextStepInfo.modulId)}
              className="px-5 py-2.5 bg-[#006A63] text-white hover:bg-[#00534D] rounded text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Lanjut Modul Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
