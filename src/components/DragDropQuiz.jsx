import React, { useState, useMemo } from 'react';
import { GripVertical, X, Check, RotateCcw, ChevronDown, ListChecks } from 'lucide-react';

export default function DragDropQuiz({
  question,
  value = [],
  onChange,
  isReadOnly = false,
  showAnswers = false
}) {
  // State untuk kata yang sedang dipilih via klik (click-to-place)
  const [selectedWord, setSelectedWord] = useState(null);
  // State untuk slot yang sedang membuka dropdown pemilihan
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  // State untuk highlight slot saat drag over
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // 1. Parsing teks soal untuk menemukan titik-titik kosong [ ... ]
  // Mendukung format: [1], [2] atau [telur], [insang] atau [...]
  const { segments, blanksCount, blankKeys } = useMemo(() => {
    const rawText = question?.teks_soal || '';
    const regex = /\[([^\]]+)\]/g;
    const parts = [];
    const keys = [];
    let lastIndex = 0;
    let match;
    let count = 0;

    while ((match = regex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: rawText.substring(lastIndex, match.index) });
      }
      const token = match[1].trim();
      parts.push({ type: 'blank', index: count, rawToken: token });
      keys.push(token);
      count++;
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      parts.push({ type: 'text', content: rawText.substring(lastIndex) });
    }

    // Jika tidak ditemukan tanda kurung siku, fallback buat 1 slot di akhir
    if (count === 0) {
      parts.push({ type: 'text', content: rawText + ' ' });
      parts.push({ type: 'blank', index: 0, rawToken: '1' });
      count = 1;
    }

    return { segments: parts, blanksCount: count, blankKeys: keys };
  }, [question?.teks_soal]);

  // 2. Normalisasi jawaban saat ini
  const currentAnswers = useMemo(() => {
    if (Array.isArray(value)) {
      const arr = new Array(blanksCount).fill('');
      value.forEach((v, i) => {
        if (i < blanksCount) arr[i] = v || '';
      });
      return arr;
    }
    return new Array(blanksCount).fill('');
  }, [value, blanksCount]);

  // 3. Bank kata pilihan (Word options)
  const allOptions = useMemo(() => {
    if (Array.isArray(question?.pilihan_jawaban) && question.pilihan_jawaban.length > 0) {
      return question.pilihan_jawaban;
    }
    // Jika data dari JSON struktur
    const pJson = typeof question?.pilihan_jawaban_json === 'string'
      ? JSON.parse(question.pilihan_jawaban_json || '{}')
      : (question?.pilihan_jawaban_json || {});

    if (pJson.all_options && Array.isArray(pJson.all_options)) {
      return pJson.all_options;
    }
    if (pJson.options && Array.isArray(pJson.options)) {
      return pJson.options;
    }
    if (pJson.blanks && Array.isArray(pJson.blanks)) {
      const bKeys = pJson.blanks.map(b => b.kunci);
      const dist = pJson.distractors || [];
      return [...bKeys, ...dist];
    }
    return blankKeys;
  }, [question, blankKeys]);

  // Kata yang sudah terpakai di salah satu slot
  const usedWordsCount = useMemo(() => {
    const counts = {};
    currentAnswers.forEach(w => {
      if (w) counts[w] = (counts[w] || 0) + 1;
    });
    return counts;
  }, [currentAnswers]);

  // Update jawaban pada slot tertentu
  const handlePlaceWord = (slotIndex, word) => {
    if (isReadOnly) return;
    const nextAnswers = [...currentAnswers];
    nextAnswers[slotIndex] = word;
    if (onChange) {
      onChange(nextAnswers);
    }
    setSelectedWord(null);
    setActiveDropdownIndex(null);
    setDragOverIndex(null);
  };

  // Hapus kata dari slot tertentu
  const handleRemoveWord = (slotIndex) => {
    if (isReadOnly) return;
    const nextAnswers = [...currentAnswers];
    nextAnswers[slotIndex] = '';
    if (onChange) {
      onChange(nextAnswers);
    }
    setActiveDropdownIndex(null);
  };

  // Reset semua slot
  const handleResetAll = () => {
    if (isReadOnly) return;
    if (onChange) {
      onChange(new Array(blanksCount).fill(''));
    }
    setSelectedWord(null);
    setActiveDropdownIndex(null);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, word) => {
    if (isReadOnly) return;
    e.dataTransfer.setData('text/plain', word);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragOver = (e, slotIndex) => {
    e.preventDefault();
    if (isReadOnly) return;
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverIndex !== slotIndex) {
      setDragOverIndex(slotIndex);
    }
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (isReadOnly) return;
    const word = e.dataTransfer.getData('text/plain');
    if (word) {
      handlePlaceWord(slotIndex, word);
    }
  };

  // Click slot handler
  const handleSlotClick = (slotIndex) => {
    if (isReadOnly) return;
    // Jika sedang ada kata yang dipilih dari bank kata, langsung tempatkan
    if (selectedWord) {
      handlePlaceWord(slotIndex, selectedWord);
      return;
    }
    // Jika belum ada kata yang dipilih dan slot belum terisi, buka dropdown opsi
    if (!currentAnswers[slotIndex]) {
      setActiveDropdownIndex(prev => prev === slotIndex ? null : slotIndex);
    }
  };

  return (
    <div className="space-y-5 select-none">
      {/* Area Kalimat dengan Slot Kosong (Drop Zones) */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-teal-50/40 via-white to-gray-50/50 rounded-2xl border border-teal-100/80 shadow-xs">
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-teal-100/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Lengkapi Kalimat di Bawah Ini
            </span>
            <span className="text-[11px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
              {blanksCount} Titik Kosong
            </span>
          </div>

          {!isReadOnly && currentAnswers.some(Boolean) && (
            <button
              type="button"
              onClick={handleResetAll}
              className="text-xs text-gray-500 hover:text-red-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-red-50 px-2.5 py-1 rounded-lg"
              title="Kosongkan seluruh isian"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Paragraf Kalimat Interaktif */}
        <div className="text-sm sm:text-base text-gray-800 leading-relaxed sm:leading-loose font-normal">
          {segments.map((seg, sIdx) => {
            if (seg.type === 'text') {
              return <span key={sIdx}>{seg.content}</span>;
            }

            const slotIndex = seg.index;
            const filledWord = currentAnswers[slotIndex];
            const isDragOver = dragOverIndex === slotIndex;
            const isDropdownOpen = activeDropdownIndex === slotIndex;

            // Jika mode showAnswers (misal preview admin)
            const answerKey = showAnswers ? (blankKeys[slotIndex] || seg.rawToken) : null;

            return (
              <span key={sIdx} className="inline-block relative mx-1.5 my-1 align-middle">
                {filledWord ? (
                  // Slot Terisi Kata
                  <span
                    onClick={() => !isReadOnly && handleRemoveWord(slotIndex)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold shadow-xs transition-all border ${
                      isReadOnly
                        ? 'bg-teal-50 text-teal-900 border-teal-300'
                        : 'bg-[#0F766E] text-white border-teal-700 hover:bg-teal-800 cursor-pointer group scale-100 hover:scale-[1.02]'
                    }`}
                    title={isReadOnly ? '' : 'Klik untuk menghapus atau mengganti kata'}
                  >
                    <span>{filledWord}</span>
                    {!isReadOnly && (
                      <X className="w-3.5 h-3.5 text-teal-200 group-hover:text-white transition-colors" />
                    )}
                  </span>
                ) : answerKey && showAnswers ? (
                  // Preview Kunci Jawaban (Admin Mode)
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-100 text-emerald-900 border-2 border-emerald-400 border-dashed">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{answerKey}</span>
                  </span>
                ) : (
                  // Slot Kosong (Drop Target & Dropdown Trigger)
                  <span
                    onClick={() => handleSlotClick(slotIndex)}
                    onDragOver={(e) => handleDragOver(e, slotIndex)}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => handleDrop(e, slotIndex)}
                    className={`inline-flex items-center justify-center gap-1 min-w-[90px] sm:min-w-[110px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 border-dashed transition-all cursor-pointer ${
                      isDragOver
                        ? 'bg-amber-100 border-amber-500 text-amber-900 scale-105 shadow-md'
                        : selectedWord
                        ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-300'
                        : 'bg-white border-gray-300 text-gray-400 hover:border-[#0F766E] hover:text-[#0F766E] hover:bg-teal-50/50'
                    }`}
                  >
                    <span>Titik #{slotIndex + 1}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </span>
                )}

                {/* Dropdown Popover untuk Memilih Kata (Sangat Ramah Mobile / Touch) */}
                {isDropdownOpen && !isReadOnly && (
                  <div className="absolute z-30 left-0 top-full mt-1.5 w-48 sm:w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 border-b border-gray-100">
                      Pilih Kata untuk Titik #{slotIndex + 1}:
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {allOptions.map((opt, optIdx) => {
                        const isUsed = Boolean(usedWordsCount[opt]);
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handlePlaceWord(slotIndex, opt)}
                            disabled={isUsed}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                              isUsed
                                ? 'text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                                : 'text-gray-800 hover:bg-teal-50 hover:text-[#0F766E] cursor-pointer'
                            }`}
                          >
                            <span>{opt}</span>
                            {isUsed && <span className="text-[10px] text-gray-400">Terpakai</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Bank Kata Pilihan (Draggable & Clickable Chips) */}
      {!showAnswers && allOptions.length > 0 && (
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Bank Kata Pilihan</span>
              <span className="text-[11px] text-gray-400 font-normal">
                (Tarik kata atau klik kata lalu klik titik kosong)
              </span>
            </h4>
            {selectedWord && (
              <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
                Klik salah satu titik kosong untuk meletakkan <b>"{selectedWord}"</b>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {allOptions.map((word, wIdx) => {
              const isUsed = Boolean(usedWordsCount[word]);
              const isSelected = selectedWord === word;

              return (
                <div
                  key={wIdx}
                  draggable={!isReadOnly && !isUsed}
                  onDragStart={(e) => handleDragStart(e, word)}
                  onClick={() => {
                    if (isReadOnly || isUsed) return;
                    setSelectedWord(prev => prev === word ? null : word);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all select-none ${
                    isUsed
                      ? 'bg-gray-100 text-gray-400 border border-gray-200 opacity-50 cursor-not-allowed line-through'
                      : isSelected
                      ? 'bg-amber-300 text-gray-900 ring-2 ring-amber-500 shadow-md scale-105 cursor-pointer'
                      : 'bg-white text-gray-800 border border-teal-200/90 shadow-2xs hover:border-[#0F766E] hover:text-[#0F766E] hover:bg-teal-50/60 cursor-grab active:cursor-grabbing hover:shadow-xs'
                  }`}
                  title={isUsed ? 'Kata sudah terpasang' : 'Tarik ke titik kosong atau klik untuk memilih'}
                >
                  <GripVertical className="w-3 h-3 text-gray-400 opacity-60" />
                  <span>{word}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Petunjuk Interaksi Ramah Pengguna */}
      <div className="flex items-center gap-2 text-[11px] text-gray-500 px-1">
        <span>
          <b>Tips:</b> Di layar laptop/komputer Anda dapat <b>menyeret (drag)</b> kata ke titik kosong. Di layar HP/ponsel Anda cukup <b>mengklik titik kosong</b> untuk memilih kata yang cocok.
        </span>
      </div>
    </div>
  );
}
