import React from 'react';
import { CheckCircle2, Eye, Trash2, Upload } from 'lucide-react';

const SuratPernyataanCard = ({
  course,
  suratFile,
  setSuratFile,
  isUploadingSurat,
  handleUploadSuratPernyataan,
  handleRemoveSuratPernyataan
}) => {
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-teal-600"></div>
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            Surat Pernyataan Keabsahan Konten
          </h2>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
          Opsional (Tidak Wajib)
        </span>
      </div>
      <div className="p-6 space-y-6">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 flex gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900 mb-1">Status Pengunggahan: Bersifat Opsional</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Pengunggahan berkas Surat Pernyataan Keabsahan Konten bersifat <b>opsional</b>. Admin Komunitas{' '}
              <b>tetap bisa mengajukan approval publikasi ke Admin BKPSDM</b> meskipun berkas ini tidak diisi atau tidak diunggah.
            </p>
          </div>
        </div>

        {/* Upload or View */}
        {course.surat_pernyataan_url ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-green-200 bg-green-50/50 rounded-xl gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                PDF
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">
                  Surat_Pernyataan_Keabsahan_Terupload.pdf
                </p>
                <p className="text-xs text-green-700 font-semibold mt-0.5">Berkas telah tersimpan di server</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={
                  course.surat_pernyataan_url.startsWith('http')
                    ? course.surat_pernyataan_url
                    : `http://localhost:8000${course.surat_pernyataan_url}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-md bg-white border border-teal-200"
              >
                <Eye className="w-3.5 h-3.5" /> Buka Dokumen
              </a>
              <button
                type="button"
                onClick={handleRemoveSuratPernyataan}
                className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 px-3 py-1.5 rounded-md bg-white border border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Berkas
              </button>
            </div>
          </div>
        ) : null}

        {/* File Upload Box */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {course.surat_pernyataan_url
              ? 'Ganti Surat Pernyataan (PDF - Opsional)'
              : 'Unggah Berkas Surat Pernyataan (PDF - Opsional)'}
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Kosongkan bagian ini jika instansi Anda tidak memerlukan surat pengantar khusus keabsahan.
          </p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/60 flex flex-col items-center justify-center text-center">
            <Upload className="w-8 h-8 text-teal-600 mb-2" />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setSuratFile(e.target.files[0] || null)}
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            <p className="text-xs text-gray-400 mt-2">Maksimal ukuran file 5MB (Format .pdf) • Opsional</p>
            {suratFile && (
              <div className="mt-3">
                <button
                  onClick={handleUploadSuratPernyataan}
                  disabled={isUploadingSurat}
                  className="px-4 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingSurat ? 'Mengunggah...' : 'Upload Berkas Sekarang'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuratPernyataanCard;
