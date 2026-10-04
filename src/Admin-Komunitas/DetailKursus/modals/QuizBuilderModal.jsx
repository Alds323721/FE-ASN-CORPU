import React from 'react';
import {
  X, BookOpen, Grid, Sparkles, Star, Trash2, Plus, RefreshCw, AlertCircle
} from 'lucide-react';
import CrosswordBoard from '../../../components/CrosswordBoard';
import DragDropQuiz from '../../../components/DragDropQuiz';

const QuizBuilderModal = ({
  isOpen,
  onClose,
  targetQuizModule,
  targetQuizType,
  targetQuizMateri,
  quizForm,
  setQuizForm,
  quizActiveTab,
  setQuizActiveTab,
  newQuizItem,
  setNewQuizItem,
  handleAddQuestionToQuiz,
  handleRemoveQuestionFromQuiz,
  ttsInputWords,
  newTtsItem,
  setNewTtsItem,
  handleAddTtsWord,
  handleRemoveTtsWord,
  ttsLayout,
  handleRegenerateTtsLayout,
  newDragDropItem,
  setNewDragDropItem,
  handleAddDragDropToQuiz,
  handleRemoveDragDropFromQuiz,
  newWeightedItem,
  setNewWeightedItem,
  handleAddWeightedToQuiz,
  handleRemoveWeightedFromQuiz,
  getModulQuiz,
  handleDeleteQuiz,
  handleSaveQuiz
}) => {
  if (!isOpen || !targetQuizModule) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 max-h-[92vh] overflow-y-auto overflow-x-hidden">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">
                {targetQuizType === 'pre_test'
                  ? `Kelola Pre-Test Materi: ${targetQuizMateri?.judul_materi}`
                  : targetQuizType === 'kuis_berbobot'
                  ? `Kelola Kuis Nilai Berbobot: ${targetQuizModule.judul_modul}`
                  : `Kelola Kuis Evaluasi: ${targetQuizModule.judul_modul}`}
              </h3>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  targetQuizType === 'pre_test'
                    ? 'bg-amber-100 text-amber-800'
                    : targetQuizType === 'kuis_berbobot'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {targetQuizType === 'pre_test'
                  ? 'Pre-Test Materi'
                  : targetQuizType === 'kuis_berbobot'
                  ? 'Kuis Nilai Berbobot'
                  : 'Evaluasi Modul'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {targetQuizType === 'pre_test'
                ? 'Pre-test ini wajib dikerjakan peserta untuk membuka berkas materi. Tidak ada nilai kelulusan minimal.'
                : targetQuizType === 'kuis_berbobot'
                ? 'Kuis dengan sistem penilaian berbasis bobot nilai pada setiap butir soal & opsi (tidak ada salah/benar mutlak).'
                : 'Konfigurasi soal evaluasi pemahaman modul (Pilihan Ganda, TTS, Drag & Drop, atau Pilihan Berbobot).'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz General Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className={targetQuizType === 'pre_test' ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Judul {targetQuizType === 'pre_test' ? 'Pre-Test' : targetQuizType === 'kuis_berbobot' ? 'Kuis Berbobot' : 'Kuis'}
            </label>
            <input
              type="text"
              value={quizForm.judul_kuis || ''}
              onChange={(e) => setQuizForm({ ...quizForm, judul_kuis: e.target.value })}
              className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Durasi (Menit)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="300"
                value={quizForm.durasi_menit ?? 15}
                onChange={(e) => setQuizForm({ ...quizForm, durasi_menit: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                placeholder="15"
              />
              <span className="absolute right-2.5 top-1.5 text-xs text-gray-400 pointer-events-none">mnt</span>
            </div>
          </div>
          {targetQuizType === 'evaluasi_modul' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Passing Grade (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={quizForm.nilai_kelulusan ?? 70}
                  onChange={(e) => setQuizForm({ ...quizForm, nilai_kelulusan: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Maks. Percobaan</label>
                <input
                  type="number"
                  min="1"
                  value={quizForm.maks_percobaan ?? 3}
                  onChange={(e) => setQuizForm({ ...quizForm, maks_percobaan: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                />
              </div>
            </>
          ) : targetQuizType === 'kuis_berbobot' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Passing Grade (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={quizForm.nilai_kelulusan ?? 0}
                  onChange={(e) => setQuizForm({ ...quizForm, nilai_kelulusan: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                  placeholder="0 (Selalu Lulus)"
                />
                <span className="text-[10px] text-gray-400">0 = Otomatis lulus</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Maks. Percobaan</label>
                <input
                  type="number"
                  min="1"
                  value={quizForm.maks_percobaan ?? 3}
                  onChange={(e) => setQuizForm({ ...quizForm, maks_percobaan: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Syarat Kelulusan</label>
              <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                Pre-test tidak memerlukan syarat kelulusan skor nilai.
              </div>
            </div>
          )}
        </div>

        {/* Tab Nav: Pilihan Ganda vs Teka-Teki Silang vs Drag & Drop vs Pilihan Berbobot */}
        <div className="flex border-b border-gray-200 gap-2 sm:gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setQuizActiveTab('pilihan_ganda')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
              quizActiveTab === 'pilihan_ganda'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Pilihan Ganda ({quizForm.soal.filter((s) => s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal).length})
          </button>
          <button
            type="button"
            onClick={() => setQuizActiveTab('tts')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
              quizActiveTab === 'tts'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="w-4 h-4" />
            Teka-Teki Silang (TTS) ({ttsInputWords.length})
          </button>
          <button
            type="button"
            onClick={() => setQuizActiveTab('drag_drop')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
              quizActiveTab === 'drag_drop'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Drag & Drop ({quizForm.soal.filter((s) => s.tipe_soal === 'drag_drop').length})
          </button>
          <button
            type="button"
            onClick={() => setQuizActiveTab('pilihan_berbobot')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
              quizActiveTab === 'pilihan_berbobot'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            Pilihan Berbobot ({quizForm.soal.filter((s) => s.tipe_soal === 'pilihan_berbobot').length})
          </button>
        </div>

        {/* TAB CONTENT: PILIHAN GANDA */}
        {quizActiveTab === 'pilihan_ganda' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Daftar Butir Pilihan Ganda ({quizForm.soal.filter((s) => s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal).length})
              </h4>
              {quizForm.soal.filter((s) => s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal).length === 0 ? (
                <p className="text-xs text-gray-400 italic py-3 bg-gray-50 rounded-lg text-center">
                  Belum ada butir soal pilihan ganda. Tambahkan melalui formulir di bawah jika diperlukan.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {quizForm.soal
                    .filter((s) => s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal)
                    .map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 border border-gray-100 rounded-lg bg-gray-50/70 flex justify-between items-start gap-2"
                      >
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-gray-900">
                            {idx + 1}. {q.teks_soal}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-teal-700 font-semibold">Kunci: {q.kunci_jawaban}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600 font-medium">Bobot: {q.bobot_nilai || 1} Poin</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionFromQuiz(idx)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Add Question Form PG */}
            <form onSubmit={handleAddQuestionToQuiz} className="border border-teal-100 bg-teal-50/30 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">Tambah Pertanyaan Pilihan Ganda</h4>
              <div>
                <input
                  type="text"
                  placeholder="Tuliskan butir soal pertanyaan..."
                  value={newQuizItem.teks_soal || ''}
                  onChange={(e) => setNewQuizItem({ ...newQuizItem, teks_soal: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['A', 'B', 'C', 'D'].map((optKey) => (
                  <div key={optKey} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 w-4">{optKey}.</span>
                    <input
                      type="text"
                      placeholder={`Pilihan ${optKey}`}
                      value={newQuizItem[`opsi${optKey}`] || ''}
                      onChange={(e) => setNewQuizItem({ ...newQuizItem, [`opsi${optKey}`]: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Bobot Nilai:</label>
                    <input
                      type="number"
                      min="1"
                      value={newQuizItem.bobot_nilai || 1}
                      onChange={(e) => setNewQuizItem({ ...newQuizItem, bobot_nilai: Number(e.target.value) })}
                      className="w-16 h-8 px-2 bg-white border border-gray-300 rounded text-xs font-bold text-teal-800 text-center"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">Kunci Jawaban Benar:</span>
                    <select
                      value={newQuizItem.kunci_jawaban || 'A'}
                      onChange={(e) => setNewQuizItem({ ...newQuizItem, kunci_jawaban: e.target.value })}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-teal-700"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Soal PG
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB CONTENT: TEKA-TEKI SILANG (TTS) */}
        {quizActiveTab === 'tts' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Game Teka-Teki Silang Interaktif:</span> Masukkan kata kunci jawaban dan petunjuk (clue). Kotak persilangan kata dan nomor petunjuk akan otomatis dihitung dan disusun ke dalam papan TTS.
              </div>
            </div>

            <form onSubmit={handleAddTtsWord} className="border border-teal-200 bg-teal-50/30 p-4 sm:p-5 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#0F766E] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Tambah Kata & Petunjuk TTS
                </h4>
                <span className="text-[11px] text-gray-500 font-medium">Hanya huruf A-Z, tanpa spasi</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                <div className="md:col-span-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-700">Kata Kunci (Jawaban)</label>
                    <span className="text-[10px] text-teal-700 font-semibold">{newTtsItem.word.length} huruf</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: INTEGRITAS"
                    value={newTtsItem.word}
                    onChange={(e) =>
                      setNewTtsItem({
                        ...newTtsItem,
                        word: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                      })
                    }
                    className="w-full h-10 px-3.5 bg-white border border-gray-300 rounded-lg text-xs font-extrabold tracking-wider text-teal-900 uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="md:col-span-5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-700">Petunjuk (Clue / Soal)</label>
                    <span className="text-[10px] text-gray-400">Pertanyaan peserta</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: Sikap teguh berpegang pada nilai moral dan kejujuran"
                    value={newTtsItem.clue}
                    onChange={(e) => setNewTtsItem({ ...newTtsItem, clue: e.target.value })}
                    className="w-full h-10 px-3.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="md:col-span-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-700">Bobot</label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={newTtsItem.bobot_nilai || 1}
                    onChange={(e) => setNewTtsItem({ ...newTtsItem, bobot_nilai: Number(e.target.value) })}
                    className="w-full h-10 px-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-teal-800 text-center focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="h-[17px] mb-1"></div>
                  <button
                    type="submit"
                    className="w-full h-10 bg-[#0F766E] text-white rounded-lg text-xs font-bold hover:bg-teal-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </div>
              </div>
            </form>

            {/* List Kata TTS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Daftar Kata TTS</span>
                  <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {ttsInputWords.length} Kata
                  </span>
                </h4>
                {ttsInputWords.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRegenerateTtsLayout}
                    className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1.5 hover:underline cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                    title="Acak ulang susunan persilangan kata"
                  >
                    <RefreshCw className="w-3 h-3" /> Acak Ulang Susunan
                  </button>
                )}
              </div>

              {ttsInputWords.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <Grid className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-gray-500">Belum ada kata TTS yang ditambahkan.</p>
                  <p className="text-[11px] text-gray-400">Tambahkan minimal 2 kata di atas untuk menghasilkan papan TTS otomatis.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-gray-50/70 rounded-xl border border-gray-200">
                  {ttsInputWords.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-teal-200 shadow-2xs text-xs group hover:border-teal-400 transition-colors"
                    >
                      <span className="font-extrabold text-teal-900 tracking-wider uppercase">{item.word}</span>
                      <span className="bg-teal-50 text-teal-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {item.word.length}H
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600 truncate max-w-[220px]" title={item.clue}>
                        {item.clue}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTtsWord(item.id)}
                        className="text-gray-400 hover:text-red-500 ml-1 p-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus kata"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Preview Grid TTS */}
            {ttsLayout && (
              <div className="border border-teal-100 rounded-2xl p-4 sm:p-5 bg-teal-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-800 flex items-center gap-2">
                    <Grid className="w-4 h-4 text-[#0F766E]" />
                    Preview Papan Teka-Teki Silang ({ttsLayout.rows} &times; {ttsLayout.cols} Kotak)
                  </span>
                  <span className="text-[11px] text-[#0F766E] bg-teal-100/70 px-2.5 py-0.5 rounded-full border border-teal-200 font-bold">
                    {ttsLayout.placedWords.length} Kata Tersusun Rapi
                  </span>
                </div>

                {ttsLayout.unplacedWords && ttsLayout.unplacedWords.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Perhatian:</span> Kata (
                      <b>{ttsLayout.unplacedWords.map((w) => w.word).join(', ')}</b>) belum memiliki huruf yang bersilangan dengan kata lainnya. Coba klik <b>"Acak Ulang Susunan"</b> atau tambahkan kata lain yang memiliki huruf yang sama.
                    </div>
                  </div>
                )}

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs w-full overflow-hidden">
                  <CrosswordBoard gridData={ttsLayout} showAnswers={true} isReadOnly={true} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: DRAG & DROP / DROPDOWN */}
        {quizActiveTab === 'drag_drop' && (
          <div className="space-y-5">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-teal-900">
              <Sparkles className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">Cara Membuat Soal Dropdown / Drag & Drop:</span> Tuliskan kalimat soal dan apit kata yang ingin dijadikan titik-titik kosong menggunakan tanda kurung siku <b>[ ... ]</b>. Kata di dalam kurung siku otomatis menjadi kunci jawaban dan bank pilihan.
                <div className="mt-1 text-[11px] text-teal-700 font-mono bg-white/70 px-2 py-1 rounded border border-teal-100">
                  Contoh: Anak ayam lahir dari [telur] dan ikan bernafas dengan [insang]
                </div>
              </div>
            </div>

            {/* Form Tambah Soal Drag & Drop */}
            <form onSubmit={handleAddDragDropToQuiz} className="border border-teal-200 bg-teal-50/20 p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#0F766E] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Tambah Soal Dropdown / Drag & Drop
                </h4>
                <span className="text-[11px] text-gray-500 font-medium">Apit kata kunci dengan [ ]</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Kalimat Soal (Gunakan [kunci] untuk titik-titik kosong)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: ASN harus memiliki nilai dasar [BerAKHLAK] dan selalu menjaga [integritas] dalam melayani masyarakat."
                  value={newDragDropItem.teks_soal}
                  onChange={(e) => setNewDragDropItem({ ...newDragDropItem, teks_soal: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pilihan Pengecoh / Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: loyalitas, adaptif, kompeten (pisahkan dengan koma)"
                    value={newDragDropItem.distractors}
                    onChange={(e) => setNewDragDropItem({ ...newDragDropItem, distractors: e.target.value })}
                    className="w-full h-10 px-3.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Kata pengecoh untuk memperkaya pilihan</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bobot Nilai</label>
                  <input
                    type="number"
                    min="1"
                    value={newDragDropItem.bobot_nilai}
                    onChange={(e) => setNewDragDropItem({ ...newDragDropItem, bobot_nilai: Number(e.target.value) })}
                    className="w-full h-10 px-3.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-teal-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-10 bg-[#0F766E] text-white rounded-lg text-xs font-bold hover:bg-teal-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Simpan Soal
                  </button>
                </div>
              </div>
            </form>

            {/* Daftar Soal Drag & Drop */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Daftar Soal Dropdown / Drag & Drop</span>
                <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {quizForm.soal.filter((s) => s.tipe_soal === 'drag_drop').length} Soal
                </span>
              </h4>

              {quizForm.soal.filter((s) => s.tipe_soal === 'drag_drop').length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-gray-500">Belum ada butir soal Drag & Drop.</p>
                  <p className="text-[11px] text-gray-400">Tambahkan kalimat rumpang melalui formulir di atas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizForm.soal
                    .filter((s) => s.tipe_soal === 'drag_drop')
                    .map((item, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            Soal #{idx + 1} (Bobot: {item.bobot_nilai || 1})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDragDropFromQuiz(idx)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>

                        <DragDropQuiz question={item} isReadOnly={true} showAnswers={true} />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: PILIHAN BERBOBOT */}
        {quizActiveTab === 'pilihan_berbobot' && (
          <div className="space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
              <Star className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">Konsep Soal Berbobot Nilai (Tanpa Benar/Salah Mutlak):</span> Setiap pilihan jawaban memiliki poin bobot tersendiri (misalnya A=5, B=4, C=3, D=2, E=1). Peserta akan mendapatkan skor sesuai opsi yang dipilih secara proporsional terhadap bobot maksimal butir soal ini.
              </div>
            </div>

            <form onSubmit={handleAddWeightedToQuiz} className="border border-amber-200 bg-amber-50/20 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-700" /> Tambah Soal Pilihan Berbobot
                </h4>
                <span className="text-[11px] text-gray-500 font-medium">Tentukan poin untuk masing-masing opsi</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pertanyaan / Pernyataan Soal
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Seberapa siap instansi Anda dalam menerapkan transformasi digital pelayanan publik?"
                  value={newWeightedItem.teks_soal}
                  onChange={(e) => setNewWeightedItem({ ...newWeightedItem, teks_soal: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-gray-700">
                  Opsi Pilihan Jawaban & Bobot Nilai Poin
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {/* Opsi A */}
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-2xs">
                    <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">A</span>
                    <input
                      type="text"
                      placeholder="Teks Opsi A (Wajib)"
                      value={newWeightedItem.opsiA}
                      onChange={(e) => setNewWeightedItem({ ...newWeightedItem, opsiA: e.target.value })}
                      className="w-full text-xs bg-transparent focus:outline-none"
                    />
                    <div className="flex items-center gap-1 shrink-0 border-l border-gray-200 pl-2">
                      <span className="text-[10px] text-gray-400 font-semibold">Poin:</span>
                      <input
                        type="number"
                        min="0"
                        value={newWeightedItem.bobotA}
                        onChange={(e) => setNewWeightedItem({ ...newWeightedItem, bobotA: Number(e.target.value) })}
                        className="w-12 h-7 px-1 bg-amber-50 border border-amber-300 rounded text-center text-xs font-bold text-amber-900"
                      />
                    </div>
                  </div>

                  {/* Opsi B */}
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-2xs">
                    <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">B</span>
                    <input
                      type="text"
                      placeholder="Teks Opsi B (Wajib)"
                      value={newWeightedItem.opsiB}
                      onChange={(e) => setNewWeightedItem({ ...newWeightedItem, opsiB: e.target.value })}
                      className="w-full text-xs bg-transparent focus:outline-none"
                    />
                    <div className="flex items-center gap-1 shrink-0 border-l border-gray-200 pl-2">
                      <span className="text-[10px] text-gray-400 font-semibold">Poin:</span>
                      <input
                        type="number"
                        min="0"
                        value={newWeightedItem.bobotB}
                        onChange={(e) => setNewWeightedItem({ ...newWeightedItem, bobotB: Number(e.target.value) })}
                        className="w-12 h-7 px-1 bg-amber-50 border border-amber-300 rounded text-center text-xs font-bold text-amber-900"
                      />
                    </div>
                  </div>

                  {/* Opsi C */}
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-2xs">
                    <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">C</span>
                    <input
                      type="text"
                      placeholder="Teks Opsi C (Opsional)"
                      value={newWeightedItem.opsiC}
                      onChange={(e) => setNewWeightedItem({ ...newWeightedItem, opsiC: e.target.value })}
                      className="w-full text-xs bg-transparent focus:outline-none"
                    />
                    <div className="flex items-center gap-1 shrink-0 border-l border-gray-200 pl-2">
                      <span className="text-[10px] text-gray-400 font-semibold">Poin:</span>
                      <input
                        type="number"
                        min="0"
                        value={newWeightedItem.bobotC}
                        onChange={(e) => setNewWeightedItem({ ...newWeightedItem, bobotC: Number(e.target.value) })}
                        className="w-12 h-7 px-1 bg-amber-50 border border-amber-300 rounded text-center text-xs font-bold text-amber-900"
                      />
                    </div>
                  </div>

                  {/* Opsi D */}
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-2xs">
                    <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">D</span>
                    <input
                      type="text"
                      placeholder="Teks Opsi D (Opsional)"
                      value={newWeightedItem.opsiD}
                      onChange={(e) => setNewWeightedItem({ ...newWeightedItem, opsiD: e.target.value })}
                      className="w-full text-xs bg-transparent focus:outline-none"
                    />
                    <div className="flex items-center gap-1 shrink-0 border-l border-gray-200 pl-2">
                      <span className="text-[10px] text-gray-400 font-semibold">Poin:</span>
                      <input
                        type="number"
                        min="0"
                        value={newWeightedItem.bobotD}
                        onChange={(e) => setNewWeightedItem({ ...newWeightedItem, bobotD: Number(e.target.value) })}
                        className="w-12 h-7 px-1 bg-amber-50 border border-amber-300 rounded text-center text-xs font-bold text-amber-900"
                      />
                    </div>
                  </div>

                  {/* Opsi E */}
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-2xs md:col-span-2">
                    <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">E</span>
                    <input
                      type="text"
                      placeholder="Teks Opsi E (Opsional)"
                      value={newWeightedItem.opsiE}
                      onChange={(e) => setNewWeightedItem({ ...newWeightedItem, opsiE: e.target.value })}
                      className="w-full text-xs bg-transparent focus:outline-none"
                    />
                    <div className="flex items-center gap-1 shrink-0 border-l border-gray-200 pl-2">
                      <span className="text-[10px] text-gray-400 font-semibold">Poin:</span>
                      <input
                        type="number"
                        min="0"
                        value={newWeightedItem.bobotE}
                        onChange={(e) => setNewWeightedItem({ ...newWeightedItem, bobotE: Number(e.target.value) })}
                        className="w-12 h-7 px-1 bg-amber-50 border border-amber-300 rounded text-center text-xs font-bold text-amber-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-200/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">Bobot Maksimal Soal:</span>
                  <input
                    type="number"
                    min="1"
                    value={newWeightedItem.bobot_nilai || 5}
                    onChange={(e) => setNewWeightedItem({ ...newWeightedItem, bobot_nilai: Number(e.target.value) })}
                    className="w-16 h-8 px-2 bg-white border border-gray-300 rounded text-xs font-bold text-amber-900 text-center"
                  />
                  <span className="text-[11px] text-gray-400">(Digunakan saat kalkulasi total nilai)</span>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Simpan Soal Berbobot
                </button>
              </div>
            </form>

            {/* Daftar Soal Berbobot */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Daftar Soal Pilihan Berbobot</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {quizForm.soal.filter((s) => s.tipe_soal === 'pilihan_berbobot').length} Soal
                </span>
              </h4>

              {quizForm.soal.filter((s) => s.tipe_soal === 'pilihan_berbobot').length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <Star className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-gray-500">Belum ada butir soal pilihan berbobot.</p>
                  <p className="text-[11px] text-gray-400">Tambahkan pertanyaan asesmen / skala bertingkat di atas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizForm.soal
                    .filter((s) => s.tipe_soal === 'pilihan_berbobot')
                    .map((item, idx) => (
                      <div key={idx} className="bg-white border border-amber-200/80 rounded-xl p-3.5 shadow-2xs space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              {item.teks_soal}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
                              Bobot Soal: {item.bobot_nilai || 5}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveWeightedFromQuiz(idx)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer text-xs"
                              title="Hapus Soal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pt-1">
                          {Object.entries(item.pilihan_jawaban_json || {}).map(([key, opt]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between text-[11px] bg-amber-50/50 border border-amber-100 rounded px-2 py-1"
                            >
                              <span className="text-gray-700 truncate pr-1">
                                <strong className="text-amber-800 mr-1">{key}.</strong>
                                {typeof opt === 'object' ? opt.teks : opt}
                              </span>
                              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded shrink-0">
                                {typeof opt === 'object' ? opt.bobot : 0} pt
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Total Soal: <span className="font-bold text-gray-800">{quizForm.soal.length}</span> (
            {quizForm.soal.filter((s) => s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal).length} PG,{' '}
            {quizForm.soal.filter((s) => s.tipe_soal === 'tts').length} TTS,{' '}
            {quizForm.soal.filter((s) => s.tipe_soal === 'drag_drop').length} Drag & Drop,{' '}
            {quizForm.soal.filter((s) => s.tipe_soal === 'pilihan_berbobot').length} Berbobot)
          </div>
          <div className="flex items-center gap-2">
            {((targetQuizType === 'pre_test' && targetQuizMateri?.pre_test?.kuis_id) ||
              (targetQuizType === 'evaluasi_modul' && getModulQuiz(targetQuizModule, 'evaluasi_modul')?.kuis_id) ||
              (targetQuizType === 'kuis_berbobot' && getModulQuiz(targetQuizModule, 'kuis_berbobot')?.kuis_id)) && (
              <button
                type="button"
                onClick={() => {
                  const qId =
                    targetQuizType === 'pre_test'
                      ? targetQuizMateri?.pre_test?.kuis_id
                      : targetQuizType === 'kuis_berbobot'
                      ? getModulQuiz(targetQuizModule, 'kuis_berbobot')?.kuis_id
                      : getModulQuiz(targetQuizModule, 'evaluasi_modul')?.kuis_id;
                  handleDeleteQuiz(
                    qId,
                    targetQuizType === 'pre_test'
                      ? 'Pre-Test'
                      : targetQuizType === 'kuis_berbobot'
                      ? 'Kuis Berbobot'
                      : 'Kuis'
                  );
                }}
                className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus{' '}
                {targetQuizType === 'pre_test'
                  ? 'Pre-Test'
                  : targetQuizType === 'kuis_berbobot'
                  ? 'Kuis Berbobot'
                  : 'Kuis'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveQuiz}
              className="px-6 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 shadow-sm"
            >
              Simpan Seluruh{' '}
              {targetQuizType === 'pre_test'
                ? 'Pre-Test'
                : targetQuizType === 'kuis_berbobot'
                ? 'Kuis Berbobot'
                : 'Kuis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilderModal;
