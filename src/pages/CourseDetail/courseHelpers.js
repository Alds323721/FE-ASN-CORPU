export const extractYouTubeId = (url) => {
  if (!url) return null;
  let cleaned = String(url).trim();
  if (cleaned.includes('<iframe')) {
    const srcMatch = cleaned.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      cleaned = srcMatch[1];
    }
  }
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = cleaned.match(regExp);
  return match ? match[1] : null;
};

export const getDocumentUrl = (path) => {
  if (!path) return '';
  const trimmed = String(path).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${origin}${cleanPath}`;
};

export const isMateriVideo = (materi) => {
  if (!materi) return false;
  if (materi.tipe === 'h5p' || materi.tipe === 'scorm') return false;
  if (materi.tipe === 'video' || materi.tipe === 'video_embed') return true;
  if (extractYouTubeId(materi.tautan)) return true;
  if (materi.tautan && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(materi.tautan)) return true;
  return false;
};

export const getQuizBadges = (tipeSoalList = []) => {
  if (!tipeSoalList || !Array.isArray(tipeSoalList) || tipeSoalList.length === 0) return [];
  const badges = [];
  if (tipeSoalList.includes('tts')) {
    badges.push({ label: '🧩 TTS', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' });
  }
  if (tipeSoalList.includes('drag_drop')) {
    badges.push({ label: '🎯 Drag & Drop', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' });
  }
  if (tipeSoalList.includes('pilihan_berbobot')) {
    badges.push({ label: '⭐ Berbobot', color: 'bg-amber-50 text-amber-700 border-amber-200' });
  }
  if (tipeSoalList.includes('pilihan_ganda') && (tipeSoalList.includes('tts') || tipeSoalList.includes('drag_drop') || tipeSoalList.includes('pilihan_berbobot'))) {
    badges.push({ label: '📝 PG', color: 'bg-teal-50 text-teal-700 border-teal-200' });
  }
  return badges;
};

export const findNextMateriInfo = (allModuls, currentModulId, currentMateriId) => {
  if (!allModuls || allModuls.length === 0) return null;

  let currentModul = null;
  if (currentModulId) {
    currentModul = allModuls.find(m => String(m.modul_id) === String(currentModulId));
  }
  if (!currentModul && currentMateriId) {
    currentModul = allModuls.find(m => m.materi?.some(mat => String(mat.materi_id) === String(currentMateriId)));
  }
  if (!currentModul || !Array.isArray(currentModul.materi)) return null;

  const sortedMateri = [...currentModul.materi].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  const currIdx = sortedMateri.findIndex(m => String(m.materi_id) === String(currentMateriId));

  // 1. Cek apakah ada materi berikutnya di modul yang sama
  if (currIdx !== -1 && currIdx + 1 < sortedMateri.length) {
    return {
      type: 'same_modul_materi',
      materi: sortedMateri[currIdx + 1],
      modul: currentModul,
      modulId: currentModul.modul_id
    };
  }

  // 2. Jika materi terakhir di modul, cek kuis evaluasi modul
  if (currentModul.kuis && !currentModul.kuis.is_completed) {
    return {
      type: 'modul_kuis',
      kuis: currentModul.kuis,
      modul: currentModul,
      modulId: currentModul.modul_id
    };
  }

  // 2b. Jika kuis evaluasi modul sudah selesai atau tidak ada, periksa kuis nilai berbobot
  if (currentModul.kuis_berbobot && !currentModul.kuis_berbobot.is_completed) {
    return {
      type: 'modul_kuis',
      kuis: currentModul.kuis_berbobot,
      modul: currentModul,
      modulId: currentModul.modul_id
    };
  }

  // 3. Cek apakah ada modul berikutnya
  const curModulIdx = allModuls.findIndex(m => String(m.modul_id) === String(currentModul.modul_id));
  if (curModulIdx !== -1 && curModulIdx + 1 < allModuls.length) {
    const nextMod = allModuls[curModulIdx + 1];
    if (nextMod.materi && nextMod.materi.length > 0) {
      const nextSortedMateri = [...nextMod.materi].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
      return {
        type: 'next_modul_materi',
        materi: nextSortedMateri[0],
        modul: nextMod,
        modulId: nextMod.modul_id
      };
    }
  }

  return {
    type: 'all_completed'
  };
};
