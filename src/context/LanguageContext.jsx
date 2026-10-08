import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  ID: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.community': 'Komunitas',
    'nav.catalog': 'Katalog',
    'nav.myCourses': 'Pelatihanku',
    'nav.certificates': 'Sertifikat',
    'nav.helpCenter': 'Bantuan',

    // Footer
    'footer.tagline': 'Platform Digital ASN untuk pengembangan kompetensi dan peningkatan kapasitas secara berkelanjutan.',
    'footer.copyright': '© 2026 BKPSDM. Hak Cipta Dilindungi Undang-Undang. Platform Digital ASN.',
    'footer.quickLinks': 'Tautan Cepat',
    'footer.courses': 'Pelatihan',
    'footer.community': 'Komunitas',
    'footer.help': 'Bantuan',
    'footer.contactUs': 'Kontak Kami',
    'footer.socialMedia': 'Media Sosial',

    // Profile Dropdown
    'profile.changePhoto': 'Ganti Foto Profil',
    'profile.changePassword': 'Ubah Password',
    'profile.logout': 'Logout',

    // Dashboard
    'dashboard.welcome': 'Selamat Datang,',
    'dashboard.bannerDesc': 'Terus tingkatkan kompetensi Anda untuk pelayanan publik yang lebih baik.',
    'dashboard.activeTraining': 'Pelatihan Aktif',
    'dashboard.completedTraining': 'Selesai',
    'dashboard.totalCertificates': 'Sertifikat',
    'dashboard.totalJp': 'Total JPL',
    'dashboard.myTraining': 'Pelatihan Saya',
    'dashboard.recommendations': 'Rekomendasi Pelatihan',
    'dashboard.viewAll': 'Lihat Semua',
    'dashboard.emptyTraining': 'Belum ada pelatihan aktif.',
    'dashboard.emptyTrainingSub': 'Daftar pelatihan di Katalog untuk mulai belajar.',
    'dashboard.exploreCatalog': 'Eksplor Katalog',
    'dashboard.viewCatalog': 'Lihat Katalog',
    'dashboard.continueLearning': 'Lanjutkan Belajar',
    'dashboard.progress': 'Progress',
    'dashboard.recentActivity': 'Aktivitas Terakhir',
    'dashboard.noActivity': 'Belum ada aktivitas',

    // My Courses
    'myCourses.title': 'Pelatihanku',
    'myCourses.inProgress': 'Sedang Berjalan',
    'myCourses.completed': 'Selesai',
    'myCourses.completedTag': 'Selesai',
    'myCourses.learningProgress': 'Progres Belajar',
    'myCourses.completedOn': 'Diselesaikan pada',
    'myCourses.empty': 'Tidak ada pelatihan di bagian ini.',

    // Certificates
    'certificates.title': 'Sertifikat Saya',
    'certificates.subtitle': 'Kelola dan unduh semua sertifikat pelatihan yang telah Anda selesaikan.',
    'certificates.new': 'BARU',
    'certificates.download': 'Unduh Sertifikat',
    'certificates.downloadPdf': 'Unduh PDF',
    'certificates.published': 'Diterbitkan',
    'certificates.available': 'Sertifikat yang Tersedia',
    'certificates.found': 'Sertifikat ditemukan',
    'certificates.loading': 'Memuat sertifikat...',
    'certificates.empty': 'Belum ada sertifikat',
    'certificates.emptySub': 'Selesaikan pelatihan untuk mendapatkan sertifikat pertama Anda.',
    'certificates.issueDate': 'Tanggal Penerbitan',
    'certificates.certNumber': 'No. Sertifikat',

    // Catalog
    'catalog.title': 'Katalog Pelatihan',
    'catalog.searchPlaceholder': 'Cari pelatihan...',
    'catalog.category': 'Kategori',
    'catalog.showing': 'Menampilkan',
    'catalog.of': 'dari',
    'catalog.courses': 'pelatihan',
    'catalog.sortBy': 'Urutkan:',
    'catalog.newest': 'Terbaru',
    'catalog.alphabetical': 'A-Z',
    'catalog.loading': 'Memuat Katalog...',
    'catalog.empty': 'Tidak ada pelatihan ditemukan.',
    'catalog.viewCurriculum': 'Lihat Kurikulum',
    'catalog.enrollNow': 'Daftar Sekarang',
    'catalog.page': 'Hal',
    'catalog.allCategories': 'Semua Kategori',
    'catalog.catAsn': 'Manajemen ASN',
    'catalog.catIt': 'Teknologi Informasi',
    'catalog.catPublic': 'Pelayanan Publik',
    'catalog.catLeadership': 'Kepemimpinan',

    // Community
    'community.title': 'Komunitas Belajar',
    'community.general': 'Umum',
    'community.members': 'Anggota',
    'community.courses': 'Pelatihan',
    'community.viewCommunity': 'Lihat Komunitas',
    'community.joinCommunity': 'Gabung Komunitas',
    'community.jobFamily': 'Rumpun Jabatan',
    'community.staff': 'Pelaksana',
    'community.showing': 'Menampilkan',
    'community.communities': 'komunitas',
    'community.loading': 'Memuat Komunitas...',
    'community.empty': 'Tidak ada komunitas di kategori ini.',

    // Help Center
    'helpCenter.heroTitle': 'Pusat Bantuan',
    'helpCenter.heroSubtitle': 'Temukan jawaban atas pertanyaan Anda atau hubungi tim dukungan kami untuk bantuan lebih lanjut terkait platform pembelajaran BKPSDM Pintar.',
    'helpCenter.searchPlaceholder': 'Cari topik bantuan atau keluhan Anda di sini...',
    'helpCenter.categoriesTitle': 'Kategori Bantuan',
    'helpCenter.faqTitle': 'Pertanyaan yang Sering Diajukan',
    'helpCenter.cat1Title': 'Akun & Profil',
    'helpCenter.cat1Desc': 'Pengaturan NIP, lupa kata sandi, pembaruan data diri, dan masalah login.',
    'helpCenter.cat2Title': 'Kelas & Pelatihan',
    'helpCenter.cat2Desc': 'Pendaftaran kursus, akses materi, jadwal pelatihan, dan penilaian modul.',
    'helpCenter.cat3Title': 'Sertifikat & JPL',
    'helpCenter.cat3Desc': 'Pengunduhan sertifikat, perhitungan Jam Pelajaran (JPL), dan verifikasi kelulusan.',
    'helpCenter.cat4Title': 'Kendala Teknis',
    'helpCenter.cat4Desc': 'Sistem error, halaman tidak dapat dimuat, masalah pemutaran video, dan bug aplikasi.',
    'helpCenter.faq1Q': 'Bagaimana cara mereset kata sandi akun NIP saya?',
    'helpCenter.faq1A': 'Anda dapat mereset kata sandi dengan mengklik "Lupa Password" pada halaman login. Masukkan NIP Anda dan ikuti instruksi yang dikirimkan ke email terdaftar.',
    'helpCenter.faq2Q': 'Berapa lama sertifikat pelatihan akan diterbitkan setelah menyelesaikan kursus?',
    'helpCenter.faq2A': 'Sertifikat akan diterbitkan secara otomatis segera setelah Anda lulus post test dengan nilai di atas passing grade. Sertifikat dapat diunduh langsung dari dashboard Anda.',
    'helpCenter.faq3Q': 'Apakah saya dikenakan biaya untuk mengikuti pelatihan di platform ini?',
    'helpCenter.faq3A': 'Tidak, semua pelatihan di platform BKPSDM Pintar adalah gratis untuk seluruh ASN. Anda hanya perlu login menggunakan NIP yang terdaftar.',
    'helpCenter.formTitle': 'Formulir Keluhan',
    'helpCenter.formDesc': 'Mengalami masalah atau memiliki saran untuk layanan kami? Sampaikan melalui form di bawah ini agar kami dapat memperbaikinya.',
    'helpCenter.formSuccess': 'Keluhan Anda berhasil dikirim. Tim kami akan segera merespons melalui email.',
    'helpCenter.complaintType': 'Jenis Keluhan',
    'helpCenter.complaintTypePlaceholder': 'Pilih jenis keluhan...',
    'helpCenter.complaintDesc': 'Deskripsi Keluhan',
    'helpCenter.complaintDescPlaceholder': 'Jelaskan secara detail masalah yang Anda alami...',
    'helpCenter.satisfaction': 'Tingkat Kepuasan Layanan Bantuan (Opsional)',
    'helpCenter.sendComplaint': 'Kirim Keluhan ▶',
    'helpCenter.sending': 'Mengirim...',
    'helpCenter.formNote': 'Tim kami akan merespons melalui email akun Anda dalam waktu maksimal 2×24 jam.',

    // Common
    'common.free': 'GRATIS',
    'common.viewDetails': 'Lihat Detail',
    'common.loading': 'Memuat data...',
    'common.search': 'Cari...',
    'common.modules': 'Modul',
    'common.hours': 'JPL',
    'common.back': 'Kembali',
    'common.close': 'Tutup',
    'common.cancel': 'Batal',
    'common.save': 'Simpan',
  },
  EN: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.community': 'Community',
    'nav.catalog': 'Catalog',
    'nav.myCourses': 'My Courses',
    'nav.certificates': 'Certificates',
    'nav.helpCenter': 'Help',

    // Footer
    'footer.tagline': 'Digital ASN Platform for continuous competency development and capacity building.',
    'footer.copyright': '© 2026 BKPSDM. All Rights Reserved. Digital ASN Platform.',
    'footer.quickLinks': 'Quick Links',
    'footer.courses': 'Courses',
    'footer.community': 'Community',
    'footer.help': 'Help',
    'footer.contactUs': 'Contact Us',
    'footer.socialMedia': 'Social Media',

    // Profile Dropdown
    'profile.changePhoto': 'Change Profile Photo',
    'profile.changePassword': 'Change Password',
    'profile.logout': 'Logout',

    // Dashboard
    'dashboard.welcome': 'Welcome,',
    'dashboard.bannerDesc': 'Continuously improve your competence for better public service.',
    'dashboard.activeTraining': 'Active Courses',
    'dashboard.completedTraining': 'Completed',
    'dashboard.totalCertificates': 'Certificates',
    'dashboard.totalJp': 'Total JPL',
    'dashboard.myTraining': 'My Courses',
    'dashboard.recommendations': 'Course Recommendations',
    'dashboard.viewAll': 'View All',
    'dashboard.emptyTraining': 'No active courses yet.',
    'dashboard.emptyTrainingSub': 'Enroll in courses from the Catalog to start learning.',
    'dashboard.exploreCatalog': 'Explore Catalog',
    'dashboard.viewCatalog': 'View Catalog',
    'dashboard.continueLearning': 'Continue Learning',
    'dashboard.progress': 'Progress',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.noActivity': 'No activity yet',

    // My Courses
    'myCourses.title': 'My Courses',
    'myCourses.inProgress': 'In Progress',
    'myCourses.completed': 'Completed',
    'myCourses.completedTag': 'Completed',
    'myCourses.learningProgress': 'Learning Progress',
    'myCourses.completedOn': 'Completed on',
    'myCourses.empty': 'No courses found in this section.',

    // Certificates
    'certificates.title': 'My Certificates',
    'certificates.subtitle': 'Manage and download all training certificates you have completed.',
    'certificates.new': 'NEW',
    'certificates.download': 'Download Certificate',
    'certificates.downloadPdf': 'Download PDF',
    'certificates.published': 'Issued',
    'certificates.available': 'Available Certificates',
    'certificates.found': 'Certificates found',
    'certificates.loading': 'Loading certificates...',
    'certificates.empty': 'No certificates yet',
    'certificates.emptySub': 'Complete courses to earn your first certificate.',
    'certificates.issueDate': 'Issue Date',
    'certificates.certNumber': 'Certificate No.',

    // Catalog
    'catalog.title': 'Course Catalog',
    'catalog.searchPlaceholder': 'Search courses...',
    'catalog.category': 'Category',
    'catalog.showing': 'Showing',
    'catalog.of': 'of',
    'catalog.courses': 'courses',
    'catalog.sortBy': 'Sort by:',
    'catalog.newest': 'Newest',
    'catalog.alphabetical': 'A-Z',
    'catalog.loading': 'Loading Catalog...',
    'catalog.empty': 'No courses found.',
    'catalog.viewCurriculum': 'View Curriculum',
    'catalog.enrollNow': 'Enroll Now',
    'catalog.page': 'Page',
    'catalog.allCategories': 'All Categories',
    'catalog.catAsn': 'ASN Management',
    'catalog.catIt': 'Information Technology',
    'catalog.catPublic': 'Public Service',
    'catalog.catLeadership': 'Leadership',

    // Community
    'community.title': 'Learning Community',
    'community.general': 'General',
    'community.members': 'Members',
    'community.courses': 'Courses',
    'community.viewCommunity': 'View Community',
    'community.joinCommunity': 'Join Community',
    'community.jobFamily': 'Job Family',
    'community.staff': 'Executive / Staff',
    'community.showing': 'Showing',
    'community.communities': 'communities',
    'community.loading': 'Loading Communities...',
    'community.empty': 'No communities in this category.',

    // Help Center
    'helpCenter.heroTitle': 'Help Center',
    'helpCenter.heroSubtitle': 'Find answers to your questions or contact our support team for further assistance regarding the BKPSDM Pintar learning platform.',
    'helpCenter.searchPlaceholder': 'Search for help topics or your inquiries here...',
    'helpCenter.categoriesTitle': 'Help Categories',
    'helpCenter.faqTitle': 'Frequently Asked Questions',
    'helpCenter.cat1Title': 'Account & Profile',
    'helpCenter.cat1Desc': 'NIP settings, forgot password, personal data updates, and login issues.',
    'helpCenter.cat2Title': 'Classes & Training',
    'helpCenter.cat2Desc': 'Course enrollment, learning materials access, schedules, and module assessments.',
    'helpCenter.cat3Title': 'Certificates & JPL',
    'helpCenter.cat3Desc': 'Certificate downloads, JPL calculation, and graduation verification.',
    'helpCenter.cat4Title': 'Technical Issues',
    'helpCenter.cat4Desc': 'System errors, page loading issues, video playback problems, and application bugs.',
    'helpCenter.faq1Q': 'How do I reset my NIP account password?',
    'helpCenter.faq1A': 'You can reset your password by clicking "Forgot Password" on the login page. Enter your NIP and follow the instructions sent to your registered email.',
    'helpCenter.faq2Q': 'How long does it take for a course certificate to be issued after completion?',
    'helpCenter.faq2A': 'Certificates are issued automatically as soon as you pass the post test with a score above the passing grade. You can download certificates directly from your dashboard.',
    'helpCenter.faq3Q': 'Are there any fees for participating in training on this platform?',
    'helpCenter.faq3A': 'No, all training programs on the BKPSDM Pintar platform are free for all civil servants (ASN). You only need to log in with your registered NIP.',
    'helpCenter.formTitle': 'Feedback & Complaint Form',
    'helpCenter.formDesc': 'Experiencing an issue or have suggestions for our service? Submit them via the form below so we can improve.',
    'helpCenter.formSuccess': 'Your feedback has been submitted successfully. Our team will respond shortly via email.',
    'helpCenter.complaintType': 'Complaint Type',
    'helpCenter.complaintTypePlaceholder': 'Select complaint type...',
    'helpCenter.complaintDesc': 'Description',
    'helpCenter.complaintDescPlaceholder': 'Describe in detail the problem you are experiencing...',
    'helpCenter.satisfaction': 'Service Satisfaction Rating (Optional)',
    'helpCenter.sendComplaint': 'Submit Feedback ▶',
    'helpCenter.sending': 'Submitting...',
    'helpCenter.formNote': 'Our team will respond to your registered email address within a maximum of 2×24 hours.',

    // Common
    'common.free': 'FREE',
    'common.viewDetails': 'View Details',
    'common.loading': 'Loading data...',
    'common.search': 'Search...',
    'common.modules': 'Modules',
    'common.hours': 'JPL',
    'common.back': 'Back',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('app_language') || 'ID';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['ID']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'ID',
      setLanguage: () => {},
      t: (key) => key
    };
  }
  return context;
};
