import axios from "axios";
import { toast } from "react-hot-toast";
import { errorToastOptions } from "./toastConfig";
import { API_BASE_URL } from "./constants";
import { logout } from "./useStore";
let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

const api = axios.create({
    baseURL: API_BASE_URL || 'http://localhost:5002/api',
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest?.skipAuthRefresh) {
            return Promise.reject(error);
        }

        // Auth endpoints should NOT trigger token refresh or session-expired redirect
        const authEndpoints = ['/auth/login', '/auth/google-signin', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/refresh'];
        const requestUrl = originalRequest?.url || '';
        const isAuthEndpoint = authEndpoints.some((endpoint) => requestUrl.includes(endpoint));

        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403) &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthEndpoint
        ) {
            originalRequest._retry = true;

            try {
                refreshPromise ||= axios.get(`${API_BASE_URL}/auth/refresh`, { withCredentials: true });
                const response = await refreshPromise;
                refreshPromise = null;
                const newAccessToken = response.data.accessToken;
                setAccessToken(newAccessToken);

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch (refreshError) {
                refreshPromise = null;
                console.log("Refresh token expired. Logging out...");
                toast.error("Session expired. Please login again.", errorToastOptions);
                await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true }).catch(() => undefined);
                setAccessToken(null);
                logout();
                window.location.href = "/signin";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

export default api;
