import React from 'react';
import {
  Plus, BookOpen, ChevronDown, Edit, Edit2, Trash2, FileText, Sparkles, Package, Video, Eye
} from 'lucide-react';

const CourseSyllabusSection = ({
  modules,
  totalJp,
  isReadOnly,
  openModuleIds,
  toggleModuleOpen,
  handleOpenAddModuleModal,
  handleOpenEditModuleModal,
  handleDeleteModule,
  handleOpenAddMaterialModal,
  handleOpenEditMaterialModal,
  handleDeleteMaterial,
  handleOpenQuizModal
}) => {
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-900">Modul & Materi Pembelajaran</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Total: {totalJp % 1 === 0 ? totalJp : totalJp.toFixed(2)} JP
            </span>
          </div>
          <p className="text-xs text-gray-500">Kelola bab, dokumen bacaan PDF, dan video pendukung.</p>
        </div>
        {!isReadOnly && (
          <button
            onClick={handleOpenAddModuleModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-[#0F766E]/30 text-[#0F766E] text-sm font-semibold rounded-lg hover:bg-teal-100 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Modul
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {modules.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">Belum ada modul pada kursus ini</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Mulai dengan menambahkan modul pembelajaran pertama.</p>
            {!isReadOnly && (
              <button
                onClick={handleOpenAddModuleModal}
                className="px-4 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 cursor-pointer"
              >
                Tambah Modul Sekarang
              </button>
            )}
          </div>
        ) : (
          modules.map((modul, idx) => {
            const isOpen = !!openModuleIds[modul.modul_id];
            const materiList = modul.materi || [];

            return (
              <div key={modul.modul_id} className="border border-gray-200 rounded-xl overflow-hidden transition-all shadow-xs">
                {/* Accordion Header */}
                <div
                  className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors ${
                    isOpen ? 'bg-teal-50/60 border-b border-teal-100' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="flex items-center gap-3 text-sm font-bold text-gray-900 flex-1 min-w-0"
                    onClick={() => toggleModuleOpen(modul.modul_id)}
                  >
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    {modul.thumbnail_url && (
                      <img
                        src={modul.thumbnail_url}
                        alt={modul.judul_modul}
                        className="w-8 h-8 rounded-md object-cover border border-gray-200 shrink-0"
                      />
                    )}
                    <span className="truncate">{modul.judul_modul}</span>
                    <span className="text-xs font-normal text-gray-500 hidden sm:inline">
                      ({materiList.length} Materi • {modul.durasi_total_menit || 0} Menit)
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                      {parseFloat(modul.jp_modul || 0)} JP
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isReadOnly && (
                      <>
                        <button
                          onClick={() => handleOpenAddMaterialModal(modul.modul_id)}
                          title="Tambah Materi"
                          className="px-2.5 py-1 bg-white border border-gray-200 text-teal-700 hover:bg-teal-50 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Materi</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModuleModal(modul)}
                          title="Edit Modul"
                          className="p-1 text-gray-400 hover:text-teal-600 rounded hover:bg-teal-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(modul.modul_id, modul.judul_modul)}
                          title="Hapus Modul"
                          className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => toggleModuleOpen(modul.modul_id)}
                      className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-teal-600' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white space-y-4">
                    {(modul.deskripsi || modul.gambaran_umum || modul.thumbnail_url) && (
                      <div className="text-xs text-gray-700 bg-gray-50/80 p-3 rounded-lg border border-gray-100 flex items-start gap-3">
                        {modul.thumbnail_url && (
                          <img
                            src={modul.thumbnail_url}
                            alt={modul.judul_modul}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900 block mb-0.5">Deskripsi Modul:</span>
                          <span className="leading-relaxed text-gray-600">
                            {modul.deskripsi || modul.gambaran_umum || '-'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Materi List */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daftar Materi:</h4>
                        <span className="text-[11px] text-gray-400">Total: {materiList.length} berkas</span>
                      </div>

                      {materiList.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                          <p className="text-xs text-gray-500 mb-2">Belum ada berkas materi di modul ini.</p>
                          <button
                            onClick={() => handleOpenAddMaterialModal(modul.modul_id)}
                            className="text-xs font-semibold text-teal-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tambah materi sekarang
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {materiList.map((mat) => (
                            <div
                              key={mat.materi_id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/70 hover:bg-gray-50 transition-colors gap-2"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div
                                  className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                                    mat.tipe_materi === 'pdf'
                                      ? 'bg-red-50 text-red-600'
                                      : mat.tipe_materi === 'h5p'
                                      ? 'bg-purple-50 text-purple-600'
                                      : mat.tipe_materi === 'scorm'
                                      ? 'bg-amber-50 text-amber-600'
                                      : 'bg-blue-50 text-blue-600'
                                  }`}
                                >
                                  {mat.tipe_materi === 'pdf' ? (
                                    <FileText className="w-4 h-4" />
                                  ) : mat.tipe_materi === 'h5p' ? (
                                    <Sparkles className="w-4 h-4" />
                                  ) : mat.tipe_materi === 'scorm' ? (
                                    <Package className="w-4 h-4" />
                                  ) : (
                                    <Video className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {mat.judul_materi}
                                    </p>
                                    {mat.tipe_materi === 'h5p' && (
                                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-500" />
                                        H5P Interaktif
                                      </span>
                                    )}
                                    {mat.tipe_materi === 'scorm' && (
                                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                                        <Package className="w-3 h-3 text-amber-500" />
                                        SCORM Interaktif
                                      </span>
                                    )}
                                    {mat.pre_test ? (
                                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                                        Pre-test Aktif ({mat.pre_test.durasi_menit || 15}m)
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
                                        Tanpa Pre-test
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {mat.tipe_materi === 'pdf'
                                      ? 'Dokumen PDF'
                                      : mat.tipe_materi === 'h5p'
                                      ? 'Video Interaktif (H5P)'
                                      : mat.tipe_materi === 'scorm'
                                      ? 'Video Interaktif (SCORM)'
                                      : 'Video Pembelajaran'}{' '}
                                    • {mat.durasi_menit} Menit
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                {!isReadOnly && (
                                  <>
                                    <button
                                      onClick={() => handleOpenQuizModal(modul, 'pre_test', mat)}
                                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                        mat.pre_test
                                          ? 'bg-white border border-teal-200 text-teal-700 hover:bg-teal-50'
                                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                      }`}
                                      title={mat.pre_test ? 'Edit Pre-test Materi' : 'Buat Pre-test untuk Materi ini'}
                                    >
                                      {mat.pre_test ? (
                                        <>
                                          <Edit2 className="w-3.5 h-3.5" /> Edit Pre-test
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-3.5 h-3.5" /> + Pre-test
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => handleOpenEditMaterialModal(mat, modul.modul_id)}
                                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                                      title="Edit Materi Pembelajaran"
                                    >
                                      <Edit className="w-3.5 h-3.5" /> Edit Materi
                                    </button>
                                  </>
                                )}

                                <a
                                  href={
                                    mat.tautan_atau_berkas.startsWith('http')
                                      ? mat.tautan_atau_berkas
                                      : `http://localhost:8000${mat.tautan_atau_berkas}`
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Buka
                                </a>
                                {!isReadOnly && (
                                  <button
                                    onClick={() => handleDeleteMaterial(mat.materi_id, mat.judul_materi)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                                    title="Hapus Materi"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default CourseSyllabusSection;
