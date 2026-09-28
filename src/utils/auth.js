import api from '../api/axios';

export const AUTH_KEYS = [
  'access_token',
  'token',
  'user',
  'active_role',
  'current_route',
  'userCourseId',
  'userModulId',
  'userKuisId',
  'postTestResult',
  'adminKomunitasCourseId',
  'filterKomunitasId',
  'reviewCourseId',
  'reviewCourseData'
];

/**
 * Mengambil token autentikasi yang tersimpan
 */
export const getToken = () => {
  return localStorage.getItem('access_token') || localStorage.getItem('token') || null;
};

/**
 * Mengambil data objek user yang sedang login
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

/**
 * Mengambil seluruh daftar role sah yang dimiliki pengguna (yang diatur Admin-BKPSDM)
 * @returns {Array<string>}
 */
export const getUserRoles = () => {
  const user = getUser();
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles;
  }
  return user.peran ? [user.peran] : [];
};

/**
 * Memeriksa apakah user memiliki lebih dari 1 role sah (sehingga berhak switch role)
 * @returns {boolean}
 */
export const canSwitchRole = () => {
  const roles = getUserRoles();
  return roles.length > 1;
};

/**
 * Mengambil peran (role) yang sedang aktif digunakan dalam sesi
 * @returns {string|null}
 */
export const getActiveRole = () => {
  const user = getUser();
  if (!user) return null;

  const roles = getUserRoles();
  const savedActiveRole = localStorage.getItem('active_role');

  // Pastikan active_role yang tersimpan benar-benar sah dimiliki pengguna
  if (savedActiveRole && roles.includes(savedActiveRole)) {
    return savedActiveRole;
  }

  // Fallback: gunakan user.active_role, user.peran, atau role pertama di daftar peran
  const initialRole = (user.active_role && roles.includes(user.active_role))
    ? user.active_role
    : (roles[0] || user.peran || 'peserta');

  localStorage.setItem('active_role', initialRole);
  return initialRole;
};

/**
 * Mengganti peran aktif sesi dengan validasi ketat
 * @param {string} targetRole
 * @returns {boolean}
 */
export const setActiveRole = (targetRole) => {
  const roles = getUserRoles();
  if (!roles.includes(targetRole)) {
    console.error(`Akses ditolak: User tidak memiliki hak untuk peran ${targetRole}`);
    return false;
  }

  localStorage.setItem('active_role', targetRole);

  // Sinkronkan juga pada objek user di localStorage
  const user = getUser();
  if (user) {
    user.active_role = targetRole;
    localStorage.setItem('user', JSON.stringify(user));
  }

  return true;
};

/**
 * Mengambil peran (role) aktif dari user yang sedang login (kompatibilitas backward)
 */
export const getUserRole = () => {
  return getActiveRole();
};

/**
 * Cek apakah user sedang login dan memiliki token valid
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Simpan data autentikasi baru saat login berhasil
 */
export const setAuth = (token, user) => {
  if (token) localStorage.setItem('access_token', token);
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    const initialRole = user.active_role || (Array.isArray(user.roles) && user.roles[0]) || user.peran || 'peserta';
    localStorage.setItem('active_role', initialRole);
  }
};

/**
 * Membersihkan semua data auth dan session di localStorage
 */
export const clearAuth = () => {
  AUTH_KEYS.forEach(key => localStorage.removeItem(key));
};

/**
 * Log out user secara menyeluruh (Single Source of Truth)
 * @param {Function} [navigateCallback] - fungsi navigasi (opsional)
 */
export const logout = (navigateCallback) => {
  // Opsional: Beritahu backend untuk revoke token secara fire-and-forget
  try {
    api.post('/logout').catch(() => {});
  } catch (e) {}

  // Bersihkan seluruh penyimpanan lokal
  clearAuth();

  // Reset URL browser ke root
  window.history.pushState({}, '', '/');

  // Trigger navigasi ke landing
  if (typeof navigateCallback === 'function') {
    navigateCallback('landing');
  } else {
    window.location.href = '/';
  }
};
