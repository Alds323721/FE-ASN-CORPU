import React from 'react';

export default function HowItWorksSection() {
  const steps = [
    { num: 1, title: 'Login dengan NIP', desc: 'Masuk dengan NIP. Pertama kali? Buat kata sandi melalui Lupa Kata Sandi.' },
    { num: 2, title: 'Pilih Pelatihan', desc: 'Eksplorasi katalog dan pilih kursus yang sesuai dengan kebutuhan pengembangan Anda.' },
    { num: 3, title: 'Belajar Mandiri', desc: 'Ikuti materi, kerjakan kuis, dan selesaikan modul sesuai dengan waktu yang Anda miliki.' },
    { num: 4, title: 'Dapatkan Sertifikat', desc: 'Unduh sertifikat digital yang otomatis terintegrasi dengan riwayat kompetensi kepegawaian.' },
  ];

  return (
    <section className="py-12 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto bg-white">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] mb-2 md:mb-3">Cara Kerja Platform</h2>
        <p className="text-gray-500 text-xs sm:text-sm px-4">Langkah mudah untuk mulai meningkatkan kompetensi Anda melalui platform BKPSDM Pintar.</p>
      </div>
      <div className="relative">
        {/* Connecting Line */}
        <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-[1px] bg-gray-200 z-0"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1D315F] text-white flex items-center justify-center font-bold text-base md:text-lg mb-4 md:mb-6 shadow-lg ring-4 md:ring-8 ring-white">
                {step.num}
              </div>
              <h3 className="font-bold text-[#1D315F] text-sm md:text-[14px] mb-2 md:mb-3">{step.title}</h3>
              <p className="text-xs md:text-[12px] text-gray-500 leading-relaxed max-w-[220px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
