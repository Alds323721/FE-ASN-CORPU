import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const cleanEnv = (val) => String(val || '').trim().replace(/^["']|["']$/g, '');

export const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
};

export const firebaseVapidKey = cleanEnv(import.meta.env.VITE_FIREBASE_VAPID_KEY);

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

let firebaseAppInstance = null;
let messagingInstancePromise = null;

export const getFirebaseApp = () => {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!firebaseAppInstance) {
    firebaseAppInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return firebaseAppInstance;
};

export const getFirebaseMessaging = async () => {
  if (typeof window === 'undefined' || !isFirebaseConfigured()) {
    return null;
  }

  if (!messagingInstancePromise) {
    messagingInstancePromise = (async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          return null;
        }
        const app = getFirebaseApp();
        return app ? getMessaging(app) : null;
      } catch {
        return null;
      }
    })();
  }

  return messagingInstancePromise;
};

