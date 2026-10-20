import Swal from 'sweetalert2';

/**
 * Toast mixin configured specifically for Admin System theme
 */
export const SystemToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  background: '#ffffff',
  color: '#1f2937',
  customClass: {
    popup: 'system-swal-toast border border-gray-100 shadow-xl rounded-xl text-sm font-sans',
    title: 'text-xs sm:text-sm font-bold text-gray-800',
    timerProgressBar: 'bg-teal-600',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

/**
 * Trigger a toast notification
 * @param {Object} options { icon: 'success'|'error'|'warning'|'info', title: string, text?: string, timer?: number }
 */
export const systemToast = ({ icon = 'success', title = '', text = '', timer = 3200 }) => {
  return SystemToast.fire({
    icon,
    title,
    text,
    timer,
  });
};

/**
 * Base custom modal configuration with Admin System design tokens
 */
const BaseSystemSwal = Swal.mixin({
  buttonsStyling: false,
  background: '#ffffff',
  color: '#1f2937',
  customClass: {
    container: 'system-swal-container backdrop-blur-xs font-sans',
    popup: 'system-swal-popup rounded-2xl border border-gray-100 shadow-2xl p-6 sm:p-7 max-w-lg w-full text-left',
    title: 'text-lg sm:text-xl font-bold text-gray-800 text-left pt-2 pb-1',
    htmlContainer: 'text-sm text-gray-600 text-left mt-2 leading-relaxed',
    actions: 'flex items-center justify-end gap-2.5 mt-6 w-full',
    confirmButton: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
    cancelButton: 'inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300',
    loader: 'border-teal-600',
  },
});

/**
 * Generic Confirmation Modal
 */
export const confirmAction = async ({
  title = 'Konfirmasi Tindakan',
  text = '',
  html = null,
  icon = 'warning',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDanger = false,
}) => {
  const confirmBtnClasses = isDanger
    ? 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-200'
    : 'bg-teal-700 hover:bg-teal-800 text-white focus:ring-teal-500 shadow-teal-200';

  return BaseSystemSwal.fire({
    title,
    text: html ? undefined : text,
    html: html || undefined,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      ...BaseSystemSwal.params.customClass,
      confirmButton: `${BaseSystemSwal.params.customClass.confirmButton} ${confirmBtnClasses}`,
    },
  });
};

/**
 * Confirm Generate Database Backup Modal
 */
export const confirmGenerateBackup = async (dbInfo = null) => {
  const dbName = dbInfo?.database_name || 'Database Utama';
  const tableCount = dbInfo?.table_count ? `${dbInfo.table_count} tabel` : 'seluruh tabel';
  const dbSize = dbInfo?.size_mb ? `${dbInfo.size_mb} MB` : 'ukuran aktif';

  const htmlContent = `
    <div class="space-y-3 pt-1">
      <p class="text-sm text-gray-600">
        Sistem akan mengekstrak snapshot struktur skema dan seluruh baris data basis data ke dalam berkas <b>.sql.gz</b> terkompresi.
      </p>

      <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs text-gray-700 font-mono">
        <div class="flex justify-between items-center">
          <span class="text-gray-400 font-sans">Basis Data:</span>
          <span class="font-bold text-gray-800">${dbName}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400 font-sans">Cakupan Data:</span>
          <span class="font-semibold text-teal-800">${tableCount}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400 font-sans">Perkiraan Ukuran:</span>
          <span class="font-semibold text-blue-700">${dbSize}</span>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
        <span class="text-base shrink-0">ℹ️</span>
        <div>
          <b>Catatan Disaster Recovery:</b> Proses ini berjalan di latar belakang dan dapat memakan waktu beberapa detik tergantung volume transaksi basis data.
        </div>
      </div>
    </div>
  `;

  return confirmAction({
    title: 'Buat Cadangan Database?',
    html: htmlContent,
    icon: 'question',
    confirmText: 'Ya, Buat Cadangan',
    cancelText: 'Batal',
    isDanger: false,
  });
};

/**
 * Confirm Delete Database Backup Modal
 */
export const confirmDeleteBackup = async (backupItem) => {
  const fileName = backupItem?.nama_file || 'Berkas cadangan';
  const size = backupItem?.ukuran_bytes ? (backupItem.ukuran_bytes / (1024 * 1024)).toFixed(2) + ' MB' : '-';
  const dateStr = backupItem?.dibuat_pada ? new Date(backupItem.dibuat_pada).toLocaleString('id-ID') : '-';

  const htmlContent = `
    <div class="space-y-3 pt-1">
      <p class="text-sm text-gray-600">
        Apakah Anda yakin ingin menghapus berkas snapshot cadangan basis data ini dari storage server?
      </p>

      <div class="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 space-y-1.5 text-xs">
        <div class="font-mono font-bold text-gray-800 break-all text-[11px] bg-white p-2 rounded border border-rose-200/60">
          ${fileName}
        </div>
        <div class="flex justify-between text-gray-600 pt-1">
          <span>Ukuran File: <b>${size}</b></span>
          <span>Dibuat: <b>${dateStr}</b></span>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
        ⚠️ <b>Tindakan Permanen:</b> Berkas snapshot fisik yang dihapus tidak dapat dipulihkan kembali.
      </div>
    </div>
  `;

  return confirmAction({
    title: 'Hapus Berkas Cadangan?',
    html: htmlContent,
    icon: 'warning',
    confirmText: 'Ya, Hapus Cadangan',
    cancelText: 'Batal',
    isDanger: true,
  });
};

/**
 * Confirm Delete Single Physical File in E-File
 */
export const confirmDeleteFile = async (file) => {
  const fileName = file?.name || 'Berkas';
  const filePath = file?.path || '-';
  const fileSize = file?.size_formatted || '-';
  const lastModified = file?.last_modified || '-';

  const htmlContent = `
    <div class="space-y-3 pt-1">
      <p class="text-sm text-gray-600">
        Apakah Anda yakin ingin menghapus berkas media ini secara permanen dari penyimpanan server?
      </p>

      <div class="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-1.5 text-xs">
        <div class="font-mono font-bold text-gray-900 break-all text-[11px] bg-white p-2 rounded border border-gray-200">
          ${fileName}
        </div>
        <div class="text-[11px] text-gray-500 font-mono break-all">
          <span class="text-gray-400 font-sans">Lokasi:</span> ${filePath}
        </div>
        <div class="flex justify-between text-gray-600 pt-1 border-t border-gray-200/60">
          <span>Ukuran: <b>${fileSize}</b></span>
          <span>Dimodifikasi: <b>${lastModified}</b></span>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
        ⚠️ Berkas fisik akan langsung dihapus dari disk penyimpanan server dan tautan terkait tidak akan berfungsi lagi.
      </div>
    </div>
  `;

  return confirmAction({
    title: 'Hapus Berkas dari Storage?',
    html: htmlContent,
    icon: 'warning',
    confirmText: 'Ya, Hapus Berkas',
    cancelText: 'Batal',
    isDanger: true,
  });
};

/**
 * Confirm Clean Orphan Files Modal
 */
export const confirmCleanOrphans = async (orphanData) => {
  const count = orphanData?.orphan_count || 0;
  const reclaimable = orphanData?.total_reclaimable_formatted || '0 B';

  const htmlContent = `
    <div class="space-y-3 pt-1">
      <p class="text-sm text-gray-600">
        Sistem mendeteksi berkas fisik di direktori publik yang tidak lagi terhubung dengan entitas kursus, modul, atau sertifikat di basis data.
      </p>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-teal-50/70 p-3 rounded-xl border border-teal-100 text-center">
          <span class="text-[11px] text-gray-500 block">Berkas Tanpa Relasi</span>
          <span class="text-lg font-bold text-teal-800 font-mono">${count} File</span>
        </div>
        <div class="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-center">
          <span class="text-[11px] text-gray-500 block">Ruang Dipulihkan</span>
          <span class="text-lg font-bold text-emerald-800 font-mono">${reclaimable}</span>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
        ⚠️ <b>Peringatan Pembersihan:</b> Seluruh berkas tanpa relasi ini akan dihapus secara fisik dari disk. Pastikan tidak ada berkas penting sebelum melanjutkan.
      </div>
    </div>
  `;

  return confirmAction({
    title: 'Bersihkan Berkas Tanpa Relasi?',
    html: htmlContent,
    icon: 'warning',
    confirmText: 'Ya, Bersihkan Sekarang',
    cancelText: 'Batal',
    isDanger: true,
  });
};

/**
 * Confirm Prune Retention Logs Modal
 */
export const confirmPruneLogs = async (days) => {
  const htmlContent = `
    <div class="space-y-3 pt-1">
      <p class="text-sm text-gray-600">
        Apakah Anda yakin ingin memangkas seluruh catatan audit log sistem yang berusia lebih dari <b>${days} hari</b>?
      </p>

      <div class="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
        <div class="font-bold flex items-center gap-1.5">
          <span>🛡️ Batas Retensi Audit:</span>
          <span class="px-2 py-0.5 rounded bg-white font-mono text-amber-950 border border-amber-300">&gt; ${days} Hari</span>
        </div>
        <p class="text-[11px] text-amber-800 pt-0.5">
          Tindakan ini ditujukan untuk menjaga performa tabel relasional sistem dan kepatuhan kebijakan retensi data.
        </p>
      </div>

      <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
        ⚠️ <b>Peringatan Keamanan:</b> Riwayat audit yang telah dipangkas tidak dapat dikembalikan. Disarankan untuk mengekspor cadangan log CSV sebelum memangkas.
      </div>
    </div>
  `;

  return confirmAction({
    title: 'Konfirmasi Pemangkasan Log Audit',
    html: htmlContent,
    icon: 'warning',
    confirmText: 'Ya, Pangkas Log',
    cancelText: 'Batal',
    isDanger: true,
  });
};

/**
 * Show Loading Alert during long-running tasks
 */
export const showLoadingAlert = (title = 'Memproses...', text = 'Harap tunggu, proses sedang berlangsung.') => {
  BaseSystemSwal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Close any open alert
 */
export const closeAlert = () => {
  Swal.close();
};

/**
 * Show Success Alert
 */
export const showSuccessAlert = ({ title = 'Berhasil!', text = '', html = null }) => {
  return BaseSystemSwal.fire({
    title,
    text: html ? undefined : text,
    html: html || undefined,
    icon: 'success',
    confirmButtonText: 'Selesai',
    customClass: {
      ...BaseSystemSwal.params.customClass,
      confirmButton: `${BaseSystemSwal.params.customClass.confirmButton} bg-teal-700 hover:bg-teal-800 text-white focus:ring-teal-500`,
    },
  });
};

/**
 * Show Error Alert
 */
export const showErrorAlert = ({ title = 'Terjadi Kesalahan', text = '', html = null, error = null }) => {
  let errorMessage = text;
  if (!errorMessage && error) {
    errorMessage = error.response?.data?.message || error.message || 'Operasi gagal diselesaikan oleh sistem.';
  }

  return BaseSystemSwal.fire({
    title,
    text: html ? undefined : errorMessage,
    html: html || undefined,
    icon: 'error',
    confirmButtonText: 'Tutup',
    customClass: {
      ...BaseSystemSwal.params.customClass,
      confirmButton: `${BaseSystemSwal.params.customClass.confirmButton} bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-700`,
    },
  });
};
