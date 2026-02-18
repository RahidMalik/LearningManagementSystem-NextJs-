import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/auth";

class ApiClient {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
        });

        // Request Interceptor: Token automatically attach with every request
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response Interceptor: it will handle Error Responses and also directly return data for successful responses (so we don't have to do res.data every time)
        this.axiosInstance.interceptors.response.use(
            (response) => response.data, // return direct data (no need for res.json()
            (error) => {
                const message = error.response?.data?.message || "API Error";
                return Promise.reject(new Error(message));
            }
        );
    }

    // helper method to set token (for login/logout)
    public setToken(token: string | null) {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    }

    // Generic Request Method (Axios compatible)
    public async request<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
        const response = await this.axiosInstance({
            url: endpoint,
            ...options,
        });
        return (response as unknown) as ApiResponse<T>;
    }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:5001/api');