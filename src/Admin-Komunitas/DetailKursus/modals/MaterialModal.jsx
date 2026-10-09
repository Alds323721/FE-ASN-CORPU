import React from 'react';
import { X, Sparkles, Package, Clock, Video, Link2, PlayCircle } from 'lucide-react';

const MaterialModal = ({
  isOpen,
  onClose,
  isEdit = false,
  form,
  setForm,
  onSubmit,
  courseStatus,
  editingMaterial = null
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              {isEdit ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran'}
            </h3>
            {isEdit && (
              <p className="text-xs text-gray-500">Ubah detail atau berkas materi pada modul</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isEdit && courseStatus === 'dipublikasikan' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <b>Peringatan Approval:</b> Pelatihan ini aktif di katalog. Menyimpan perubahan materi akan <b>mengunci pelatihan (berwarna abu-abu)</b> pada katalog peserta hingga disetujui kembali oleh <b>Admin BKPSDM</b>.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Judul Materi
            </label>
            <input
              type="text"
              required
              value={form.judul_materi || ''}
              onChange={(e) => setForm({ ...form, judul_materi: e.target.value })}
              placeholder="Contoh: Modul Bacaan Bab 1 (PDF)"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Tipe Materi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, tipe_materi: 'pdf' })}
                className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${form.tipe_materi === 'pdf'
                    ? 'bg-teal-50 border-[#0F766E] text-[#0F766E]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                Dokumen PDF
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, tipe_materi: 'video_embed' })}
                className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${form.tipe_materi === 'video_embed'
                    ? 'bg-teal-50 border-[#0F766E] text-[#0F766E]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video (MP4/YT)</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, tipe_materi: 'h5p' })}
                className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${form.tipe_materi === 'h5p'
                    ? 'bg-purple-50 border-purple-600 text-purple-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>H5P Interaktif</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, tipe_materi: 'scorm' })}
                className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${form.tipe_materi === 'scorm'
                    ? 'bg-amber-50 border-amber-600 text-amber-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <Package className="w-3.5 h-3.5 text-amber-500" />
                <span>SCORM Interaktif</span>
              </button>
            </div>
          </div>

          {form.tipe_materi === 'pdf' ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {isEdit ? 'Ganti Berkas PDF (Opsional, Maks. 10MB)' : 'Unggah Berkas PDF (Maks. 10MB)'}
              </label>
              {isEdit && editingMaterial?.tautan_atau_berkas && (
                <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 flex items-center justify-between">
                  <span className="truncate max-w-xs">
                    Berkas saat ini: {editingMaterial.tautan_atau_berkas.split('/').pop()}
                  </span>
                  <a
                    href={
                      editingMaterial.tautan_atau_berkas.startsWith('http')
                        ? editingMaterial.tautan_atau_berkas
                        : `http://localhost:8000${editingMaterial.tautan_atau_berkas}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 font-semibold hover:underline"
                  >
                    Pratinjau
                  </a>
                </div>
              )}
              <input
                type="file"
                required={!isEdit}
                accept="application/pdf"
                onChange={(e) => setForm({ ...form, file_pdf: e.target.files[0] || null })}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {isEdit && (
                <p className="text-[11px] text-gray-400 mt-1">Biarkan kosong jika tidak ingin mengubah berkas PDF.</p>
              )}
            </div>
          ) : form.tipe_materi === 'h5p' ? (
            <div className="space-y-3 bg-purple-50/40 p-3.5 rounded-lg border border-purple-200/70">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Metode Video Interaktif H5P
                </label>
                <span className="text-[10px] text-purple-700 font-semibold bg-purple-100/70 px-2 py-0.5 rounded">
                  Berkas .H5P (Maks. 200MB) / Embed
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, h5p_mode: 'file' })}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md border transition-all flex items-center justify-center gap-1.5 ${(form.h5p_mode || 'file') === 'file'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Unggah Berkas .H5P</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, h5p_mode: 'link' })}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md border transition-all flex items-center justify-center gap-1.5 ${form.h5p_mode === 'link'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Tautan Embed / Lumi</span>
                </button>
              </div>

              {isEdit && editingMaterial?.tipe_materi === 'h5p' && editingMaterial?.tautan_atau_berkas && (
                <div className="p-2 bg-white border border-purple-200 rounded text-xs text-purple-900 flex items-center justify-between">
                  <span className="truncate max-w-xs font-medium">
                    H5P saat ini:{' '}
                    {editingMaterial.tautan_atau_berkas.includes('/storage/h5p/')
                      ? 'Paket H5P Lokal (' + (editingMaterial.tautan_atau_berkas.split('/')[3] || 'Unggahan') + ')'
                      : editingMaterial.tautan_atau_berkas}
                  </span>
                  <a
                    href={
                      editingMaterial.tautan_atau_berkas.startsWith('http')
                        ? editingMaterial.tautan_atau_berkas
                        : `http://localhost:8000${editingMaterial.tautan_atau_berkas}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-700 font-bold hover:underline shrink-0 ml-2"
                  >
                    Pratinjau
                  </a>
                </div>
              )}

              {(form.h5p_mode || 'file') === 'file' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {isEdit ? 'Ganti Berkas H5P (Opsional, Format .h5p, Maks. 200MB)' : 'Pilih Berkas H5P (Format .h5p, Maks. 200MB)'}
                  </label>
                  <input
                    type="file"
                    required={!isEdit || (editingMaterial?.tipe_materi === 'h5p' && !editingMaterial?.tautan_atau_berkas?.includes('/storage/h5p/'))}
                    accept=".h5p"
                    onChange={(e) => setForm({ ...form, file_h5p: e.target.files[0] || null })}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200"
                  />
                  {isEdit && (
                    <p className="text-[11px] text-gray-400 mt-1">Biarkan kosong jika tidak ingin mengubah paket H5P saat ini.</p>
                  )}
                  <p className="text-[11px] text-gray-500 mt-1">
                    💡 Sistem otomatis mengekstrak berkas <b>.h5p</b> dan memutar video interaktif di server.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tautan Embed H5P
                  </label>
                  <input
                    type="text"
                    required
                    value={form.tautan_atau_berkas_embed || ''}
                    onChange={(e) => setForm({ ...form, tautan_atau_berkas_embed: e.target.value })}
                    placeholder="https://app.lumi.education/run/... atau URL embed H5P"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    💡 Masukkan URL run/embed dari Lumi Cloud, H5P.org, atau kode iframe video interaktif.
                  </p>
                </div>
              )}
            </div>
          ) : form.tipe_materi === 'scorm' ? (
            <div className="space-y-3 bg-amber-50/40 p-3.5 rounded-lg border border-amber-200/70">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Metode Pengisian SCORM
                </label>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/70 px-2 py-0.5 rounded">
                  SCORM 1.2 / 2004
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, scorm_mode: 'zip' })}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md border transition-all ${form.scorm_mode === 'zip'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  📦 Unggah Paket ZIP
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, scorm_mode: 'link' })}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md border transition-all ${form.scorm_mode === 'link'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  🔗 Tautan Eksternal
                </button>
              </div>

              {isEdit && editingMaterial?.tipe_materi === 'scorm' && editingMaterial?.tautan_atau_berkas && (
                <div className="p-2 bg-white border border-amber-200 rounded text-xs text-amber-900 flex items-center justify-between">
                  <span className="truncate max-w-xs font-medium">
                    Materi SCORM saat ini: {editingMaterial.tautan_atau_berkas}
                  </span>
                  <a
                    href={
                      editingMaterial.tautan_atau_berkas.startsWith('http')
                        ? editingMaterial.tautan_atau_berkas
                        : `http://localhost:8000${editingMaterial.tautan_atau_berkas}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-700 font-bold hover:underline shrink-0 ml-2"
                  >
                    Buka
                  </a>
                </div>
              )}

              {form.scorm_mode === 'zip' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {isEdit ? 'Ganti Berkas ZIP SCORM (Opsional, Maks. 100MB)' : 'Pilih Berkas ZIP SCORM (Maks. 100MB)'}
                  </label>
                  <input
                    type="file"
                    required={!isEdit}
                    accept=".zip,application/zip,application/x-zip-compressed"
                    onChange={(e) => setForm({ ...form, file_scorm: e.target.files[0] || null })}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    💡 Sistem otomatis mengekstrak berkas dan membaca file launcher (
                    <code className="bg-amber-100 px-1 rounded">imsmanifest.xml</code> /{' '}
                    <code className="bg-amber-100 px-1 rounded">index.html</code>).
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tautan SCORM Cloud / Hosted URL
                  </label>
                  <input
                    type="text"
                    required
                    value={form.tautan_atau_berkas_embed || ''}
                    onChange={(e) => setForm({ ...form, tautan_atau_berkas_embed: e.target.value })}
                    placeholder="https://cloud.scorm.com/tc/... atau URL player SCORM"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    💡 Masukkan URL player SCORM Cloud atau URL hosting web eksternal.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 bg-teal-50/40 p-3.5 rounded-lg border border-teal-200/70">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider">
                  Metode Video Pembelajaran
                </label>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-100/70 px-2 py-0.5 rounded">
                  MP4 (Maks. 500MB) / YouTube
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, video_mode: 'file' })}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md border transition-all flex items-center justify-center gap-1.5 ${(form.video_mode || 'file') === 'file'
                      ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Unggah Berkas MP4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, video_mode: 'link' })}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md border transition-all flex items-center justify-center gap-1.5 ${form.video_mode === 'link'
                      ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Tautan YouTube</span>
                </button>
              </div>

              {isEdit && editingMaterial?.tipe_materi === 'video_embed' && editingMaterial?.tautan_atau_berkas && (
                <div className="p-2 bg-white border border-teal-200 rounded text-xs text-teal-900 flex items-center justify-between">
                  <span className="truncate max-w-xs font-medium">
                    Video saat ini:{' '}
                    {editingMaterial.tautan_atau_berkas.includes('/storage/')
                      ? editingMaterial.tautan_atau_berkas.split('/').pop()
                      : editingMaterial.tautan_atau_berkas}
                  </span>
                  <a
                    href={
                      editingMaterial.tautan_atau_berkas.startsWith('http')
                        ? editingMaterial.tautan_atau_berkas
                        : `http://localhost:8000${editingMaterial.tautan_atau_berkas}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 font-bold hover:underline shrink-0 ml-2"
                  >
                    Pratinjau
                  </a>
                </div>
              )}

              {(form.video_mode || 'file') === 'file' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {isEdit ? 'Ganti Berkas Video MP4 (Opsional, Maks. 500MB)' : 'Pilih Berkas Video MP4 (Maks. 500MB)'}
                  </label>
                  <input
                    type="file"
                    required={!isEdit || (editingMaterial?.tipe_materi === 'video_embed' && !editingMaterial?.tautan_atau_berkas?.includes('/storage/materi_video/'))}
                    accept="video/mp4,.mp4"
                    onChange={(e) => setForm({ ...form, file_video: e.target.files[0] || null })}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-100 file:text-teal-800 hover:file:bg-teal-200"
                  />
                  {isEdit && (
                    <p className="text-[11px] text-gray-400 mt-1">Biarkan kosong jika tidak ingin mengubah berkas video saat ini.</p>
                  )}
                  <p className="text-[11px] text-gray-500 mt-1">
                    Berkas video format <b>.mp4</b> langsung diputar di pemutar video aplikasi peserta.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    URL Video YouTube
                  </label>
                  <input
                    type="url"
                    required
                    value={form.tautan_atau_berkas_embed || ''}
                    onChange={(e) => setForm({ ...form, tautan_atau_berkas_embed: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    💡 Masukkan URL lengkap video YouTube (contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/...).
                  </p>
                </div>
              )}
            </div>
          )}

          {isEdit ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Durasi (Menit)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.durasi_menit ?? 15}
                  onChange={(e) => setForm({ ...form, durasi_menit: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Sifat Materi
                </label>
                <select
                  value={form.apakah_wajib ? '1' : '0'}
                  onChange={(e) => setForm({ ...form, apakah_wajib: e.target.value === '1' })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  <option value="1">Wajib Dipelajari</option>
                  <option value="0">Materi Pengayaan (Opsional)</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Estimasi Durasi Belajar (Menit)
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.durasi_menit ?? 15}
                onChange={(e) => setForm({ ...form, durasi_menit: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 shadow-sm"
            >
              {isEdit ? 'Simpan Perubahan Materi' : 'Unggah Materi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialModal;
