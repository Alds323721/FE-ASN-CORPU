import React from 'react';
import { Eye, AlertCircle, Upload, ChevronDown } from 'lucide-react';

const CourseBasicInfoCard = ({
  course,
  setCourse,
  categories,
  totalJp,
  courseThumbnailPreview,
  courseThumbnailFile,
  handleCourseThumbnailChange,
  handleRemoveCourseThumbnail,
  handleUpdateBasicInfo,
  savingBasicInfo,
  isReadOnly
}) => {
  return (
    <div className="space-y-6">
      {/* Read-Only Alert Banner */}
      {isReadOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <Eye className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-blue-900">Mode Hanya Baca (Read-Only)</h4>
            <p className="text-xs text-blue-700">
              Pembelajaran di Komunitas Umum ini dirancang oleh admin komunitas lain. Anda dapat meninjau seluruh modul dan materi dalam mode baca.
            </p>
          </div>
        </div>
      )}

      {/* Published Alert Banner */}
      {course.status === 'dipublikasikan' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-900 mb-1">Pelatihan Sedang Aktif Dipublikasikan</h3>
            <p className="text-xs text-amber-800 leading-relaxed mb-2">
              Pelatihan ini saat ini berstatus aktif di katalog umum. Jika Anda melakukan perubahan (edit informasi dasar, modul, materi, kuis, atau post-test), status pelatihan akan <b>otomatis menjadi Menunggu Approval</b> dan <b>tetap tampil di katalog peserta dalam kondisi terkunci</b> sampai disetujui kembali oleh Admin BKPSDM.
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              💡 Pelatihan tidak akan hilang dari katalog peserta, melainkan terkunci secara otomatis.
            </p>
          </div>
        </div>
      )}

      {/* Rejection Alert Banner */}
      {course.status === 'ditolak' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="text-sm font-bold text-red-900">Pengajuan Pembelajaran Ditolak oleh BKPSDM</h3>
              {course.validasi?.pemvalidasi?.nama_lengkap && (
                <span className="text-[11px] text-red-700 bg-red-100/70 px-2 py-0.5 rounded">
                  Diverifikasi oleh: {course.validasi.pemvalidasi.nama_lengkap}
                </span>
              )}
            </div>
            <p className="text-xs text-red-700 mb-2.5 leading-relaxed bg-white/70 p-3 rounded-lg border border-red-100">
              <span className="font-semibold block text-red-800 mb-0.5">Catatan Perbaikan:</span>
              {course.validasi?.catatan
                ? course.validasi.catatan
                : 'Pembelajaran ini memerlukan perbaikan sebelum dapat dipublikasikan. Silakan lengkapi modul, materi, atau evaluasi sesuai arahan verifikator.'}
            </p>
            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1.5">
              <span>
                💡 <b>Petunjuk:</b> Lakukan perbaikan konten pada halaman ini, lalu klik tombol <b>"Simpan Draft"</b> untuk mengembalikan status kursus ke <b>Draft</b> sebelum diajukan approval kembali.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Informasi Dasar Kursus */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-900">Informasi Dasar Kursus</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {totalJp % 1 === 0 ? totalJp : totalJp.toFixed(2)} JP Total
            </span>
          </div>
          <span className="text-xs text-gray-500 font-medium">ID Pembelajaran: #{course.pembelajaran_id}</span>
        </div>
        <div className="p-6 space-y-6">
          {/* Thumbnail / Cover Kursus */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Thumbnail / Cover Kursus <span className="text-gray-400 text-xs font-normal">(Maks. 2MB)</span>
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-full sm:w-56 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 shrink-0 relative shadow-2xs">
                <img
                  src={
                    courseThumbnailPreview ||
                    course.thumbnail_url ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'
                  }
                  alt={course.judul_pembelajaran}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>{courseThumbnailFile ? 'Ganti File Dipilih' : 'Pilih File Thumbnail'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleCourseThumbnailChange}
                      className="hidden"
                    />
                  </label>
                  {courseThumbnailFile && (
                    <button
                      type="button"
                      onClick={handleRemoveCourseThumbnail}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                    >
                      Batal Pilih
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Format yang didukung: JPG, JPEG, PNG, WEBP. Maksimal 2MB. Gambar ini tampil di kartu kursus katalog dan dasbor peserta.
                </p>
                {courseThumbnailFile && (
                  <p className="text-xs text-teal-700 font-medium">
                    File baru terpilih: <strong>{courseThumbnailFile.name}</strong> (klik <em>Simpan Perubahan</em> di bawah untuk menerapkan)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Kursus</label>
            <input
              type="text"
              value={course.judul_pembelajaran || ''}
              onChange={(e) => setCourse({ ...course, judul_pembelajaran: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
              <div className="relative">
                <select
                  value={course.kategori_id || course.kategori || 'Pengembangan Kompetensi'}
                  onChange={(e) => {
                    const val = e.target.value;
                    const catObj = categories.find(
                      (c) => String(c.kategori_id) === String(val) || c.nama_kategori === val
                    );
                    setCourse({
                      ...course,
                      kategori_id: catObj ? catObj.kategori_id : '',
                      kategori: catObj ? catObj.nama_kategori : val
                    });
                  }}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pr-10"
                >
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.kategori_id} value={c.kategori_id}>
                        {c.nama_kategori}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Pengembangan Kompetensi">Pengembangan Kompetensi</option>
                      <option value="Manajemen ASN">Manajemen ASN</option>
                      <option value="Teknologi Informasi">Teknologi Informasi</option>
                      <option value="Pelayanan Publik">Pelayanan Publik</option>
                    </>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Capaian Pembelajaran</label>
              <input
                type="text"
                value={course.capaian_pembelajaran || ''}
                onChange={(e) => setCourse({ ...course, capaian_pembelajaran: e.target.value })}
                placeholder="Contoh: Menguasai prinsip integritas birokrasi"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Kursus</label>
            <textarea
              rows="3"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              value={course.deskripsi === '-' ? '' : course.deskripsi || ''}
              onChange={(e) => setCourse({ ...course, deskripsi: e.target.value })}
              placeholder="Tuliskan deskripsi lengkap mengenai tujuan dan target pelatihan ini..."
            ></textarea>
          </div>

          {/* Tombol Simpan Cepat untuk Informasi Dasar & Thumbnail */}
          {!isReadOnly && (
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={handleUpdateBasicInfo}
                disabled={savingBasicInfo}
                className="px-5 py-2.5 bg-[#0F766E] hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {savingBasicInfo ? 'Menyimpan...' : 'Simpan Informasi Dasar & Thumbnail'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseBasicInfoCard;
