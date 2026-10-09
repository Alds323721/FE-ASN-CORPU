/**
 * Helper dinamis untuk menghasilkan URL berkas publik/storage
 * Menyesuaikan secara otomatis antara lingkungan Localhost dan Production
 */
export const getStorageUrl = (path) => {
  if (!path) return '';
  let trimmed = String(path).trim();

  // Ambil konfigurasi API URL dari env
  const envUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '';

  const isBrowser = typeof window !== 'undefined' && Boolean(window.location);
  const isLocalHostBrowser =
    isBrowser &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  // Tentukan base origin
  let baseOrigin = '';

  if (envUrl) {
    const cleanEnv = envUrl.replace(/\/api\/?$/, '');
    // Jika di browser production tapi envUrl masih berisi localhost, gunakan window.location.origin
    if (
      isBrowser &&
      !isLocalHostBrowser &&
      (cleanEnv.includes('localhost') || cleanEnv.includes('127.0.0.1'))
    ) {
      baseOrigin = window.location.origin;
    } else {
      baseOrigin = cleanEnv;
    }
  } else if (isBrowser) {
    baseOrigin = isLocalHostBrowser
      ? 'http://localhost:8000'
      : window.location.origin;
  } else {
    baseOrigin = 'http://localhost:8000';
  }

  // Jika URL berupa blob atau data URI
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Jika URL tidak sengaja tersimpan di database sebagai http://localhost:8000 atau http://127.0.0.1:8000
  // dan kita sedang berada di lingkungan production (bukan localhost)
  if (isBrowser && !isLocalHostBrowser) {
    trimmed = trimmed.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i,
      baseOrigin
    );
  }

  // Jika sudah merupakan URL absolut (misal: https://... atau http://...)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Jika merupakan path relatif (misal: /storage/h5p/... atau storage/h5p/...)
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseOrigin}${cleanPath}`;
};

export const getDocumentUrl = getStorageUrl;
