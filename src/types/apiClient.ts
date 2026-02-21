import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

class ApiClient {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({ baseURL });

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

        this.axiosInstance.interceptors.response.use(
            (response) => response.data,
            (error) => {
                const message = error.response?.data?.error || error.response?.data?.message || "Something went wrong";
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