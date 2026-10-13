import React from 'react';
import { HelpCircle, ChevronRight, Lock, Clock, AlertCircle } from 'lucide-react';
import { getQuizBadges } from './courseHelpers';

export default function PreTestLockedCard({ activeMateri, courseData, onNavigate }) {
  const isPending = courseData?.status_persetujuan === 'menunggu';
  const isRejected = courseData?.status_persetujuan === 'ditolak';

  if (isPending) {
    return (
      <div className="bg-white border border-amber-200 rounded-xl p-8 md:p-12 text-center flex flex-col items-center justify-center bg-gradient-to-b from-amber-50/40 to-white shadow-xs">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
          <Clock className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-3">
          Permintaan Akses Menunggu Persetujuan
        </span>
        <h3 className="text-xl font-bold text-[#1D315F] mb-2">{activeMateri.judul}</h3>
        <p className="text-sm text-gray-600 max-w-lg mb-4 leading-relaxed">
          Permintaan akses Anda untuk pelatihan ini sedang ditinjau oleh Admin Komunitas. Seluruh video dan berkas materi terkunci dan akan aktif setelah permohonan disetujui.
        </p>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-8 md:p-12 text-center flex flex-col items-center justify-center bg-gradient-to-b from-red-50/30 to-white shadow-xs">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full mb-3">
          Permintaan Akses Ditolak
        </span>
        <h3 className="text-xl font-bold text-[#1D315F] mb-2">{activeMateri.judul}</h3>
        <p className="text-sm text-gray-600 max-w-lg mb-4 leading-relaxed">
          Permintaan akses Anda ditolak oleh Admin Komunitas.
          {courseData?.catatan_persetujuan && (
            <span className="block mt-2 text-xs font-semibold text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
              Alasan: "{courseData.catatan_persetujuan}"
            </span>
          )}
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#006A63] text-white rounded-lg font-bold text-xs hover:bg-[#00534D] transition-colors"
        >
          Lihat Katalog Pelatihan
        </button>
      </div>
    );
  }

  const isLockedByPreTest = activeMateri.pre_test && !activeMateri.pre_test.is_completed && !activeMateri.pre_test.is_locked;

  if (isLockedByPreTest) {
    return (
      <div className="bg-white border border-amber-200 rounded-xl p-8 md:p-12 text-center flex flex-col items-center justify-center bg-gradient-to-b from-amber-50/40 to-white shadow-xs">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 mb-3 flex-wrap justify-center">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            Pre-Test Pemahaman Awal
          </span>
          {getQuizBadges(activeMateri.pre_test?.tipe_soal_list).map((tb, idx) => (
            <span key={idx} className={`px-2.5 py-1 text-xs font-bold rounded-full border ${tb.color}`}>
              {tb.label}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-bold text-[#1D315F] mb-2">{activeMateri.judul}</h3>
        <p className="text-sm text-gray-600 max-w-lg mb-6 leading-relaxed">
          Materi ini mewajibkan pengerjaan <strong>Pre-Test</strong> untuk mengukur pemahaman awal Anda sebelum berkas materi dapat dipelajari.
          <br className="hidden sm:inline" />
          <span className="text-xs text-gray-500 mt-1.5 block">
            Catatan: Tidak ada batas nilai kelulusan minimal. Anda hanya perlu menyelesaikan seluruh pertanyaan.
          </span>
        </p>

        <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 bg-gray-50 px-5 py-2.5 rounded-xl border border-gray-200 mb-6">
          <span> Durasi: <strong>{activeMateri.pre_test.durasi || 15} Menit</strong></span>
          <span>•</span>
          <span> Status: <strong className="text-amber-600">Belum Dikerjakan</strong></span>
        </div>

        <button
          onClick={() => {
            if (activeMateri.currentModulId) {
              localStorage.setItem('userModulId', activeMateri.currentModulId);
            }
            localStorage.setItem('userActiveMateriId', activeMateri.materi_id);
            localStorage.setItem('userKuisId', activeMateri.pre_test.kuis_id);
            onNavigate('kuis');
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#006A63] text-white rounded-xl font-bold text-sm hover:bg-[#00534D] active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <span>Mulai Kerjakan Pre-Test</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-12 text-center text-gray-500 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
        <Lock className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-[#1D315F] mb-1">{activeMateri.judul}</h3>
      <p className="text-sm text-gray-500 max-w-md">
        {courseData?.lock_reason || 'Materi ini masih terkunci. Silakan selesaikan seluruh materi sebelumnya sesuai urutan silabus.'}
      </p>
    </div>
  );
}
