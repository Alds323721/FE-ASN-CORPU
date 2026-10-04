import React from 'react';
import { X, ImageIcon, Upload } from 'lucide-react';

const ModuleModal = ({
  isOpen,
  onClose,
  isEditing,
  moduleForm,
  setModuleForm,
  moduleThumbnailPreview,
  setModuleThumbnailPreview,
  setModuleThumbnailFile,
  handleModuleThumbnailChange,
  handleSaveModule
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-bold text-gray-900 text-base">
            {isEditing ? 'Edit Modul Pembelajaran' : 'Tambah Modul Pembelajaran'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSaveModule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Thumbnail / Gambar Modul
            </label>
            <div className="flex items-center gap-3.5">
              {moduleThumbnailPreview ? (
                <div className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden shrink-0 group">
                  <img src={moduleThumbnailPreview} alt="Thumbnail Modul" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setModuleThumbnailFile(null);
                      setModuleThumbnailPreview('');
                    }}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-bold cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-gray-50">
                  <ImageIcon className="w-5 h-5 mb-0.5 text-gray-400" />
                  <span className="text-[9px]">No Image</span>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="module-thumbnail-upload"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleModuleThumbnailChange}
                  className="hidden"
                />
                <label
                  htmlFor="module-thumbnail-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" /> {moduleThumbnailPreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                </label>
                <p className="text-[11px] text-gray-400 mt-1">Format: JPG, PNG, WEBP. Maksimal 2MB.</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Judul Modul</label>
            <input
              type="text"
              required
              value={moduleForm.judul_modul || ''}
              onChange={(e) => setModuleForm({ ...moduleForm, judul_modul: e.target.value })}
              placeholder="Contoh: Modul 1: Konsep Dasar Integritas"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Alokasi Jam Pelajaran (JP) Modul
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="99.99"
                value={moduleForm.jp_modul ?? ''}
                onChange={(e) => setModuleForm({ ...moduleForm, jp_modul: e.target.value })}
                placeholder="Contoh: 2 atau 1.5"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                JP
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Alokasi JP untuk modul ini. Nilai otomatis diakumulasikan ke total JP kursus.
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Deskripsi / Gambaran Umum Modul
            </label>
            <textarea
              rows="3"
              value={moduleForm.deskripsi || ''}
              onChange={(e) => setModuleForm({ ...moduleForm, deskripsi: e.target.value })}
              placeholder="Tuliskan deskripsi atau gambaran umum mengenai materi pada modul ini..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800"
            >
              {isEditing ? 'Simpan Perubahan' : 'Simpan Modul'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleModal;
