/**
 * Crossword Generator Utility
 * Menyusun kata-kata TTS secara otomatis dengan mencari titik persilangan huruf (intersections).
 * Menggunakan algoritma multi-pass scoring untuk memaksimalkan jumlah kata yang bersilangan (horizontal & vertikal).
 */

export function generateCrosswordLayout(wordList, maxGridSize = 12) {
  if (!wordList || wordList.length === 0) {
    return {
      grid: [],
      placedWords: [],
      unplacedWords: [],
      rows: 0,
      cols: 0
    };
  }

  // 1. Bersihkan kata: kapital, hanya huruf A-Z
  const cleanedList = wordList
    .map((item, idx) => {
      const cleanWord = (item.word || '').toUpperCase().replace(/[^A-Z]/g, '');
      return {
        id: item.id || `word-${idx}`,
        word: cleanWord,
        clue: item.clue || '',
        originalIndex: idx
      };
    })
    .filter(item => item.word.length >= 2);

  if (cleanedList.length === 0) {
    return {
      grid: [],
      placedWords: [],
      unplacedWords: [],
      rows: 0,
      cols: 0
    };
  }

  const CANVAS_SIZE = Math.max(maxGridSize * 2, 32);

  // Helper untuk menjalankan 1 kali percobaan layout
  function attemptLayout(wordsToPlace, startHorizontal = true) {
    const canvas = Array.from({ length: CANVAS_SIZE }, () => Array(CANVAS_SIZE).fill(null));
    const placed = [];
    const unplaced = [];

    const canPlaceWord = (word, startRow, startCol, direction) => {
      const isAcross = direction === 'mendatar';
      const endRow = isAcross ? startRow : startRow + word.length - 1;
      const endCol = isAcross ? startCol + word.length - 1 : startCol;

      // Cek batas canvas
      if (startRow < 0 || startCol < 0 || endRow >= CANVAS_SIZE || endCol >= CANVAS_SIZE) {
        return false;
      }

      // Cek sel tepat sebelum kata (harus kosong agar tidak menyambung kata lain)
      if (isAcross && startCol > 0 && canvas[startRow][startCol - 1] !== null) return false;
      if (!isAcross && startRow > 0 && canvas[startRow - 1][startCol] !== null) return false;

      // Cek sel tepat setelah kata (harus kosong)
      if (isAcross && endCol < CANVAS_SIZE - 1 && canvas[startRow][endCol + 1] !== null) return false;
      if (!isAcross && endRow < CANVAS_SIZE - 1 && canvas[endRow + 1][startCol] !== null) return false;

      let hasIntersection = placed.length === 0;

      for (let i = 0; i < word.length; i++) {
        const r = isAcross ? startRow : startRow + i;
        const c = isAcross ? startCol + i : startCol;
        const char = word[i];
        const existing = canvas[r][c];

        if (existing !== null) {
          if (existing !== char) {
            return false; // Tabrakan huruf berbeda
          }
          hasIntersection = true;
        } else {
          // Jika sel kosong, cek tetangga paralel agar tidak menempel tidak sengaja
          if (isAcross) {
            if (r > 0 && canvas[r - 1][c] !== null) return false;
            if (r < CANVAS_SIZE - 1 && canvas[r + 1][c] !== null) return false;
          } else {
            if (c > 0 && canvas[r][c - 1] !== null) return false;
            if (c < CANVAS_SIZE - 1 && canvas[r][c + 1] !== null) return false;
          }
        }
      }

      return hasIntersection;
    };

    const placeWord = (wordObj, row, col, direction) => {
      const isAcross = direction === 'mendatar';
      for (let i = 0; i < wordObj.word.length; i++) {
        const r = isAcross ? row : row + i;
        const c = isAcross ? col + i : col;
        canvas[r][c] = wordObj.word[i];
      }
      placed.push({
        ...wordObj,
        row,
        col,
        direction
      });
    };

    // Pasang kata pertama
    const firstWord = wordsToPlace[0];
    const midPoint = Math.floor(CANVAS_SIZE / 2);
    const startDir = startHorizontal ? 'mendatar' : 'menurun';
    const firstRow = startHorizontal ? midPoint : Math.max(0, midPoint - Math.floor(firstWord.word.length / 2));
    const firstCol = startHorizontal ? Math.max(0, midPoint - Math.floor(firstWord.word.length / 2)) : midPoint;
    placeWord(firstWord, firstRow, firstCol, startDir);

    // Pasang kata-kata berikutnya
    for (let w = 1; w < wordsToPlace.length; w++) {
      const currentWordObj = wordsToPlace[w];
      const word = currentWordObj.word;
      let successfullyPlaced = false;

      placementLoop:
      for (const placedItem of placed) {
        // Kata yang bersilangan harus memiliki arah tegak lurus (berlawanan)
        const oppositeDir = placedItem.direction === 'mendatar' ? 'menurun' : 'mendatar';

        for (let i = 0; i < word.length; i++) {
          const char = word[i];

          for (let j = 0; j < placedItem.word.length; j++) {
            if (placedItem.word[j] === char) {
              const intersectRow = placedItem.direction === 'mendatar' ? placedItem.row : placedItem.row + j;
              const intersectCol = placedItem.direction === 'mendatar' ? placedItem.col + j : placedItem.col;

              const candidateRow = oppositeDir === 'mendatar' ? intersectRow : intersectRow - i;
              const candidateCol = oppositeDir === 'mendatar' ? intersectCol - i : intersectCol;

              if (canPlaceWord(word, candidateRow, candidateCol, oppositeDir)) {
                placeWord(currentWordObj, candidateRow, candidateCol, oppositeDir);
                successfullyPlaced = true;
                break placementLoop;
              }
            }
          }
        }
      }

      if (!successfullyPlaced) {
        unplaced.push(currentWordObj);
      }
    }

    if (placed.length === 0) return null;

    // Hitung bounding box
    let minRow = CANVAS_SIZE, maxRow = 0;
    let minCol = CANVAS_SIZE, maxCol = 0;

    for (const item of placed) {
      minRow = Math.min(minRow, item.row);
      minCol = Math.min(minCol, item.col);
      const endRow = item.direction === 'mendatar' ? item.row : item.row + item.word.length - 1;
      const endCol = item.direction === 'mendatar' ? item.col + item.word.length - 1 : item.col;
      maxRow = Math.max(maxRow, endRow);
      maxCol = Math.max(maxCol, endCol);
    }

    const rows = maxRow - minRow + 1;
    const cols = maxCol - minCol + 1;

    // Hitung jumlah persilangan (intersections)
    let intersections = 0;
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const wordsAtCell = placed.filter(p => {
          if (p.direction === 'mendatar') {
            return p.row === r && c >= p.col && c < p.col + p.word.length;
          } else {
            return p.col === c && r >= p.row && r < p.row + p.word.length;
          }
        });
        if (wordsAtCell.length > 1) intersections++;
      }
    }

    // Skor kecocokan: maksimalkan kata terpasang, maksimalkan persilangan, minimalkan ukuran grid
    const score = (placed.length * 10000) + (intersections * 500) - (rows * cols) - (Math.abs(rows - cols) * 10);

    return {
      placed,
      unplaced,
      minRow,
      minCol,
      rows,
      cols,
      score,
      intersections
    };
  }

  // Jalankan multi-pass untuk mencari tata letak persilangan terbaik
  let bestResult = null;

  // Pass 1: Urut kata terpanjang ke terpendek, horizontal dulu
  const sortedLongest = [...cleanedList].sort((a, b) => b.word.length - a.word.length);
  const r1 = attemptLayout(sortedLongest, true);
  if (r1 && (!bestResult || r1.score > bestResult.score)) bestResult = r1;

  // Pass 2: Urut kata terpanjang, vertikal dulu
  const r2 = attemptLayout(sortedLongest, false);
  if (r2 && (!bestResult || r2.score > bestResult.score)) bestResult = r2;

  // Pass 3: Urutan input asli
  const r3 = attemptLayout(cleanedList, true);
  if (r3 && (!bestResult || r3.score > bestResult.score)) bestResult = r3;

  // Pass 4..N: Coba setiap kata sebagai titik awal (akar)
  for (let k = 0; k < Math.min(cleanedList.length, 6); k++) {
    const shifted = [cleanedList[k], ...cleanedList.filter((_, idx) => idx !== k)];
    const resH = attemptLayout(shifted, true);
    if (resH && (!bestResult || resH.score > bestResult.score)) bestResult = resH;
    const resV = attemptLayout(shifted, false);
    if (resV && (!bestResult || resV.score > bestResult.score)) bestResult = resV;
  }

  if (!bestResult) {
    return {
      grid: [],
      placedWords: [],
      unplacedWords: cleanedList,
      rows: 0,
      cols: 0
    };
  }

  const { placed, unplaced, minRow, minCol, rows: finalRows, cols: finalCols } = bestResult;

  // Normalisasi koordinat ke (0, 0)
  const normalizedWords = placed.map(item => ({
    ...item,
    row: item.row - minRow,
    col: item.col - minCol
  }));

  // Berikan nomor urut TTS standar (scan baris atas-ke-bawah, kolom kiri-ke-kanan)
  const startPoints = new Map();
  normalizedWords.forEach(w => {
    const key = `${w.row},${w.col}`;
    if (!startPoints.has(key)) {
      startPoints.set(key, []);
    }
    startPoints.get(key).push(w);
  });

  const sortedKeys = Array.from(startPoints.keys()).sort((a, b) => {
    const [r1, c1] = a.split(',').map(Number);
    const [r2, c2] = b.split(',').map(Number);
    if (r1 !== r2) return r1 - r2;
    return c1 - c2;
  });

  let currentNumber = 1;
  sortedKeys.forEach(key => {
    const wordsAtPoint = startPoints.get(key);
    wordsAtPoint.forEach(w => {
      w.number = currentNumber;
    });
    currentNumber++;
  });

  // Bentuk matriks grid akhir
  const finalGrid = Array.from({ length: finalRows }, () => Array(finalCols).fill(null));

  normalizedWords.forEach(w => {
    const isAcross = w.direction === 'mendatar';
    for (let i = 0; i < w.word.length; i++) {
      const r = isAcross ? w.row : w.row + i;
      const c = isAcross ? w.col + i : w.col;

      if (!finalGrid[r][c]) {
        finalGrid[r][c] = {
          char: w.word[i],
          number: (i === 0) ? w.number : null,
          words: [w.id]
        };
      } else {
        if (i === 0 && !finalGrid[r][c].number) {
          finalGrid[r][c].number = w.number;
        }
        finalGrid[r][c].words.push(w.id);
      }
    }
  });

  return {
    grid: finalGrid,
    placedWords: normalizedWords,
    unplacedWords: unplaced,
    rows: finalRows,
    cols: finalCols
  };
}
