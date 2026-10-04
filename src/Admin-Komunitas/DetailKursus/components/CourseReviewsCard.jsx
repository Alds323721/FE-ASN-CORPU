import React from 'react';
import { Star, RefreshCw, Filter, MessageSquare } from 'lucide-react';

const CourseReviewsCard = ({
  reviewsData,
  loadingReviews,
  handleRefreshReviews,
  selectedReviewStar,
  setSelectedReviewStar
}) => {
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900">Ulasan & Evaluasi Peserta</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {reviewsData.statistik?.total_ulasan || 0} Ulasan
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Umpan balik dan penilaian mutu pembelajaran dari peserta yang telah menyelesaikan pelatihan.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefreshReviews}
          disabled={loadingReviews}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
          title="Segarkan data ulasan"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loadingReviews ? 'animate-spin text-teal-600' : 'text-gray-500'}`}
          />
          <span>{loadingReviews ? 'Memuat...' : 'Segarkan Ulasan'}</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Rating Overview Card */}
        <div className="bg-gradient-to-br from-amber-50/60 via-white to-teal-50/30 border border-amber-100/80 rounded-xl p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Nilai Rata-rata Besar */}
            <div className="flex flex-col items-center justify-center text-center sm:border-r sm:border-gray-200/80 md:pr-8 shrink-0 min-w-[160px]">
              <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                {reviewsData.statistik?.rata_rata ? Number(reviewsData.statistik.rata_rata).toFixed(1) : '0.0'}
              </span>
              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(reviewsData.statistik?.rata_rata || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-gray-500">
                Dari total <strong className="text-gray-800">{reviewsData.statistik?.total_ulasan || 0}</strong>{' '}
                ulasan peserta
              </p>
            </div>

            {/* Breakdown Bintang 5 s/d 1 */}
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewsData.statistik?.distribusi?.[star] || 0;
                const total = reviewsData.statistik?.total_ulasan || 0;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-14 font-semibold text-gray-700 flex items-center gap-1 shrink-0">
                      {star} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-gray-500 font-medium shrink-0">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Bintang Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-400" /> Filter:
          </span>
          {[
            { id: 'all', label: `Semua (${reviewsData.statistik?.total_ulasan || 0})` },
            { id: '5', label: `⭐ 5 (${reviewsData.statistik?.distribusi?.[5] || 0})` },
            { id: '4', label: `⭐ 4 (${reviewsData.statistik?.distribusi?.[4] || 0})` },
            { id: '3', label: `⭐ 3 (${reviewsData.statistik?.distribusi?.[3] || 0})` },
            { id: '2', label: `⭐ 2 (${reviewsData.statistik?.distribusi?.[2] || 0})` },
            { id: '1', label: `⭐ 1 (${reviewsData.statistik?.distribusi?.[1] || 0})` },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedReviewStar(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedReviewStar === filter.id
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Daftar Review Cards */}
        {(() => {
          const filteredReviews = (reviewsData.ulasan || []).filter((r) => {
            if (selectedReviewStar === 'all') return true;
            return String(r.skor_rating) === String(selectedReviewStar);
          });

          if (filteredReviews.length === 0) {
            return (
              <div className="text-center py-10 px-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Star className="w-6 h-6 stroke-1 fill-amber-100" />
                </div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">
                  {selectedReviewStar === 'all'
                    ? 'Belum Ada Ulasan dari Peserta'
                    : `Tidak Ada Ulasan dengan ${selectedReviewStar} Bintang`}
                </h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {selectedReviewStar === 'all'
                    ? 'Ulasan dan penilaian dari peserta pelatihan akan otomatis tampil di sini setelah peserta menyelesaikan materi dan mengirimkan evaluasi.'
                    : 'Silakan pilih filter rating lainnya untuk melihat ulasan peserta.'}
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-3.5">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.ulasan_id}
                  className="p-4 sm:p-5 border border-gray-200/90 rounded-xl bg-white hover:border-teal-200 hover:shadow-xs transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {(rev.peserta?.nama_lengkap || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                          {rev.peserta?.nama_lengkap || 'Peserta Anonim'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          NIP: <span className="font-mono text-gray-700">{rev.peserta?.nip || '-'}</span> •{' '}
                          {rev.peserta?.unit_kerja || 'Pemerintah Kabupaten Buleleng'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="flex items-center gap-0.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.skor_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-amber-900 ml-1">
                          {rev.skor_rating}.0
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {rev.dikirim_pada
                          ? new Date(rev.dikirim_pada).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50/70 border border-gray-100 rounded-lg p-3 sm:p-3.5 text-xs text-gray-700 leading-relaxed relative">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400 absolute top-3.5 left-3 pointer-events-none" />
                    <p className="pl-6 italic text-gray-800 font-normal">
                      "{rev.teks_ulasan || 'Peserta memberikan penilaian rating tanpa komentar teks.'}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </section>
  );
};

export default CourseReviewsCard;
