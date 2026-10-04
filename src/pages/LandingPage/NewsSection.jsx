import React from 'react';

export default function NewsSection() {
  const news = [
    {
      title: "APEL PAGI, SATUKAN LANGKAH",
      date: "07 September 2026",
      image: "https://bkpsdm.bulelengkab.go.id/uploads/konten/thumbnail/28_apel-pagi-satukan-langkah_2026-09-07-08-35-21.jpeg",
      url: "https://bkpsdm.bulelengkab.go.id/informasi/detail/berita/28_apel-pagi-satukan-langkah"
    },
    {
      title: "BKPSDM Buleleng Ikut Aksi Bersih Lingkungan",
      date: "04 September 2026",
      image: "https://bkpsdm.bulelengkab.go.id/uploads/konten/thumbnail/76_bkpsdm-buleleng-ikut-aksi-bersih-lingkungan_2026-09-04-08-31-45.jpeg",
      url: "https://bkpsdm.bulelengkab.go.id/informasi/detail/berita/76_bkpsdm-buleleng-ikut-aksi-bersih-lingkungan"
    },
    {
      title: "Rekonsiliasi Data Peserta Tapera 2026",
      date: "03 September 2026",
      image: "https://bkpsdm.bulelengkab.go.id/uploads/konten/thumbnail/82_rekonsiliasi-data-peserta-tapera-2026_08-44-08.jpeg",
      url: "https://bkpsdm.bulelengkab.go.id/informasi/detail/berita/82_rekonsiliasi-data-peserta-tapera-2026"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-[#E8EDF4] px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] mb-2 md:mb-3">Berita Terbaru</h2>
          <p className="text-gray-500 text-xs sm:text-sm px-4">Ikuti informasi dan kegiatan terbaru dari BKPSDM Kabupaten Buleleng.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs text-gray-500 font-semibold mb-2">{item.date}</p>
                <h3 className="text-sm md:text-base font-bold text-[#1D315F] leading-snug mb-4 line-clamp-2">{item.title}</h3>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full py-2.5 border border-[#006A63] text-[#006A63] rounded-md font-bold text-[13px] hover:bg-[#006A63] hover:text-white transition-colors cursor-pointer"
                  >
                    Baca Berita
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
