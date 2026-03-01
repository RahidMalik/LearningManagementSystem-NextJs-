import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

class ApiClient {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({ baseURL });

        // --- REQUEST INTERCEPTOR ---
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // --- RESPONSE INTERCEPTOR ---
        this.axiosInstance.interceptors.response.use(
            (response) => response.data,
            (error) => {
                const status = error.response?.status;

                // 401 — Token expired, redirect to login
                if (status === 401) {
                    if (typeof window !== "undefined") {
                        console.warn("Token expired or invalid. Redirecting to login...");
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        const currentPath = window.location.pathname;
                        if (!['/login', '/signup'].includes(currentPath)) {
                            window.location.href = `/login?redirect=${currentPath}`;
                        }
                    }
                }

                // 404 — Resource not found (e.g. no courses yet) — silently return empty
                if (status === 404) {
                    return Promise.resolve({ success: true, data: [], message: "" });
                }

                const backendError = error.response?.data?.error || error.response?.data?.message;
                const message = backendError || error.message || "Something went wrong";

                console.error("API_ERROR_DETAILS:", error.response?.data);
                return Promise.reject(new Error(message));
            }
        );
    }

    public setToken(token: string | null) {
        if (typeof window !== "undefined") {
            if (token) localStorage.setItem('token', token);
            else localStorage.removeItem('token');
        }
    }

    public async request<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<any> {
        return this.axiosInstance({ url: endpoint, ...options });
    }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api');