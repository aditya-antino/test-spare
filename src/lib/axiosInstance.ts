import axios, { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { encryptRequest, decryptResponse, isEncrypted } from '@/utils/encryption';
import { PATHS } from '@/constants/path';

const ENABLE_ENCRYPTION = process.env.NEXT_PUBLIC_ENABLE_ENCRYPTION === 'true';
const TOKEN_EXPIRED_MESSAGE = 'Token is Expired';
const REFRESH_TOKEN_EXPIRED_MESSAGE = 'Refresh Token expired';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const handleSessionExpired = () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('signup_step');
    sessionStorage.removeItem('signup_gender');

    // Only show toast and redirect if we were actually logged in
    if (token) {
        toast.error('Your session has expired. Please log in again.');
        setTimeout(() => window.location.replace(PATHS.LOGIN), 1500);
    }
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
    },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────

axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            const roleId = window.location.pathname.includes('host') ? 2 : 3;
            config.headers['x-role-id'] = String(roleId);
        }

        if (ENABLE_ENCRYPTION && config.data) {
            try {
                const isUpload =
                    config.data instanceof FormData ||
                    config.data instanceof Blob ||
                    config.data instanceof ArrayBuffer;

                if (!isUpload && !config.headers['X-Encrypted']) {
                    config.data = encryptRequest(config.data);
                    config.headers['X-Encrypted'] = 'true';
                }
            } catch (error) {
                console.error('[Axios] Failed to encrypt request:', error);
            }
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        if (ENABLE_ENCRYPTION && response.data) {
            try {
                const isEncryptedByHeader =
                    response.headers['x-encrypted'] === 'true' ||
                    response.headers['X-Encrypted'] === 'true';

                const encryptedString = response.data?.encryptData || response.data?.encryptedData;
                const hasEncryptedPayload =
                    typeof encryptedString === 'string' && encryptedString.length > 0;

                if (isEncryptedByHeader || hasEncryptedPayload) {
                    response.data = decryptResponse(response.data);
                }
            } catch (error) {
                console.error('[Axios] Failed to decrypt response:', error);
            }
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // ── Decrypt error response if encrypted ───────────────────────────
        if (ENABLE_ENCRYPTION && error?.response?.data) {
            try {
                const isEncryptedByHeader =
                    error.response.headers['x-encrypted'] === 'true' ||
                    error.response.headers['X-Encrypted'] === 'true';
                const encryptedString =
                    error.response.data?.encryptData || error.response.data?.encryptedData;
                const hasEncryptedPayload =
                    typeof encryptedString === 'string' &&
                    encryptedString.length > 0 &&
                    isEncrypted(encryptedString);

                if (isEncryptedByHeader || hasEncryptedPayload) {
                    error.response.data = decryptResponse(error.response.data);
                }
            } catch (decryptError) {
                console.error('[Axios] Failed to decrypt error response:', decryptError);
            }
        }

        const message: string =
            error?.response?.data?.message ||
            error?.response?.data?.data?.message ||
            error?.response?.data?.error ||
            '';

        // ── Refresh Token expired → logout ────────────────────────────────
        if (message === REFRESH_TOKEN_EXPIRED_MESSAGE) {
            handleSessionExpired();
            return Promise.reject(error?.response?.data);
        }

        // ── Token expiry → Attempt Refresh ────────────────────────────────
        // We only attempt to refresh the token if the request was originally authenticated
        // and it's not a login/auth endpoint that naturally returns 401 on bad credentials.
        const isAuthEndpoint =
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/google-login');

        if (
            (error?.response?.status === 401 || message === TOKEN_EXPIRED_MESSAGE) &&
            !originalRequest._retry &&
            originalRequest.url !== '/auth/refresh-token' &&
            !isAuthEndpoint &&
            originalRequest.headers.Authorization
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    processQueue(new Error('No refresh token'), null);
                    handleSessionExpired();
                    return Promise.reject(error?.response?.data);
                }

                const response = await axiosInstance.post('/auth/refresh-token', {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                if (accessToken) {
                    localStorage.setItem('accessToken', accessToken);
                }
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                processQueue(null, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError: any) {
                processQueue(refreshError, null);
                handleSessionExpired();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // ── Account deactivated → redirect ────────────────────────────────
        if (
            message === 'Your account has been deactivated. Please contact support for assistance!'
        ) {
            localStorage.clear();
            window.location.replace('/account-deactivated');
        }

        return Promise.reject(error?.response?.data || error);
    },
);

export default axiosInstance;
