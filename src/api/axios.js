import axios from 'axios';
import { clearAuth } from '../utils/auth';

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        'http://localhost:8000/api',

    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
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
                !error.config?.url?.endsWith('/login')
            ) {
                clearAuth();
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default api;