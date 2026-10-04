import React, { useState, useEffect, useRef } from 'react';

export default function TimerCard({
  answeredCount,
  totalQuestions,
  durationMinutes,
  onTimeUp,
  maxAttempts = 3,
  isPreTest = false,
  isWeighted = false,
  storageKey
}) {
  const [time, setTime] = useState(() => {
    if (!storageKey || !durationMinutes) return (durationMinutes || 15) * 60;
    try {
      const savedEndTime = localStorage.getItem(storageKey);
      if (savedEndTime) {
        const parsed = parseInt(savedEndTime, 10);
        const remaining = Math.max(0, Math.floor((parsed - Date.now()) / 1000));
        if (remaining > 0 && (parsed - Date.now()) <= (durationMinutes * 60 + 300) * 1000) {
          return remaining;
        }
      }
    } catch (e) { }
    return (durationMinutes || 15) * 60;
  });

  const timerRef = useRef(null);

  useEffect(() => {
    if (!durationMinutes) return;

    let targetEndTime;
    try {
      const savedEndTime = storageKey ? localStorage.getItem(storageKey) : null;
      if (savedEndTime) {
        const parsed = parseInt(savedEndTime, 10);
        const remaining = Math.max(0, Math.floor((parsed - Date.now()) / 1000));
        if (remaining > 0 && (parsed - Date.now()) <= (durationMinutes * 60 + 300) * 1000) {
          targetEndTime = parsed;
          setTime(remaining);
        } else if (remaining === 0) {
          setTime(0);
          if (onTimeUp) onTimeUp();
          return;
        }
      }
    } catch (e) { }

    if (!targetEndTime) {
      targetEndTime = Date.now() + (durationMinutes * 60) * 1000;
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, targetEndTime.toString());
        } catch (e) { }
      }
      setTime(durationMinutes * 60);
    }

    timerRef.current = setInterval(() => {
      const currentRemaining = Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000));
      setTime(currentRemaining);
      if (currentRemaining <= 0) {
        clearInterval(timerRef.current);
        if (storageKey) {
          try {
            localStorage.removeItem(storageKey);
          } catch (e) { }
        }
        if (onTimeUp) onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [durationMinutes, storageKey, onTimeUp]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6">
      <h3 className="font-semibold text-[#1D315F] text-base md:text-lg mb-4">Waktu Tersisa</h3>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 mb-6">
        <div className="text-4xl md:text-5xl font-semibold text-red-500 text-center">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-gray-600 font-semibold">Status</span>
          <span className="text-[#006A63] font-semibold">Sedang Berjalan</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-gray-600 font-semibold">{isPreTest ? 'Jenis Ujian' : (isWeighted ? 'Jenis Kuis' : 'Batas Kesempatan')}</span>
          <span className="text-[#1D315F] font-semibold">{isPreTest ? 'Pre-Test Materi' : (isWeighted ? 'Kuis Nilai Berbobot' : `${maxAttempts} Kali`)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-semibold">Soal Terjawab</span>
          <span className="text-[#1D315F] font-semibold">{answeredCount} dari {totalQuestions}</span>
        </div>
      </div>
    </div>
  );
}
