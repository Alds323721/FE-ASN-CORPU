import { getToken, onMessage } from 'firebase/messaging';
import api from '../api/axios';
import {
  firebaseConfig,
  firebaseVapidKey,
  getFirebaseMessaging,
  isFirebaseConfigured,
} from '../firebase/firebase';

export const FCM_DEVICE_TOKEN_KEY = 'fcm_current_device_token';

/**
 * Periksa dukungan browser dan status izin notifikasi saat ini.
 * @returns {'unsupported' | 'granted' | 'denied' | 'default'}
 */
export const getNotificationPermissionState = () => {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator) ||
    !isFirebaseConfigured()
  ) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Daftarkan Service Worker khusus Firebase Messaging dengan parameter konfigurasi Web App.
 */
export const registerFirebaseServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  const query = new URLSearchParams({
    apiKey: firebaseConfig.apiKey || '',
    authDomain: firebaseConfig.authDomain || '',
    projectId: firebaseConfig.projectId || '',
    storageBucket: firebaseConfig.storageBucket || '',
    messagingSenderId: firebaseConfig.messagingSenderId || '',
    appId: firebaseConfig.appId || '',
  }).toString();

  const swUrl = `/firebase-messaging-sw.js?${query}`;
  const registration = await navigator.serviceWorker.register(swUrl, {
    scope: '/',
  });

  await navigator.serviceWorker.ready;
  return registration;
};

/**
 * Ambil FCM token dari Firebase Web SDK dan simpan ke backend Laravel.
 */
export const obtainAndSaveFcmToken = async () => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return { ok: false, reason: 'unsupported' };
  }

  const swRegistration = await registerFirebaseServiceWorker();
  if (!swRegistration) {
    return { ok: false, reason: 'sw_failed' };
  }

  const tokenOptions = {
    serviceWorkerRegistration: swRegistration,
  };
  if (firebaseVapidKey) {
    tokenOptions.vapidKey = firebaseVapidKey;
  }

  const currentToken = await getToken(messaging, tokenOptions);
  if (!currentToken) {
    return { ok: false, reason: 'empty_token' };
  }

  await api.post('/fcm-tokens', {
    token: currentToken,
    device_type: 'web',
  });

  localStorage.setItem(FCM_DEVICE_TOKEN_KEY, currentToken);

  return { ok: true, token: currentToken };
};

/**
 * Meminta izin notifikasi secara eksplisit (dipanggil saat pengguna menekan tombol Aktifkan Notifikasi).
 */
export const requestPermissionAndRegisterToken = async () => {
  const state = getNotificationPermissionState();
  if (state === 'unsupported') {
    return { ok: false, permission: 'unsupported', message: 'Browser Anda tidak mendukung Web Push Notification.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        ok: false,
        permission,
        message:
          permission === 'denied'
            ? 'Izin notifikasi ditolak pada pengaturan browser.'
            : 'Permintaan izin notifikasi ditutup.',
      };
    }

    const result = await obtainAndSaveFcmToken();
    return {
      ok: result.ok,
      permission: 'granted',
      token: result.token || null,
    };
  } catch (error) {
    return {
      ok: false,
      permission: Notification.permission,
      message: error?.response?.data?.message || error?.message || 'Gagal mengaktifkan push notification.',
    };
  }
};

/**
 * Sinkronisasi otomatis token jika pengguna sudah pernah memberikan izin ('granted') sebelumnya.
 */
export const syncExistingPermissionToken = async () => {
  if (getNotificationPermissionState() !== 'granted') {
    return null;
  }
  try {
    const res = await obtainAndSaveFcmToken();
    return res.token || null;
  } catch {
    return null;
  }
};

/**
 * Hapus token perangkat saat ini dari backend ketika pengguna logout.
 */
export const removeCurrentFcmToken = async () => {
  const savedToken = localStorage.getItem(FCM_DEVICE_TOKEN_KEY);
  localStorage.removeItem(FCM_DEVICE_TOKEN_KEY);

  if (!savedToken) {
    return;
  }

  try {
    await api.delete('/fcm-tokens/current', {
      data: { token: savedToken },
    });
  } catch {
    // Abaikan jika sesi sudah kedaluwarsa saat logout
  }
};

/**
 * Listener pesan saat aplikasi sedang aktif di foreground.
 * @param {(payload: any) => void} callback
 * @returns {Promise<() => void>} Fungsi unsubscribe
 */
export const subscribeForegroundMessages = async (callback) => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    if (typeof callback === 'function') {
      callback(payload);
    }
  });

  return unsubscribe;
};

