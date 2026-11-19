import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowRight, ArrowDown, Check, HelpCircle } from 'lucide-react';

export default function CrosswordBoard({
  gridConfig,
  gridData,
  words = [],
  answers = {},
  onAnswerChange,
  isReadOnly = false,
  showAnswers = false,
  focusedWordId = null
}) {
  const [selectedCell, setSelectedCell] = useState(null); // { r, c }
  const [direction, setDirection] = useState('mendatar'); // 'mendatar' | 'menurun'
  const inputRef = useRef(null);

  // Normalisasi data kata (mendukung format database maupun hasil crosswordGenerator)
  const normalizedWords = useMemo(() => {
    const rawList = (words && words.length > 0) ? words : (gridData?.placedWords || []);
    return rawList.map((w, idx) => ({
      soal_kuis_id: w.soal_kuis_id ?? w.id ?? idx,
      tipe_soal: 'tts',
      arah: w.arah || w.direction || 'mendatar',
      nomor_urut: w.nomor_urut ?? w.number ?? (idx + 1),
      baris_mulai: w.baris_mulai ?? w.row ?? 0,
      kolom_mulai: w.kolom_mulai ?? w.col ?? 0,
      panjang_kata: w.panjang_kata || (w.word ? w.word.length : (w.kunci_jawaban ? w.kunci_jawaban.length : 0)),
      teks_soal: w.teks_soal || w.clue || '',
      kunci_jawaban: w.kunci_jawaban || w.word || '',
      bobot_nilai: w.bobot_nilai ?? 1
    }));
  }, [words, gridData]);

  useEffect(() => {
    if (focusedWordId === null || focusedWordId === undefined || isReadOnly) return;
    const targetWord = normalizedWords.find(w => String(w.soal_kuis_id) === String(focusedWordId));
    if (targetWord) {
      setSelectedCell({ r: targetWord.baris_mulai || 0, c: targetWord.kolom_mulai || 0 });
      setDirection(targetWord.arah || 'mendatar');
    }
  }, [focusedWordId, normalizedWords, isReadOnly]);

  // 1. Hitung dimensi grid
  const computedRows = useMemo(() => {
    if (gridConfig?.rows) return gridConfig.rows;
    if (gridData?.rows) return gridData.rows;
    let maxR = 0;
    normalizedWords.forEach(w => {
      const endR = w.arah === 'menurun' ? (w.baris_mulai || 0) + (w.panjang_kata || 0) - 1 : (w.baris_mulai || 0);
      if (endR > maxR) maxR = endR;
    });
    return Math.max(maxR + 1, 1);
  }, [gridConfig, gridData, normalizedWords]);

  const computedCols = useMemo(() => {
    if (gridConfig?.cols) return gridConfig.cols;
    if (gridData?.cols) return gridData.cols;
    let maxC = 0;
    normalizedWords.forEach(w => {
      const endC = w.arah === 'mendatar' ? (w.kolom_mulai || 0) + (w.panjang_kata || 0) - 1 : (w.kolom_mulai || 0);
      if (endC > maxC) maxC = endC;
    });
    return Math.max(maxC + 1, 1);
  }, [gridConfig, gridData, normalizedWords]);

  const rows = computedRows;
  const cols = computedCols;

  // 2. Bangun peta cell dan persilangan kata
  const { cellMap, startNumbers } = useMemo(() => {
    const map = {}; // "r,c" => { words: [{ wordObj, charIndex }], acrossWord, downWord }
    const starts = {}; // "r,c" => number

    normalizedWords.forEach(w => {
      const isAcross = w.arah === 'mendatar';
      const len = w.panjang_kata || (w.kunci_jawaban ? w.kunci_jawaban.length : 0);
      const startR = w.baris_mulai ?? 0;
      const startC = w.kolom_mulai ?? 0;

      starts[`${startR},${startC}`] = w.nomor_urut;

      for (let i = 0; i < len; i++) {
        const r = isAcross ? startR : startR + i;
        const c = isAcross ? startC + i : startC;
        const key = `${r},${c}`;

        if (!map[key]) {
          map[key] = { words: [], acrossWord: null, downWord: null };
        }

        const wordInfo = { wordObj: w, charIndex: i };
        map[key].words.push(wordInfo);

        if (isAcross) {
          map[key].acrossWord = wordInfo;
        } else {
          map[key].downWord = wordInfo;
        }
      }
    });

    return { cellMap: map, startNumbers: starts };
  }, [normalizedWords]);

  // 3. Tentukan kata aktif berdasarkan sel & arah terpilih
  const activeWordInfo = useMemo(() => {
    if (!selectedCell) return null;
    const key = `${selectedCell.r},${selectedCell.c}`;
    const cellData = cellMap[key];
    if (!cellData) return null;

    if (direction === 'mendatar' && cellData.acrossWord) {
      return cellData.acrossWord;
    }
    if (direction === 'menurun' && cellData.downWord) {
      return cellData.downWord;
    }
    return cellData.acrossWord || cellData.downWord || null;
  }, [selectedCell, direction, cellMap]);

  // 4. Sinkronkan arah jika sel terpilih hanya punya 1 arah
  useEffect(() => {
    if (!selectedCell) return;
    const key = `${selectedCell.r},${selectedCell.c}`;
    const cellData = cellMap[key];
    if (!cellData) return;

    if (direction === 'mendatar' && !cellData.acrossWord && cellData.downWord) {
      setDirection('menurun');
    } else if (direction === 'menurun' && !cellData.downWord && cellData.acrossWord) {
      setDirection('mendatar');
    }
  }, [selectedCell, cellMap]);

  // 5. Helper mengambil huruf pada sel (r, c) dari state answers
  const getCellChar = (r, c) => {
    const key = `${r},${c}`;
    const cellData = cellMap[key];
    if (!cellData) return '';

    // Jika mode showAnswers (misal preview admin)
    if (showAnswers) {
      for (const info of cellData.words) {
        if (info.wordObj.kunci_jawaban) {
          return info.wordObj.kunci_jawaban[info.charIndex] || '';
        }
      }
    }

    // Ambil dari jawaban peserta
    for (const info of cellData.words) {
      const userAns = answers[info.wordObj.soal_kuis_id] || '';
      if (userAns[info.charIndex]) {
        return userAns[info.charIndex].toUpperCase();
      }
    }

    return '';
  };

  // 6. Handle klik cell
  const handleCellClick = (r, c) => {
    if (isReadOnly) return;
    const key = `${r},${c}`;
    const cellData = cellMap[key];
    if (!cellData) return; // Sel hitam/kosong

    if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
      // Toggle arah jika sel ini persilangan 2 kata
      if (cellData.acrossWord && cellData.downWord) {
        setDirection(prev => prev === 'mendatar' ? 'menurun' : 'mendatar');
      }
    } else {
      setSelectedCell({ r, c });
    }

    // Fokus ke hidden input agar keyboard muncul di mobile
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 7. Handle klik petunjuk (clue)
  const handleClueClick = (wordObj) => {
    if (isReadOnly) return;
    setSelectedCell({ r: wordObj.baris_mulai || 0, c: wordObj.kolom_mulai || 0 });
    setDirection(wordObj.arah || 'mendatar');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 8. Handle input huruf
  const handleKeyDown = (e) => {
    if (isReadOnly || !selectedCell || !activeWordInfo) return;

    const key = e.key;

    // A-Z input
    if (/^[a-zA-Z]$/.test(key)) {
      e.preventDefault();
      const char = key.toUpperCase();
      const currentWord = activeWordInfo.wordObj;
      const charIndex = activeWordInfo.charIndex;
      const len = currentWord.panjang_kata || (currentWord.kunci_jawaban ? currentWord.kunci_jawaban.length : 0);

      // Bentuk string jawaban baru untuk kata aktif
      const currentAnswer = (answers[currentWord.soal_kuis_id] || '').padEnd(len, ' ');
      const newAnswerArr = currentAnswer.split('');
      newAnswerArr[charIndex] = char;
      const newAnswer = newAnswerArr.join('').trimEnd();

      if (onAnswerChange) {
        onAnswerChange(currentWord.soal_kuis_id, newAnswer);

        // Jika sel ini juga bagian dari kata yang bersilangan, sinkronkan juga kata satunya
        const cellKey = `${selectedCell.r},${selectedCell.c}`;
        const otherWordInfo = cellMap[cellKey]?.words.find(w => w.wordObj.soal_kuis_id !== currentWord.soal_kuis_id);
        if (otherWordInfo) {
          const otherWord = otherWordInfo.wordObj;
          const otherLen = otherWord.panjang_kata || (otherWord.kunci_jawaban ? otherWord.kunci_jawaban.length : 0);
          const otherCurrent = (answers[otherWord.soal_kuis_id] || '').padEnd(otherLen, ' ');
          const otherArr = otherCurrent.split('');
          otherArr[otherWordInfo.charIndex] = char;
          onAnswerChange(otherWord.soal_kuis_id, otherArr.join('').trimEnd());
        }
      }

      // Otomatis maju ke sel berikutnya
      if (charIndex < len - 1) {
        const nextR = direction === 'mendatar' ? selectedCell.r : selectedCell.r + 1;
        const nextC = direction === 'mendatar' ? selectedCell.c + 1 : selectedCell.c;
        setSelectedCell({ r: nextR, c: nextC });
      }
    } else if (key === 'Backspace') {
      e.preventDefault();
      const currentWord = activeWordInfo.wordObj;
      const charIndex = activeWordInfo.charIndex;
      const len = currentWord.panjang_kata || (currentWord.kunci_jawaban ? currentWord.kunci_jawaban.length : 0);
      const currentAnswer = (answers[currentWord.soal_kuis_id] || '').padEnd(len, ' ');
      const hasChar = currentAnswer[charIndex] && currentAnswer[charIndex] !== ' ';

      if (hasChar) {
        const newAnswerArr = currentAnswer.split('');
        newAnswerArr[charIndex] = ' ';
        if (onAnswerChange) {
          onAnswerChange(currentWord.soal_kuis_id, newAnswerArr.join('').trimEnd());
        }
      } else if (charIndex > 0) {
        // Mundur ke sel sebelumnya
        const prevR = direction === 'mendatar' ? selectedCell.r : selectedCell.r - 1;
        const prevC = direction === 'mendatar' ? selectedCell.c - 1 : selectedCell.c;
        setSelectedCell({ r: prevR, c: prevC });
      }
    } else if (key === 'ArrowRight' && selectedCell.c < cols - 1) {
      setSelectedCell({ r: selectedCell.r, c: selectedCell.c + 1 });
    } else if (key === 'ArrowLeft' && selectedCell.c > 0) {
      setSelectedCell({ r: selectedCell.r, c: selectedCell.c - 1 });
    } else if (key === 'ArrowDown' && selectedCell.r < rows - 1) {
      setSelectedCell({ r: selectedCell.r + 1, c: selectedCell.c });
    } else if (key === 'ArrowUp' && selectedCell.r > 0) {
      setSelectedCell({ r: selectedCell.r - 1, c: selectedCell.c });
    }
  };

  // Pisahkan kata mendatar & menurun untuk daftar petunjuk
  const acrossWords = normalizedWords.filter(w => w.arah === 'mendatar').sort((a, b) => (a.nomor_urut || 0) - (b.nomor_urut || 0));
  const downWords = normalizedWords.filter(w => w.arah === 'menurun').sort((a, b) => (a.nomor_urut || 0) - (b.nomor_urut || 0));

  // Cek apakah seluruh huruf pada sebuah kata sudah terisi
  const isWordFilled = (w) => {
    const ans = answers[w.soal_kuis_id] || '';
    const len = w.panjang_kata || (w.kunci_jawaban ? w.kunci_jawaban.length : 0);
    return ans.trim().length === len && !ans.includes(' ');
  };

  // Ukuran sel adaptif proporsional sesuai jumlah kolom agar kata mendatar muat rapi dan tidak terpotong
  const cellSize = useMemo(() => {
    if (cols <= 5) return { box: 'w-10 h-10 sm:w-11 sm:h-11', text: 'text-base sm:text-lg', num: 'text-[9px] sm:text-[10px]' };
    if (cols <= 8) return { box: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10', text: 'text-xs sm:text-sm md:text-base', num: 'text-[8px] sm:text-[9px]' };
    return { box: 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9', text: 'text-xs sm:text-sm', num: 'text-[7px] sm:text-[8px]' };
  }, [cols]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
      {/* Hidden input untuk fokus mobile keyboard */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -z-50 pointer-events-none"
        onKeyDown={handleKeyDown}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
      />

      {/* Grid Papan TTS */}
      <div className="flex-1 w-full min-w-0 flex flex-col items-center bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex justify-between items-center w-full mb-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Papan Teka-Teki Silang</span>
            <span className="text-[11px] text-gray-500 font-medium">({rows} × {cols})</span>
          </div>
          {activeWordInfo && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
              <span className="font-bold text-teal-800">
                {activeWordInfo.wordObj.nomor_urut}. {activeWordInfo.wordObj.arah === 'mendatar' ? 'Mendatar' : 'Menurun'}
              </span>
              <span className="text-gray-400">({activeWordInfo.wordObj.panjang_kata || activeWordInfo.wordObj.kunci_jawaban?.length} huruf)</span>
            </div>
          )}
        </div>

        {/* Board Container - Safe horizontal scroll tanpa terpotong di kiri */}
        <div className="overflow-x-auto max-w-full p-2 w-full text-center">
          <div
            className="inline-grid select-none bg-slate-900 p-3 sm:p-4 rounded-2xl shadow-xl text-left"
            style={{
              gridTemplateColumns: `repeat(${cols}, max-content)`,
              gridTemplateRows: `repeat(${rows}, max-content)`,
              gap: '4px'
            }}
          >
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((_, c) => {
                const key = `${r},${c}`;
                const cellData = cellMap[key];
                const isActiveCell = Boolean(cellData);
                const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;

                // Cek apakah sel ini merupakan bagian dari kata yang sedang aktif disorot
                const isPartOfActiveWord = activeWordInfo && cellData?.words.some(
                  w => w.wordObj.soal_kuis_id === activeWordInfo.wordObj.soal_kuis_id
                );

                const char = getCellChar(r, c);
                const startNum = startNumbers[key];

                if (!isActiveCell) {
                  return (
                    <div
                      key={key}
                      className={`${cellSize.box} rounded-lg bg-slate-950/70 border border-slate-800/60 pointer-events-none`}
                    />
                  );
                }

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    disabled={isReadOnly}
                    className={`${cellSize.box} ${cellSize.text} rounded-lg font-bold flex items-center justify-center relative transition-all duration-150 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-amber-300 text-gray-900 ring-2 ring-amber-500 shadow-md scale-105 z-10'
                        : isPartOfActiveWord
                        ? 'bg-teal-100 text-[#0F766E] border-2 border-teal-500 font-extrabold'
                        : 'bg-white text-gray-900 border border-gray-300 hover:bg-teal-50/70'
                    }`}
                  >
                    {startNum && (
                      <span className={`absolute top-0.5 left-1 ${cellSize.num} font-extrabold text-teal-800 leading-none`}>
                        {startNum}
                      </span>
                    )}
                    <span className="mt-1">{char}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Petunjuk Aksi Bawah Board */}
        <div className="flex flex-wrap items-center justify-between w-full mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 gap-2">
          <span>Klik kotak atau klik nomor petunjuk untuk mulai mengetik.</span>
          <span className="hidden sm:inline">Gunakan tombol <b>Backspace</b> untuk menghapus dan <b>Panah</b> untuk navigasi.</span>
        </div>
      </div>

      {/* Daftar Petunjuk (Clues) */}
      <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
        {/* Mendatar (Across) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-teal-200/80 shadow-xs">
          <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-teal-100 text-teal-900">
            <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center text-[#0F766E]">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0F766E]">Mendatar</h4>
              <p className="text-[10px] text-gray-400">Petunjuk horizontal</p>
            </div>
            <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold ml-auto border border-teal-200">
              {acrossWords.length} Kata
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {acrossWords.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2 text-center">Tidak ada kata mendatar</p>
            ) : (
              acrossWords.map((w) => {
                const isSelected = activeWordInfo?.wordObj.soal_kuis_id === w.soal_kuis_id;
                const filled = isWordFilled(w);

                return (
                  <button
                    key={w.soal_kuis_id || w.nomor_urut}
                    type="button"
                    onClick={() => handleClueClick(w)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-500 text-teal-950 shadow-xs ring-1 ring-teal-400'
                        : 'hover:bg-gray-50 border-gray-200/80 text-gray-800'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-[#0F766E] text-white flex items-center justify-center font-extrabold shrink-0 text-[10px] shadow-2xs mt-0.5">
                      {w.nomor_urut}
                    </span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="leading-snug font-semibold text-gray-900">{w.teks_soal}</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                          {w.panjang_kata || w.kunci_jawaban?.length} huruf
                        </span>
                        {showAnswers && w.kunci_jawaban && (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold tracking-wider font-mono">
                            Kunci: {w.kunci_jawaban}
                          </span>
                        )}
                      </div>
                    </div>
                    {filled && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Menurun (Down) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-indigo-200/80 shadow-xs">
          <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-indigo-100 text-indigo-900">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-800">Menurun</h4>
              <p className="text-[10px] text-gray-400">Petunjuk vertikal</p>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold ml-auto border border-indigo-200">
              {downWords.length} Kata
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {downWords.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2 text-center">Tidak ada kata menurun</p>
            ) : (
              downWords.map((w) => {
                const isSelected = activeWordInfo?.wordObj.soal_kuis_id === w.soal_kuis_id;
                const filled = isWordFilled(w);

                return (
                  <button
                    key={w.soal_kuis_id || w.nomor_urut}
                    type="button"
                    onClick={() => handleClueClick(w)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-400'
                        : 'hover:bg-gray-50 border-gray-200/80 text-gray-800'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-indigo-700 text-white flex items-center justify-center font-extrabold shrink-0 text-[10px] shadow-2xs mt-0.5">
                      {w.nomor_urut}
                    </span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="leading-snug font-semibold text-gray-900">{w.teks_soal}</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                          {w.panjang_kata || w.kunci_jawaban?.length} huruf
                        </span>
                        {showAnswers && w.kunci_jawaban && (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold tracking-wider font-mono">
                            Kunci: {w.kunci_jawaban}
                          </span>
                        )}
                      </div>
                    </div>
                    {filled && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
