import axios from 'axios';
import { clearAuth } from '../utils/auth';

const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    const isBrowser = typeof window !== 'undefined' && Boolean(window.location);
    const isLocal = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (envUrl) {
        if (isBrowser && !isLocal && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
            return `${window.location.origin}/api`;
        }
        return envUrl;
    }

    if (isBrowser && !isLocal) {
        return `${window.location.origin}/api`;
    }

    return 'http://localhost:8000/api';
};

const getOrCreateDeviceSessionId = () => {
    const storageKey = 'device_session_id';
    try {
        let deviceId = localStorage.getItem(storageKey);
        if (!deviceId || deviceId.length < 12) {
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                deviceId = crypto.randomUUID();
            } else {
                deviceId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15);
            }
            localStorage.setItem(storageKey, deviceId);
        }
        if (typeof document !== 'undefined') {
            document.cookie = `${storageKey}=${encodeURIComponent(deviceId)}; path=/; max-age=31536000; SameSite=Lax`;
        }
        return deviceId;
    } catch (e) {
        return 'fallback_device_session';
    }
};

const api = axios.create({
    baseURL: getApiBaseUrl(),

    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const deviceSessionId = getOrCreateDeviceSessionId();
        if (deviceSessionId) {
            config.headers['X-Device-Session'] = deviceSessionId;
        }

        const token =
            localStorage.getItem('access_token') ||
            localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const activeRole = localStorage.getItem('active_role');
        if (activeRole) {
            config.headers['X-Active-Role'] = activeRole;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            if (
                error.config?.url !== '/login' &&
                !error.config?.url?.endsWith('/login') &&
                !error.config?.url?.includes('/sertifikat/validasi') &&
                !error.config?.url?.includes('/kategori-kursus')
            ) {
                clearAuth();
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
