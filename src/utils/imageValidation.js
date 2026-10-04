import Swal from 'sweetalert2';

/**
 * Validasi file thumbnail foto kursus atau modul agar di bawah 2MB.
 * Menolak otomatis dan memunculkan pop-up pemberitahuan untuk mengompres foto.
 * 
 * @param {File} file - Berkas yang dipilih oleh user
 * @param {HTMLInputElement} inputElement - Elemen input file untuk direset jika ditolak
 * @param {Function} onReject - Callback opsional saat file ditolak (misal mereset state)
 * @returns {boolean} - true jika file valid (< 2MB & format gambar), false jika ditolak
 */
export const validateThumbnailFile = (file, inputElement = null, onReject = null) => {
  if (!file) return false;

  // 1. Validasi tipe file
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const fileType = file.type ? file.type.toLowerCase() : '';
  const fileName = file.name ? file.name.toLowerCase() : '';
  const isImage = validTypes.includes(fileType) || /\.(jpe?g|png|webp)$/i.test(fileName);

  if (!isImage) {
    Swal.fire({
      icon: 'error',
      title: 'Format File Tidak Didukung',
      html: `
        <div class="text-left text-xs sm:text-sm text-gray-600 space-y-2 pt-1">
          <p>File yang Anda pilih: <b>${file.name || 'tidak diketahui'}</b>.</p>
          <p class="bg-red-50 text-red-800 p-2.5 rounded-lg border border-red-200">
            Harap gunakan format gambar yang didukung: <b>JPG, JPEG, PNG,</b> atau <b>WEBP</b>.
          </p>
        </div>
      `,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Tutup',
      customClass: {
        popup: 'rounded-2xl'
      }
    });

    if (inputElement) {
      inputElement.value = '';
    }
    if (typeof onReject === 'function') {
      onReject();
    }
    return false;
  }

  // 2. Validasi batas ukuran file (maksimal 2MB = 2 * 1024 * 1024 bytes)
  const maxSizeBytes = 2 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    Swal.fire({
      icon: 'warning',
      title: 'Ukuran Foto Melebihi 2MB!',
      html: `
        <div class="text-left text-xs sm:text-sm text-gray-600 space-y-3 pt-1">
          <div class="p-3 bg-red-50 border border-red-200 rounded-xl">
            <div class="flex items-center justify-between font-semibold text-red-900 mb-1">
              <span>Ukuran file Anda:</span>
              <span class="text-red-700 font-bold font-mono text-sm">${fileSizeMB} MB</span>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>Batas maksimal:</span>
              <span class="font-bold text-gray-700">2.00 MB</span>
            </div>
          </div>

          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed space-y-1.5">
            <p class="font-bold flex items-center gap-1.5">
              <span>⚠️ Foto otomatis ditolak oleh sistem</span>
            </p>
            <p>
              Harap <b>mengompres (memperkecil ukuran) foto</b> Anda terlebih dahulu agar ukurannya berada di bawah <b>2 MB</b> sebelum mengunggahnya ke platform.
            </p>
          </div>

          <div class="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200 leading-relaxed">
            💡 <b>Tips Kompres Foto:</b> Anda dapat mengompres foto secara online dan gratis melalui website seperti 
            <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" class="text-teal-700 font-bold underline hover:text-teal-900">TinyPNG</a>, 
            <a href="https://www.iloveimg.com/compress-image" target="_blank" rel="noopener noreferrer" class="text-teal-700 font-bold underline hover:text-teal-900">iLoveIMG</a>, 
            atau memperkecil resolusi foto pada galeri ponsel/aplikasi edit foto Anda.
          </div>
        </div>
      `,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Saya Mengerti, Kompres Foto Dulu',
      customClass: {
        popup: 'rounded-2xl'
      }
    });

    if (inputElement) {
      inputElement.value = '';
    }
    if (typeof onReject === 'function') {
      onReject();
    }
    return false;
  }

  return true;
};
